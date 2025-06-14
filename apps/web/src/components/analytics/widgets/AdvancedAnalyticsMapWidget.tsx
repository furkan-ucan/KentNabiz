import React, { useState, lazy, Suspense } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  CircularProgress,
} from '@mui/material';
import { Map, ScatterPlot } from '@mui/icons-material';
import { AnalyticsFilters } from '@/hooks/analytics/useAnalyticsFilters';
import { useSpatialDistribution } from '@/hooks/analytics/useSpatialDistribution';

// Lazy load heavy components
const InteractiveReportMap = lazy(
  () => import('../../supervisor/maps/InteractiveReportMap')
);

interface AdvancedAnalyticsMapWidgetProps {
  filters: AnalyticsFilters;
  onFiltersChange?: (filters: AnalyticsFilters) => void;
}

export const AdvancedAnalyticsMapWidget: React.FC<
  AdvancedAnalyticsMapWidgetProps
> = ({ filters, onFiltersChange }) => {
  const [mapView, setMapView] = useState<'heat' | 'cluster'>('heat');

  // Gerçek spatial distribution verilerini çek
  const {
    data: spatialReports,
    isLoading,
    error,
  } = useSpatialDistribution(filters);

  const handleViewChange = (
    _: React.MouseEvent<HTMLElement>,
    newView: 'heat' | 'cluster' | null
  ) => {
    if (newView !== null) {
      setMapView(newView);
    }
  };
  // Mahalle seçme handler'ı
  const handleNeighborhoodSelect = (neighborhoodName: string | null) => {
    onFiltersChange?.({
      ...filters,
      neighborhoodName,
    });
  };

  // Rapor detaylarını görüntüleme (şimdilik console.log)
  const handleViewDetails = (reportId: number) => {
    console.log('Viewing details for report:', reportId);
    // TODO: Modal açma veya detay sayfasına yönlendirme
  };

  // Rapor paylaşma (şimdilik console.log)
  const handleShareReport = (reportId: number) => {
    console.log('Sharing report:', reportId);
    // TODO: Paylaşım modalı açma
  };

  // Loading state
  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader
          title="Coğrafi Sorun Dağılımı"
          subheader="Veriler yükleniyor..."
        />
        <CardContent
          sx={{
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div>Harita yükleniyor...</div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader
          title="Coğrafi Sorun Dağılımı"
          subheader="Veri yüklenirken hata oluştu"
        />
        <CardContent
          sx={{
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div>Harita verileri yüklenemedi</div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Gelişmiş Coğrafi Analiz"
        subheader={`${spatialReports?.totalCount || 0} rapor • Raporların İslahiye genelindeki yoğunluğunu ve dağılımını analiz edin`}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {/* Görünüm modu toggle */}
            <ToggleButtonGroup
              value={mapView}
              exclusive
              onChange={handleViewChange}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 2,
                  py: 0.5,
                  fontSize: '0.875rem',
                },
              }}
            >
              <ToggleButton value="heat" aria-label="Isı Haritası">
                <Map sx={{ mr: 1, fontSize: '1rem' }} />
                Isı Haritası
              </ToggleButton>
              <ToggleButton value="cluster" aria-label="Nokta Dağılımı">
                <ScatterPlot sx={{ mr: 1, fontSize: '1rem' }} />
                Nokta Dağılımı
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        }
      />
      <CardContent sx={{ height: '600px', p: 0, position: 'relative' }}>
        <Suspense
          fallback={
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress size={40} />
            </Box>
          }
        >
          {' '}
          <InteractiveReportMap
            reports={spatialReports?.reports || []}
            viewMode={mapView}
            height="100%"
            filters={filters as unknown as Record<string, unknown>}
            selectedNeighborhood={filters.neighborhoodName || null}
            onNeighborhoodSelect={handleNeighborhoodSelect}
            onReportView={handleViewDetails}
            onReportShare={handleShareReport}
          />
        </Suspense>
      </CardContent>
    </Card>
  );
};

export default AdvancedAnalyticsMapWidget;
