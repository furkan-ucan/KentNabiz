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
import { BarChart3, TrendingUp, FileText } from 'lucide-react';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import {
  useCategoryDistribution,
  CategoryChartData,
} from '@/hooks/analytics/useCategoryDistribution';
import { AnalyticsFilters } from '@/hooks/analytics/useAnalyticsFilters';

interface CategoryDistributionWidgetProps {
  filters: AnalyticsFilters;
  className?: string;
  onCategoryClick?: (categoryId: number, categoryName: string) => void; // Drill-down için
  limit?: number;
}

/**
 * Loading skeleton bileşeni
 */
const LoadingSkeleton: React.FC = () => (
  <Box sx={{ padding: 2 }}>
    <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
    {Array.from({ length: 7 }).map((_, index) => (
      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Skeleton variant="text" width="30%" height={20} sx={{ mr: 2 }} />
        <Skeleton variant="rectangular" width="60%" height={20} />
      </Box>
    ))}
  </Box>
);

/**
 * İstatistik chip bileşeni
 */
interface StatChipProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning';
}

const StatChip: React.FC<StatChipProps> = ({
  label,
  value,
  icon,
  color = 'primary',
}) => (
  <Chip
    icon={<Box sx={{ display: 'flex', alignItems: 'center' }}>{icon}</Box>}
    label={`${label}: ${value.toLocaleString('tr-TR')}`}
    color={color}
    variant="outlined"
    size="small"
    sx={{ margin: 0.5 }}
  />
);

/**
 * Smart/Container Category Distribution Widget bileşeni
 *
 * Sorumlulukları:
 * - useCategoryDistribution hook'u ile veri yönetimi
 * - Loading ve error state'lerini handle etme
 * - HorizontalBarChart'a veri aktarımı
 * - onCategoryClick ile drill-down özelliği
 * - İstatistiksel chip'lerin gösterimi
 */
const CategoryDistributionWidget: React.FC<CategoryDistributionWidgetProps> = ({
  filters,
  className,
  onCategoryClick,
  limit = 10,
}) => {
  // Hook ile veri çekme
  const {
    data: chartData,
    isLoading,
    error,
    totalReports,
    maxValue,
    isEmpty,
  } = useCategoryDistribution(filters, limit);

  // Debug: Sadece hata durumlarında log
  if (process.env.NODE_ENV === 'development' && error) {
    console.warn('⚠️ CategoryDistributionWidget Error:', error);
  }

  // Bar'a tıklama olayı (drill-down)
  const handleBarClick = (data: CategoryChartData) => {
    if (onCategoryClick) {
      const categoryId = parseInt(data.id, 10);
      console.log('📊 Category clicked for drill-down:', {
        categoryId,
        categoryName: data.name,
      });
      onCategoryClick(categoryId, data.name);
    }
  };

  // Error durumu
  if (error) {
    console.error('❌ Category distribution error:', error);
    return (
      <Card className={className}>
        <CardHeader
          title="En Sorunlu Kategoriler"
          subheader="Kategori dağılımı yüklenirken hata oluştu"
        />
        <CardContent>
          <Alert severity="error">
            Kategori istatistikleri yüklenirken bir hata oluştu. Lütfen daha
            sonra tekrar deneyin.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader
        avatar={<BarChart3 size={24} color="#1976d2" />}
        title="En Sorunlu Kategoriler"
        subheader="Rapor sayısına göre kategori dağılımı"
        action={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {!isLoading && !isEmpty && (
              <>
                {' '}
                <StatChip
                  label="Toplam"
                  value={totalReports}
                  icon={<FileText size={16} />}
                  color="primary"
                />
                <StatChip
                  label="En Yoğun"
                  value={maxValue}
                  icon={<TrendingUp size={16} />}
                  color="success"
                />
              </>
            )}
          </Box>
        }
      />
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton />
        ) : isEmpty ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 300,
              color: 'text.secondary',
            }}
          >
            <FileText size={48} />
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Veri Bulunamadı
            </Typography>
            <Typography variant="body2" align="center">
              Seçilen filtre kriterleri için kategori verisi bulunmuyor.
              <br />
              Lütfen farklı tarih aralığı veya filtre seçeneğini deneyin.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ height: 400 }}>
            <HorizontalBarChart
              data={chartData}
              height={400}
              showGrid={true}
              showTooltip={true}
              onClickBar={onCategoryClick ? handleBarClick : undefined}
              nameKey="name"
              dataKey="value"
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryDistributionWidget;
