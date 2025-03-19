# Sprint 3 - Raporlama Sistemi ve Harita Entegrasyonu

## 1. Shared Paket Geliştirmeleri

### 1.1. @kentnabiz/ui Geliştirmeleri

```typescript
packages/ui/src/
├── components/
│   ├── map/              # Harita komponentleri
│   │   ├── MapView.tsx
│   │   ├── Marker.tsx
│   │   └── Controls.tsx
│   └── reports/          # Rapor form komponentleri
│       ├── ReportForm.tsx
│       ├── MediaUpload.tsx
│       └── LocationPicker.tsx
└── hooks/
    ├── useMap.ts
    ├── useGeolocation.ts
    └── useMediaUpload.ts
```

### 1.2. @kentnabiz/shared Geliştirmeleri

```typescript
packages/shared/src/
├── types/
│   ├── report.types.ts
│   └── location.types.ts
├── utils/
│   ├── geo.utils.ts
│   └── media.utils.ts
└── services/
    └── map.service.ts
```

## 2. Raporlama Sistemi

### 2.1. Form Yapısı

```typescript
interface ReportForm {
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  category: ReportCategory;
  media?: File[];
}
```

### 2.2. Media Upload

- Drag & drop desteği
- Image preview
- Client-side optimizasyon
- Progress tracking

## 3. Harita Entegrasyonu

### 3.1. Leaflet Setup

```typescript
// @kentnabiz/ui/src/components/map/MapView.tsx
const MapView: React.FC<MapProps> = ({ center, zoom, markers, onMarkerClick }) => {
  // Map implementation
};
```

### 3.2. Harita Özellikleri

- Marker clustering
- Custom markers
- Popup bilgileri
- Konum seçimi
- Viewport yönetimi

## 4. Sprint Planı

### Hafta 1 - Shared Paketler

| Gün       | Görev            |
| --------- | ---------------- |
| Pazartesi | UI komponentleri |
| Salı      | Map hooks        |
| Çarşamba  | Shared utils     |
| Perşembe  | Unit testler     |
| Cuma      | Dokümantasyon    |

### Hafta 2 - Web İmplementasyonu

| Gün       | Görev                   |
| --------- | ----------------------- |
| Pazartesi | Rapor form geliştirmesi |
| Salı      | Harita entegrasyonu     |
| Çarşamba  | Media upload            |
| Perşembe  | State management        |
| Cuma      | Integration tests       |

## 5. Test Stratejisi

### 5.1. UI Tests

```typescript
describe('MapView', () => {
  it('should render markers', () => {
    // Test implementation
  });

  it('should handle marker click', () => {
    // Test implementation
  });
});
```

### 5.2. Integration Tests

- Form submission flow
- File upload flow
- Map interactions
- State updates

## 6. Performance Optimizasyonları

### 6.1. Map Optimizasyonları

- Lazy loading
- Viewport based loading
- Marker clustering
- Tile caching

### 6.2. Media Optimizasyonları

- Client-side resizing
- Progressive loading
- Cache stratejisi
- Batch upload

## 7. Başarı Kriterleri

### 7.1. Teknik

- Smooth map interactions
- < 2s form submission
- Successful file uploads
- Responsive UI

### 7.2. Kalite

- Test coverage > 80%
- Zero prop type errors
- Consistent styling
- Clear documentation

## 8. Özet

Sprint 3, raporlama sisteminin ve harita entegrasyonunun monorepo yapısı içinde geliştirilmesine odaklanmaktadır. Shared paketler aracılığıyla kod tekrarını önleyerek, web ve mobil uygulamalarda kullanılabilecek ortak komponentler ve utilities geliştirilecektir.
