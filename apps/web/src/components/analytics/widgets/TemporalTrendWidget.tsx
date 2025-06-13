import React, { useState } from 'react';
import {
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Box,
  useTheme,
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
import { BarChart3 } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ChartWrapper } from '../charts/ChartWrapper';
import { useTemporalDistribution } from '@/hooks/analytics/useTemporalDistribution';
import { AnalyticsFilters } from '@/hooks/analytics/useAnalyticsFilters';

interface TemporalTrendWidgetProps {
  filters: AnalyticsFilters;
  onDrillDown?: (filter: {
    dateRange?: { start: string; end: string };
  }) => void;
}

export const TemporalTrendWidget: React.FC<TemporalTrendWidgetProps> = ({
  filters,
}) => {
  const theme = useTheme();
  const [granularity, setGranularity] = useState<
    'daily' | 'weekly' | 'monthly'
  >('daily'); // Temporal distribution verilerini çek
  const { data, isLoading, error } = useTemporalDistribution({
    granularity,
    startDate:
      filters.startDate || format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: filters.endDate || format(new Date(), 'yyyy-MM-dd'),
    departmentId: filters.departmentId
      ? parseInt(filters.departmentId, 10)
      : undefined,
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
        return format(date, 'MM/dd');
      case 'weekly':
        return `${format(date, 'MM/dd')} Haftası`;
      case 'monthly':
        return format(date, 'yyyy/MM');
      default:
        return dateStr;
    }
  };

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
            <Typography
              key={index}
              variant="body2"
              sx={{
                color: entry.color,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  backgroundColor: entry.color,
                  borderRadius: '50%',
                }}
              />
              {entry.name}: {entry.value}
            </Typography>
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

  // Hata mesajı
  const errorMessage =
    error instanceof Error ? error.message : 'Beklenmeyen hata';

  return (
    <ChartWrapper
      title="Rapor Akış Trendi"
      isLoading={isLoading}
      error={error ? errorMessage : undefined}
      headerAccessory={GranularityToggle}
    >
      <Box sx={{ height: 350 }}>
        {data && data.length > 0 ? (
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
                dot={{ fill: theme.palette.success.main, strokeWidth: 2, r: 4 }}
                activeDot={{
                  r: 6,
                  stroke: theme.palette.success.main,
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary',
            }}
          >
            <BarChart3 size={48} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Seçilen tarih aralığında veri bulunamadı
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
              Farklı bir tarih aralığı seçerek tekrar deneyin
            </Typography>
          </Box>
        )}
      </Box>
    </ChartWrapper>
  );
};
