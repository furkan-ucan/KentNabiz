// apps/web/src/pages/AnalyticsPage.tsx
import { Box, Typography, Grid } from '@mui/material';
import { AnalyticsFilterBar } from '@/components/analytics/AnalyticsFilterBar';
import { KpiMetricsWidget } from '@/components/analytics/widgets/KpiMetricsWidget';
import { useAnalyticsFilters } from '@/hooks/analytics/useAnalyticsFilters';

export const AnalyticsPage = () => {
  const { filters, setFilters, resetFilters } = useAnalyticsFilters();

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* BÖLÜM 1: SAYFA BAŞLIĞI VE GLOBAL FİLTRELER */}
      <Box>
        {' '}
        <Typography variant="h4" fontWeight="bold">
          Analitik Panel
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Departman performansını, rapor trendlerini ve coğrafi yoğunluğu analiz
          edin.
        </Typography>
      </Box>

      {/* BÖLÜM 1.5: FİLTRE BARI */}
      <Box sx={{ mt: 2 }}>
        <AnalyticsFilterBar
          filters={filters}
          onFiltersChange={setFilters}
          onResetFilters={resetFilters}
        />
      </Box>

      {/* BÖLÜM 2: KPI KOKPİTİ (ÖZET KARTLAR) */}
      <Box>
        <KpiMetricsWidget filters={filters} />
      </Box>
      {/* BÖLÜM 3: DETAYLI ANALİZ WIDGET'LARI (GRID) */}
      <Grid container spacing={3}>
        {/*
          Gelecekte eklenecek widget'lar:
          <Grid size={{ xs: 12, md: 6 }}>
            <StatusDistributionWidget filters={filters} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CategoryDistributionWidget filters={filters} />
          </Grid>
        */}
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              p: 3,
              border: '2px dashed #ccc',
              borderRadius: 2,
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            {' '}
            <Typography variant="h6">
              Detaylı Analiz Widget&apos;ları
            </Typography>
            <Typography variant="body2">
              Grafik ve tablo widget&apos;ları buraya eklenecektir
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
