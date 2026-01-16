# Personal Diary Application / Kişisel Günlük Uygulaması

[English](#english) | [Türkçe](#türkçe)

---

## English

A diary application with admin panel and public viewing features.

### Features

- **Admin Panel**: Create tabs, pages, and diary entries
- **Check-in System**: Keep your diary private for 30 more days with each check-in
- **Auto-Publishing**: All entries become public if you don't check in for 30 days
- **Hierarchical Structure**: Tabs → Pages → Entries
- **Privacy Control**: Make each entry public or private individually

### Quick Start

```bash
npm install
npm run setup
npm run dev
```

Visit http://localhost:3000

**Default credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **Change the default password after first login!**

For detailed installation instructions, see [SETUP.md](SETUP.md)

### Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT + NextAuth.js

### Project Structure

```
├── app/              # Next.js app directory
│   ├── admin/       # Admin panel
│   ├── login/       # Login page
│   └── api/         # API routes
├── prisma/          # Database schema and migrations
├── public/          # Static files
└── lib/             # Utilities and configurations
```

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### License

ISC

---

## Türkçe

Admin panelli ve herkese açık görüntüleme özellikli günlük uygulaması.

### Özellikler

- **Admin Paneli**: Sekmeler, sayfalar ve günlük girdileri oluşturun
- **Check-in Sistemi**: Her check-in ile günlüğünüz 30 gün daha özel kalır
- **Otomatik Yayınlama**: 30 gün check-in yapmazsanız tüm günlükler herkese açılır
- **Hiyerarşik Yapı**: Sekmeler → Sayfalar → Girdiler
- **Gizlilik Kontrolü**: Her girdiyi ayrı ayrı herkese açık/özel yapabilirsiniz

### Hızlı Başlangıç

```bash
npm install
npm run setup
npm run dev
```

http://localhost:3000 adresini ziyaret edin

**Varsayılan giriş bilgileri:**
- Kullanıcı adı: `admin`
- Şifre: `admin123`

⚠️ **İlk girişten sonra varsayılan şifreyi değiştirin!**

Detaylı kurulum talimatları için [SETUP.md](SETUP.md) dosyasına bakın.

### Teknoloji Yığını

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Veritabanı**: Prisma ORM ile SQLite
- **Kimlik Doğrulama**: JWT + NextAuth.js

### Proje Yapısı

```
├── app/              # Next.js app dizini
│   ├── admin/       # Admin paneli
│   ├── login/       # Giriş sayfası
│   └── api/         # API rotaları
├── prisma/          # Veritabanı şeması ve migrasyonlar
├── public/          # Statik dosyalar
└── lib/             # Yardımcı araçlar ve yapılandırmalar
```

### Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen Pull Request göndermekten çekinmeyin.

### Lisans

ISC
