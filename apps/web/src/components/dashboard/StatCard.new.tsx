// apps/web/src/components/dashboard/StatCard.tsx
import { Card, Box, Typography, alpha, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  delay?: number;
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color,
  delay = 0,
}: StatCardProps) => {
  const theme = useTheme();

  const getColorPalette = () => {
    switch (color) {
      case 'primary':
        return theme.palette.primary;
      case 'secondary':
        return theme.palette.secondary;
      case 'success':
        return theme.palette.success;
      case 'warning':
        return theme.palette.warning;
      case 'error':
        return theme.palette.error;
      case 'info':
        return theme.palette.info;
      default:
        return theme.palette.primary;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    switch (trend.type) {
      case 'positive':
        return theme.palette.success.main;
      case 'negative':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const colorPalette = getColorPalette();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02 }}
    >
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { xs: 2.5, md: 3 },
          minHeight: { xs: 160, md: 180 },
          backgroundColor: 'background.paper',
          border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
          borderRadius: 3,
          boxShadow: `2px 2px 6px ${alpha('#000', 0.3)}`,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `4px 4px 12px ${alpha('#000', 0.4)}`,
          },
        }}
      >
        {/* Üst: İkon + Trend */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: alpha(colorPalette.main, 0.1),
                color: `${color}.main`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={20} />
            </Box>
          </motion.div>

          {trend && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: delay + 0.4 }}
            >
              <Typography
                variant="body2"
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: alpha(getTrendColor(), 0.15),
                  color: getTrendColor(),
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              >
                {trend.value}
              </Typography>
            </motion.div>
          )}
        </Box>

        {/* Alt: Değer + Etiket */}
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography
            variant="h3"
            color={`${color}.main`}
            sx={{
              fontSize: { xs: '1.8rem', md: '2.2rem' },
              fontWeight: 700,
              mb: 0.5,
            }}
          >
            {value}
          </Typography>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
          >
            {title}
          </Typography>
        </Box>
      </Card>
    </motion.div>
  );
};
