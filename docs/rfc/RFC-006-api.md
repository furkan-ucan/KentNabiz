# RFC-006: API Geliştirme ve Veri Entegrasyonu

## Metadata

```yaml
RFC Numarası: RFC-006
Başlık: API Geliştirme ve Veri Entegrasyonu
Yazar: Ali Yılmaz
Durum: Taslak
Oluşturma Tarihi: 2024-01-20
Son Güncelleme: 2024-01-20
İlgili Bileşenler: Backend
```

## 1. Özet

Bu RFC, KentNabız platformunun API yapısını ve veri entegrasyonunu monolitik bir yaklaşımla ele almaktadır. MVP sürecinde NestJS tabanlı tek bir API servisi ile başlanacak, gerektiğinde modüler yapı sayesinde ileride mikroservislere geçiş yapılabilecektir.

## 2. API Tasarımı

### 2.1. Genel API Yapısı

```typescript
interface APIConfig {
  version: 'v1';
  baseUrl: '/api/v1';
  format: 'json';
  authentication: {
    type: 'jwt';
    headerName: 'Authorization';
    scheme: 'Bearer';
  };
}

interface StandardResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
```

### 2.2. NestJS Modüler Yapı

```typescript
interface APIModules {
  core: {
    auth: AuthModule;
    reports: ReportsModule;
    users: UsersModule;
  };

  shared: {
    database: DatabaseModule;
    cache: CacheModule;
    upload: UploadModule;
  };

  config: {
    env: ConfigModule;
    validation: ValidationModule;
  };
}
```

## 3. Monolitik API Mimarisi

### 3.1. Katmanlı Mimari

```typescript
interface LayeredArchitecture {
  presentation: {
    controllers: 'HTTP/WebSocket controllers';
    middlewares: 'Global middlewares';
    interceptors: 'Response transformers';
  };

  business: {
    services: 'Business logic';
    validators: 'DTO validation';
    mappers: 'Entity/DTO mapping';
  };

  data: {
    repositories: 'Data access';
    entities: 'Database models';
    migrations: 'Schema changes';
  };
}
```

### 3.2. Module Yapısı

```typescript
interface ModuleStructure {
  common: {
    guards: ['JwtGuard', 'RolesGuard'];
    filters: ['HttpExceptionFilter'];
    pipes: ['ValidationPipe'];
  };

  features: {
    auth: ['local', 'jwt', 'refresh'];
    reports: ['crud', 'media', 'geo'];
    users: ['profile', 'preferences'];
  };
}
```

## 4. Veri Katmanı

### 4.1. TypeORM Entegrasyonu

```typescript
interface DatabaseConfig {
    type: 'postgres';
    entities: ['dist/**/*.entity{.ts,.js}'];
    migrations: ['dist/migrations/*{.ts,.js}'];
    connection: {
        host: process.env.DB_HOST;
        port: process.env.DB_PORT;
        ssl: process.env.NODE_ENV === 'production';
    };
}
```

### 4.2. Redis Cache

```typescript
interface CacheConfig {
  driver: 'redis';
  prefix: 'urbanpulse:';
  ttl: 3600; // 1 saat
  invalidation: {
    tags: true;
    patterns: true;
  };
}
```

## 5. API Endpoint'leri

### 5.1. Auth Endpoints

```typescript
interface AuthEndpoints {
  base: '/auth';
  routes: {
    login: {
      method: 'POST';
      path: '/login';
      dto: LoginDto;
    };
    register: {
      method: 'POST';
      path: '/register';
      dto: RegisterDto;
    };
    refresh: {
      method: 'POST';
      path: '/refresh';
      dto: RefreshTokenDto;
    };
  };
}
```

### 5.2. Report Endpoints

```typescript
interface ReportEndpoints {
  base: '/reports';
  routes: {
    create: {
      method: 'POST';
      path: '/';
      dto: CreateReportDto;
    };
    list: {
      method: 'GET';
      path: '/';
      query: ListReportsQuery;
    };
    detail: {
      method: 'GET';
      path: '/:id';
      param: string;
    };
    update: {
      method: 'PUT';
      path: '/:id';
      dto: UpdateReportDto;
    };
  };
}
```

## 6. Güvenlik

### 6.1. Authentication

```typescript
interface AuthConfig {
  jwt: {
    secret: string;
    expiresIn: '15m';
    refreshExpiresIn: '7d';
  };

  password: {
    saltRounds: 10;
    minLength: 8;
  };
}
```

### 6.2. Authorization

```typescript
interface RoleConfig {
  roles: ['citizen', 'staff', 'admin'];
  default: 'citizen';
  permissions: {
    reports: {
      create: ['citizen', 'staff', 'admin'];
      update: ['staff', 'admin'];
      delete: ['admin'];
    };
  };
}
```

## 7. Performans Optimizasyonları

### 7.1. Database

```typescript
interface DBOptimization {
  indexes: {
    reports: ['category_status_idx', 'location_idx', 'created_at_idx'];
  };

  queries: {
    maxLimit: 100;
    defaultLimit: 20;
    cacheTime: 300; // 5 dakika
  };
}
```

### 7.2. Caching Stratejisi

```typescript
interface CacheStrategy {
  lists: {
    ttl: 300; // 5 dakika
    invalidate: ['create', 'update'];
  };

  entities: {
    ttl: 3600; // 1 saat
    invalidate: ['update', 'delete'];
  };
}
```

## 8. Error Handling

### 8.1. Exception Filter

```typescript
interface ErrorHandling {
  statusMappings: {
    ValidationError: 400;
    UnauthorizedError: 401;
    ForbiddenError: 403;
    NotFoundError: 404;
    ConflictError: 409;
  };

  logging: {
    errors: true;
    validation: false;
    auth: true;
  };
}
```

### 8.2. Response Transformasyonu

```typescript
interface ResponseTransform {
    success: {
        wrapper: true;
        metadata: true;
    };

    error: {
        stacktrace: process.env.NODE_ENV !== 'production';
        codes: true;
        validation: true;
    };
}
```

## 9. API Dokümantasyonu

### 9.1. Swagger Integration

```typescript
interface SwaggerConfig {
  enabled: true;
  path: '/api/docs';
  title: 'KentNabız API';
  version: '1.0';
  security: {
    bearer: true;
  };
}
```

### 9.2. Response Örnekleri

```typescript
interface SwaggerExamples {
  success: {
    login: LoginResponseExample;
    report: ReportResponseExample;
  };

  error: {
    validation: ValidationErrorExample;
    auth: AuthErrorExample;
  };
}
```

## 10. Rate Limiting

### 10.1. Global Limitler

```typescript
interface RateLimits {
  public: {
    window: 900_000; // 15 dakika
    max: 100;
  };

  authenticated: {
    window: 900_000;
    max: 1000;
  };
}
```

### 10.2. Endpoint Limitleri

```typescript
interface EndpointLimits {
  'auth/login': {
    window: 3600_000; // 1 saat
    max: 5;
  };

  'reports/create': {
    window: 3600_000;
    max: 10;
  };
}
```

## 11. Uygulama Planı

### 11.1. Faz 1: Core API (2 hafta)

1. NestJS temel yapı
2. Auth sistemi
3. CRUD endpoints

### 11.2. Faz 2: Optimizasyon (1 hafta)

1. Caching implementasyonu
2. Error handling
3. Rate limiting

### 11.3. Faz 3: Dokümantasyon (1 hafta)

1. Swagger entegrasyonu
2. Response örnekleri
3. Validation rules

## 12. Sonuç

Bu RFC, KentNabız platformunun API yapısını monolitik bir yaklaşımla ele almaktadır. NestJS'in modüler yapısı sayesinde, başlangıçta tek bir servis olarak geliştirilen API, ileride ihtiyaç duyulması halinde kolayca mikroservislere bölünebilecektir. MVP sürecinde temel özelliklere odaklanılarak, hızlı bir şekilde kullanılabilir bir API sunulması hedeflenmektedir.
