// apps/web/src/components/analytics/KpiCard.tsx
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface KpiCardProps {
  title: string;
  value: string | number;
  isLoading?: boolean;
  subtitle?: string;
  color?: string;
  icon?: React.ReactNode;
  isClickable?: boolean;
  onClick?: () => void;
  description?: string;
  targetUrl?: string | null;
}

export const KpiCard = ({
  title,
  value,
  isLoading = false,
  subtitle,
  color = 'primary',
  icon,
  isClickable = false,
  onClick,
  description,
  targetUrl,
}: KpiCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isClickable) {
      if (targetUrl) {
        // Navigate to targetUrl if provided
        navigate(targetUrl);
      } else if (onClick) {
        // Fallback to onClick if no targetUrl
        onClick();
      }
    }
  };
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
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': isClickable
          ? {
              transform: 'translateY(-2px)',
              boxShadow: 3,
            }
          : {
              transform: 'translateY(-2px)',
              boxShadow: 3,
            },
      }}
      onClick={handleClick}
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

        {description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 1 }}
          >
            {description}
          </Typography>
        )}

        {isClickable && !isLoading && (
          <Typography
            variant="caption"
            color={`${color}.main`}
            sx={{ display: 'block', mt: 1, fontWeight: 500 }}
          >
            Detaylar için tıklayın →
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
