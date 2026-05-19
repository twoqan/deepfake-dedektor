# Vercel’e yayınlama

Bu proje artık **libSQL** (`@libsql/client`) kullanır: yerelde dosya SQLite, production’da **Turso** önerilir (kalıcı skor / liderlik).

## Önkoşullar

1. Kod **GitHub / GitLab / Bitbucket** üzerinde bir repoda olmalı.
2. [Vercel](https://vercel.com) hesabı.
3. Kalıcı veritabanı için [Turso](https://turso.tech) hesabı (ücretsiz katman yeterli).

## 1) Turso veritabanı

1. Turso konsolunda **Create database** ile yeni bir database oluşturun.
2. **Connect** / bağlantı bilgilerinden:
   - `libsql://...` URL’sini kopyalayın → `TURSO_DATABASE_URL`
   - **Auth token** oluşturup kopyalayın → `TURSO_AUTH_TOKEN`

## 2) İlk veriyi Turso’ya yükleme (seed)

Yerelde veya CI’da, Turso env’leriyle:

```bash
export TURSO_DATABASE_URL="libsql://..."
export TURSO_AUTH_TOKEN="..."
npm install
npm run seed
```

Bu komut görseller için `public/images` altına SVG oluşturur ve **images** tablosuna kayıtlar ekler.  
Görselleri repoya commit ettiyseniz, Vercel build’inde de `public/` dağıtılmış olur; seed yalnızca DB satırlarını doldurur.

**Not:** Seed’i hiç çalıştırmazsanız `/api/quiz` görselsiz döner (404).

## 3) Vercel projesi

1. [vercel.com/new](https://vercel.com/new) → repoyu içe aktarın.
2. **Framework Preset:** Next.js (otomatik).
3. **Build Command:** `npm run build`
4. **Install Command:** `npm install`

### Ortam değişkenleri (Project → Settings → Environment Variables)

| Ad | Ortam | Açıklama |
|----|--------|----------|
| `TURSO_DATABASE_URL` | Production (ve isteğe Preview) | Turso `libsql://` URL |
| `TURSO_AUTH_TOKEN` | Production | Turso token |
| `ADMIN_PASSWORD` | Production | `/api/admin` için şifre |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | Production | `/admin` sayfası girişi (public key) |

`.env.example` dosyasına bakın. **`admin123` kullanmayın.**

## 4) Deploy

**Deploy** sonrası üretim URL’nizi açın:

- `/` — karşılama
- `/quiz` — test (seed yapıldıysa)
- `/leaderboard` — skorlar (Turso’da kalıcı)
- `/admin` — yönetim

## 5) Doğrulama listesi

- [ ] Bir test tamamlayıp skor kaydı
- [ ] Liderlik tablosunda skorun görünmesi
- [ ] Sayfayı yeniledikten sonra skorun **kaybolmaması** (Turso çalışıyor demektir)
- [ ] İsteğe bağlı: özel alan adı (Vercel → Domains)

## Sorun giderme

**Liderlik boş / skor uçuyor:** `TURSO_DATABASE_URL` ve `TURSO_AUTH_TOKEN` eksik veya yanlış; veya seed Turso’ya karşı çalıştırılmadı.

**Build hatası:** `npm run build` yerelde çalıştırıp log’a bakın.

**Yerel geliştirme:** `TURSO_*` tanımlı değilse uygulama `data/deepfake-kiosk.db` kullanır (`.gitignore`’da, commit edilmez).
