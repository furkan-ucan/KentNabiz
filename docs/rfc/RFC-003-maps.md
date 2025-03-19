# RFC-003: Harita Entegrasyonu ve CBS Desteği

## Metadata
```yaml
RFC Numarası: RFC-003
Başlık: Harita Entegrasyonu ve CBS Desteği
Yazar: Ali Yılmaz
Durum: Taslak
Oluşturma Tarihi: 2024-01-20
Son Güncelleme: 2024-01-20
İlgili Bileşenler: Frontend, Mobile, Maps Service
```

## 1. Özet
Bu RFC, KentNabız platformunun harita ve CBS entegrasyonunu detaylandırmaktadır. MVP sürecinde temel harita özelliklerine odaklanılırken, gelişmiş CBS analizleri ileriki aşamalara bırakılmıştır.

## 2. Harita Entegrasyonu

### 2.1. Frontend Harita Komponenti
```typescript
interface MapConfig {
    defaultCenter: {
        lat: 41.0082;     // İstanbul
        lng: 28.9784;
    };
    defaultZoom: 13;
    minZoom: 10;
    maxZoom: 18;
    
    tileLayer: {
        url: string;      // OpenStreetMap
        attribution: string;
    };
}

interface MapFeatures {
    basic: {
        pan: boolean;         // true
        zoom: boolean;        // true
        markers: boolean;     // true
    };
    advanced: {
        clustering: boolean;  // false - Faz 2
        heatmap: boolean;    // false - Faz 2
    };
}
```

### 2.2. Mobil Harita Komponenti
```typescript
interface MobileMapConfig extends MapConfig {
    offline: {
        enabled: boolean;     // false - Faz 2
        tileCache: boolean;   // false - Faz 2
    };
    
    locationTracking: {
        enabled: boolean;     // true
        accuracy: 'high' | 'balanced' | 'low';
        interval: number;     // milliseconds
    };
}
```

## 3. Veri Yapıları

### 3.1. Temel Geo Veri Modeli
```typescript
interface GeoPoint {
    type: 'Point';
    coordinates: [number, number];  // [longitude, latitude]
}

interface Report {
    id: string;
    location: GeoPoint;
    category: string;
    status: string;
    createdAt: Date;
}

interface MapMarker {
    id: string;
    location: GeoPoint;
    type: 'report' | 'user';
    icon?: string;
    popupContent?: string;
}
```

### 3.2. Spatial Queries
```typescript
interface SpatialQuery {
    viewport: {
        north: number;
        south: number;
        east: number;
        west: number;
    };
    
    filters?: {
        category?: string[];
        status?: string[];
        date?: {
            start: Date;
            end: Date;
        };
    };
    
    pagination: {
        limit: number;
        offset: number;
    };
}
```

## 4. Frontend Implementation

### 4.1. Web Harita Komponenti
```typescript
interface MapProps {
    center?: [number, number];
    zoom?: number;
    markers?: MapMarker[];
    onMarkerClick?: (marker: MapMarker) => void;
    onLocationSelect?: (location: GeoPoint) => void;
}

// Örnek Kullanım
const ReportMap: React.FC<MapProps> = ({
    center = [41.0082, 28.9784],
    zoom = 13,
    markers = [],
    onMarkerClick,
    onLocationSelect
}) => {
    return (
        <Map
            center={center}
            zoom={zoom}
            onClick={handleMapClick}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
            />
            {markers.map(marker => (
                <Marker
                    key={marker.id}
                    position={marker.location.coordinates}
                    onClick={() => onMarkerClick?.(marker)}
                />
            ))}
        </Map>
    );
};
```

### 4.2. Mobil Harita Komponenti
```typescript
interface MobileMapProps extends MapProps {
    showUserLocation?: boolean;
    onUserLocationChange?: (location: GeoPoint) => void;
}

// Örnek Kullanım
const MobileReportMap: React.FC<MobileMapProps> = ({
    showUserLocation = true,
    onUserLocationChange,
    ...mapProps
}) => {
    return (
        <MapView
            {...mapProps}
            showsUserLocation={showUserLocation}
            onUserLocationChange={handleLocationChange}
        >
            {mapProps.markers?.map(marker => (
                <Marker
                    key={marker.id}
                    coordinate={{
                        latitude: marker.location.coordinates[1],
                        longitude: marker.location.coordinates[0]
                    }}
                />
            ))}
        </MapView>
    );
};
```

## 5. Backend Implementation

### 5.1. PostGIS Integration
```typescript
interface GeoRepository {
    findInViewport(query: SpatialQuery): Promise<Report[]>;
    findNearby(point: GeoPoint, radius: number): Promise<Report[]>;
    calculateDistance(point1: GeoPoint, point2: GeoPoint): Promise<number>;
}

// Örnek Query
const reportsInViewport = `
    SELECT *
    FROM reports
    WHERE ST_Within(
        location,
        ST_MakeEnvelope($1, $2, $3, $4, 4326)
    )
    AND category = ANY($5)
    AND status = ANY($6)
    AND created_at BETWEEN $7 AND $8
    LIMIT $9 OFFSET $10
`;
```

### 5.2. Veri Optimizasyonu
```typescript
interface GeoOptimizations {
    indexes: {
        spatial: boolean;    // true - R-tree index
        category: boolean;   // true - B-tree index
        status: boolean;     // true - B-tree index
    };
    
    caching: {
        viewport: {
            enabled: boolean;    // true
            ttl: number;        // 5 minutes
        };
        markers: {
            enabled: boolean;    // true
            ttl: number;        // 15 minutes
        };
    };
}
```

## 6. MVP Özellikleri

### 6.1. Faz 1 (İlk Versiyon)
1. **Temel Harita**
   - OpenStreetMap entegrasyonu
   - Marker gösterimi
   - Konum seçimi

2. **Rapor Entegrasyonu**
   - Rapor konumları
   - Temel filtreleme
   - Popup bilgileri

3. **Mobil Destek**
   - Kullanıcı konumu
   - Basit marker'lar
   - Konum izni yönetimi

### 6.2. Ertelenen Özellikler (Faz 2)
1. Marker clustering
2. Isı haritaları
3. Offline harita desteği
4. Gelişmiş CBS analizleri
5. Custom tile server

## 7. Test Stratejisi

### 7.1. Unit Tests
```typescript
interface MapTestPlan {
    components: {
        map: string[];
        markers: string[];
        controls: string[];
    };
    
    functionality: {
        rendering: string[];
        interactions: string[];
        events: string[];
    };
}
```

### 7.2. Integration Tests
```typescript
interface GeoTestPlan {
    queries: {
        viewport: boolean;
        nearby: boolean;
        distance: boolean;
    };
    
    performance: {
        largeDatasets: boolean;
        concurrentRequests: boolean;
    };
}
```

## 8. Performance Hedefleri

### 8.1. Frontend
- İlk harita yükleme < 2s
- Marker render < 100ms (100 marker için)
- Viewport değişim < 200ms

### 8.2. Backend
- Spatial query < 200ms
- Nearby search < 100ms
- Cache hit ratio > 80%

## 9. Uygulama Planı

### Hafta 1: Temel Harita
1. OpenStreetMap entegrasyonu
2. Temel harita kontrolları
3. Marker sistemi

### Hafta 2: Rapor Entegrasyonu
1. PostGIS setup
2. Spatial queries
3. Frontend-backend entegrasyonu

### Hafta 3: Mobil Destek
1. React Native Maps setup
2. Konum servisleri
3. Mobil optimizasyonlar

### Hafta 4: Test & Optimizasyon
1. Unit ve integration testler
2. Performance optimizasyonları
3. Belgeleme ve review

## 10. Sonuç

Bu RFC, KentNabız platformunun harita ve CBS entegrasyonunu MVP odaklı bir yaklaşımla ele almaktadır. İlk aşamada temel harita özellikleri ve rapor entegrasyonuna odaklanılarak, kullanılabilir bir sistem hedeflenmektedir. Gelişmiş CBS özellikleri ve optimizasyonlar, kullanıcı geribildirimleri ve ihtiyaçlar doğrultusunda ilerleyen aşamalarda eklenecektir.