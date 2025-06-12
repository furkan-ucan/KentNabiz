// apps/web/src/components/analytics/KpiCard.tsx
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';

interface KpiCardProps {
  title: string;
  value: string | number;
  isLoading?: boolean;
  subtitle?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  icon?: React.ReactNode;
}

export const KpiCard = ({
  title,
  value,
  isLoading = false,
  subtitle,
  color = 'primary',
  icon,
}: KpiCardProps) => {
  if (isLoading) {
    return (
      <Card sx={{ height: '100%', minHeight: 120 }}>
        <CardContent>
          <Skeleton variant="text" height={24} width="60%" />
          <Skeleton variant="text" height={40} width="80%" sx={{ mt: 1 }} />
          <Skeleton variant="text" height={16} width="40%" sx={{ mt: 1 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        minHeight: 120,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {icon && <Box sx={{ color: `${color}.main` }}>{icon}</Box>}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            {title}
          </Typography>
        </Box>

        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: 'bold',
            color: `${color}.main`,
            mb: subtitle ? 0.5 : 0,
          }}
        >
          {value}
        </Typography>

        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
