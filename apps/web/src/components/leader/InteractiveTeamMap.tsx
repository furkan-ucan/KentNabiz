import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  GeoJSON,
} from 'react-leaflet';
import { LatLngExpression, Icon } from 'leaflet';
import { SharedReport, ReportStatus } from '@kentnabiz/shared';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import type { FeatureCollection } from 'geojson';
import 'leaflet/dist/leaflet.css';

// Leaflet'ın varsayılan ikonunun düzgün çalışması için bu ayar gerekli
// Default icon paths fix for Vite
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Durum bazlı pin renkleri için özel ikonlar
const createCustomIcon = (status: ReportStatus) => {
  const colors = {
    OPEN: '#f44336',
    IN_REVIEW: '#ff9800',
    IN_PROGRESS: '#2196f3',
    DONE: '#4caf50',
    REJECTED: '#9e9e9e',
    CANCELLED: '#9e9e9e',
  };

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="${colors[status] || '#666'}" stroke="#fff" stroke-width="2"/>
        <circle cx="12.5" cy="12.5" r="7" fill="#fff"/>
      </svg>
    `)}`,
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
    shadowSize: [41, 41],
  });
};

interface MapProps {
  reports: SharedReport[];
  selectedReportId: number | null;
  onSelectReport: (id: number | null) => void;
  center?: LatLngExpression;
}

// Haritanın merkezini ve zoom seviyesini dinamik olarak değiştiren bileşen
function ChangeView({
  center,
  zoom,
}: {
  center: LatLngExpression;
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  return null;
}

export function InteractiveTeamMap({
  reports,
  selectedReportId,
  onSelectReport,
}: MapProps) {
  // İslahiye koordinatları - haritanın merkezi (doğru koordinatlar)
  const ISLAHIYE_CENTER: LatLngExpression = [37.025638, 36.631124]; // İslahiye/Gaziantep koordinatları
  const [islahiyeData, setIslahiyeData] = useState<FeatureCollection | null>(
    null
  );

  // İslahiye sınırlarını yükle
  useEffect(() => {
    fetch('/src/assets/lottie/islahiye_neighborhoods.geojson')
      .then(response => response.json())
      .then(data => setIslahiyeData(data))
      .catch(error => console.warn('İslahiye sınırları yüklenemedi:', error));
  }, []);

  const selectedReport = reports.find(r => r.id === selectedReportId);
  const mapCenter: LatLngExpression = selectedReport?.location
    ? [
        selectedReport.location.coordinates[1],
        selectedReport.location.coordinates[0],
      ]
    : ISLAHIYE_CENTER;

  const zoomLevel = selectedReport ? 16 : 9;

  return (
    <MapContainer
      center={ISLAHIYE_CENTER}
      zoom={9}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
      scrollWheelZoom={true}
    >
      {/* Harita katmanını OpenStreetMap'ten çekiyoruz */}
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* İslahiye Sınırları */}
      {islahiyeData && (
        <GeoJSON
          data={islahiyeData}
          style={{
            color: '#1976d2',
            weight: 2,
            opacity: 0.8,
            fillColor: '#bbdefb',
            fillOpacity: 0.1,
          }}
          onEachFeature={(feature, layer) => {
            if (feature.properties?.name) {
              layer.bindPopup(
                `<strong>${feature.properties.name}</strong><br/>
                 ${feature.properties.place || 'Mahalle'}`
              );
            }
          }}
        />
      )}

      {/* Seçili bir rapor varsa haritayı o konuma odakla */}
      <ChangeView center={mapCenter} zoom={zoomLevel} />

      {/* Raporları harita üzerinde pin'le */}
      {reports.map(report => {
        if (!report.location?.coordinates) return null;

        const position: LatLngExpression = [
          report.location.coordinates[1], // Latitude
          report.location.coordinates[0], // Longitude
        ];

        const isSelected = report.id === selectedReportId;

        return (
          <Marker
            key={report.id}
            position={position}
            icon={createCustomIcon(report.status)}
            eventHandlers={{
              click: () => {
                onSelectReport(report.id);
              },
            }}
            // Seçili rapor için z-index ayarla
            zIndexOffset={isSelected ? 1000 : 0}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>
                  {report.title}
                </h4>
                <p
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    color: '#666',
                  }}
                >
                  {report.description}
                </p>
                <p
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '12px',
                    color: '#888',
                  }}
                >
                  📍 {report.address}
                </p>
                <p style={{ margin: '0 0 12px 0', fontSize: '12px' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: '#f0f0f0',
                      color: '#333',
                    }}
                  >
                    {report.status}
                  </span>
                </p>
                <button
                  onClick={e => {
                    e.preventDefault();
                    onSelectReport(report.id);
                  }}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Detayları Gör
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
