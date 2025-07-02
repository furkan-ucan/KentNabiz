# KentNabız

KentNabız, vatandaşların şehirdeki altyapı sorunlarını kolayca bildirebilecekleri ve belediye birimlerinin bu sorunları takip edip çözebileceği modern bir platformdur.

---

## 📱 Şehir Sorunları İzleme ve Müdahale Platformu

KentNabız, şehirde meydana gelen çeşitli altyapı sorunlarını (örneğin; yol hasarı, su kaçağı, elektrik kesintisi vb.) hızlı ve etkili bir şekilde bildirmenizi sağlar. Platform, sorunların harita üzerinde görselleştirilmesini, fotoğraflarla desteklenmesini ve ilgili belediye birimlerine yönlendirilmesini mümkün kılar. Ayrıca, raporlar üzerinden analiz ve istatistikler sunarak, şehir yönetimlerinin sorunlara daha bilinçli müdahalede bulunmasını destekler.

---

## 🌟 Özellikler

- **Harita Tabanlı Sorun Bildirme:**
  Sorunlar, interaktif harita üzerinde işaretlenir ve lokasyon bilgisi ile birlikte detaylandırılır.

- **Fotoğraf ve Medya Ekleyebilme:**
  Raporlarınıza fotoğraf veya video ekleyerek, sorunların görsel kanıtını sağlayabilirsiniz.

- **Mobil ve Web Uygulaması:**
  Hem mobil hem de web üzerinden erişim imkanı ile kullanıcı deneyimi optimize edilmiştir.

- **Anlık Bildirim Sistemi:**
  Raporunuzun durumu hakkında anlık bildirimler alarak, sürecin her adımını takip edebilirsiniz.

- **Rol Tabanlı Yetkilendirme:**
  Platformda dört temel kullanıcı rolü bulunmaktadır:

  1.  `CITIZEN` (Vatandaş): Sorunları bildirebilir ve kendi bildirimlerini takip edebilir.
  2.  `DEPARTMENT_EMPLOYEE` (Departman Çalışanı): Atandığı departmanla ilgili sorunları görüntüleyebilir, güncelleyebilir ve çözüm sürecinde rol alabilir.
  3.  `DEPARTMENT_SUPERVISOR` (Departman Sorumlusu): Departmanındaki tüm sorunları yönetebilir, çalışanlara görev atayabilir ve raporları başka departmanlara yönlendirebilir.
  4.  `SYSTEM_ADMIN` (Sistem Yöneticisi): Tüm sistem üzerinde tam yetkiye sahiptir; kullanıcıları, departmanları yönetebilir ve tüm raporlara erişebilir.

- **Sorun Analizi ve Raporlama:**
  Toplanan veriler, detaylı istatistikler ve raporlar halinde sunularak, şehir yönetimlerinin stratejik kararlar almasına yardımcı olur.

- **Belediye Departmanları Arası Yönlendirme:**
  Bildirilen sorunlar, ilgili belediye departmanlarına otomatik veya manuel olarak yönlendirilir.

- **Güvenli JWT Tabanlı Kimlik Doğrulama:**
  Kullanıcıların güvenli bir şekilde sisteme giriş yapabilmesi için JSON Web Token (JWT) kullanılır.

---

## 🛠️ Teknoloji Stack'i

### Backend

- **Framework:** NestJS
- **Dil:** TypeScript
- **Veritabanı:** PostgreSQL (PostGIS eklentili)
- **Cache:** Redis
- **Depolama:** MinIO (S3 uyumlu)
- **API Dokümantasyonu:** Swagger
- **Validasyon:** class-validator, class-transformer

### Frontend

- **Web:** React
- **Mobil:** React Native
- **State Yönetimi:** Redux Toolkit
- **UI Kütüphanesi:** Chakra UI
- **Harita:** Leaflet.js

### DevOps & Araçlar

- **Monorepo:** pnpm Workspaces + TurboRepo
- **Konteynerizasyon:** Docker, Docker Compose
- **CI/CD:** GitHub Actions
- **Test:** Jest
- **Linting & Formatlama:** ESLint, Prettier
- **Versiyon Kontrolü:** Git, Conventional Commits

---

## 🚀 Kurulum

### Gereksinimler

- **Node.js:** v18 veya üstü
- **pnpm:** v8 veya üstü
- **Docker & Docker Compose:** En az Docker kurulumu
- **Git:** Sürüm kontrol sistemi

### Adım Adım Kurulum

1. **Repoyu Klonlayın:**

   ```bash
   git clone https://github.com/username/kentnabiz.git
   cd kentnabiz
   ```

2. **Bağımlılıkları Yükleyin:**

   ```bash
   pnpm install
   ```

3. **Ortam Değişkenlerini Yapılandırın:**

   ```bash
   cp .env.example .env
   # .env dosyasını düzenleyin (veritabanı, API anahtarı, vb.)
   ```

4. **Docker Servislerini Başlatın:**

   ```bash
   docker-compose up -d
   ```

5. **Veritabanını Sıfırlayın ve Seed Verilerini Yükleyin:**

   ```bash
   pnpm db:reset
   ```

6. **Uygulamayı Geliştirme Modunda Başlatın:**
   ```bash
   pnpm dev
   ```

---

## 💻 Geliştirme Ortamı

### Monorepo Yapısı

Proje, bir monorepo yapısına sahiptir. Bu yapı, tüm uygulama bileşenlerinin ortak bir depoda yer almasını sağlar:

- **api:** NestJS tabanlı backend uygulaması
- **apps/web:** React tabanlı web uygulaması
- **apps/mobile:** React Native ile mobil uygulama
- **shared:** Ortak kodlar, tipler ve yardımcı fonksiyonlar
- **ui:** Ortak UI bileşenleri
- **test-lib:** Test yardımcı kütüphaneleri

### Kullanılan Servisler

Docker Compose ile başlatılan servisler:

- **PostgreSQL:** PostGIS eklentisi ile coğrafi veri desteği
- **Redis:** Cache işlemleri için
- **MinIO:** S3 uyumlu dosya depolama

### Yararlı Komutlar

```bash
# Geliştirme modunda çalıştırma (monorepo genelinde)
pnpm dev

# Sadece API'nin geliştirme modunda çalıştırılması
pnpm dev:api

# Veritabanını sıfırlama ve seed verilerini yükleme
pnpm db:reset

# Testleri çalıştırma
pnpm test

# Linting
pnpm lint

# Build işlemi
pnpm build
```

---

## 🧪 Test

Projede kapsamlı testler bulunmaktadır:

```bash
# Tüm testleri çalıştırma
pnpm test

# Belirli bir workspace'in testlerini çalıştırma (ör. API)
pnpm --filter api test

# Test coverage raporu oluşturma
pnpm test:cov
```

---

## 📚 API Dokümantasyonu

API, Swagger UI üzerinden dokümante edilmiştir. Uygulama çalışırken aşağıdaki URL'den erişebilirsiniz:

```
http://localhost:3000/api/docs
```

---

## 🤝 Katkıda Bulunma

Katkıda bulunmak isteyen geliştiriciler için öneriler:

1. **Repoyu Forklayın:**
   Kendi fork'unuzu oluşturun.

2. **Yeni Bir Branch Oluşturun:**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Değişiklikleri Yapın ve Commit Edin:**
   Commit mesajlarınızı [Conventional Commits](https://www.conventionalcommits.org) standardına uygun şekilde hazırlayın.

   ```bash
   git commit -m 'feat: add amazing feature'
   ```

4. **Branch'i Push Edin:**

   ```bash
   git push origin feature/amazing-feature
   ```

5. **Pull Request Açın:**
   Değişikliklerinizi ana repoya merge edilmesi için bir pull request oluşturun.

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.

---



## Ek Bilgiler

- **Versiyon Kontrolü:**
  Proje, Git ve Conventional Commits kullanılarak sürümlenmektedir.



- **Kod Standartları:**
  ESLint ve Prettier ile kod kalitesi sağlanmaktadır.

---

🌟 KentNabız ile şehrinizi iyileştirmeye katkıda bulunun! 🌟
