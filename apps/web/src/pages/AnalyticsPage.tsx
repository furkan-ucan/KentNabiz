// apps/web/src/pages/AnalyticsPage.tsx
import { Box, Typography, Grid, Button, Alert, Snackbar } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useState } from 'react';
import { AnalyticsFilterBar } from '@/components/analytics/AnalyticsFilterBar';
import { KpiMetricsWidget } from '@/components/analytics/widgets/KpiMetricsWidget';
import { FunnelChartWidget } from '@/components/analytics/widgets/FunnelChartWidget';
import CategoryDistributionWidget from '@/components/analytics/widgets/CategoryDistributionWidget';
import TemporalTrendWidget from '@/components/analytics/widgets/TemporalTrendWidget';
import { AdvancedAnalyticsMapWidget } from '@/components/analytics/widgets/AdvancedAnalyticsMapWidget';
import { useAnalyticsFilters } from '@/hooks/analytics/useAnalyticsFilters';
import { api } from '@/lib/api';

export const AnalyticsPage = () => {
  const { filters, setFilters, resetFilters } = useAnalyticsFilters();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Category drill-down handler
  const handleCategoryClick = (categoryId: number, categoryName: string) => {
    console.log('🔽 Drill-down to category:', { categoryId, categoryName });

    // Global filtreyi güncelle (categoryId string olarak)
    setFilters({
      ...filters,
      categoryId: categoryId.toString(),
    });

    // Snackbar ile bilgilendirme
    setSnackbar({
      open: true,
      message: `"${categoryName}" kategorisine göre filtrelendi`,
      severity: 'success',
    });
  };

  const handleRefreshAnalytics = async () => {
    try {
      setIsRefreshing(true);
      await api.post('/report-analytics/refresh-analytics');
      setSnackbar({
        open: true,
        message: 'Analitik veriler başarıyla yenilendi!',
        severity: 'success',
      });
      // Sayfa yenilenerek cache'i temizle
      window.location.reload();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || 'Veriler yenilenirken bir hata oluştu';

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* BÖLÜM 1: SAYFA BAŞLIĞI VE GLOBAL FİLTRELER */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Analitik Panel
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Departman performansını, rapor trendlerini ve coğrafi yoğunluğu
            analiz edin.
          </Typography>
        </Box>

        {/* Refresh Button */}
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => void handleRefreshAnalytics()}
          disabled={isRefreshing}
          sx={{ ml: 2 }}
        >
          {isRefreshing ? 'Yenileniyor...' : 'Verileri Yenile'}
        </Button>
      </Box>

      {/* BÖLÜM 1.5: FİLTRE BARI - Auto-Hiding */}
      <AnalyticsFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onResetFilters={resetFilters}
      />

      {/* BÖLÜM 2: KPI KOKPİTİ (ÖZET KARTLAR) */}
      <Box>
        <KpiMetricsWidget filters={filters} onFiltersChange={setFilters} />
      </Box>
      {/* BÖLÜM 3: DETAYLI ANALİZ WIDGET'LARI (GRID) */}
      <Grid container spacing={3}>
        {/* --- GRAFİK KOKPİTİ: 3 Widget Yan Yana --- */}

        {/* Funnel Chart Widget - İş Akışı Hunisi */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <FunnelChartWidget filters={filters} />
        </Grid>

        {/* Category Distribution Widget - En Sorunlu Kategoriler */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <CategoryDistributionWidget
            filters={filters}
            onCategoryClick={handleCategoryClick}
            limit={10}
          />
        </Grid>

        {/* Temporal Trend Widget - Rapor Akış Trendi */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <TemporalTrendWidget filters={filters} />
        </Grid>

        {/* --- COĞRAFİ ANALİZ TUVALİ: Tam Genişlik --- */}
        <Grid size={{ xs: 12 }}>
          <AdvancedAnalyticsMapWidget
            filters={filters}
            onFiltersChange={setFilters}
          />
        </Grid>
      </Grid>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
