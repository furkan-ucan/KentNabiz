import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';

export interface KPICardProps {
  title: string;
  value: number | string;
  description: string;
  color: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  description,
  color,
  icon,
  trend,
  onClick,
}) => {
  const theme = useTheme();

  const handleClick = () => {
    if (onClick && typeof onClick === 'function') {
      onClick();
    } else {
      // console.warn('KPICard onClick is not a function:', onClick);
      // İsteğe bağlı: onClick sağlanmazsa veya fonksiyon değilse bir uyarı logu.
      // Üretimde bu logu kaldırmak isteyebilirsiniz.
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
          borderColor: alpha(theme.palette.primary.main, 0.25),
        },
      }}
    >
      <CardActionArea
        onClick={handleClick}
        disabled={!onClick}
        sx={{ height: '100%' }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight="medium"
            >
              {title}
            </Typography>
            {icon && <Box sx={{ color: color, opacity: 0.8 }}>{icon}</Box>}
          </Box>

          <Typography
            variant="h3"
            component="div"
            color={color}
            fontWeight="bold"
            sx={{ mb: 1, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
          >
            {value}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
            {trend && (
              <Chip
                size="small"
                icon={trend.isPositive ? <TrendingUpIcon /> : <ErrorIcon />}
                label={`${trend.isPositive ? '+' : ''}${trend.value}%`}
                color={trend.isPositive ? 'success' : 'error'}
                variant="outlined"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
