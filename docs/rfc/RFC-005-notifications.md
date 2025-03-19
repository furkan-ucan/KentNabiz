# RFC-005: Bildirim Sistemi ve Gerçek Zamanlı Güncellemeler

## Metadata
```yaml
RFC Numarası: RFC-005
Başlık: Bildirim Sistemi ve Gerçek Zamanlı Güncellemeler
Yazar: Ali Yılmaz
Durum: Taslak
Oluşturma Tarihi: 2024-01-20
Son Güncelleme: 2024-01-20
İlgili Bileşenler: Backend, Frontend, Mobile
```

## 1. Özet
Bu RFC, KentNabız platformunun bildirim sistemi ve gerçek zamanlı güncellemeler için gerekli altyapıyı detaylandırmaktadır. MVP sürecinde email ve in-app bildirimlerine odaklanılmış, push notifications ve WebSocket desteği ileriki aşamalara bırakılmıştır.

## 2. Bildirim Sistemi

### 2.1. Bildirim Tipleri
```typescript
interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data: Record<string, any>;
    read: boolean;
    createdAt: Date;
}

enum NotificationType {
    REPORT_STATUS = 'report_status',    // Rapor durum değişikliği
    REPORT_COMMENT = 'report_comment',   // Yeni yorum
    REPORT_ASSIGN = 'report_assign',     // Görevlendirme
    SYSTEM = 'system'                    // Sistem bildirimi
}
```

### 2.2. Bildirim Tercihleri
```typescript
interface NotificationPreferences {
    userId: string;
    channels: {
        email: boolean;       // true by default
        inApp: boolean;      // true by default
        push: boolean;       // false - Faz 2
    };
    types: {
        [key in NotificationType]: {
            enabled: boolean;
            channels: string[];
        };
    };
}

const defaultPreferences: NotificationPreferences = {
    channels: {
        email: true,
        inApp: true,
        push: false
    },
    types: {
        report_status: {
            enabled: true,
            channels: ['email', 'inApp']
        },
        report_comment: {
            enabled: true,
            channels: ['inApp']
        },
        report_assign: {
            enabled: true,
            channels: ['email', 'inApp']
        },
        system: {
            enabled: true,
            channels: ['email', 'inApp']
        }
    }
};
```

## 3. Bildirim Kanalları

### 3.1. Email Bildirimleri
```typescript
interface EmailConfig {
    provider: 'nodemailer';
    templates: {
        [key in NotificationType]: {
            subject: string;
            template: string;
        };
    };
    settings: {
        from: string;
        replyTo: string;
        rateLimit: {
            user: number;     // max per hour
            global: number;   // max per hour
        };
    };
}

interface EmailTemplate {
    title: string;
    preheader: string;
    content: string;
    actionButton?: {
        text: string;
        url: string;
    };
}
```

### 3.2. In-App Bildirimleri
```typescript
interface InAppNotificationConfig {
    storage: {
        type: 'postgres';
        retention: string;    // '30d'
        cleanup: boolean;     // true
    };
    
    delivery: {
        polling: {
            enabled: true;
            interval: number;  // 30000ms
        };
        realtime: {
            enabled: false;   // Faz 2
            type: 'websocket';
        };
    };
}
```

## 4. API Endpoint'leri

### 4.1. Bildirim Yönetimi
```typescript
interface NotificationEndpoints {
    list: {
        method: 'GET';
        path: '/api/v1/notifications';
        query: {
            unreadOnly?: boolean;
            type?: NotificationType[];
            fromDate?: Date;
            page?: number;
            limit?: number;
        };
        response: PaginatedResponse<Notification>;
    };
    
    markRead: {
        method: 'PUT';
        path: '/api/v1/notifications/:id/read';
        response: Notification;
    };
    
    markAllRead: {
        method: 'PUT';
        path: '/api/v1/notifications/read';
        response: void;
    };
    
    preferences: {
        method: 'PUT';
        path: '/api/v1/notifications/preferences';
        body: NotificationPreferences;
        response: NotificationPreferences;
    };
}
```

## 5. Bildirim Tetikleyicileri

### 5.1. Olay Tabanlı Tetikleyiciler
```typescript
interface NotificationTrigger {
    event: string;
    condition?: (data: any) => boolean;
    recipients: (data: any) => Promise<string[]>;
    template: (data: any) => NotificationTemplate;
    channels: string[];
}

const notificationTriggers: Record<string, NotificationTrigger> = {
    'report.status.changed': {
        event: 'report.status.changed',
        recipients: async (data) => {
            return [data.reporterId, data.assigneeId];
        },
        template: (data) => ({
            type: 'report_status',
            title: 'Rapor Durumu Güncellendi',
            body: `#${data.reportId} numaralı rapor ${data.newStatus} durumuna güncellendi`
        }),
        channels: ['email', 'inApp']
    },
    
    'report.comment.created': {
        event: 'report.comment.created',
        recipients: async (data) => {
            return [data.reporterId];
        },
        template: (data) => ({
            type: 'report_comment',
            title: 'Yeni Yorum',
            body: `#${data.reportId} numaralı raporunuza yeni bir yorum yapıldı`
        }),
        channels: ['inApp']
    }
};
```

### 5.2. Zamanlanmış Bildirimler
```typescript
interface ScheduledNotification {
    id: string;
    type: NotificationType;
    recipients: string[];
    template: NotificationTemplate;
    channels: string[];
    scheduledFor: Date;
    repeat?: {
        frequency: 'daily' | 'weekly' | 'monthly';
        until: Date;
    };
}
```

## 6. MVP Özellikleri

### 6.1. Faz 1 (İlk Versiyon)
1. **Email Bildirimleri**
   - Durum değişiklikleri
   - Görevlendirmeler
   - Sistem duyuruları

2. **In-App Bildirimleri**
   - Bildirim listesi
   - Okundu/okunmadı durumu
   - Polling ile güncelleme

3. **Bildirim Tercihleri**
   - Email açık/kapalı
   - Bildirim tipleri
   - Temel özelleştirme

### 6.2. Ertelenen Özellikler (Faz 2)
1. Push notifications
2. WebSocket gerçek zamanlı güncellemeler
3. Zengin medya bildirimleri
4. Gelişmiş bildirim şablonları
5. Toplu bildirim yönetimi

## 7. Performance ve Ölçeklenebilirlik

### 7.1. Rate Limiting
```typescript
interface RateLimits {
    email: {
        perUser: {
            window: string;   // '1h'
            max: number;      // 20
        };
        global: {
            window: string;   // '1h'
            max: number;      // 1000
        };
    };
    
    inApp: {
        polling: {
            minInterval: number;  // 30s
            maxConnections: number;  // 1000
        };
    };
}
```

### 7.2. Caching
```typescript
interface CacheConfig {
    notifications: {
        ttl: string;         // '5m'
        invalidation: string[];  // ['user']
    };
    
    preferences: {
        ttl: string;         // '1h'
        invalidation: string[];  // ['user']
    };
}
```

## 8. Test Stratejisi

### 8.1. Unit Tests
```typescript
interface NotificationTestPlan {
    triggers: {
        events: string[];
        conditions: string[];
        templates: string[];
    };
    
    delivery: {
        email: string[];
        inApp: string[];
    };
    
    preferences: {
        validation: string[];
        updates: string[];
    };
}
```

### 8.2. Integration Tests
```typescript
interface IntegrationTests {
    email: {
        delivery: boolean;
        templates: boolean;
        bounces: boolean;
    };
    
    inApp: {
        storage: boolean;
        retrieval: boolean;
        polling: boolean;
    };
}
```

## 9. Başarı Kriterleri

### 9.1. Performance
- Email gönderim < 5s
- Bildirim listesi yükleme < 200ms
- Polling interval > 30s

### 9.2. Reliability
- Email başarı oranı > 99%
- Notification delivery > 99.9%
- Zero duplicate notifications

## 10. Uygulama Planı

### Faz 1: Core System (2 hafta)
1. Notification service
2. Email templates
3. Basic in-app notifications

### Faz 2: Frontend Integration (1 hafta)
1. Notification UI
2. Preferences management
3. Polling implementation

### Faz 3: Testing & Monitoring (1 hafta)
1. Unit tests
2. Integration tests
3. Monitoring setup

## 11. Sonuç

Bu RFC, KentNabız platformunun bildirim sistemini MVP odaklı bir yaklaşımla ele almaktadır. Başlangıçta email ve in-app bildirimleri ile sınırlı tutularak, sistem karmaşıklığı azaltılmış ve hızlı bir şekilde kullanılabilir bir ürün ortaya çıkarılması hedeflenmiştir. Push notifications ve WebSocket gibi gelişmiş özellikler, kullanıcı ihtiyaçları ve sistem yükü değerlendirilerek ileriki aşamalarda eklenecektir.