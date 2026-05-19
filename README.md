# Deepfake Dedektörü - Kiosk Uygulaması

Etkinliklerde kullanılmak üzere tasarlanmış, ziyaretçilerin gerçek ve yapay zeka ile üretilmiş görselleri ayırt etmeye çalıştığı interaktif bir web quiz uygulaması.

## Kurulum

```bash
npm install
```

## Veritabanı ve örnek görseller

- **Yerel:** `TURSO_*` tanımlı değilse SQLite dosyası `data/deepfake-kiosk.db` kullanılır (`data/` repoya eklenmez).
- **Vercel / üretim:** Kalıcı skor ve liderlik için [Turso](https://turso.tech) (libSQL) önerilir. Ortam değişkenleri: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`. Ayrıntılar: [DEPLOYMENT.md](DEPLOYMENT.md).

Örnek değişken listesi: [.env.example](.env.example).

İlk kurulumda veya görselleri sıfırlarken seed scriptini çalıştırın:

```bash
npm run seed
```

## Geliştirme

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışır.

## Vercel’e yayınlama

Adım adım talimat: [DEPLOYMENT.md](DEPLOYMENT.md).

## Prodüksiyon

```bash
npm run build
npm start
```

## Görsel ekleme: gerçek / yapay ayrımı

**Konum:** Tüm görseller **`public/images/`** altında olmalı (ör. `public/images/11-yeni-fake-foto/...`). Proje **kök dizinine** (`deepfake-kiosk/11-yeni-fake-foto/`) koyulan klasörler ne tarayıcıda yayınlanır ne de `npm run seed` tarafından okunur.

Veritabanında **`images.real_image`**, **`images.fake_image`** ve **`images.image_kind`** (`'ai'` | `'real'`) birlikte tanımlar. Yerel klasörün **yapay mı gerçek mi** sayılacağı `images-manifest.json` içinde klasör için opsiyonel **`"kind"`** ile belirlenir; yazılmazsa varsayılan **`ai`**. Gerçek fotoğraf havuzu için **`public/images/gercek-fotolar/`** klasöründe jpeg/png vb. kullanın ve manifest’e `"kind":"real"` ekleyin.

| Dosya | Anlamı |
|--------|--------|
| `real.jpg` veya `real.png` / `.webp` / `.svg` | **İsteğe bağlı.** Klasörde yoksa quiz yine çalışır; yapay klasörlerde ekranda yalnızca `fake_image` kullanılır (gerçek havuzunda her iki kolon da aynı dosyaya işaret edebilir). |
| `fake.jpg` (veya aynı uzantılar) | **Zorunlu** (tipik yapay klasörleri için) — yapay görseli; `image_kind === 'ai'` satırlarda quiz’de kullanılan dosya budur. |

Her `public/images/<klasör-adı>/` dizini için seed şöyle çalışır:

- **Klasik çift:** Dosya adı **`fake`** olan bir görsel varsa (`fake.png` vb.) o klasör için veritabanına **tek satır** eklenir; **`real.*`** yoksa gerçek kolonuna da aynı dosya yazılır; `image_kind` manifest’ten veya **`ai`** varsayılanıdır.
- **Çoklu dosya havuzu:** Klasörde **`fake.*` adlı dosya yoksa**, uzantısı uygun **tüm görseller** ayrı satır olur (`11-yeni-fake-foto/` gibi). **`gercek-fotolar`** + manifest **`kind: real`** → her dosya gerçek havuzuna yazılır. Aynı klasörde hem `fake.*` hem diğer dosyalar varsa yalnızca **tek satır** klasik çift kullanılır.

**Quiz:** Her **`GET /api/quiz`** rastgele **7 yapay + 3 gerçek** toplam **10** soru seçer (`QUIZ_AI_PER_SESSION` + `QUIZ_REAL_PER_SESSION` = `DEFAULT_QUIZ_SIZE`); oturum içinde **yedeksiz**; sıra iki kez karıştırılır. En az **7** aktif `ai` ve **3** aktif `real` satırı yoksa API **422** döner. Yer tutucu seed (yalnızca yapay SVG) kullanılıyorsa gerçek havuz olmadığı için quiz başlamadan bu mesaj görülebilir.

**İsteğe bağlı başlıklar ve tür:** `public/images-manifest.json` ([images-manifest.example.json](public/images-manifest.example.json)): `folder`, `name`, isteğe bağlı **`"kind":"real"`** veya **`"kind":"ai"`**. Dosya yoksa klasör adı kullanılır ve `kind` için varsayılan `ai`'dir.

**Seed:**

```bash
npm run seed
```

- Geçerli klasörler varsa tablo temizlenir, satırlar `image_kind` ile yazılır.
- Hiç klasör uygun değilse yer tutucu SVG’ler oluşturulur (tamamı `ai`).

**Üretim (Turso):** Manifest veya görsel güncelledikten sonra **`npm run seed`** (bkz. [DEPLOYMENT.md](DEPLOYMENT.md)). Eski bir veritabanında ilk bağlantı veya seed **`images.image_kind`** kolonunu **`ALTER TABLE`** ile ekleyebilir.

## Görsel klasör yapısı (örnek)

```
public/images/
├── etkinlik-01/
│   ├── real.jpg
│   └── fake.jpg
├── etkinlik-02/
│   ├── real.webp
│   └── fake.webp
├── 11-yeni-fake-foto/
│   ├── resim-01.png
│   └── ... (fake.* yoksa her dosya ayrı havuz öğesi)
├── yapay-ofis-may2026/
│   ├── yapay-polar-ceket-sandalye.png
│   └── ... (çok dosya; manifest’te `"kind":"ai"`)
└── gercek-fotolar/
    ├── foto-01.jpg
    └── ... (manifest'te kind: real)
```

Görselleri commit edip yeniden seed + deploy edin (`npm run seed` üretimde Turso’ya doğrudan bağlanırken Ortamda `TURSO_*`).

## Sayfalar

| Sayfa | Yol | Açıklama |
|-------|-----|----------|
| Ana Sayfa | `/` | Karşılama ekranı, isim girişi |
| Quiz | `/quiz` | Her soruda tek görsel: gerçek mi yapay zeka mı? |
| Sonuç | `/result` | Test sonucu ve puan |
| Liderlik | `/leaderboard` | Skor + süre sıralaması (eşit puanda hızlı olan üstte) |
| Admin | `/admin` | Yönetim paneli |

## Admin Paneli

`/admin` — şifreler ortam değişkeni ile ayarlanır (varsayılan `admin123` üretimde kullanılmamalı):

- `ADMIN_PASSWORD` — sunucu API doğrulaması
- `NEXT_PUBLIC_ADMIN_PASSWORD` — tarayıcıdaki admin formu (public)

`.env.example` dosyasına bakın.

## Kiosk Modu

Uygulama dokunmatik kiosk ekranları için optimize edilmiştir:

- Metin seçimi devre dışı
- Büyük dokunmatik hedefler
- Sonuç ve liderlik sayfalarında 60 sn inaktivite sonrası otomatik ana sayfaya dönüş
- Scrollbar gizli

Tarayıcıyı tam ekran (kiosk) modunda açmak için:

**Chrome:**
```bash
google-chrome --kiosk http://localhost:3000
```

**macOS Safari:**
Menü > Görünüm > Tam Ekrana Geç
