# Sprint 2.5 - Web Uygulama Geliştirme

## 1. Frontend Altyapı

### 1.1. React Application Setup
```typescript
// apps/web/src yapısı
src/
├── App.tsx              # Ana uygulama bileşeni
├── pages/              # Sayfa bileşenleri
│   ├── auth/          # Auth sayfaları
│   ├── reports/       # Rapor sayfaları
│   └── profile/       # Profil sayfaları
├── components/         # UI bileşenleri
│   ├── common/        # Genel bileşenler
│   ├── maps/         # Harita bileşenleri
│   └── reports/      # Rapor bileşenleri
├── hooks/             # Custom hooks
├── services/          # API servisleri
├── store/            # Redux store
└── utils/            # Yardımcı fonksiyonlar
```

### 1.2. Core Dependencies
```json
{
  "dependencies": {
    "@kentnabiz/shared": "workspace:*",
    "@kentnabiz/ui": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@reduxjs/toolkit": "^2.0.0",
    "react-router-dom": "^6.0.0",
    "leaflet": "^1.9.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.0.0"
  }
}
```

## 2. UI/UX Geliştirme

### 2.1. Auth Flows
- Login sayfası
- Register sayfası
- Şifre sıfırlama
- Private route yapısı

### 2.2. Ana Özellikler
- Dashboard layout
- Rapor listeleme
- Rapor detay
- Rapor oluşturma formu
- Profil yönetimi

### 2.3. Harita Entegrasyonu
- Leaflet implementasyonu
- Marker yönetimi
- Cluster desteği
- Konum seçici

## 3. State Management

### 3.1. Redux Store Yapısı
```typescript
interface RootState {
  auth: {
    user: User | null;
    token: string | null;
    loading: boolean;
  };
  reports: {
    items: Report[];
    selected: Report | null;
    filters: ReportFilters;
    pagination: PaginationState;
  };
  map: {
    center: [number, number];
    zoom: number;
    markers: MapMarker[];
  };
}
```

### 3.2. API Entegrasyonu
- RTK Query setup
- API endpoints
- Error handling
- Loading states

## 4. Sprint Planı

### Hafta 1 - Temel Yapı
| Gün | Görev |
|-----|-------|
| Pazartesi | React app scaffold |
| Salı | Router ve layout |
| Çarşamba | UI kit entegrasyonu |
| Perşembe | Redux store setup |
| Cuma | Auth flow |

### Hafta 2 - Core Features
| Gün | Görev |
|-----|-------|
| Pazartesi | Dashboard ve listeleme |
| Salı | Rapor detay ve form |
| Çarşamba | Harita entegrasyonu |
| Perşembe | Media upload |
| Cuma | Profil ve ayarlar |

## 5. Performance Optimizasyonları

### 5.1. Code Splitting
- Route-based splitting
- Component lazy loading
- Image optimization
- Bundle analizi

### 5.2. Caching Stratejisi
- API response cache
- Image cache
- Map tile cache
- Local storage

## 6. Test Stratejisi

### 6.1. Component Tests
```typescript
describe('ReportForm', () => {
  it('should validate required fields', () => {
    // Test implementation
  });

  it('should handle form submission', () => {
    // Test implementation
  });
});
```

### 6.2. Integration Tests
- API calls
- Route transitions
- State updates
- Form submissions

## 7. Başarı Kriterleri

### 7.1. Performance
- First load < 2s
- Page transitions < 300ms
- API responses < 200ms
- Lighthouse score > 90

### 7.2. Quality
- Test coverage > 80%
- Zero TypeScript errors
- Consistent styling
- Cross-browser uyumluluk

## 8. Özet
Bu sprint, KentNabız web uygulamasının geliştirilmesine odaklanmaktadır. Monorepo yapısı içinde shared paketleri kullanarak, modern ve performanslı bir web uygulaması geliştirilecektir. Kullanıcı deneyimi ve kod kalitesi ön planda tutularak, maintainable ve scalable bir frontend altyapısı oluşturulacaktır.