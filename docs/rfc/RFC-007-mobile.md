# RFC-007: Mobil Uygulama Geliştirme

## Metadata
```yaml
RFC Numarası: RFC-007
Başlık: Mobil Uygulama Geliştirme
Yazar: Ali Yılmaz
Durum: Taslak
Oluşturma Tarihi: 2024-01-20
Son Güncelleme: 2024-01-20
İlgili Bileşenler: Mobile, Backend
```

## 1. Özet
Bu RFC, KentNabız platformunun mobil uygulamasını monorepo yapısı içinde geliştirme sürecini detaylandırmaktadır. Mobil uygulama, @kentnabiz/shared ve @kentnabiz/ui paketlerini kullanarak kod paylaşımını maksimize edecek şekilde tasarlanmıştır.

## 2. Monorepo Entegrasyonu

### 2.1. Paket Yapısı
```typescript
interface MobileWorkspace {
    location: 'apps/mobile';
    dependencies: {
        shared: '@kentnabiz/shared';
        ui: '@kentnabiz/ui';
    };
    scripts: {
        dev: 'react-native start';
        android: 'react-native run-android';
        ios: 'react-native run-ios';
        test: 'jest';
    };
}
```

### 2.2. Shared Kod Kullanımı
```typescript
interface SharedUsage {
    components: {
        ui: [
            'Button',
            'Input',
            'Card'
        ];
        forms: [
            'ReportForm',
            'LoginForm'
        ];
    };
    
    logic: {
        hooks: [
            'useAuth',
            'useReport',
            'useLocation'
        ];
        utils: [
            'validation',
            'api-client',
            'storage'
        ];
    };
}
```

## 3. Mobil Özelleştirmeler

### 3.1. Native Modüller
```typescript
interface NativeModules {
    location: {
        provider: 'react-native-geolocation';
        accuracy: 'high';
    };
    
    camera: {
        provider: 'react-native-camera';
        features: [
            'photo',
            'flash',
            'autofocus'
        ];
    };
    
    storage: {
        provider: '@react-native-async-storage/async-storage';
        encryption: false;  // MVP'de basit tutuyoruz
    };
}
```

### 3.2. Platform Özellikleri
```typescript
interface PlatformFeatures {
    android: {
        minSdk: 24;
        targetSdk: 33;
        permissions: [
            'CAMERA',
            'LOCATION',
            'STORAGE'
        ];
    };
    
    ios: {
        minVersion: '13.0';
        permissions: [
            'NSCameraUsageDescription',
            'NSLocationWhenInUseUsageDescription'
        ];
    };
}
```

## 4. Ekran Yapısı

### 4.1. Navigation
```typescript
interface NavigationStructure {
    stack: {
        auth: ['Login', 'Register'];
        main: ['Home', 'Reports', 'Profile'];
        modals: ['ReportCreate', 'ImagePreview'];
    };
    
    tabs: {
        items: [
            'HomeTab',
            'ReportsTab',
            'ProfileTab'
        ];
        initialTab: 'HomeTab';
    };
}
```

### 4.2. Screen Components
```typescript
interface ScreenComponents {
    base: {
        Screen: React.FC<ScreenProps>;
        Header: React.FC<HeaderProps>;
        Loading: React.FC;
    };
    
    shared: {
        MapView: React.FC<MapProps>;
        ImagePicker: React.FC<ImagePickerProps>;
        ErrorBoundary: React.FC;
    };
}
```

## 5. State Yönetimi

### 5.1. Redux Entegrasyonu
```typescript
interface ReduxIntegration {
    store: {
        persistConfig: {
            key: 'mobile';
            whitelist: ['auth', 'settings'];
            storage: 'async-storage';
        };
    };
    
    slices: {
        shared: [
            'auth',
            'reports',
            'notifications'
        ];
        mobile: [
            'camera',
            'location',
            'offline'
        ];
    };
}
```

### 5.2. Local Storage
```typescript
interface StorageConfig {
    keys: {
        auth: '@auth';
        settings: '@settings';
        reports: '@reports';
    };
    
    cleanup: {
        maxAge: '7d';
        maxSize: '50MB';
    };
}
```

## 6. Offline Desteği

### 6.1. MVP Offline Features
```typescript
interface OfflineSupport {
    reports: {
        create: {
            queue: true;
            maxItems: 10;
        };
        view: {
            cache: true;
            maxAge: '1d';
        };
    };
    
    maps: {
        tiles: {
            cache: true;
            maxSize: '100MB';
        };
        markers: {
            storage: true;
            sync: 'background';
        };
    };
}
```

### 6.2. Sync Stratejisi
```typescript
interface SyncStrategy {
    mode: 'on-connection';  // MVP için basit tutuyoruz
    retries: 3;
    priority: {
        high: ['reports/create'];
        normal: ['reports/update'];
        low: ['maps/cache'];
    };
}
```

## 7. Development Workflow

### 7.1. Local Development
```typescript
interface DevWorkflow {
    setup: {
        env: '.env.mobile';
        metro: 'metro.config.js';
        typescript: 'tsconfig.json';
    };
    
    tools: {
        emulator: 'Android Studio';
        simulator: 'Xcode';
        debugger: 'Flipper';
    };
}
```

### 7.2. Build Pipeline
```typescript
interface BuildPipeline {
    tasks: {
        validate: [
            'tsc',
            'eslint',
            'jest'
        ];
        build: {
            android: 'gradlew assembleRelease';
            ios: 'xcodebuild';
        };
    };
}
```

## 8. Test Stratejisi

### 8.1. Unit Tests
```typescript
interface MobileTests {
    scope: [
        'navigation',
        'state-management',
        'offline-logic'
    ];
    
    tools: {
        framework: 'jest';
        renderer: '@testing-library/react-native';
    };
}
```

### 8.2. Manual Testing
```typescript
interface ManualTests {
    devices: [
        'Android Emulator',
        'iOS Simulator'
    ];
    
    scenarios: [
        'offline-usage',
        'background-sync',
        'camera-usage'
    ];
}
```

## 9. MVP Timeline

### 9.1. Faz 1: Setup (1 hafta)
1. Monorepo entegrasyonu
2. Native modül kurulumları
3. Build pipeline

### 9.2. Faz 2: Core Features (2 hafta)
1. Auth flows
2. Report management
3. Map integration

### 9.3. Faz 3: Polish (1 hafta)
1. Offline support
2. Error handling
3. Performance optimization

## 10. Sonuç

Bu RFC, KentNabız mobil uygulamasının monorepo yapısı içinde geliştirilmesini detaylandırmaktadır. Önerilen yaklaşım, kod paylaşımını maksimize ederken, mobil-spesifik özellikleri etkin bir şekilde yönetmeyi hedeflemektedir. MVP sürecinde temel özelliklere odaklanılarak, hızlı bir şekilde kullanılabilir bir uygulama sunulması planlanmaktadır.