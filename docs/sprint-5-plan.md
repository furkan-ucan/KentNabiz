# Sprint 5 – Mobile App Geliştirme

## 1. Monorepo Entegrasyonu

### 1.1. Shared Paketler
```typescript
// apps/mobile/package.json
{
  "dependencies": {
    "@kentnabiz/shared": "workspace:*",
    "@kentnabiz/ui": "workspace:*"
  }
}
```

### 1.2. Metro Konfigürasyonu
```javascript
// apps/mobile/metro.config.js
module.exports = {
  resolver: {
    extraNodeModules: {
      '@kentnabiz/shared': path.resolve(__dirname, '../../packages/shared'),
      '@kentnabiz/ui': path.resolve(__dirname, '../../packages/ui')
    }
  }
};
```

## 2. UI Component Adaptasyonu

### 2.1. React Native Özellikleri
```typescript
// @kentnabiz/ui/src/components/mobile/
├── adapters/
│   ├── MapView.native.tsx
│   ├── Button.native.tsx
│   └── Input.native.tsx
└── hooks/
    ├── useNativeMap.ts
    └── useImagePicker.ts
```

### 2.2. Native Modüller
- React Native Maps
- Image Picker
- File System
- Geolocation
- Push Notifications

## 3. Mobil Spesifik Özellikler

### 3.1. Temel Özellikler
- Offline storage
- Location tracking
- Camera integration
- Deep linking
- Biometric auth

### 3.2. Navigation Yapısı
```typescript
// apps/mobile/src/navigation/
├── AppNavigator.tsx
├── AuthNavigator.tsx
└── TabNavigator.tsx
```

## 4. Sprint Planı

### Hafta 1 - Temel Kurulum
| Gün | Görev |
|-----|-------|
| Pazartesi | React Native setup |
| Salı | Monorepo entegrasyonu |
| Çarşamba | Shared paket adaptasyonu |
| Perşembe | Navigation yapısı |
| Cuma | Auth flow |

### Hafta 2 - Core Features
| Gün | Görev |
|-----|-------|
| Pazartesi | Harita entegrasyonu |
| Salı | Rapor oluşturma |
| Çarşamba | Offline storage |
| Perşembe | Native features |
| Cuma | Testing |

## 5. Native Features

### 5.1. Camera Integration
```typescript
// apps/mobile/src/hooks/useCamera.ts
export const useCamera = () => {
  const takePhoto = async () => {
    // Camera implementation
  };

  const pickImage = async () => {
    // Image picker implementation
  };

  return { takePhoto, pickImage };
};
```

### 5.2. Location Services
```typescript
// apps/mobile/src/hooks/useLocation.ts
export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);

  const startTracking = () => {
    // Location tracking implementation
  };

  return { location, tracking, startTracking };
};
```

## 6. Offline Support

### 6.1. Local Storage
```typescript
// @kentnabiz/shared/src/storage/
export class LocalStorage {
  saveReport(report: Report) {
    // Save to AsyncStorage
  }

  getPendingReports() {
    // Get offline reports
  }

  sync() {
    // Sync with server
  }
}
```

### 6.2. Sync Strategy
- Background sync
- Conflict resolution
- Retry mechanism
- Queue management

## 7. Test Stratejisi

### 7.1. Component Tests
- React Native Testing Library
- Component render tests
- Hook tests
- Native module mocks

### 7.2. E2E Tests
- Device testing
- Offline scenarios
- Navigation flows
- Permission handling

## 8. Performance

### 8.1. Optimizasyonlar
- Image caching
- List virtualization
- Memory management
- Bundle size

### 8.2. Monitoring
- Error tracking
- Performance metrics
- Usage analytics
- Crash reporting

## 9. Başarı Kriterleri

### 9.1. Teknik
- Cold start < 2s
- Smooth animations
- Offline functionality
- Battery efficiency

### 9.2. Quality
- Unit test coverage
- Error handling
- Code organization
- Documentation

## 10. Özet
Sprint 5, KentNabız mobil uygulamasının monorepo yapısı içinde geliştirilmesini hedeflemektedir. Shared paketlerin etkin kullanımı ile kod tekrarı minimuma indirilecek, native özelliklerin etkin entegrasyonu sağlanacaktır. Offline first yaklaşımı ile kullanıcı deneyimi optimize edilecektir.