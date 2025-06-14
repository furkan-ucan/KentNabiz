import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Box,
  useTheme,
  Skeleton,
  Alert,
  Chip,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Activity, Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useTemporalDistribution } from '@/hooks/analytics/useTemporalDistribution';
import { AnalyticsFilters } from '@/hooks/analytics/useAnalyticsFilters';

interface TemporalTrendWidgetProps {
  filters: AnalyticsFilters;
  className?: string;
  onDrillDown?: (filter: {
    dateRange?: { start: string; end: string };
  }) => void;
}

export const TemporalTrendWidget: React.FC<TemporalTrendWidgetProps> = ({
  filters,
  className,
}) => {
  const theme = useTheme();
  const [granularity, setGranularity] = useState<
    'daily' | 'weekly' | 'monthly'
  >('daily');

  // Ana filtre çubuğundan gelen tarih aralığını kullan
  const startDate =
    filters.startDate || format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const endDate = filters.endDate || format(new Date(), 'yyyy-MM-dd');

  // Temporal distribution verilerini çek
  const { data, isLoading, error } = useTemporalDistribution({
    granularity,
    startDate,
    endDate,
    departmentId: filters.departmentId
      ? parseInt(filters.departmentId, 10)
      : undefined,
    categoryId: filters.categoryId
      ? parseInt(filters.categoryId, 10)
      : undefined,
    status: filters.status || undefined,
  });

  // Granularity değişikliği
  const handleGranularityChange = (
    _event: React.MouseEvent<HTMLElement>,
    newGranularity: 'daily' | 'weekly' | 'monthly'
  ) => {
    if (newGranularity !== null) {
      setGranularity(newGranularity);
    }
  };

  // Tarih formatı
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (granularity) {
      case 'daily':
        return format(date, 'dd/MM');
      case 'weekly':
        return `${format(date, 'dd/MM')} Haftası`;
      case 'monthly':
        return format(date, 'yyyy/MM');
      default:
        return dateStr;
    }
  };

  // İstatistik hesaplamaları
  const totalCreated =
    data?.reduce((sum, item) => sum + item.createdCount, 0) || 0;
  const totalResolved =
    data?.reduce((sum, item) => sum + item.resolvedCount, 0) || 0;
  const maxCreated = Math.max(...(data?.map(item => item.createdCount) || [0]));

  // Tooltip formatı
  interface TooltipPayload {
    color: string;
    name: string;
    value: number;
  }

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 1.5,
            boxShadow: theme.shadows[4],
          }}
        >
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            {formatDate(label || '')}
          </Typography>
          {payload?.map((entry: TooltipPayload, index: number) => (
            <Box
              key={index}
              sx={{
                color: entry.color,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.875rem',
                lineHeight: 1.43,
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 8,
                  height: 8,
                  backgroundColor: entry.color,
                  borderRadius: '50%',
                  display: 'inline-block',
                }}
              />
              {entry.name}: {entry.value}
            </Box>
          ))}
        </Box>
      );
    }
    return null;
  };

  // Granularity toggle bileşeni
  const GranularityToggle = (
    <ToggleButtonGroup
      value={granularity}
      exclusive
      onChange={handleGranularityChange}
      size="small"
      aria-label="Zaman aralığı"
    >
      <ToggleButton value="daily" aria-label="Günlük">
        Günlük
      </ToggleButton>
      <ToggleButton value="weekly" aria-label="Haftalık">
        Haftalık
      </ToggleButton>
      <ToggleButton value="monthly" aria-label="Aylık">
        Aylık
      </ToggleButton>
    </ToggleButtonGroup>
  );

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader
          avatar={<Activity size={24} color="#1976d2" />}
          title="Rapor Akış Trendi"
          subheader="Zaman bazlı rapor oluşturma ve çözme trendi"
          action={<Skeleton variant="rectangular" width={200} height={40} />}
        />
        <CardContent>
          <Skeleton variant="rectangular" height={350} />
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
          avatar={<Activity size={24} color="#f44336" />}
          title="Rapor Akış Trendi"
          subheader="Trend verileri yüklenirken hata oluştu"
        />
        <CardContent>
          <Alert severity="error">
            Trend istatistikleri yüklenirken bir hata oluştu. Lütfen daha sonra
            tekrar deneyin.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  const isEmpty = !data || data.length === 0;

  return (
    <Card className={className}>
      <CardHeader
        avatar={<TrendingUp size={24} color="#1976d2" />}
        title="Rapor Akış Trendi"
        subheader="Zaman bazlı rapor oluşturma ve çözme trendi"
        action={GranularityToggle}
      />
      <CardContent>
        {/* İstatistikler */}
        <Box sx={{ mb: 2 }}>
          {!isEmpty && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip
                label={`Oluşturulan: ${totalCreated.toLocaleString('tr-TR')}`}
                color="error"
                variant="outlined"
                size="small"
                icon={<Calendar size={16} />}
              />
              <Chip
                label={`Çözülen: ${totalResolved.toLocaleString('tr-TR')}`}
                color="success"
                variant="outlined"
                size="small"
                icon={<TrendingUp size={16} />}
              />
              <Chip
                label={`En Yoğun Gün: ${maxCreated}`}
                color="warning"
                variant="outlined"
                size="small"
              />
            </Box>
          )}
        </Box>

        {isEmpty ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 350,
              color: 'text.secondary',
            }}
          >
            <Calendar size={48} />
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Veri Bulunamadı
            </Typography>
            <Typography variant="body2" align="center">
              Seçilen tarih aralığında trend verisi bulunmuyor.
              <br />
              Lütfen farklı tarih aralığı veya filtre seçeneğini deneyin.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: theme.palette.divider }}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: theme.palette.divider }}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="createdCount"
                  name="Yeni Gelen"
                  stroke={theme.palette.error.main}
                  strokeWidth={2}
                  dot={{ fill: theme.palette.error.main, strokeWidth: 2, r: 4 }}
                  activeDot={{
                    r: 6,
                    stroke: theme.palette.error.main,
                    strokeWidth: 2,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="resolvedCount"
                  name="Çözülen"
                  stroke={theme.palette.success.main}
                  strokeWidth={2}
                  dot={{
                    fill: theme.palette.success.main,
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                    stroke: theme.palette.success.main,
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TemporalTrendWidget;
