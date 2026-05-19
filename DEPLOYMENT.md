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

**Seed ne yapar?**

- `public/images` alt klasörleri tarar: klasörde **`fake.png`** gibi **dosya adı `fake`** olan bir görsel varsa tek satır; yoksa klasördeki **tüm uygun görseller** ayrı havuz satırı olur. **`real.*`** yoksa `real_image` alanına da aynı yol yazılabilir. Her satır **`image_kind`** alır (**`ai`** varsayılan); manifest’te klasör için **`"kind":"real"`** ile gerçek havuz olarak işaretleyin (**`gercek-fotolar`**). Quiz her **`GET /api/quiz`** isteğinde rastgele **7 yapay + 3 gerçek** toplam **10** soru seçer (**`DEFAULT_QUIZ_SIZE`**, **`src/lib/quiz-config.ts`**). En az **7** aktif **`ai`** ve **3** aktif **`real`** satırı yoksa **`/api/quiz`** **422** döner.
- Hiç uygun klasör yoksa 10 adet yer tutucu SVG üretimi yapılır (`seed.ts`); bunların hepsi **`ai`** olduğu için gerçek havuz eklenmeden quiz başlamaz.
- İstersen görünür başlıklar ve tür için projede **`public/images-manifest.json`** oluştur; şablon: `public/images-manifest.example.json`.

Görselleri repoya commit edin; seed yalnızca Turso/satır kayıtlarını günceller. `npm run build` dosyayı barındırmaz, `public/` statik olarak dağıtılır.

**Not:** Seed’i hiç çalıştırmazsanız `/api/quiz` görselsiz döner (**404**). Yetersiz havuz (**422**) için **`gercek-fotolar/`** içine en az 3 görsel ekleyip manifest **`kind`** ile seed yenileyin ve en az **7** yapay satır olduğundan emin olun.

**Şema migrasyonu:** Eski prod veritabanında **`images.image_kind`** yoksa ilk uygulama veya **`npm run seed`** bağlantısında **`ensureDb()`**, **`scores.duration_ms`** için olduğu gibi **`ALTER TABLE`** ile kolon ekler.

**Quiz limiti:** Sabit **10** soru (7+3). **`count`** sorgu parametresi kullanılmaz.

**Görselleri veya `images-manifest.json` güncelledikten sonra:** Yerelde veya CI’da Turso ortam değişkenleriyle `npm run seed` çalıştırın; yalnızca Vercel deploy etmek Turso’daki `images` tablosunu güncellemez — quiz eski URL’lerle kalabilir.

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

Build komutu `next build` sonrasında **Vercel ortamında** ve `TURSO_DATABASE_URL` tanımlıysa otomatik olarak `npm run seed` çalışır (`scripts/vercel-seed-if-turso.cjs`). Böylece Turso’daki `images` tablosu repodaki `public/images` ve manifest ile uyumlu kalır; aksi halde quiz **havuz güncellenmediği** için hatalı veya **422** dönebilir (en az **7 yapay / 3 gerçek** satır şartı).

Yine de sorun yaşarsanız yerelde `TURSO_*` ile manuel `npm run seed` çalıştırın.

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
