// apps/web/src/components/analytics/widgets/KpiMetricsWidget.tsx
import { Grid } from '@mui/material';
import {
  TrendingUp,
  CheckCircle,
  HourglassEmpty,
  Speed,
  Timer,
  FlashOn,
} from '@mui/icons-material';
import { KpiCard } from '../KpiCard';
import { useKpiMetrics } from '@/hooks/analytics/useKpiMetrics';
import { AnalyticsFilters } from '@/hooks/analytics/useAnalyticsFilters';

interface KpiMetricsWidgetProps {
  filters: AnalyticsFilters;
}

export const KpiMetricsWidget = ({ filters }: KpiMetricsWidgetProps) => {
  const { data, isLoading, error } = useKpiMetrics(filters);

  // Zaman hesaplamaları için yardımcı fonksiyonlar
  const formatTimeHours = (hours: string | number): string => {
    const numHours = typeof hours === 'string' ? parseFloat(hours) : hours;
    if (!numHours || numHours === 0) return '0 saat';

    if (numHours < 24) {
      return `${numHours.toFixed(1)} saat`;
    } else {
      const days = Math.floor(numHours / 24);
      const remainingHours = numHours % 24;
      return remainingHours > 0
        ? `${days} gün ${remainingHours.toFixed(1)} saat`
        : `${days} gün`;
    }
  };

  const kpiData = [
    {
      title: 'Toplam Rapor',
      value: data?.totalReports || 0,
      isLoading,
      icon: <TrendingUp />,
      color: 'primary' as const,
      subtitle: 'Toplam rapor sayısı',
    },
    {
      title: 'Çözülen Rapor',
      value: data?.resolvedReports || 0,
      isLoading,
      icon: <CheckCircle />,
      color: 'success' as const,
      subtitle: 'Başarıyla tamamlanan',
    },
    {
      title: 'Beklemede',
      value: data?.pendingReports || 0,
      isLoading,
      icon: <HourglassEmpty />,
      color: 'warning' as const,
      subtitle: 'İşlem bekleyen rapor',
    },
    {
      title: 'Başarı Oranı',
      value: data?.resolutionRate ? `%${data.resolutionRate}` : '%0',
      isLoading,
      icon: <Speed />,
      color: 'primary' as const,
      subtitle: 'Çözüm başarı oranı',
    },
    {
      title: 'Ort. Çözüm Süresi',
      value: formatTimeHours(data?.avgResolutionTimeHours || '0'),
      isLoading,
      icon: <Timer />,
      color: 'secondary' as const,
      subtitle: 'Ortalama tamamlanma süresi',
    },
    {
      title: 'Ort. Müdahale Süresi',
      value: formatTimeHours(data?.avgInterventionTimeHours || '0'),
      isLoading,
      icon: <FlashOn />,
      color: 'error' as const,
      subtitle: 'Ortalama ilk müdahale süresi',
    },
  ];
  if (error) {
    return (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <KpiCard
            title="Hata"
            value="Veriler yüklenemedi"
            color="error"
            subtitle="Lütfen sayfayı yenileyin"
          />
        </Grid>
      </Grid>
    );
  }
  return (
    <Grid container spacing={3}>
      {kpiData.map((kpi, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={index}>
          <KpiCard {...kpi} />
        </Grid>
      ))}
    </Grid>
  );
};
