import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { Box, Typography } from '@mui/material';

export interface HorizontalBarData {
  id: string;
  name: string;
  code?: string;
  value: number;
  color?: string;
}

interface HorizontalBarChartProps {
  data: HorizontalBarData[];
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  onClickBar?: (data: HorizontalBarData) => void;
  nameKey?: string;
  dataKey?: string;
}

/**
 * Özel tooltip bileşeni
 */
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: HorizontalBarData;
    value: number;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const categoryName = data?.payload?.name || label || 'Bilinmeyen';
    const value = Number(data?.value) || 0;

    return (
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #ccc',
          borderRadius: 1,
          padding: 1.5,
          boxShadow: 2,
          minWidth: 200,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
          {categoryName}
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
          Toplam Rapor: <strong>{value.toLocaleString('tr-TR')}</strong>
        </Typography>
      </Box>
    );
  }

  return null;
};

/**
 * Yeniden kullanılabilir Horizontal Bar Chart bileşeni
 * Recharts kullanarak kategorileri yatay çubuk grafiğinde gösterir
 */
const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  height = 400,
  showGrid = true,
  showTooltip = true,
  onClickBar,
  nameKey = 'name',
  dataKey = 'value',
}) => {
  // Debug: Chart'a gelen veriyi logla
  console.log('🎯 HorizontalBarChart received data:', data);
  console.log('📊 Chart props:', {
    nameKey,
    dataKey,
    height,
    showGrid,
    showTooltip,
  });

  // Eğer veri boşsa
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
        <Typography variant="body1">Veri bulunamadı</Typography>
      </Box>
    );
  }

  // Bar'a tıklama olayı
  const handleBarClick = (data: HorizontalBarData) => {
    if (onClickBar) {
      onClickBar(data);
    }
  };

  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 5,
            right: 30,
            left: 24, // Biraz soldan başlasın
            bottom: 5,
          }}
          barCategoryGap={12}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
          <XAxis
            type="number"
            domain={[0, 'dataMax']}
            allowDecimals={false}
            tickFormatter={value => Number(value).toLocaleString('tr-TR')}
            tick={{ fontSize: 11 }}
            stroke="#666"
          />
          <YAxis
            type="category"
            dataKey={nameKey}
            width={180} // Daha geniş etiket alanı
            tick={{ fontSize: 13 }}
            interval={0}
            axisLine={false}
            tickLine={false}
            stroke="#666"
          />
          {showTooltip && (
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
            />
          )}
          <Bar
            dataKey={dataKey}
            radius={[0, 6, 6, 0]}
            barSize={32}
            cursor={onClickBar ? 'pointer' : 'default'}
            onClick={clickData =>
              handleBarClick(clickData as HorizontalBarData)
            }
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#1976d2'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default HorizontalBarChart;
