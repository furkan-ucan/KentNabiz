# KentNabız (UrbanPulse) – Sistem ve Mimari Dokümanı

## 1. Sistem Mimarisi

### 1.1. Genel Mimari Yapı

```
                        [Client Layer]
            Web App (React)    Mobile App (React Native)
                              |
                    [API Layer (NestJS)]
                      Auth | Reports | Maps
                            |
                    [Data Layer]
    +-------------+  +------------+  +-----------+
    |  PostgreSQL |  |   Redis   |  |  S3/Blob  |
    | (Core Data) |  |  (Cache)  |  |  (Media)  |
    +-------------+  +------------+  +-----------+
```

### 1.2. Monorepo Yapısı

```
root/
├── apps/
│   ├── api/            # NestJS backend
│   ├── web/            # React frontend
│   └── mobile/         # React Native
├── packages/
│   ├── shared/         # Ortak utility ve tipler
│   └── ui/            # Ortak UI komponentleri
└── tools/             # Build ve development araçları
```

## 2. Teknoloji Stack'i

### 2.1. Frontend Teknolojileri

#### Web Uygulaması

- **React 18+**
  - Modern component mimarisi
  - Hook tabanlı state yönetimi
  - React Query ile veri yönetimi
- **TypeScript**
  - Tip güvenliği
  - Geliştirici deneyimi
  - Kod kalitesi
- **Redux Toolkit**
  - Merkezi state yönetimi
  - İzolasyonlu state yapısı
- **Leaflet.js**
  - Harita görselleştirme
  - Marker yönetimi
  - Isı haritaları
- **Chart.js**
  - Veri görselleştirme
  - İnteraktif grafikler

#### Mobile Uygulama

- **React Native**
  - Cross-platform geliştirme
  - Native performans
  - Kod paylaşımı
- **React Navigation**
  - Routing yönetimi
  - Deep linking
- **React Native Maps**
  - Native harita entegrasyonu
  - Offline harita desteği

### 2.2. Backend Teknolojileri

#### NestJS Monolitik API

- TypeScript desteği
- Modüler yapı
- Dependency injection
- OpenAPI entegrasyonu

#### Veritabanları

- **PostgreSQL & PostGIS**
  - İlişkisel veri yönetimi
  - Coğrafi veri desteği
  - Spatial indexing
- **Redis**
  - Önbellekleme
  - Session yönetimi
  - Real-time veri

### 2.3. Development Araçları

#### Version Control

- Git
- GitHub
- Conventional Commits

#### Development Environment

- VS Code
- Docker (local development)
- pnpm workspaces

## 3. Veri Akış Diyagramları

### 3.1. Rapor Oluşturma Akışı

```
[Mobile/Web Client] -> [NestJS API]
           |               |
           v               v
    [File Upload]    [PostgreSQL/PostGIS]
           |               |
           v               v
    [Media Storage]   [Notification]
```

### 3.2. Kullanıcı Kimlik Doğrulama Akışı

```
[Client] -> [NestJS Auth Module]
              |
              v
         [Redis Cache]
              |
              v
         [PostgreSQL]
```

## 4. Güvenlik Mimarisi

### 4.1. Authentication

- JWT based auth
- Refresh token mekanizması
- Session yönetimi

### 4.2. Authorization

- Role-based access control
- Resource-based permissions
- API endpoint security

### 4.3. Data Security

- SSL/TLS
- Input validation
- Data masking

## 5. Performans Optimizasyonları

### 5.1. Caching Strategy

- Redis cache layers
- Browser caching
- API response caching

### 5.2. Performance Enhancement

- Image optimization
- API response compression
- Database indexing

## 6. Development Workflow

### 6.1. Local Development

- Docker Compose for services
- Hot reload setup
- Shared environment config

### 6.2. Testing Strategy

- Jest for unit tests
- React Testing Library
- Supertest for API tests
- E2E with Cypress

### 6.3. Code Quality

- ESLint configuration
- Prettier setup
- Husky pre-commit hooks
- SonarQube analysis

Bu doküman, KentNabız projesinin monorepo tabanlı mimarisini ve sistem yapısını detaylı bir şekilde açıklamaktadır. Geliştirme sürecinde bu doküman referans olarak kullanılmalı ve sistem geliştikçe güncellenmelidir.
