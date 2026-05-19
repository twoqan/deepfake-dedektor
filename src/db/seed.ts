import fs from 'fs';
import path from 'path';
import type { Client } from '@libsql/client';

import { ensureDb } from './index';

type ImageKind = 'ai' | 'real';

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
const MANIFEST_PATH = path.join(process.cwd(), 'public', 'images-manifest.json');

const IMAGE_EXT_REGEX = /\.(jpe?g|png|webp|svg)$/i;

interface DiscoveredPair {
  folder: string;
  displayName: string;
  realFile: string;
  fakeFile: string;
  image_kind: ImageKind;
}

interface ManifestRow {
  folder: string;
  name?: string;
  kind?: string;
}

interface ManifestMaps {
  namesByFolder: Map<string, string>;
  kindsByFolder: Map<string, ImageKind>;
}

function parseManifestKind(value: unknown): ImageKind | undefined {
  if (value === 'real') return 'real';
  if (value === 'ai') return 'ai';
  return undefined;
}

function loadManifestMaps(): ManifestMaps {
  const namesByFolder = new Map<string, string>();
  const kindsByFolder = new Map<string, ImageKind>();
  if (!fs.existsSync(MANIFEST_PATH)) {
    return { namesByFolder, kindsByFolder };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) as unknown;
    if (!Array.isArray(raw)) return { namesByFolder, kindsByFolder };
    for (const row of raw as ManifestRow[]) {
      if (!row || typeof row.folder !== 'string') continue;
      const folder = row.folder.trim();
      if (!folder.length) continue;
      const k = parseManifestKind(row.kind);
      if (k) kindsByFolder.set(folder, k);
      if (typeof row.name === 'string' && row.name.trim().length) {
        namesByFolder.set(folder, row.name.trim());
      }
    }
  } catch {
    console.warn(
      `  Uyarı: ${MANIFEST_PATH} okunamadı — klasör adları etiket olarak kullanılacak`
    );
  }
  return { namesByFolder, kindsByFolder };
}

/** `fake.{ext}` zorunlu; `real.{ext}` yoksa tek görsel modu — DB için gerçek kolonuna da aynı dosya yazılır. */
function pickRealFakeFiles(entries: string[]): {
  real: string;
  fake: string;
} | null {
  const files = entries.filter((e) =>
    IMAGE_EXT_REGEX.test(path.extname(e))
  );

  function pick(prefix: string): string | undefined {
    const needles = files.filter((f) => {
      const base = path.parse(f).name.toLowerCase();
      return base === prefix;
    });
    if (!needles.length) return undefined;
    needles.sort();
    return needles[0];
  }

  const fake = pick('fake');
  if (!fake) return null;
  const real = pick('real');
  return { real: real ?? fake, fake };
}

/** Klasörde fake.* yoksa: tüm görsel dosyaları (alfabetik) ayrı soru satırları. */
function listLooseImageFiles(entries: string[]): string[] {
  const out = entries.filter((e) =>
    IMAGE_EXT_REGEX.test(path.extname(e))
  );
  out.sort((a, b) => a.localeCompare(b, 'tr'));
  return out;
}

function discoverPairsFromDisk(manifest: ManifestMaps): DiscoveredPair[] {
  if (!fs.existsSync(IMAGES_DIR)) return [];

  const subs = fs
    .readdirSync(IMAGES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'));

  const pairs: DiscoveredPair[] = [];

  for (const d of subs) {
    const folder = d.name;
    const imageKind: ImageKind =
      manifest.kindsByFolder.get(folder) ?? 'ai';
    const pairDir = path.join(IMAGES_DIR, folder);
    const entries = fs.readdirSync(pairDir);
    const picked = pickRealFakeFiles(entries);

    const fromManifest = manifest.namesByFolder.get(folder);
    const fromFolder =
      folder.replace(/[-_]+/g, ' ').trim().length > 0
        ? folder.replace(/[-_]+/g, ' ').trim()
        : folder;
    const labelBase = fromManifest ?? fromFolder;

    if (picked) {
      pairs.push({
        folder,
        displayName: labelBase,
        realFile: picked.real,
        fakeFile: picked.fake,
        image_kind: imageKind,
      });
      continue;
    }

    const loose = listLooseImageFiles(entries);
    for (const file of loose) {
      const stem = path.parse(file).name;
      pairs.push({
        folder,
        displayName: `${labelBase} — ${stem}`,
        realFile: file,
        fakeFile: file,
        image_kind: imageKind,
      });
    }
  }

  pairs.sort((a, b) => {
    const fa = `${a.folder}/${a.fakeFile}`;
    const fb = `${b.folder}/${b.fakeFile}`;
    return fa.localeCompare(fb, 'tr');
  });
  return pairs;
}

const LEGACY_PAIR_NAMES: { folder: string; name: string }[] = [
  { name: 'Yemek — Patates', folder: 'pair-01' },
  { name: 'Gündelik — Kablo', folder: 'pair-02' },
  { name: 'İçecek — Çay', folder: 'pair-03' },
  { name: 'İç mekân — Bekleme alanı', folder: 'pair-04' },
  { name: 'Gece — Dökülmüş bardak', folder: 'pair-05' },
  { name: 'Yemek — Mandalin', folder: 'pair-06' },
  { name: 'Portre — Dış mekân', folder: 'pair-07' },
  { name: 'Ayakkabı — Çamurlu bot', folder: 'pair-08' },
  { name: 'Yapay görsel — Çift 09', folder: 'pair-09' },
  { name: 'Yapay görsel — Çift 10', folder: 'pair-10' },
];

function generateSVG(label: string, hue: number, isFake: boolean): string {
  const sat = 65;
  const light1 = isFake ? 32 : 38;
  const light2 = isFake ? 18 : 22;
  const hue2 = (hue + 45) % 360;

  const shapes = isFake
    ? `
    <pattern id="p" width="30" height="30" patternUnits="userSpaceOnUse">
      <rect width="30" height="30" fill="none"/>
      <circle cx="15" cy="15" r="1" fill="rgba(255,255,255,0.04)"/>
    </pattern>
    <rect width="800" height="600" fill="url(#p)"/>
    <ellipse cx="600" cy="150" rx="120" ry="80" fill="rgba(255,255,255,0.015)"/>
    <ellipse cx="200" cy="450" rx="100" ry="70" fill="rgba(255,255,255,0.015)"/>
    <rect x="50" y="50" width="700" height="500" rx="20" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
    `
    : `
    <circle cx="400" cy="300" r="200" fill="rgba(255,255,255,0.02)"/>
    <circle cx="400" cy="300" r="120" fill="rgba(255,255,255,0.015)"/>
    <circle cx="400" cy="300" r="60" fill="rgba(255,255,255,0.01)"/>
    `;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:hsl(${hue}, ${sat}%, ${light1}%)"/>
      <stop offset="100%" style="stop-color:hsl(${hue2}, ${sat}%, ${light2}%)"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  ${shapes}
  <text x="400" y="270" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="36" font-family="system-ui, -apple-system, sans-serif" font-weight="700">${label}</text>
  <text x="400" y="320" text-anchor="middle" fill="rgba(255,255,255,0.2)" font-size="14" font-family="system-ui, sans-serif">Placeholder - Kendi görsellerinizi ekleyin</text>
</svg>`;
}

async function seedSvgPlaceholders(client: Client): Promise<void> {
  for (let i = 0; i < LEGACY_PAIR_NAMES.length; i++) {
    const pair = LEGACY_PAIR_NAMES[i];
    const pairDir = path.join(IMAGES_DIR, pair.folder);
    if (!fs.existsSync(pairDir)) fs.mkdirSync(pairDir, { recursive: true });

    const hue =
      LEGACY_PAIR_NAMES.length > 0 ? (i / LEGACY_PAIR_NAMES.length) * 360 : 0;

    fs.writeFileSync(
      path.join(pairDir, 'real.svg'),
      generateSVG(pair.name, hue, false)
    );
    fs.writeFileSync(
      path.join(pairDir, 'fake.svg'),
      generateSVG(pair.name, hue, true)
    );

    await client.execute({
      sql: 'INSERT INTO images (name, real_image, fake_image, image_kind) VALUES (?, ?, ?, ?)',
      args: [
        pair.name,
        `/images/${pair.folder}/real.svg`,
        `/images/${pair.folder}/fake.svg`,
        'ai',
      ],
    });
  }
}

async function insertDiscovered(
  client: Client,
  pairs: DiscoveredPair[]
): Promise<void> {
  for (const p of pairs) {
    await client.execute({
      sql:
        'INSERT INTO images (name, real_image, fake_image, image_kind) VALUES (?, ?, ?, ?)',
      args: [
        p.displayName,
        `/images/${p.folder}/${p.realFile}`,
        `/images/${p.folder}/${p.fakeFile}`,
        p.image_kind,
      ],
    });
  }
}

async function main() {
  const dbDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

  const client = await ensureDb();
  await client.execute('DELETE FROM images');

  const manifest = loadManifestMaps();
  const discovered = discoverPairsFromDisk(manifest);

  let count: number;

  if (discovered.length > 0) {
    await insertDiscovered(client, discovered);
    count = discovered.length;
    console.log(
      `\n  ${count} görsel kaydı eklendi (klasör başına ya klasik fake.* çifti ya da fake.* yoksa klasördeki her görsel ayrı havuz öğesi).`
    );
    if (!fs.existsSync(MANIFEST_PATH)) {
      console.log(
        `  İstersen ${path.relative(process.cwd(), MANIFEST_PATH)} ile daha güzel başlıklar ver.`
      );
    }
  } else {
    console.log('\n  Uygun klasör yok → örnek SVG çiftleri yazılıyor…');
    await seedSvgPlaceholders(client);
    count = LEGACY_PAIR_NAMES.length;
  }

  const dbPathLocal = path.join(process.cwd(), 'data', 'deepfake-kiosk.db');
  console.log(`\n  Deepfake Kiosk — Seed tamam`);
  console.log(`  ─────────────────────────────────`);
  console.log(`  Toplam görsel çifti: ${count}`);
  console.log(`  Yerel DB (TURSO yoksa): ${dbPathLocal}`);
  console.log(`  Turso kullanılıyorsa: TURSO_DATABASE_URL ile seed çalıştırın.`);
  console.log(`  Görseller: ${IMAGES_DIR}`);
  console.log(
    `\n  Kural: Klasörde fake adlı dosya (fake.png…) varsa tek satır; yoksa klasördeki her görsel ayrı havuz öğesi olur. Quiz her oturumda havuzdan 7 yapay + 3 gerçek (manifest'te "kind":"real") seçer.\n`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
