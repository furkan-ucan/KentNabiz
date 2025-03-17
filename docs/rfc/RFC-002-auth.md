# RFC-002: Kullanıcı Yönetimi ve Kimlik Doğrulama

## Metadata
```yaml
RFC Numarası: RFC-002
Başlık: Kullanıcı Yönetimi ve Kimlik Doğrulama
Yazar: Ali Yılmaz
Durum: Taslak
Oluşturma Tarihi: 2024-01-20
Son Güncelleme: 2024-01-20
İlgili Bileşenler: Auth Service, Frontend, Mobile
```

## 1. Özet
Bu RFC, KentNabız platformunda kullanıcı yönetimi, kimlik doğrulama ve yetkilendirme süreçlerini detaylandırmaktadır. MVP sürecinde basit ve etkili bir auth sistemi hedeflenmektedir.

## 2. Kullanıcı Tipleri ve Roller

### 2.1. Kullanıcı Rolleri
```typescript
enum UserRole {
    CITIZEN = 'citizen',    // Vatandaş
    STAFF = 'staff',       // Belediye personeli
    ADMIN = 'admin'        // Sistem yöneticisi
}

interface RolePermissions {
    role: UserRole;
    permissions: string[];
    description: string;
}
```

### 2.2. Rol Yetkileri

#### Vatandaş (CITIZEN)
- Sorun raporlama
- Rapor takibi
- Profil yönetimi
- Temel harita görünümü

#### Belediye Personeli (STAFF)
- Rapor inceleme ve güncelleme
- Durum güncelleme
- Vatandaş iletişimi
- Temel istatistikler

#### Sistem Yöneticisi (ADMIN)
- Kullanıcı yönetimi
- Sistem ayarları
- Tam rapor yönetimi
- Tüm özelliklere erişim

## 3. Kimlik Doğrulama Sistemi

### 3.1. Kayıt Süreci

#### Vatandaş Kaydı
```typescript
interface CitizenRegistration {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
}
```

#### Personel Kaydı
```typescript
interface StaffRegistration {
    fullName: string;
    email: string;
    password: string;
    employeeId: string;
    department: string;
}
```

### 3.2. Giriş Yöntemi

#### JWT Authentication
```typescript
interface AuthConfig {
    jwt: {
        secret: string;
        expiresIn: string;     // '15m'
        refreshExpiresIn: string;  // '7d'
    };
    
    session: {
        store: 'redis';
        prefix: string;
        ttl: number;          // 24 hours
    };
}
```

#### Login Flow
```typescript
interface LoginRequest {
    email: string;
    password: string;
    deviceId?: string;
}

interface LoginResponse {
    token: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        fullName: string;
        role: UserRole;
    };
}
```

## 4. Yetkilendirme Sistemi

### 4.1. Permission-Based Access Control
```typescript
interface Permission {
    resource: string;
    action: 'create' | 'read' | 'update' | 'delete';
    scope?: 'own' | 'all';
}

const DefaultPermissions: Record<UserRole, Permission[]> = {
    citizen: [
        { resource: 'reports', action: 'create' },
        { resource: 'reports', action: 'read', scope: 'own' },
        { resource: 'profile', action: 'update', scope: 'own' }
    ],
    staff: [
        { resource: 'reports', action: 'read', scope: 'all' },
        { resource: 'reports', action: 'update', scope: 'all' },
        { resource: 'profile', action: 'update', scope: 'own' }
    ],
    admin: [
        { resource: '*', action: '*', scope: 'all' }
    ]
};
```

## 5. Güvenlik Önlemleri

### 5.1. Şifre Politikası
```typescript
interface PasswordPolicy {
    minLength: 8;
    requireUppercase: true;
    requireLowercase: true;
    requireNumbers: true;
    requireSpecialChars: true;
    maxAge: 180;           // days
    preventReuse: 3;       // last N passwords
}
```

### 5.2. Rate Limiting
```typescript
interface RateLimitConfig {
    login: {
        windowMs: 15 * 60 * 1000;  // 15 minutes
        max: 5;                    // 5 attempts
        message: string;
    };
    
    api: {
        windowMs: 15 * 60 * 1000;  // 15 minutes
        max: 100;                  // 100 requests
        message: string;
    };
}
```

### 5.3. API Güvenliği
```typescript
interface SecurityHeaders {
    'Content-Security-Policy': string;
    'X-Content-Type-Options': 'nosniff';
    'X-Frame-Options': 'DENY';
    'X-XSS-Protection': '1; mode=block';
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains';
}
```

## 6. Veri Gizliliği

### 6.1. Kişisel Veri İşleme
```typescript
interface PrivacySettings {
    dataRetention: {
        userProfile: '5y';
        activityLogs: '2y';
        deletedAccounts: '1y';
    };
    
    encryption: {
        algorithm: 'AES-256-GCM';
        keyRotation: '90d';
    };
}
```

### 6.2. KVKK Uyumluluğu
- Açık rıza metni
- Veri işleme envanteri
- Veri silme prosedürü

## 7. MVP Kapsamı

### 7.1. MVP Auth Özellikleri
1. **Temel Auth**
   - Email/password login
   - JWT token yönetimi
   - 3 rol sistemi

2. **Güvenlik**
   - Basit şifre politikası
   - Rate limiting
   - SSL/TLS

3. **Veri Yönetimi**
   - Temel KVKK uyumu
   - Veri şifreleme
   - Log yönetimi

### 7.2. Faz 2 Özellikleri (Ertelenen)
1. Multi-factor authentication
2. SSO entegrasyonu
3. OAuth providers
4. Advanced audit logging
5. Role-based analytics

## 8. Test Stratejisi

### 8.1. Unit Tests
```typescript
interface AuthTestPlan {
    unit: {
        coverage: {
            statements: 80;
            branches: 80;
            functions: 80;
            lines: 80;
        };
        scenarios: [
            'registration',
            'login',
            'token-refresh',
            'password-reset'
        ];
    };
}
```

### 8.2. Integration Tests
```typescript
interface IntegrationTests {
    api: {
        endpoints: string[];
        auth: boolean;
        roles: UserRole[];
    };
    database: {
        transactions: boolean;
        rollback: boolean;
    };
}
```

## 9. Başarı Kriterleri

### 9.1. Güvenlik Metrikleri
- Failed login rate < 0.1%
- Security incidents < 1/ay
- Password strength score > 80%

### 9.2. Performans Metrikleri
- Auth işlemleri < 200ms
- Token validation < 50ms
- Concurrent users > 1000

## 10. Uygulama Planı

### Faz 1: Core Auth (2 hafta)
1. User model ve veritabanı
2. JWT implementasyonu
3. Basic auth endpoints
4. Role sistemi

### Faz 2: Security (1 hafta)
1. Password policies
2. Rate limiting
3. Security headers
4. SSL setup

### Faz 3: Testing (1 hafta)
1. Unit tests
2. Integration tests
3. Security testing
4. Load testing

## 11. Sonuç

Bu RFC, KentNabız platformunun kimlik doğrulama ve yetkilendirme sistemini MVP odaklı bir yaklaşımla ele almaktadır. Başlangıçta 3 temel rol ve basit ama güvenli bir auth sistemi ile başlanması, ilerleyen aşamalarda ihtiyaca göre genişletilmesi planlanmaktadır.