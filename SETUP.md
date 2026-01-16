# Setup Guide / Kurulum Kılavuzu

## English

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd DeadMansDiary
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit .env and change the secret keys
   # IMPORTANT: Use strong, random secrets in production!
   ```

4. **Initialize database**
   ```bash
   npm run setup
   ```
   This command will:
   - Generate Prisma client
   - Run database migrations
   - Seed initial admin user

5. **Start the application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

6. **Access the application**
   - Main page: http://localhost:3000
   - Login page: http://localhost:3000/login
   - Admin panel: http://localhost:3000/admin

### Default Credentials
- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANT: Change the default password after first login!**

---

## Türkçe

### Gereksinimler
- Node.js 18+ kurulu olmalı
- npm veya yarn paket yöneticisi

### Kurulum Adımları

1. **Depoyu klonlayın**
   ```bash
   git clone <repo-url>
   cd DeadMansDiary
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Ortam değişkenlerini ayarlayın**
   ```bash
   # Örnek dosyayı kopyalayın
   cp .env.example .env

   # .env dosyasını düzenleyin ve gizli anahtarları değiştirin
   # ÖNEMLİ: Üretim ortamında güçlü, rastgele anahtarlar kullanın!
   ```

4. **Veritabanını başlatın**
   ```bash
   npm run setup
   ```
   Bu komut:
   - Prisma istemcisini oluşturur
   - Veritabanı migrasyonlarını çalıştırır
   - İlk admin kullanıcısını oluşturur

5. **Uygulamayı başlatın**
   ```bash
   # Geliştirme modu
   npm run dev

   # Üretim modu
   npm run build
   npm start
   ```

6. **Uygulamaya erişin**
   - Ana sayfa: http://localhost:3000
   - Giriş sayfası: http://localhost:3000/login
   - Admin paneli: http://localhost:3000/admin

### Varsayılan Giriş Bilgileri
- Kullanıcı adı: `admin`
- Şifre: `admin123`

**⚠️ ÖNEMLİ: İlk girişten sonra şifrenizi değiştirin!**
