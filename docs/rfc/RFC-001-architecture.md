# RFC-001: Proje Genel Mimari ve Teknoloji Seçimleri

## Metadata
```yaml
RFC Numarası: RFC-001
Başlık: Proje Genel Mimari ve Teknoloji Seçimleri
Yazar: Ali Yılmaz
Durum: Taslak
Oluşturma Tarihi: 2024-01-20
Son Güncelleme: 2024-01-20
İlgili Bileşenler: Frontend, Backend, Mobile, Database, DevOps
```

## 1. Özet
Bu RFC, KentNabız platformunun temel mimarisini, kullanılacak teknolojileri ve sistemin MVP sürecinden başlayarak nasıl geliştirileceğini detaylandırmaktadır. Doküman, projenin teknik vizyonunu ortaya koyarak, geliştirme sürecinde referans olarak kullanılacaktır.

## 2. Genel Mimari

### 2.1. Sistem Mimarisi
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

### 2.2. Temel Bileşenler
1. Frontend (Web)
2. Mobile App
3. Backend (Monolitik)
4. Database Layer
5. DevOps Infrastructure

## 3. Teknoloji Seçimleri

### 3.1. Frontend (Web)

#### Teknolojiler
- **React 18+**
  - Modern component yapısı
  - Hook-based state management
  - Virtual DOM optimizasyonu

- **TypeScript**
  - Tip güvenliği
  - IDE desteği
  - Kod kalitesi

- **Redux Toolkit**
  - Merkezi state yönetimi
  - RTK Query ile cache yönetimi

- **Leaflet.js**
  - Hafif ve performanslı
  - Mobile-friendly
  - OpenStreetMap desteği

- **Material UI**
  - Hazır UI komponetleri
  - Tema desteği
  - Responsive design

### 3.2. Mobile App

#### Teknolojiler
- **React Native**
  - Cross-platform geliştirme
  - Native performans
  - Code sharing

- **React Native Maps**
  - Native map integration
  - Performans
  - Offline support

### 3.3. Backend (Monolitik NestJS)

#### Core Özellikler
- TypeScript-first geliştirme
- Modern mimari yapı
- Modüler yapı
- Dependency Injection
- OpenAPI (Swagger) desteği
- Built-in validation

#### Temel Modüller
1. **Auth Module**
   - JWT authentication
   - Role-based access control
   - Session management

2. **Report Module**
   - CRUD operations
   - File uploads
   - Business logic

3. **Maps Module**
   - Geo-processing
   - PostGIS integration
   - Report visualization

### 3.4. Database Layer

#### PostgreSQL + PostGIS
- Spatial data support
- ACID compliance
- Complex queries

#### Redis
- Session storage
- API caching
- Rate limiting

## 4. Modüler Yapı

### 4.1. Frontend Modüler Yapı
```typescript
src/
├── components/          # Reusable components
│   ├── common/         # Shared components
│   ├── maps/          # Map related components
│   └── forms/         # Form components
├── pages/             # Route components
├── services/          # API services
├── store/            # Redux store
├── hooks/            # Custom hooks
└── utils/            # Utility functions
```

### 4.2. Backend Modüler Yapı
```typescript
src/
├── main.ts                 # Ana uygulama girişi
├── app.module.ts           # Ana modül
├── modules/               # Feature modülleri
│   ├── auth/             # Kimlik doğrulama
│   ├── reports/          # Raporlama sistemi
│   └── maps/            # Harita ve konum
├── shared/               # Paylaşılan öğeler
│   ├── interfaces/       # Ortak arayüzler
│   ├── decorators/      # Custom decoratorler
│   └── filters/         # Exception filters
└── config/              # Yapılandırma dosyaları
```

## 5. Ölçeklenebilirlik Stratejisi

### 5.1. MVP Aşaması
- Monolitik mimari
- Tek sunucu deployment
- Manuel scaling

### 5.2. İkinci Aşama Tetikleyicileri
- Kullanıcı sayısı > 10,000
- Veri hacmi > 1TB
- Request rate > 1000 req/s

### 5.3. İkinci Aşama Hedefleri
- Mikroservis mimarisine geçiş
- Container orchestration
- Auto-scaling

## 6. DevOps & CI/CD

### 6.1. Infrastructure (MVP)
- Single VPS hosting
- Nginx web server
- PM2 process manager
- Docker containerization

### 6.2. Monitoring (MVP)
- Basic logging
- Error tracking
- Uptime monitoring

## 7. Güvenlik

### 7.1. Authentication & Authorization
- JWT based auth
- 3 temel rol (citizen, staff, admin)
- API key management

### 7.2. Data Security
- SSL/TLS
- Input validation
- Rate limiting

## 8. Minimum Viable Product (MVP)

### 8.1. MVP Özellikleri
1. **Auth**
   - Basic login/register
   - Role management
   - Session handling

2. **Reports**
   - Report creation
   - Basic listing/filtering
   - Status updates

3. **Maps**
   - Basic map view
   - Report markers
   - Location selection

### 8.2. MVP Zaman Çizelgesi (2 Ay)

1. **Hafta 1-2: Temel Altyapı**
   - Proje scaffolding
   - Development environment
   - Database setup

2. **Hafta 3-4: Core Features**
   - User authentication
   - Basic CRUD
   - File upload

3. **Hafta 5-6: Frontend**
   - UI components
   - Map integration
   - API integration

4. **Hafta 7-8: Mobile**
   - Basic screens
   - Map integration
   - Core features

## 9. Başarı Kriterleri

### 9.1. Development
- Deployment süresi < 15 dakika
- Test coverage > 70%
- Code quality score > 85

### 9.2. Performance
- API response time < 200ms
- Frontend load time < 2s
- Database query time < 100ms

### 9.3. Resource Usage
- RAM < 2GB
- CPU < 50%
- Disk < 20GB

## 10. Sonuç

Bu RFC'de önerilen mimari ve teknoloji seçimleri, tek geliştirici ortamında yönetilebilir, MVP odaklı ve ölçeklenebilir bir sistem sunmaktadır. Monolitik başlangıç yaklaşımı ile hızlı geliştirme ve deployment sağlanırken, gelecekteki büyüme ihtiyaçları için geçiş planı sunulmaktadır.