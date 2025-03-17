# Sprint 2 - Monolitik API Geliştirme

## 1. API Yapılandırması

### 1.1. NestJS Modüler Yapı
```typescript
apps/api/src/
├── modules/
│   ├── auth/         # Kimlik doğrulama
│   ├── users/        # Kullanıcı yönetimi
│   ├── reports/      # Rapor işlemleri
│   └── media/        # Medya yönetimi
├── common/           # Shared utilities
└── config/          # Konfigürasyon
```

### 1.2. Core Modules
- **AuthModule**: JWT tabanlı auth sistemi
- **UserModule**: Kullanıcı CRUD işlemleri
- **ReportModule**: Rapor yönetimi
- **MediaModule**: Dosya upload işlemleri

## 2. API Development

### 2.1. Endpoint Yapısı
- Base URL: `/api/v1`
- Standardize response format:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    total?: number;
  };
}
```

### 2.2. Core Endpoints
```typescript
// Auth endpoints
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
GET    /auth/profile

// User endpoints
GET    /users
GET    /users/:id
PATCH  /users/:id

// Report endpoints
POST   /reports
GET    /reports
GET    /reports/:id
PUT    /reports/:id
DELETE /reports/:id
POST   /reports/:id/media
```

## 3. Database ve Storage

### 3.1. PostgreSQL Schema
- Users table
- Reports table
- Media records
- PostGIS extension

### 3.2. Local Storage
- MinIO S3-compatible storage
- File type validation
- Image optimization
- Secure URLs

## 4. Sprint Planı

### Hafta 1 - Core API
| Gün | Görev |
|-----|-------|
| Pazartesi | Auth module implementasyonu |
| Salı | User module ve CRUD |
| Çarşamba | Database migration ve seeding |
| Perşembe | Unit test yazımı |
| Cuma | API dokümantasyonu |

### Hafta 2 - Report & Media
| Gün | Görev |
|-----|-------|
| Pazartesi | Report module geliştirmesi |
| Salı | Media upload sistemi |
| Çarşamba | MinIO entegrasyonu |
| Perşembe | Integration testleri |
| Cuma | API optimizasyonu |

## 5. Teknik Detaylar

### 5.1. Auth Implementation
```typescript
@Injectable()
export class AuthService {
  login() { /* JWT auth */ }
  register() { /* User creation */ }
  refresh() { /* Token refresh */ }
}
```

### 5.2. Media Handling
```typescript
@Injectable()
export class MediaService {
  upload() { /* S3 upload */ }
  getSignedUrl() { /* Secure URL */ }
  optimize() { /* Image processing */ }
}
```

## 6. Development Guidelines

### 6.1. Code Quality
- ESLint kuralları
- Prettier yapılandırması
- Jest test coverage
- API documentation

### 6.2. Security
- JWT based auth
- Input validation
- File type checking
- Rate limiting

## 7. Başarı Kriterleri

### 7.1. Technical
- Test coverage > 80%
- API response < 200ms
- Successful file upload
- Clean code standards

### 7.2. Documentation
- Swagger/OpenAPI docs
- Postman collection
- Code comments
- README updates

## 8. Özet
Sprint 2, KentNabız projesinin monolitik API yapısının geliştirilmesine odaklanmaktadır. NestJS kullanılarak modüler ve test edilebilir bir API yapısı oluşturulacak, temel CRUD operasyonları ve dosya yönetimi implementasyonları tamamlanacaktır.