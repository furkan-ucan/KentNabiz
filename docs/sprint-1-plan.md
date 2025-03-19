# Sprint 1 – Monorepo Kurulumu ve Temel Yapılandırma

## 1. Sprint Hedefleri

### 1.1. Zaman Çizelgesi (4 Hafta)

- **Hafta 1**: Monorepo yapısının kurulması ve proje iskeletinin oluşturulması
- **Hafta 2**: Backend core yapılandırması ve veritabanı entegrasyonu
- **Hafta 3**: Frontend ve shared paketlerin oluşturulması
- **Hafta 4**: Test ve deployment altyapısının kurulması

### 1.2. Temel Hedefler

- pnpm workspace kurulumu
- NestJS monolitik API altyapısı
- React frontend ve shared paketler
- Local development environment

## 2. Monorepo Yapılandırması

### 2.1. Proje Yapısı

```
root/
├── apps/
│   ├── api/              # NestJS backend
│   ├── web/              # React frontend
│   └── mobile/           # React Native (temel yapı)
├── packages/
│   ├── shared/          # Ortak utilities
│   └── ui/              # UI components
└── tools/               # Build tools
```

### 2.2. Teknik Gereksinimler

#### Development Tools

- pnpm (workspace yönetimi)
- TypeScript
- ESLint + Prettier
- Jest
- Docker Desktop

#### Core Dependencies

- NestJS
- React 18+
- PostgreSQL
- Redis

## 3. Günlük İş Planı

### Hafta 1 - Temel Yapı

| Gün       | Görev                              |
| --------- | ---------------------------------- |
| Pazartesi | Monorepo iskeletinin oluşturulması |
| Salı      | pnpm workspace yapılandırması      |
| Çarşamba  | Shared paketlerin oluşturulması    |
| Perşembe  | Development ortamı kurulumu        |
| Cuma      | Docker servisleri yapılandırması   |

### Hafta 2 - Backend

| Gün       | Görev                         |
| --------- | ----------------------------- |
| Pazartesi | NestJS app setup              |
| Salı      | Veritabanı şemaları           |
| Çarşamba  | Core modüllerin oluşturulması |
| Perşembe  | Auth sistem temelleri         |
| Cuma      | API test yapılandırması       |

### Hafta 3 - Frontend

| Gün       | Görev                  |
| --------- | ---------------------- |
| Pazartesi | React app setup        |
| Salı      | UI kit entegrasyonu    |
| Çarşamba  | Routing yapılandırması |
| Perşembe  | Shared hooks ve utils  |
| Cuma      | Frontend test setup    |

### Hafta 4 - Build & Deployment

| Gün       | Görev                        |
| --------- | ---------------------------- |
| Pazartesi | Build pipeline kurulumu      |
| Salı      | Local deployment testleri    |
| Çarşamba  | Test coverage yapılandırması |
| Perşembe  | Dokümantasyon                |
| Cuma      | Review ve optimizasyon       |

## 4. Development Workflow

### 4.1. Local Development

```yaml
Services:
  - PostgreSQL (Docker)
  - Redis (Docker)
  - MinIO (Docker, S3 alternative)
  - API (local)
  - Web (local)
```

### 4.2. Development Practises

- Feature branch workflow
- Conventional commits
- Pre-commit hooks
- Unit test coverage

## 5. Başarı Kriterleri

### 5.1. Teknik Kriterler

- Tüm servislerin local ortamda çalışması
- Workspace scripts'lerinin düzgün işlemesi
- Test altyapısının hazır olması
- Hot reload desteği

### 5.2. Dokümantasyon

- README dosyaları
- API dokümantasyonu
- Development guide
- Architecture overview

## 6. Özet

Bu sprint, KentNabız projesinin monorepo yapısında geliştirilmesi için gerekli temel altyapının kurulmasını hedeflemektedir. pnpm workspace kullanılarak modüler bir yapı oluşturulacak, development araçları ve süreçleri tek geliştirici için optimize edilecektir. Sprint sonunda, projenin sonraki aşamaları için sağlam bir temel oluşturulmuş olacaktır.
