# Faz 6: Mobil Uygulama Geliştirme

## 📌 Adım 6.1: React Navigation Kurulumu ve Temel Yapı

### Açıklama
React Navigation ile mobil uygulama için routing ve navigasyon altyapısının kurulması.

### 🛠 Teknolojiler
- @react-navigation/native ^6.0.0
- @react-navigation/native-stack ^6.0.0
- @react-navigation/bottom-tabs ^6.0.0
- react-native-screens ^3.0.0
- react-native-safe-area-context ^4.0.0

### 📂 Navigasyon Yapısı
```typescript
// src/navigation/types.ts
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  CreateReport: undefined;
  ReportDetail: { id: string };
};

// src/navigation/RootNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={MainNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateReport"
          component={CreateReportScreen}
          options={{
            title: 'Yeni Rapor',
            animation: 'slide_from_bottom'
          }}
        />
        <Stack.Screen
          name="ReportDetail"
          component={ReportDetailScreen}
          options={{ title: 'Rapor Detayı' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// src/navigation/MainNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

export const MainNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="home" color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="map" color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="person" color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
};
```

### ✅ Kontrol Noktaları
- [ ] Stack navigator kurulumu
- [ ] Tab navigator kurulumu
- [ ] TypeScript route tanımları
- [ ] Screen options yapılandırması

### 📌 Onay Gereksinimleri
- Tüm navigasyon akışları çalışıyor
- Type-safe routing sağlandı
- Platform spesifik animasyonlar doğru

## 📌 Adım 6.2: Kamera ve Lokasyon Servisleri

### Açıklama
Kamera API'si ve GPS servisleri için native modül entegrasyonları.

### 🛠 Teknolojiler
- react-native-vision-camera ^3.0.0
- @react-native-community/geolocation ^3.0.0
- react-native-permissions ^3.0.0

### 📂 Native Servis Yapılandırması
```typescript
// src/services/camera/CameraService.ts
import { Camera } from 'react-native-vision-camera';
import { check, PERMISSIONS, request } from 'react-native-permissions';

export class CameraService {
  static async requestPermissions(): Promise<boolean> {
    const permission = Platform.select({
      ios: PERMISSIONS.IOS.CAMERA,
      android: PERMISSIONS.ANDROID.CAMERA,
    });

    const status = await check(permission);
    if (status === 'denied') {
      return await request(permission) === 'granted';
    }
    
    return status === 'granted';
  }

  static async capturePhoto(): Promise<string> {
    const photo = await camera.current.takePhoto({
      qualityPrioritization: 'quality',
      flash: 'auto',
      enableShutterSound: false
    });
    
    return photo.path;
  }
}

// src/services/location/LocationService.ts
import Geolocation from '@react-native-community/geolocation';

export class LocationService {
  static watchId: number | null = null;

  static async getCurrentLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => resolve(position.coords),
        error => reject(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  }

  static startWatching(callback: (coords: Coordinates) => void): void {
    this.watchId = Geolocation.watchPosition(
      position => callback(position.coords),
      error => console.error(error),
      { 
        enableHighAccuracy: true, 
        distanceFilter: 10 // 10 metre
      }
    );
  }

  static stopWatching(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}
```

### ✅ Kontrol Noktaları
- [ ] Kamera izinleri
- [ ] Lokasyon izinleri
- [ ] Enerji optimizasyonu
- [ ] Hata yönetimi

### 📌 Onay Gereksinimleri
- Kamera erişimi sorunsuz
- GPS doğru konum alıyor
- İzin akışları platform uyumlu

## 📌 Adım 6.3: Offline Storage ve Senkronizasyon

### Açıklama
Çevrimdışı veri depolama ve senkronizasyon mekanizmalarının kurulumu.

### 🛠 Teknolojiler
- WatermelonDB ^0.25.0
- @nozbe/watermelondb ^0.25.0
- rxjs ^7.0.0

### 📂 Offline Storage Yapılandırması
```typescript
// src/database/schema.ts
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'reports',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'sync_status', type: 'string' }
      ]
    }),
    tableSchema({
      name: 'media',
      columns: [
        { name: 'report_id', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'uri', type: 'string' },
        { name: 'sync_status', type: 'string' }
      ]
    })
  ]
});

// src/database/models/Report.ts
import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export class Report extends Model {
  static table = 'reports';

  @field('title') title!: string;
  @field('description') description!: string;
  @field('status') status!: string;
  @field('latitude') latitude!: number;
  @field('longitude') longitude!: number;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
  @field('sync_status') syncStatus!: 'pending' | 'synced' | 'error';
}

// src/services/sync/SyncService.ts
import { Database } from '@nozbe/watermelondb';
import { Report } from '../database/models/Report';
import { apiClient } from '../api/client';
import { BehaviorSubject } from 'rxjs';

export class SyncService {
  private syncStatus$ = new BehaviorSubject<'idle' | 'syncing' | 'error'>('idle');
  private database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  async syncReports(): Promise<void> {
    this.syncStatus$.next('syncing');

    try {
      // Pending raporları al
      const pendingReports = await this.database
        .get<Report>('reports')
        .query(Q.where('sync_status', 'pending'))
        .fetch();

      // Backend'e gönder
      for (const report of pendingReports) {
        await this.syncReport(report);
      }

      this.syncStatus$.next('idle');
    } catch (error) {
      this.syncStatus$.next('error');
      throw error;
    }
  }

  private async syncReport(report: Report): Promise<void> {
    try {
      const response = await apiClient.post('/reports', {
        title: report.title,
        description: report.description,
        location: {
          latitude: report.latitude,
          longitude: report.longitude
        }
      });

      await this.database.write(async () => {
        await report.update(r => {
          r.syncStatus = 'synced';
        });
      });
    } catch (error) {
      await this.database.write(async () => {
        await report.update(r => {
          r.syncStatus = 'error';
        });
      });
      throw error;
    }
  }
}
```

### ✅ Kontrol Noktaları
- [ ] Schema migrations
- [ ] CRUD operasyonları
- [ ] Sync mekanizması
- [ ] Error handling

### 📌 Onay Gereksinimleri
- Offline veri kaydı çalışıyor
- Senkronizasyon başarılı
- Çakışma çözümü doğru

## 📌 Adım 6.4: Push Notification Sistemi

### Açıklama
FCM entegrasyonu ve push notification yönetimi.

### 🛠 Teknolojiler
- @react-native-firebase/app ^18.0.0
- @react-native-firebase/messaging ^18.0.0
- @react-native-community/push-notification-ios ^1.11.0
- react-native-push-notification ^8.0.0

### 📂 Push Notification Yapılandırması
```typescript
// src/services/notifications/NotificationService.ts
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

export class NotificationService {
  static async initialize(): Promise<void> {
    // iOS için izin alma
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled = 
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      if (!enabled) {
        throw new Error('Notification permission denied');
      }
    }

    // Android için kanal oluşturma
    if (Platform.OS === 'android') {
      PushNotification.createChannel({
        channelId: 'default',
        channelName: 'Default Channel',
        importance: 4, // MAX: 5
        vibrate: true
      });
    }

    // Token alma ve kaydetme
    const token = await messaging().getToken();
    await this.updateFCMToken(token);

    // Token yenileme dinleyicisi
    messaging().onTokenRefresh(async newToken => {
      await this.updateFCMToken(newToken);
    });

    // Foreground handler
    messaging().onMessage(async remoteMessage => {
      this.showNotification(remoteMessage);
    });

    // Background/Quit state handler
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      this.showNotification(remoteMessage);
    });
  }

  private static async updateFCMToken(token: string): Promise<void> {
    try {
      await apiClient.post('/notifications/token', { token });
    } catch (error) {
      console.error('FCM token update failed:', error);
    }
  }

  private static showNotification(message: FirebaseMessagingTypes.RemoteMessage): void {
    PushNotification.localNotification({
      channelId: 'default',
      title: message.notification?.title,
      message: message.notification?.body || '',
      data: message.data,
      smallIcon: 'ic_notification',
      largeIcon: '',
      priority: 'high',
      vibrate: true,
      playSound: true
    });
  }
}
```

### ✅ Kontrol Noktaları
- [ ] FCM konfigürasyonu
- [ ] Platform spesifik setup
- [ ] Token yönetimi
- [ ] Bildirim gösterimi

### 📌 Onay Gereksinimleri
- FCM token alınıyor
- Bildirimler gösteriliyor
- Background handling çalışıyor

## 📌 Adım 6.5: Native UI Adaptasyonları

### Açıklama
Platform spesifik UI bileşenleri ve stil adaptasyonları.

### 🛠 Teknolojiler
- react-native-paper ^5.0.0
- react-native-safe-area-context ^4.0.0
- react-native-vector-icons ^9.0.0

### 📂 UI Adaptasyonları
```typescript
// src/theme/index.ts
import { Platform } from 'react-native';
import { MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  ios: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400'
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500'
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700'
    }
  },
  android: {
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: 'normal'
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: 'normal'
    },
    bold: {
      fontFamily: 'sans-serif',
      fontWeight: 'bold'
    }
  }
};

export const theme = {
  ...MD3LightTheme,
  fonts: configureFonts({config: fontConfig}),
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2B6CB0',
    accent: '#F59E0B'
  }
};

// src/components/ui/Button/index.tsx
import { TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button = ({ title, onPress, variant = 'primary' }: ButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
        Platform.select({
          ios: styles.iosButton,
          android: styles.androidButton
        })
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === 'primary' ? styles.primaryText : styles.secondaryText
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: Platform.select({
      ios: 8,
      android: 4
    }),
    alignItems: 'center'
  },
  iosButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  androidButton: {
    elevation: 3
  },
  primaryButton: {
    backgroundColor: theme.colors.primary
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary
  },
  text: {
    fontSize: 16,
    fontWeight: Platform.select({
      ios: '600',
      android: 'bold'
    })
  },
  primaryText: {
    color: 'white'
  },
  secondaryText: {
    color: theme.colors.primary
  }
});
```

### ✅ Kontrol Noktaları
- [ ] Platform spesifik stiller
- [ ] Theme yapılandırması
- [ ] Responsive tasarım
- [ ] Accessibility desteği

### 📌 Onay Gereksinimleri
- Platform uyumlu UI
- Tutarlı tema sistemi
- A11y standartları karşılandı

## 🔍 Faz 6 Sonuç ve Değerlendirme

### Başarı Metrikleri
- Cold start süresi < 2s
- Frame drop rate < 1%
- Offline sync başarı oranı > 99%
- Push delivery rate > 95%

### Performans İyileştirmeleri
- Lazy loading ve code splitting
- Image caching ve önbellekleme
- Network request optimizasyonu
- Memory leak kontrolü

### Platform Spesifik Kontroller
- iOS ve Android permission handling
- Platform UI/UX uyumluluğu
- Background task yönetimi
- Deep linking desteği

### ⚠️ Önemli Notlar
- Kamera ve GPS kullanımını optimize et
- Offline storage limitlerini belirle
- FCM token yenilemelerini monitör et
- Platform spesifik crash reporting ekle