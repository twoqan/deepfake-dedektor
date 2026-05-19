import fs from 'fs';
import path from 'path';
import { ensureDb } from './index';

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

async function main() {
  const dbDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

  const client = await ensureDb();
  await client.execute('DELETE FROM images');

  const pairs = [
    { name: 'Portre - Kadın', folder: 'pair-01' },
    { name: 'Manzara - Göl', folder: 'pair-02' },
    { name: 'Şehir - Gece', folder: 'pair-03' },
    { name: 'Hayvan - Kedi', folder: 'pair-04' },
    { name: 'Yemek - Pasta', folder: 'pair-05' },
    { name: 'Portre - Erkek', folder: 'pair-06' },
    { name: 'Doğa - Orman', folder: 'pair-07' },
    { name: 'Mimari - Köprü', folder: 'pair-08' },
    { name: 'Sanat - Tablo', folder: 'pair-09' },
    { name: 'Portre - Çocuk', folder: 'pair-10' },
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
  <text x="400" y="350" text-anchor="middle" fill="rgba(255,255,255,0.12)" font-size="12" font-family="system-ui, sans-serif">public/images/${isFake ? 'pair-XX/fake.jpg' : 'pair-XX/real.jpg'}</text>
</svg>`;
  }

  for (const pair of pairs) {
    const pairDir = path.join(IMAGES_DIR, pair.folder);
    if (!fs.existsSync(pairDir)) fs.mkdirSync(pairDir, { recursive: true });

    const hue = (pairs.indexOf(pair) / pairs.length) * 360;

    fs.writeFileSync(path.join(pairDir, 'real.svg'), generateSVG(pair.name, hue, false));
    fs.writeFileSync(path.join(pairDir, 'fake.svg'), generateSVG(pair.name, hue, true));

    await client.execute({
      sql: 'INSERT INTO images (name, real_image, fake_image) VALUES (?, ?, ?)',
      args: [
        pair.name,
        `/images/${pair.folder}/real.svg`,
        `/images/${pair.folder}/fake.svg`,
      ],
    });
  }

  const dbPath = path.join(process.cwd(), 'data', 'deepfake-kiosk.db');
  console.log(`\n  Deepfake Kiosk - Seed Tamamlandı`);
  console.log(`  ─────────────────────────────────`);
  console.log(`  ${pairs.length} görsel çifti oluşturuldu`);
  console.log(`  Yerel DB dosyası: ${dbPath}`);
  console.log(`  Uzak Turso kullanıyorsanız: TURSO_DATABASE_URL ile seed çalıştırın.`);
  console.log(`  Görseller: ${IMAGES_DIR}\n`);
  console.log(`  Gerçek görselleri eklemek için:`);
  console.log(`  public/images/pair-XX/ klasörüne real.jpg ve fake.jpg dosyalarını koyun\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
