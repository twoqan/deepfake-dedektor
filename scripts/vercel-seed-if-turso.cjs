/**
 * Vercel build sırasında Turso ortam değişkenleri tanımlıysa `images` tablosunu
 * repodaki `public/images` ile senkronize eder. Böylece üretimde eski seed (ör. 2 satır)
 * kalmaz; deploy sonrası quiz 10 soruyu görebilir.
 */
const { execSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');

if (process.env.VERCEL !== '1') {
  console.log('[vercel-seed] Vercel build değil → atlandı.');
  process.exit(0);
}

if (!process.env.TURSO_DATABASE_URL) {
  console.log('[vercel-seed] TURSO_DATABASE_URL yok → atlandı.');
  process.exit(0);
}

console.log('[vercel-seed] Turso için npm run seed çalıştırılıyor...');
try {
  execSync('npx tsx src/db/seed.ts', {
    stdio: 'inherit',
    env: process.env,
    cwd: root,
    shell: process.platform === 'win32',
  });
} catch {
  console.error('[vercel-seed] Seed başarısız.');
  process.exit(1);
}
