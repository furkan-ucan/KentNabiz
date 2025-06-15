import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  useTheme,
  Skeleton,
  Alert,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from 'recharts';
import { TrendingUp, Activity, Calendar, ZoomOut } from 'lucide-react';
import { format } from 'date-fns';
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
  // Sabit granularity - kullanıcı seçimi kaldırıldı
  const granularity = 'daily';

  // Zoom state için
  const [brushIndexes, setBrushIndexes] = useState<{
    startIndex?: number;
    endIndex?: number;
  }>({});

  // Zoom reset fonksiyonu - optimize edildi
  const handleResetZoom = useCallback(() => {
    setBrushIndexes({});
  }, []);

  // Brush değişiklik fonksiyonu - optimize edildi
  const handleBrushChange = useCallback(
    (brushData: { startIndex?: number; endIndex?: number } | null) => {
      if (
        brushData &&
        brushData.startIndex !== undefined &&
        brushData.endIndex !== undefined
      ) {
        setBrushIndexes({
          startIndex: brushData.startIndex,
          endIndex: brushData.endIndex,
        });
      }
    },
    []
  );

  // Ana filtre çubuğundan gelen tarih aralığını kullan
  // KPI widgets ile aynı default tarih aralığı (1 yıl)
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date.toISOString().split('T')[0];
  };
  const getDefaultEndDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const startDate = filters.startDate || getDefaultStartDate();
  const endDate = filters.endDate || getDefaultEndDate();

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

  // Tarih formatı - sabit günlük format
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'dd/MM');
  };

  // İstatistik hesaplamaları - zoom durumuna göre - optimize edildi
  const displayedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Zoom aktifse filtrelenmiş veriyi döndür
    if (
      brushIndexes.startIndex !== undefined &&
      brushIndexes.endIndex !== undefined
    ) {
      return data.slice(brushIndexes.startIndex, brushIndexes.endIndex + 1);
    }

    // Zoom aktif değilse tüm veriyi döndür
    return data;
  }, [data, brushIndexes.startIndex, brushIndexes.endIndex]);

  // İstatistikler - zoom'a göre güncellenecek - optimize edildi
  const { totalCreated, totalResolved, maxCreated } = useMemo(() => {
    const created = displayedData.reduce(
      (sum, item) => sum + item.createdCount,
      0
    );
    const resolved = displayedData.reduce(
      (sum, item) => sum + item.resolvedCount,
      0
    );
    const maxDaily = Math.max(
      ...(displayedData.map(item => item.createdCount) || [0])
    );

    return {
      totalCreated: created,
      totalResolved: resolved,
      maxCreated: maxDaily === -Infinity ? 0 : maxDaily,
    };
  }, [displayedData]);

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

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader
          avatar={<Activity size={24} color="#1976d2" />}
          title="Rapor Akış Trendi"
          subheader="Zaman bazlı rapor oluşturma ve çözme trendi"
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
        action={
          (brushIndexes.startIndex !== undefined ||
            brushIndexes.endIndex !== undefined) && (
            <Tooltip title="Zoom'u Sıfırla">
              <IconButton onClick={handleResetZoom} size="small">
                <ZoomOut size={18} />
              </IconButton>
            </Tooltip>
          )
        }
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
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%" debounce={1}>
              <LineChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60, // Brush için ekstra alan
                }}
                syncId="anyId" // Sync ile performans iyileştirmesi
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
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="createdCount"
                  name="Yeni Gelen"
                  stroke={theme.palette.error.main}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 6,
                    stroke: theme.palette.error.main,
                    strokeWidth: 2,
                    fill: theme.palette.error.main,
                  }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="resolvedCount"
                  name="Çözülen"
                  stroke={theme.palette.success.main}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 6,
                    stroke: theme.palette.success.main,
                    strokeWidth: 2,
                    fill: theme.palette.success.main,
                  }}
                  connectNulls={false}
                />
                {/* Zoom/Pan özelliği için Brush component - optimize edildi */}
                <Brush
                  dataKey="date"
                  height={30}
                  stroke={theme.palette.primary.main}
                  fill={`${theme.palette.primary.main}15`}
                  tickFormatter={formatDate}
                  onChange={handleBrushChange}
                  startIndex={brushIndexes.startIndex}
                  endIndex={brushIndexes.endIndex}
                  travellerWidth={10}
                  gap={2}
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
