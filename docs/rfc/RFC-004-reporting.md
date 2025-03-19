# RFC-004: Raporlama ve Durum Takip Sistemi

## Metadata
```yaml
RFC Numarası: RFC-004
Başlık: Raporlama ve Durum Takip Sistemi
Yazar: Ali Yılmaz
Durum: Taslak
Oluşturma Tarihi: 2024-01-20
Son Güncelleme: 2024-01-20
İlgili Bileşenler: Frontend, Backend, Mobile
```

## 1. Özet
Bu RFC, KentNabız platformunda vatandaşların şehir sorunlarını raporlaması ve bu raporların takibi için gerekli sistem yapısını detaylandırmaktadır. MVP sürecinde temel raporlama ve takip özelliklerine odaklanılmıştır.

## 2. Rapor Yapısı

### 2.1. Temel Veri Modeli
```typescript
interface Report {
    id: string;
    title: string;
    description: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    category: ReportCategory;
    status: ReportStatus;
    priority: ReportPriority;
    media: MediaItem[];
    reporterId: string;
    assigneeId?: string;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
}

enum ReportCategory {
    INFRASTRUCTURE = 'infrastructure',  // Altyapı
    ENVIRONMENT = 'environment',        // Çevre
    SECURITY = 'security',             // Güvenlik
    OTHER = 'other'                    // Diğer
}

enum ReportStatus {
    NEW = 'new',               // Yeni
    IN_PROGRESS = 'in_progress', // İşleme Alındı
    RESOLVED = 'resolved',     // Çözüldü
    CLOSED = 'closed'          // Kapatıldı
}

enum ReportPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
}
```

### 2.2. Medya Yönetimi
```typescript
interface MediaItem {
    id: string;
    type: 'image' | 'video';
    url: string;
    thumbnailUrl?: string;
    metadata: {
        size: number;
        mimeType: string;
        width?: number;
        height?: number;
        duration?: number;
    };
    createdAt: Date;
}

interface MediaUploadConfig {
    maxSize: {
        image: number;     // 5MB
        video: number;     // 50MB
    };
    allowedTypes: {
        image: string[];   // ['image/jpeg', 'image/png']
        video: string[];   // ['video/mp4']
    };
    optimization: {
        image: {
            maxWidth: number;      // 1920px
            quality: number;       // 0.8
            createThumbnail: boolean;  // true
        };
        video: {
            maxDuration: number;   // 60s
            compress: boolean;     // false - Faz 2
        };
    };
}
```

## 3. API Endpoint'leri

### 3.1. Rapor Yönetimi
```typescript
interface ReportEndpoints {
    create: {
        method: 'POST';
        path: '/api/v1/reports';
        body: CreateReportDTO;
        response: Report;
    };
    
    list: {
        method: 'GET';
        path: '/api/v1/reports';
        query: {
            bounds?: {
                north: number;
                south: number;
                east: number;
                west: number;
            };
            category?: ReportCategory[];
            status?: ReportStatus[];
            fromDate?: Date;
            toDate?: Date;
            page?: number;
            limit?: number;
        };
        response: PaginatedResponse<Report>;
    };
    
    detail: {
        method: 'GET';
        path: '/api/v1/reports/:id';
        response: ReportDetail;
    };
    
    update: {
        method: 'PUT';
        path: '/api/v1/reports/:id';
        body: UpdateReportDTO;
        response: Report;
    };
}

interface CreateReportDTO {
    title: string;
    description: string;
    location: {
        latitude: number;
        longitude: number;
    };
    category: ReportCategory;
    media?: File[];
}

interface UpdateReportDTO {
    status?: ReportStatus;
    priority?: ReportPriority;
    assigneeId?: string;
    resolution?: string;
}
```

### 3.2. Medya Yönetimi
```typescript
interface MediaEndpoints {
    upload: {
        method: 'POST';
        path: '/api/v1/reports/:reportId/media';
        body: FormData;  // multipart/form-data
        response: MediaItem[];
    };
    
    delete: {
        method: 'DELETE';
        path: '/api/v1/reports/:reportId/media/:mediaId';
        response: void;
    };
}
```

## 4. Kullanıcı Arayüzü

### 4.1. Rapor Oluşturma Formu
```typescript
interface ReportFormFields {
    title: {
        type: 'text';
        required: true;
        minLength: 5;
        maxLength: 100;
    };
    
    description: {
        type: 'textarea';
        required: true;
        minLength: 20;
        maxLength: 1000;
    };
    
    location: {
        type: 'map-picker';
        required: true;
    };
    
    category: {
        type: 'select';
        required: true;
        options: ReportCategory[];
    };
    
    media: {
        type: 'file-upload';
        required: false;
        multiple: true;
        accept: ['image/*', 'video/*'];
    };
}
```

### 4.2. Rapor Listeleme ve Filtreleme
```typescript
interface ReportListConfig {
    view: {
        types: ['list', 'map'];
        default: 'list';
    };
    
    filters: {
        category: boolean;    // true
        status: boolean;     // true
        date: boolean;      // true
        location: boolean;  // true
    };
    
    sorting: {
        fields: ['createdAt', 'status', 'priority'];
        default: {
            field: 'createdAt';
            order: 'desc';
        };
    };
    
    pagination: {
        itemsPerPage: 20;
        maxPage: 100;
    };
}
```

## 5. Durum Takip Sistemi

### 5.1. Durum Geçişleri
```typescript
interface StatusTransition {
    from: ReportStatus;
    to: ReportStatus;
    allowedRoles: UserRole[];
    requiresComment: boolean;
    notifyStakeholders: boolean;
}

const statusTransitions: StatusTransition[] = [
    {
        from: 'new',
        to: 'in_progress',
        allowedRoles: ['staff', 'admin'],
        requiresComment: true,
        notifyStakeholders: true
    },
    {
        from: 'in_progress',
        to: 'resolved',
        allowedRoles: ['staff', 'admin'],
        requiresComment: true,
        notifyStakeholders: true
    },
    {
        from: 'resolved',
        to: 'closed',
        allowedRoles: ['staff', 'admin'],
        requiresComment: false,
        notifyStakeholders: true
    }
];
```

### 5.2. Yorum Sistemi
```typescript
interface Comment {
    id: string;
    reportId: string;
    userId: string;
    content: string;
    attachments?: MediaItem[];
    createdAt: Date;
}

interface CommentEndpoints {
    create: {
        method: 'POST';
        path: '/api/v1/reports/:reportId/comments';
        body: {
            content: string;
            attachments?: File[];
        };
        response: Comment;
    };
    
    list: {
        method: 'GET';
        path: '/api/v1/reports/:reportId/comments';
        query: {
            page?: number;
            limit?: number;
        };
        response: PaginatedResponse<Comment>;
    };
}
```

## 6. MVP Özellikleri

### 6.1. Faz 1 (İlk Versiyon)
1. **Temel Raporlama**
   - Rapor oluşturma formu
   - Temel fotoğraf yükleme
   - Konum seçimi

2. **Durum Takibi**
   - 4 temel durum
   - Basit yorum sistemi
   - Email bildirimleri

3. **Liste ve Arama**
   - Liste görünümü
   - Temel filtreleme
   - Sayfalama

### 6.2. Ertelenen Özellikler (Faz 2)
1. Video desteği
2. İleri medya optimizasyonu
3. Toplu işlemler
4. İstatistikler ve raporlar
5. Vatandaş puanlama sistemi

## 7. Validasyon ve Güvenlik

### 7.1. Input Validation
```typescript
interface ValidationRules {
    title: {
        minLength: 5;
        maxLength: 100;
        pattern: string;  // alphanumeric + spaces
    };
    
    description: {
        minLength: 20;
        maxLength: 1000;
        sanitize: boolean;  // true
    };
    
    location: {
        bounds: {
            north: number;  // max latitude
            south: number;  // min latitude
            east: number;   // max longitude
            west: number;   // min longitude
        };
    };
    
    media: {
        maxFiles: 5;
        maxSizePerFile: number;  // bytes
        allowedTypes: string[];
    };
}
```

### 7.2. Access Control
```typescript
interface ReportPermissions {
    create: ['citizen', 'staff', 'admin'];
    read: ['citizen', 'staff', 'admin'];
    update: {
        status: ['staff', 'admin'];
        priority: ['staff', 'admin'];
        assignee: ['staff', 'admin'];
    };
    delete: ['admin'];
    comment: ['citizen', 'staff', 'admin'];
}
```

## 8. Test Stratejisi

### 8.1. Unit Tests
```typescript
interface ReportTestPlan {
    validators: string[];
    transformers: string[];
    services: string[];
    controllers: string[];
}

interface TestScenarios {
    creation: string[];
    statusTransitions: string[];
    mediaHandling: string[];
    commenting: string[];
}
```

### 8.2. E2E Tests
```typescript
interface E2ETestPlan {
    userFlows: {
        reportCreation: boolean;    // true
        statusUpdate: boolean;      // true
        commenting: boolean;        // true
        filtering: boolean;         // true
    };
    
    errorCases: {
        validation: boolean;       // true
        authorization: boolean;    // true
        mediaUpload: boolean;     // true
    };
}
```

## 9. Performance Hedefleri

### 9.1. Response Times
- Rapor oluşturma < 3s (medya ile)
- Liste yükleme < 200ms
- Arama/filtreleme < 500ms
- Yorum yükleme < 200ms

### 9.2. Resource Usage
- Medya storage < 100MB/ay
- DB size < 1GB/ay
- Cache hit ratio > 80%

## 10. Uygulama Planı

### Faz 1: Core Features (2 hafta)
1. Temel veri modeli
2. CRUD endpoints
3. Basit medya yönetimi

### Faz 2: UI/UX (1 hafta)
1. Rapor formu
2. Liste görünümü
3. Mobil uyumluluk

### Faz 3: Durum Yönetimi (1 hafta)
1. Durum geçişleri
2. Yorum sistemi
3. Bildirimler

### Faz 4: Test & Stabilizasyon (1 hafta)
1. Unit testler
2. E2E testler
3. Performance optimizasyonları

## 11. Sonuç

Bu RFC, KentNabız platformunun raporlama ve durum takip sistemini MVP odaklı bir yaklaşımla ele almaktadır. Başlangıçta temel özelliklere odaklanılarak, kullanıcıların sorunları etkili bir şekilde raporlayabilmesi ve takip edebilmesi hedeflenmektedir. Sistem, gelecekteki ihtiyaçlara göre genişletilebilir bir temel üzerine inşa edilmiştir.