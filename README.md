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

## Görsel Ekleme

Her görsel çifti `public/images/pair-XX/` klasöründe tutulur:

```
public/images/
├── pair-01/
│   ├── real.jpg   (veya .png, .svg, .webp)
│   └── fake.jpg
├── pair-02/
│   ├── real.jpg
│   └── fake.jpg
└── ...
```

Görselleri değiştirdikten sonra, veritabanındaki yolları güncellemek için seed scriptini tekrar çalıştırın veya admin panelinden yönetin.

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
# deepfake-dedektor
