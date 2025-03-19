# Sprint 4 - Bildirim Sistemi ve Gerçek Zamanlı Güncellemeler

## 1. Bildirim Sistemi

### 1.1. Backend Entegrasyonu

```typescript
// apps/api/src/modules/notifications/
├── notification.module.ts
├── notification.service.ts
├── notification.controller.ts
└── notification.gateway.ts
```

### 1.2. Web Push Bildirimleri

- Service Worker yapılandırması
- Bildirim izinleri yönetimi
- Firebase Cloud Messaging entegrasyonu
- Temel PWA desteği

### 1.3. Push Notification Templates

```typescript
interface NotificationTemplate {
  type: 'REPORT_UPDATE' | 'COMMENT' | 'ASSIGNMENT';
  title: string;
  body: string;
  data?: Record<string, any>;
  icon?: string;
  click_action?: string;
}
```

## 2. WebSocket Entegrasyonu

### 2.1. Socket Gateway

```typescript
@WebSocketGateway()
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinReport')
  handleJoinReport(client: Socket, reportId: string) {
    // Room join logic
  }

  notifyReportUpdate(reportId: string, data: any) {
    // Notification broadcast
  }
}
```

### 2.2. Client Integration

```typescript
// @kentnabiz/shared/src/services/socket.service.ts
export class SocketService {
  connect() {
    // Socket.io connection
  }

  subscribeToReport(reportId: string) {
    // Report subscription
  }
}
```

## 3. Notification Management

### 3.1. Database Schema

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.2. Notification Center

```typescript
// @kentnabiz/ui/src/components/notifications/
├── NotificationList.tsx
├── NotificationItem.tsx
└── NotificationBadge.tsx
```

## 4. Sprint Planı

### Hafta 1 - Backend & Socket

| Gün       | Görev                     |
| --------- | ------------------------- |
| Pazartesi | Notification module setup |
| Salı      | WebSocket gateway         |
| Çarşamba  | Push notification service |
| Perşembe  | Database integration      |
| Cuma      | Unit tests                |

### Hafta 2 - Frontend Integration

| Gün       | Görev                  |
| --------- | ---------------------- |
| Pazartesi | Service worker setup   |
| Salı      | Socket.io client       |
| Çarşamba  | UI components          |
| Perşembe  | State management       |
| Cuma      | Testing & optimization |

## 5. Teknik Detaylar

### 5.1. Service Worker

```typescript
// apps/web/public/sw.js
self.addEventListener('push', event => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon.png',
    data: data.data,
  });
});
```

### 5.2. Client Storage

```typescript
interface NotificationPrefs {
  pushEnabled: boolean;
  emailEnabled: boolean;
  categories: string[];
}
```

## 6. Test Stratejisi

### 6.1. Unit Tests

- Notification service
- WebSocket gateway
- Push notification handling
- Database operations

### 6.2. Integration Tests

- End-to-end notification flow
- WebSocket connections
- Service worker registration
- Push notification delivery

## 7. Başarı Kriterleri

### 7.1. Performance

- < 100ms notification delivery
- Successful WebSocket connection
- Push notification opt-in rate
- Browser compatibility

### 7.2. Reliability

- Offline notification queueing
- Connection recovery
- Error handling
- Message persistence

## 8. Özet

Sprint 4, KentNabız platformunun bildirim sistemini ve gerçek zamanlı güncelleme yeteneklerini geliştirmeye odaklanmaktadır. WebSocket ve Push Notification servisleri monolitik API içinde implemente edilecek, frontend tarafında ise shared paketler aracılığıyla ortak bir bildirim deneyimi sağlanacaktır.
