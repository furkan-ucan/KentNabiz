import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Skeleton,
  Alert,
  Chip,
} from '@mui/material';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { FunnelChart } from '../charts/FunnelChart';
import { useFunnelData } from '@/hooks/analytics/useFunnelData';
import { AnalyticsFilters } from '@/hooks/analytics/useAnalyticsFilters';

interface FunnelChartWidgetProps {
  filters: AnalyticsFilters;
  className?: string;
}

/**
 * Conversion rate chip bileşeni
 */
interface ConversionChipProps {
  label: string;
  rate: number;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning';
}

const ConversionChip: React.FC<ConversionChipProps> = ({
  label,
  rate,
  icon,
  color = 'primary',
}) => (
  <Chip
    icon={<Box sx={{ display: 'flex', alignItems: 'center' }}>{icon}</Box>}
    label={`${label}: %${Number(rate || 0).toFixed(1)}`}
    color={color}
    variant="outlined"
    size="small"
    sx={{ margin: 0.5 }}
  />
);

/**
 * Smart/Container Funnel Chart Widget bileşeni
 *
 * Bu bileşen:
 * - Veri çekme işlemini yönetir
 * - Loading ve error state'lerini handle eder
 * - Conversion rate metrics'leri hesaplar ve görüntüler
 * - Dumb chart component'ine verileri pass eder
 */
export const FunnelChartWidget: React.FC<FunnelChartWidgetProps> = ({
  filters,
  className,
}) => {
  const { data, rawData, conversionRates, isLoading, error } =
    useFunnelData(filters);

  // Debug logs
  console.log('🔥 Widget Debug Info:');
  console.log('📝 Filters:', filters);
  console.log('📊 Data from hook:', data);
  console.log('🎯 Raw data from hook:', rawData);
  console.log('📈 Conversion rates:', conversionRates);
  console.log('⏳ Is loading:', isLoading);
  console.log('❌ Error:', error);

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Activity size={20} />
              <Typography variant="h6">İş Akışı Hunisi</Typography>
            </Box>
          }
        />
        <CardContent>
          <Skeleton variant="rectangular" height={400} />
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Skeleton variant="rounded" width={120} height={32} />
            <Skeleton variant="rounded" width={130} height={32} />
            <Skeleton variant="rounded" width={140} height={32} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Activity size={20} />
              <Typography variant="h6">İş Akışı Hunisi</Typography>
            </Box>
          }
        />
        <CardContent>
          <Alert severity="error">
            Funnel verileri yüklenirken bir hata oluştu. Lütfen sayfayı
            yenileyip tekrar deneyin.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Success state with data
  return (
    <Card className={className}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Activity size={20} />
            <Typography variant="h6">İş Akışı Hunisi</Typography>
          </Box>
        }
        subheader="Rapor yaşam döngüsü ve dönüşüm oranları"
      />
      <CardContent>
        {/* Funnel Chart */}
        <FunnelChart
          data={data}
          height={350}
          showLabels={true}
          showTooltip={true}
        />

        {/* Conversion Metrics */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Dönüşüm Oranları
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <ConversionChip
              label="İşleme Alma"
              rate={conversionRates.assignmentRate}
              icon={<TrendingUp size={16} />}
              color="primary"
            />

            <ConversionChip
              label="Çözüm Oranı"
              rate={conversionRates.resolutionRate}
              icon={<TrendingDown size={16} />}
              color="warning"
            />

            <ConversionChip
              label="Genel Başarı"
              rate={conversionRates.overallSuccessRate}
              icon={<Activity size={16} />}
              color="success"
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
