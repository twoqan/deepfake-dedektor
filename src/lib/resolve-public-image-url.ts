import fs from 'fs';
import path from 'path';

import type { ImagePairData } from '@/types';

const ALLOWED_EXT = /\.(jpe?g|png|webp|svg)$/i;

/**
 * DB'deki path (örn. fake.svg) ile diskteki uzantı uyuşmazsa — yaygın: seed/Turso
 * güncellenmeden PNG deploy edildiğinde — `public/` altında aynı taban ada sahip
 * dosyayı bulup doğru `/images/...` URL'sini döner.
 */
export function resolvePublicImageUrl(urlPath: string): string {
  if (!urlPath.startsWith('/')) return urlPath;

  const relative = urlPath.replace(/^\/+/, '');
  const abs = path.join(process.cwd(), 'public', relative);

  try {
    if (fs.existsSync(abs)) return urlPath;
  } catch {
    return urlPath;
  }

  const dir = path.dirname(abs);
  const stem = path.parse(abs).name.toLowerCase();
  if (!stem) return urlPath;

  let entries: string[];
  try {
    if (!fs.existsSync(dir)) return urlPath;
    entries = fs.readdirSync(dir);
  } catch {
    return urlPath;
  }

  const match = entries.find((f) => {
    const p = path.parse(f);
    return p.name.toLowerCase() === stem && ALLOWED_EXT.test(p.ext);
  });
  if (!match) return urlPath;

  const folder = path.basename(dir);
  return `/images/${folder}/${match}`;
}

export function resolveImagePairUrls(pair: ImagePairData): ImagePairData {
  return {
    ...pair,
    real_image: resolvePublicImageUrl(pair.real_image),
    fake_image: resolvePublicImageUrl(pair.fake_image),
  };
}
