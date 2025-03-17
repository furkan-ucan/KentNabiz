# KentNabız – Anlık Şehir Sorunları İzleme ve Müdahale Platformu
## Proje Planlama Dokümanı

### 1. Proje Zaman Çizelgesi ve Kilometre Taşları

#### Faz 1: Başlangıç ve Temel Altyapı (1-2. Ay)
- [x] Proje başlangıç toplantısı ve dökümanların hazırlanması
- [ ] Gereksinim analizi ve teknik tasarım dokümanları
- [ ] Monorepo yapısının kurulması (pnpm workspaces)
- [ ] Veritabanı şeması tasarımı
- [ ] Development ortamı kurulumu (Docker, VS Code)

#### Faz 2: Core Geliştirme (2-4. Ay)
- [ ] NestJS backend temel yapısı
- [ ] PostgreSQL & Redis entegrasyonu
- [ ] Kullanıcı yönetimi ve auth sistemi
- [ ] Rapor yönetimi API'leri
- [ ] Shared paketlerin oluşturulması

#### Faz 3: Frontend Geliştirme (4-6. Ay)
- [ ] React web uygulaması scaffold
- [ ] UI komponent kütüphanesi
- [ ] Harita entegrasyonu
- [ ] State management implementasyonu
- [ ] Form ve validasyon sistemi

#### Faz 4: Mobile Geliştirme (6-8. Ay)
- [ ] React Native uygulama scaffold
- [ ] Shared paketlerin mobile entegrasyonu
- [ ] Native özelliklerin implementasyonu
- [ ] Offline-first stratejisi
- [ ] Mobile CI yapılandırması

#### Faz 5: Test ve Optimizasyon (8-9. Ay)
- [ ] Test coverage artırımı
- [ ] Performance optimizasyonları
- [ ] Error handling geliştirmeleri
- [ ] Dokümantasyon güncellemeleri

### 2. Geliştirici Araçları ve Ortam Kurulumu

#### Development Stack
- VS Code + Extensions
  - ESLint
  - Prettier
  - Docker
  - GitLens
  - REST Client
- Node.js v18+
- pnpm
- Docker Desktop
- Git

#### Local Development Ortamı
- Docker Compose ile servisler
  - PostgreSQL
  - Redis
  - Minio (S3 alternatifi)
- Hot reload yapılandırması
- SSL sertifikaları (mkcert)
- Environment değişkenleri

### 3. Geliştirici İş Akışı

#### Versiyonlama
- Feature branch workflow
- Conventional commits
- Semantic versioning
- Pre-commit hooks (husky)

#### Kod Kalitesi
- ESLint kuralları
- Prettier formatı
- SonarLint entegrasyonu
- Test coverage hedefleri

#### Testing
- Unit tests (Jest)
- Integration tests
- E2E tests (seçili flows)
- Manual testing

### 4. Local Development Guide

#### Başlangıç
```bash
# Repository klonlama
git clone https://github.com/username/kentnabiz.git
cd kentnabiz

# Dependency kurulumu
pnpm install

# Development servisleri başlatma
docker-compose up -d

# Environment değişkenleri
cp .env.example .env
```

#### Servis Başlatma
```bash
# API geliştirme
pnpm dev:api

# Web geliştirme
pnpm dev:web

# Mobile geliştirme
pnpm dev:mobile
```

#### Test Çalıştırma
```bash
# Tüm testler
pnpm test

# Specific workspace testleri
pnpm test:api
pnpm test:web
pnpm test:mobile
```

### 5. Monorepo Yapılandırması

#### Workspace Organizasyonu
```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

#### Shared Paketler
- **@kentnabiz/shared**
  - Ortak tipler
  - Utility fonksiyonları
  - API client

- **@kentnabiz/ui**
  - Ortak UI komponentleri
  - Tema sistemi
  - Icon pack

#### Scripts
```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "turbo run format"
  }
}
```

### 6. Development Best Practices

#### Code Organization
- Feature-based organizasyon
- Shared kod maksimizasyonu
- DRY prensibi
- SOLID prensipleri

#### Performance
- Lazy loading
- Code splitting
- Bundle size optimizasyonu
- Database indexing

#### Security
- Input validation
- XSS koruması
- CSRF tokenları
- Rate limiting

Bu plan, projenin tek geliştirici tarafından monorepo yapısında geliştirilmesi için gerekli tüm bileşenleri içermektedir. Plan, geliştirme süreci ilerledikçe güncellenecek ve detaylandırılacaktır.