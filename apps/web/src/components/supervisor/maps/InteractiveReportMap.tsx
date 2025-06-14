import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import * as HeatmapLayerPackage from 'react-leaflet-heatmap-layer-v3';
// @ts-expect-error TODO: Kütüphane tipleri güncellendiğinde veya daha iyi bir çözüm bulunduğunda kaldırılacak.
const { HeatmapLayer } = HeatmapLayerPackage;
import L from 'leaflet';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Tooltip,
  Badge,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import {
  Visibility,
  Share,
  LocationOn,
  Schedule,
  Person,
} from '@mui/icons-material';
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
  viewMode?: 'heat' | 'cluster';
  filters?: Record<string, unknown>;
  selectedNeighborhood?: string | null;
  onNeighborhoodSelect?: (neighborhoodName: string | null) => void;
  onReportView?: (reportId: number) => void;
  onReportShare?: (reportId: number) => void;
}

// Status based color and icon configuration
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

// Enhanced Popup Component (inline)
const EnhancedPopup: React.FC<{
  report: SharedReport;
  onViewDetails?: (reportId: number) => void;
  onShareReport?: (reportId: number) => void;
}> = ({ report, onViewDetails, onShareReport }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusConfig = {
    OPEN: { color: '#f44336', label: 'Açık' },
    IN_REVIEW: { color: '#ff9800', label: 'İncelemede' },
    IN_PROGRESS: { color: '#2196f3', label: 'İşlemde' },
    DONE: { color: '#4caf50', label: 'Tamamlandı' },
    REJECTED: { color: '#9e9e9e', label: 'Reddedildi' },
    CANCELLED: { color: '#9e9e9e', label: 'İptal Edildi' },
  };

  return (
    <Box sx={{ minWidth: 280, maxWidth: 320 }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 'bold', color: '#1976d2', mb: 0.5 }}
        >
          {report.title}
        </Typography>
        <Chip
          label={
            statusConfig[report.status as keyof typeof statusConfig]?.label ||
            report.status
          }
          size="small"
          sx={{
            backgroundColor:
              statusConfig[report.status as keyof typeof statusConfig]?.color ||
              '#666',
            color: 'white',
            fontWeight: 'bold',
          }}
        />
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Content */}
      <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOn sx={{ fontSize: 16, color: '#666' }} />
          <Typography variant="body2" color="text.secondary">
            {report.address || 'Adres bilgisi yok'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Schedule sx={{ fontSize: 16, color: '#666' }} />
          <Typography variant="body2" color="text.secondary">
            {formatDate(report.createdAt.toString())}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person sx={{ fontSize: 16, color: '#666' }} />
          <Typography variant="body2" color="text.secondary">
            {(report as unknown as { reporterName?: string }).reporterName ||
              'Anonim'}
          </Typography>
        </Box>
      </Box>

      {report.description && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
            {report.description.length > 100
              ? `${report.description.substring(0, 100)}...`
              : report.description}
          </Typography>
        </>
      )}

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
        <Button
          size="small"
          startIcon={<Visibility />}
          onClick={() => onViewDetails?.(report.id)}
          sx={{ flex: 1 }}
        >
          Detay
        </Button>
        <Button
          size="small"
          startIcon={<Share />}
          onClick={() => onShareReport?.(report.id)}
          sx={{ flex: 1 }}
        >
          Paylaş
        </Button>
      </Box>
    </Box>
  );
};

interface HeatmapPoint {
  lat: number;
  lng: number;
  value: number;
}

export const InteractiveReportMap: React.FC<InteractiveReportMapProps> = ({
  reports,
  onReportClick,
  height = 500,
  viewMode = 'cluster',
  filters,
  selectedNeighborhood,
  onNeighborhoodSelect,
  onReportView,
  onReportShare,
}) => {
  const [isMapReady, setIsMapReady] = useState(false);
  const [islahiyeData, setIslahiyeData] = useState<FeatureCollection | null>(
    null
  );

  useEffect(() => {
    // console.log('HeatmapLayerPackage:', HeatmapLayerPackage);
    // if (HeatmapLayerPackage) {
    //   console.log('HeatmapLayer from package:', HeatmapLayerPackage.HeatmapLayer);
    //   console.log('Default from package:', HeatmapLayerPackage.default);
    // }
  }, []);

  // İslahiye sınırlarını yükle
  useEffect(() => {
    fetch('/src/assets/lottie/islahiye_neighborhoods.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // İslahiye mahalle verileri başarıyla yüklendi
        setIslahiyeData(data);
      })
      .catch(error => {
        console.warn('❌ İslahiye sınırları yüklenemedi:', error);
        // Fallback olarak useNeighborhoods hook'unu kullanabiliriz
      });
  }, []);

  // Filtrelenmiş raporları hesapla
  const filteredReports = useMemo(() => {
    if (!filters) return reports;

    return reports.filter(report => {
      // Kategori filtresi - category.id üzerinden
      if (filters.categoryId && report.category?.id !== filters.categoryId) {
        return false;
      }

      // Durum filtresi
      if (filters.status && report.status !== filters.status) {
        return false;
      }

      // Tarih aralığı filtresi - basit string kontrolü
      if (filters.startDate && report.createdAt) {
        const reportDate = new Date(report.createdAt);
        const startDate = new Date(filters.startDate as string);
        if (reportDate < startDate) {
          return false;
        }
      }

      if (filters.endDate && report.createdAt) {
        const reportDate = new Date(report.createdAt);
        const endDate = new Date(filters.endDate as string);
        if (reportDate > endDate) {
          return false;
        }
      }

      return true;
    });
  }, [reports, filters]);

  // Status legend için sayımlar
  const statusCounts = useMemo(() => {
    return filteredReports.reduce(
      (acc, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1;
        return acc;
      },
      {} as Record<ReportStatus, number>
    );
  }, [filteredReports]);

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
              key={`neighborhoods-${selectedNeighborhood || 'none'}`} // Force re-render when selection changes
              data={islahiyeData}
              style={feature => {
                const neighborhoodName = feature?.properties?.name;
                const isSelected = neighborhoodName === selectedNeighborhood;

                return {
                  color: isSelected ? '#1976d2' : '#666',
                  weight: isSelected ? 3 : 2,
                  opacity: 0.8,
                  fillColor: isSelected ? '#1976d2' : '#bbdefb',
                  fillOpacity: isSelected ? 0.3 : 0.1,
                  dashArray: isSelected ? undefined : '5, 5',
                };
              }}
              onEachFeature={(feature, layer) => {
                const neighborhoodName = feature.properties?.name;
                if (neighborhoodName) {
                  // Popup bilgileri
                  layer.bindPopup(
                    `<div style="text-align: center; padding: 8px;">
                       <strong style="font-size: 16px; color: #1976d2;">${neighborhoodName}</strong><br/>
                       <span style="color: #666; font-size: 12px;">${feature.properties.place || 'Mahalle'}</span><br/>
                       <em style="color: #999; font-size: 11px;">Tıklayarak filtreleyebilirsiniz</em>
                     </div>`
                  );

                  // Event handlers
                  layer.on({
                    mouseover: e => {
                      const layer = e.target;
                      layer.setStyle({
                        weight: 4,
                        color: '#1976d2',
                        fillOpacity: 0.4,
                      });
                      layer.bringToFront();
                    },
                    mouseout: e => {
                      const layer = e.target;
                      const isSelected =
                        neighborhoodName === selectedNeighborhood;
                      layer.setStyle({
                        color: isSelected ? '#1976d2' : '#666',
                        weight: isSelected ? 3 : 2,
                        fillColor: isSelected ? '#1976d2' : '#bbdefb',
                        fillOpacity: isSelected ? 0.3 : 0.1,
                        dashArray: isSelected ? undefined : '5, 5',
                      });
                    },
                    click: e => {
                      // Toggle mahalle seçimi
                      const newSelection =
                        neighborhoodName === selectedNeighborhood
                          ? null
                          : neighborhoodName;
                      onNeighborhoodSelect?.(newSelection);

                      // Haritayı seçili mahalleye odakla
                      if (newSelection) {
                        e.target._map.fitBounds(e.target.getBounds(), {
                          padding: [20, 20],
                        });
                      }
                    },
                  });
                }
              }}
            />
          )}

          {/* Cluster View */}
          {viewMode === 'cluster' && (
            <MarkerClusterGroup
              chunkedLoading
              maxClusterRadius={50}
              disableClusteringAtZoom={16}
            >
              {filteredReports.map(report => (
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
                    <EnhancedPopup
                      report={report}
                      onViewDetails={onReportView}
                      onShareReport={onReportShare}
                    />
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          )}

          {/* Heat View with Heatmap Layer */}
          {viewMode === 'heat' && HeatmapLayer && (
            <>
              {/* Individual markers for heat view - these can be removed if heatmap is sufficient */}
              {/* {reports.map(report => (
                <Marker
                  key={report.id}
                  position={[
                    report.location.coordinates[1],
                    report.location.coordinates[0],
                  ]}
                  icon={L.divIcon({
                    html: `<div style="width:12px;height:12px;background:rgba(255,0,0,0.6);border-radius:50%;border:2px solid white;box-shadow:0 0 10px rgba(255,0,0,0.5);"></div>`,
                    className: 'heat-marker',
                    iconSize: [12, 12],
                    iconAnchor: [6, 6],
                  })}
                  eventHandlers={{
                    click: () => onReportClick?.(report),
                  }}
                >
                  <Popup>
                    <EnhancedPopup
                      report={report}
                      onViewDetails={onReportView}
                      onShareReport={onReportShare}
                    />
                  </Popup>
                </Marker>
              ))} */}

              {/* Heatmap Layer */}
              <HeatmapLayer
                points={filteredReports.map(
                  report =>
                    ({
                      lat: report.location.coordinates[1],
                      lng: report.location.coordinates[0],
                      value: 50, // Default intensity value
                    }) as HeatmapPoint // Type assertion
                )}
                longitudeExtractor={(point: HeatmapPoint) => point.lng}
                latitudeExtractor={(point: HeatmapPoint) => point.lat}
                intensityExtractor={(point: HeatmapPoint) => point.value}
                radius={25} // Increased radius for better visibility
                blur={15}
                maxZoom={18} // Adjusted maxZoom
                minOpacity={0.3} // Added minOpacity for better blending
              />
            </>
          )}
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
