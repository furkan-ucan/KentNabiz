import React from 'react';
import {
  ResponsiveContainer,
  FunnelChart as RechartsHunnel,
  Funnel,
  Cell,
  LabelList,
  Tooltip,
} from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

export interface FunnelChartData {
  name: string;
  value: number;
}

interface FunnelChartProps {
  data: FunnelChartData[];
  height?: number;
  showLabels?: boolean;
  showTooltip?: boolean;
}

/**
 * Hunilere özel renk paleti
 */
const FUNNEL_COLORS = [
  '#1976d2', // Mavi - Toplam Gelen
  '#ff9800', // Turuncu - İşleme Alınan
  '#4caf50', // Yeşil - Başarıyla Çözülen
];

/**
 * Özel tooltip bileşeni
 */
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: FunnelChartData;
    value: number;
  }>;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const name = data?.payload?.name || 'Bilinmeyen';
    const value = Number(data?.value) || 0;

    return (
      <Box
        sx={{
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          padding: 1.5,
          boxShadow: 2,
        }}
      >
        <Typography variant="body2" fontWeight="medium">
          {name}
        </Typography>
        <Typography variant="body2" color="primary.main">
          Rapor Sayısı: <strong>{value.toLocaleString('tr-TR')}</strong>
        </Typography>
      </Box>
    );
  }
  return null;
};

/**
 * Dumb/Presentational Funnel Chart bileşeni
 *
 * Bu bileşen sadece verileri görselleştirmekle sorumludur.
 * Veri çekme, filtreleme ve state yönetimi parent container tarafından yapılır.
 */
export const FunnelChart: React.FC<FunnelChartProps> = ({
  data,
  height = 400,
  showLabels = true,
  showTooltip = true,
}) => {
  const theme = useTheme();

  // Veri boşsa bilgilendirici mesaj göster
  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
        }}
      >
        <Typography variant="body1">Görüntülenecek veri bulunmuyor</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsHunnel>
          <Tooltip content={showTooltip ? <CustomTooltip /> : undefined} />
          <Funnel
            dataKey="value"
            data={data}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
          >
            {/* Her hunili parçası için renk */}
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]}
              />
            ))}
            {/* Etiketler */}{' '}
            {showLabels && (
              <LabelList
                position="center"
                fill={theme.palette.common.white}
                fontSize={14}
                fontWeight="medium"
                formatter={(value: unknown, entry?: unknown) => {
                  // Güvenli formatter - entry undefined olabilir
                  const entryData = entry as
                    | { payload?: FunnelChartData; name?: string }
                    | undefined;
                  if (!entryData || (!entryData.payload && !entryData.name)) {
                    return `${Number(value) || 0}`;
                  }
                  const name = entryData.payload?.name || entryData.name || '';
                  const numericValue = Number(value) || 0;
                  return `${name}: ${numericValue.toLocaleString('tr-TR')}`;
                }}
              />
            )}
          </Funnel>
        </RechartsHunnel>
      </ResponsiveContainer>
    </Box>
  );
};
