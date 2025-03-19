# Faz 5: Bildirim ve Gerçek Zamanlı Sistem İmplementasyonu

## 📌 Adım 5.1: Socket.io Gateway Yapılandırması

### Açıklama

NestJS WebSocket Gateway kullanarak gerçek zamanlı iletişim altyapısının kurulması.

### 🛠 Teknolojiler

- @nestjs/websockets ^10.0.0
- @nestjs/platform-socket.io ^10.0.0
- socket.io ^4.7.0
- socket.io-client ^4.7.0

### 📂 Gateway Yapılandırması

```typescript
// src/gateways/notifications/notifications.gateway.ts
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('NotificationsGateway');
  private rooms = new Map<string, Set<string>>();

  afterInit(server: Server) {
    this.logger.log('Websocket Gateway başlatıldı');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client bağlandı: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room).add(client.id);
    this.logger.log(`Client ${client.id} odaya katıldı: ${room}`);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, room: string) {
    client.leave(room);
    this.rooms.get(room)?.delete(client.id);
    this.logger.log(`Client ${client.id} odadan ayrıldı: ${room}`);
  }

  @SubscribeMessage('notification')
  handleNotification(client: Socket, payload: NotificationPayload) {
    const { room, type, data } = payload;
    this.server.to(room).emit('onNotification', { type, data });
  }
}

// src/gateways/notifications/notifications.service.ts
@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private gatewayServer: NotificationsGateway
  ) {}

  async broadcastToRoom(room: string, notification: CreateNotificationDto) {
    const savedNotification = await this.notificationRepo.save(notification);
    this.gatewayServer.server.to(room).emit('onNotification', savedNotification);
    return savedNotification;
  }
}
```

### ✅ Kontrol Noktaları

- [ ] WebSocket bağlantısı aktif
- [ ] Oda yönetimi çalışıyor
- [ ] Event handling başarılı
- [ ] Error handling yapıldı

### 📌 Onay Gereksinimleri

- Gerçek zamanlı mesaj iletimi < 100ms
- Bağlantı kopma/yeniden bağlanma senaryoları test edildi
- Memory leak yok

## 📌 Adım 5.2: Service Worker ve Push Notifications

### Açıklama

Web Push API ve Service Worker kullanarak tarayıcı seviyesinde bildirim yönetimi.

### 🛠 Teknolojiler

- Web Push API
- Service Worker API
- workbox-window ^7.0.0

### 📂 Service Worker Yapılandırması

```typescript
// public/service-worker.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

workbox.setConfig({ debug: false });

const { routing, strategies, precaching } = workbox;

// Service worker kurulumu
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      precaching.precacheAndRoute([
        { url: '/offline.html', revision: '1' },
        { url: '/manifest.json', revision: '1' },
      ]),
      self.skipWaiting(),
    ])
  );
});

// Push notification alma
self.addEventListener('push', event => {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/icons/notification.png',
    badge: '/icons/badge.png',
    data: data.data,
    actions: data.actions,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Bildirime tıklama
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action) {
    // Özel action handling
    handleNotificationAction(event.action, event.notification.data);
  } else {
    // Varsayılan tıklama davranışı
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});

// Offline queue yönetimi
const bgSyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin('notificationQueue', {
  maxRetentionTime: 24 * 60, // 24 saat
});

routing.registerRoute(
  /\/api\/notifications/,
  new strategies.NetworkOnly({
    plugins: [bgSyncPlugin],
  }),
  'POST'
);

// src/lib/push/registerServiceWorker.ts
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Subscription'ı backend'e gönder
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }
}
```

### ✅ Kontrol Noktaları

- [ ] Service worker kayıt başarılı
- [ ] Push subscription aktif
- [ ] Offline queue çalışıyor
- [ ] Bildirim etkileşimleri doğru

### 📌 Onay Gereksinimleri

- Offline durumda bildirimler kaydediliyor
- Push notification permission flow doğru
- Background sync başarılı

## 📌 Adım 5.3: FCM (Firebase Cloud Messaging) Entegrasyonu

### Açıklama

Web ve mobil platformlar için Firebase Cloud Messaging entegrasyonu.

### 🛠 Teknolojiler

- firebase ^10.5.0
- @react-native-firebase/messaging ^18.5.0
- firebase-admin ^11.11.0

### 📂 FCM Yapılandırması

```typescript
// src/lib/firebase/firebase.config.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// FCM token alma ve yönetme
export async function initializeFCM() {
  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.FIREBASE_VAPID_KEY,
    });

    // Token'ı backend'e gönder
    await updateFCMToken(token);

    // Token yenilenme dinleyicisi
    messaging.onTokenRefresh(async () => {
      const newToken = await getToken(messaging);
      await updateFCMToken(newToken);
    });

    // Foreground mesaj dinleyicisi
    onMessage(messaging, payload => {
      console.log('Foreground message:', payload);
      showNotification(payload);
    });
  } catch (error) {
    console.error('FCM initialization failed:', error);
  }
}

// src/modules/notifications/fcm.service.ts
@Injectable()
export class FCMService {
  constructor(
    private readonly firebaseAdmin: FirebaseAdmin,
    @InjectRepository(UserDevice)
    private readonly userDeviceRepo: Repository<UserDevice>
  ) {}

  async sendToUser(userId: string, notification: FCMNotification) {
    const devices = await this.userDeviceRepo.find({
      where: { userId, isActive: true },
    });

    const messages = devices.map(device => ({
      token: device.fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data,
      android: {
        priority: 'high',
        notification: {
          channelId: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
          },
        },
      },
    }));

    return this.firebaseAdmin.messaging().sendEach(messages);
  }
}
```

### ✅ Kontrol Noktaları

- [ ] Firebase konfigürasyonu doğru
- [ ] Token yönetimi başarılı
- [ ] Platform spesifik ayarlar tamam
- [ ] Error handling yapıldı

### 📌 Onay Gereksinimleri

- Web ve mobil bildirimleri çalışıyor
- Token yenileme sorunsuz
- Bildirim kanalları doğru

## 📌 Adım 5.4: Offline Notification Queueing

### Açıklama

Çevrimdışı durumda bildirimlerin yerel depolanması ve senkronizasyonu.

### 🛠 Teknolojiler

- IndexedDB
- idb ^7.1.0
- rxjs ^7.8.0

### 📂 Offline Queue Yapılandırması

```typescript
// src/lib/storage/notification-queue.ts
import { openDB } from 'idb';

const dbName = 'NotificationQueue';
const storeName = 'notifications';

export class NotificationQueue {
  private db: IDBDatabase;

  async initialize() {
    this.db = await openDB(dbName, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
      },
    });
  }

  async addToQueue(notification: QueuedNotification) {
    return this.db.add(storeName, {
      ...notification,
      timestamp: Date.now(),
      status: 'pending',
    });
  }

  async processQueue() {
    const tx = this.db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const pendingItems = await store.index('status').getAll('pending');

    for (const item of pendingItems) {
      try {
        await this.sendNotification(item);
        await store.put({ ...item, status: 'sent' });
      } catch (error) {
        console.error(`Failed to process notification ${item.id}:`, error);
        await store.put({
          ...item,
          status: 'failed',
          error: error.message,
        });
      }
    }
  }
}

// src/lib/network/connection-manager.ts
export class ConnectionManager {
  private connectionStatus$ = new BehaviorSubject<boolean>(navigator.onLine);
  private queue: NotificationQueue;

  constructor() {
    this.queue = new NotificationQueue();
    this.initialize();
  }

  private initialize() {
    window.addEventListener('online', () => {
      this.connectionStatus$.next(true);
      this.queue.processQueue();
    });

    window.addEventListener('offline', () => {
      this.connectionStatus$.next(false);
    });

    this.connectionStatus$
      .pipe(
        distinctUntilChanged(),
        filter(isOnline => isOnline)
      )
      .subscribe(() => {
        this.queue.processQueue();
      });
  }
}
```

### ✅ Kontrol Noktaları

- [ ] IndexedDB yapılandırması doğru
- [ ] Queue işleme mantığı çalışıyor
- [ ] Bağlantı yönetimi başarılı
- [ ] Error recovery mantığı aktif

### 📌 Onay Gereksinimleri

- Offline bildirimler kaydediliyor
- Online olunca sync başarılı
- Veri kaybı yok

## 📌 Adım 5.5: Real-time Veri Senkronizasyonu

### Açıklama

Tüm istemciler arasında veri tutarlılığının sağlanması.

### 🛠 Teknolojiler

- Socket.io ^4.7.0
- rxjs ^7.8.0
- @reduxjs/toolkit ^2.0.0

### 📂 Senkronizasyon Yapılandırması

```typescript
// src/lib/sync/sync.service.ts
@Injectable()
export class SyncService {
  constructor(
    private gateway: NotificationsGateway,
    private reportService: ReportService
  ) {}

  private readonly syncSubject = new Subject<SyncEvent>();

  async broadcastChange(event: SyncEvent) {
    // Değişikliği veritabanına kaydet
    await this.persistChange(event);

    // Socket üzerinden değişikliği yayınla
    this.gateway.server.to(event.room).emit('sync', event);
  }

  private async persistChange(event: SyncEvent) {
    switch (event.type) {
      case 'REPORT_UPDATE':
        await this.reportService.update(event.data);
        break;
      // Diğer sync tipleri...
    }
  }
}

// src/lib/sync/sync.client.ts
export class SyncClient {
  private socket: Socket;
  private store: Store;

  constructor(store: Store) {
    this.store = store;
    this.socket = io(SOCKET_URL);
    this.initialize();
  }

  private initialize() {
    this.socket.on('sync', (event: SyncEvent) => {
      switch (event.type) {
        case 'REPORT_UPDATE':
          this.store.dispatch(updateReport(event.data));
          break;
        case 'NOTIFICATION':
          this.store.dispatch(addNotification(event.data));
          break;
      }
    });

    // Conflict resolution
    this.socket.on('sync_conflict', async (conflict: SyncConflict) => {
      const resolution = await this.resolveConflict(conflict);
      this.socket.emit('sync_resolve', resolution);
    });
  }

  private async resolveConflict(conflict: SyncConflict): Promise<SyncResolution> {
    // Çakışma çözüm stratejisi
    const localVersion = await this.store.getState().getVersion(conflict.entityId);

    if (conflict.serverVersion > localVersion) {
      // Server versiyonunu kabul et
      return {
        type: 'ACCEPT_SERVER',
        entityId: conflict.entityId,
      };
    }

    // Merge stratejisi uygula
    return {
      type: 'MERGE',
      entityId: conflict.entityId,
      mergedData: await this.mergeChanges(conflict),
    };
  }
}
```

### ✅ Kontrol Noktaları

- [ ] Veri senkronizasyonu çalışıyor
- [ ] Conflict resolution aktif
- [ ] Version tracking doğru
- [ ] State management entegrasyonu başarılı

### 📌 Onay Gereksinimleri

- Tüm istemciler senkron
- Çakışmalar çözülüyor
- Veri tutarlılığı korunuyor

## 🔍 Faz 5 Sonuç ve Değerlendirme

### Başarı Metrikleri

- Socket latency < 100ms
- Push notification delivery < 500ms
- Offline sync başarı oranı > 99%
- Memory kullanımı < 50MB

### Performans Önlemleri

- Socket connection pooling
- Push notification rate limiting
- Indexed DB chunk size optimization
- Batch processing için queue system

### Güvenlik Kontrolleri

- WebSocket authentication
- Push API encryption
- FCM token validation
- Rate limiting ve throttling

### ⚠️ Önemli Notlar

- Service Worker ve Push API browser desteğini kontrol et
- FCM token yenilemelerini düzenli monitör et
- Offline queue size limitlerini belirle
- WebSocket reconnection stratejisini test et
