import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Tooltip,
  Badge,
} from '@mui/material';
import { SharedReport, ReportStatus } from '@kentnabiz/shared';
import type { FeatureCollection } from 'geojson';
import 'leaflet/dist/leaflet.css';

// Leaflet default icon fix
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveReportMapProps {
  reports: SharedReport[];
  onReportClick?: (report: SharedReport) => void;
  height?: number | string;
}

const statusConfig: Record<
  ReportStatus,
  { color: string; icon: string; label: string }
> = {
  OPEN: { color: '#f44336', icon: '🔴', label: 'Açık' },
  IN_REVIEW: { color: '#ff9800', icon: '👁️', label: 'İncelemede' },
  IN_PROGRESS: { color: '#2196f3', icon: '⚡', label: 'İşlemde' },
  DONE: { color: '#4caf50', icon: '✅', label: 'Tamamlandı' },
  REJECTED: { color: '#9e9e9e', icon: '❌', label: 'Reddedildi' },
  CANCELLED: { color: '#9e9e9e', icon: '⭕', label: 'İptal Edildi' },
};

const createCustomIcon = (status: ReportStatus) =>
  L.divIcon({
    html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:#fff;border:3px solid ${statusConfig[status].color};border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:16px;">${statusConfig[status].icon}</div>`,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

const ISLAHIYE_CENTER: [number, number] = [37.025638, 36.631124];
const ISLAHIYE_BOUNDS: [[number, number], [number, number]] = [
  [36.825638, 36.431124],
  [37.225638, 36.831124],
];

export const InteractiveReportMap: React.FC<InteractiveReportMapProps> = ({
  reports,
  onReportClick,
  height = 500,
}) => {
  const [isMapReady, setIsMapReady] = useState(false);
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

  // Status legend için sayımlar
  const statusCounts = useMemo(() => {
    return reports.reduce(
      (acc, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1;
        return acc;
      },
      {} as Record<ReportStatus, number>
    );
  }, [reports]);

  return (
    <Card
      sx={{
        position: 'relative',
        height: typeof height === 'number' ? `${height}px` : height,
        minHeight: 400,
        overflow: 'hidden',
        borderRadius: 2,
        background: '#e3f2fd',
      }}
    >
      <CardContent
        sx={{ p: 0, height: '100%', minHeight: 400, '&:last-child': { pb: 0 } }}
      >
        {!isMapReady && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1001,
              backgroundColor: '#f5f5f5',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Skeleton
              variant="rectangular"
              width="90%"
              height="70%"
              animation="pulse"
              sx={{ backgroundColor: '#e3f2fd', borderRadius: 2, mb: 2 }}
            />
            <Typography
              variant="h6"
              sx={{ color: '#1976d2', mb: 2, textAlign: 'center' }}
            >
              🗺️ Harita Yükleniyor...
            </Typography>
          </Box>
        )}
        <MapContainer
          center={ISLAHIYE_CENTER}
          zoom={9}
          style={{
            height: '100%',
            width: '100%',
            minHeight: 400,
            background: '#e3f2fd',
            border: '2px solid #1976d2',
            opacity: 1,
            transition: 'opacity 0.3s',
          }}
          maxBounds={ISLAHIYE_BOUNDS}
          minZoom={7}
          maxZoom={19}
          maxBoundsViscosity={1.0}
          whenReady={() => setIsMapReady(true)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            errorTileUrl="https://via.placeholder.com/256x256/ff0000/ffffff?text=Tile+Error"
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

          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            disableClusteringAtZoom={16}
          >
            {reports.map(report => (
              <Marker
                key={report.id}
                position={[
                  report.location.coordinates[1],
                  report.location.coordinates[0],
                ]}
                icon={createCustomIcon(report.status)}
                eventHandlers={{
                  click: () => onReportClick?.(report),
                }}
              >
                <Popup>
                  <Typography variant="subtitle2">{report.title}</Typography>
                  <Typography variant="body2">
                    {statusConfig[report.status].label}
                  </Typography>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
        {/* Status Legend */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          {Object.entries(statusConfig).map(([status, config]) =>
            statusCounts[status as ReportStatus] ? (
              <Tooltip
                key={status}
                title={`${config.label}: ${statusCounts[status as ReportStatus]} rapor`}
                placement="left"
                arrow
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: `2px solid ${config.color}`,
                    borderRadius: '50%',
                    boxShadow: 3,
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <Typography sx={{ fontSize: '16px', lineHeight: 1 }}>
                    {config.icon}
                  </Typography>
                  <Badge
                    badgeContent={statusCounts[status as ReportStatus]}
                    color="secondary"
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      '& .MuiBadge-badge': {
                        fontSize: '0.65rem',
                        minWidth: 16,
                        height: 16,
                        backgroundColor: config.color,
                        color: 'white',
                        fontWeight: 600,
                      },
                    }}
                  />
                </Box>
              </Tooltip>
            ) : null
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default InteractiveReportMap;
