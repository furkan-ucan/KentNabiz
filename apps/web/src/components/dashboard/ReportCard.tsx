// apps/web/src/components/dashboard/ReportCard.tsx

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  alpha,
  useTheme,
  IconButton,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  MoreVert as MoreIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

interface Report {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  category: string;
  location: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

interface ReportCardProps {
  report: Report;
  onClick?: (report: Report) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onClick }) => {
  const theme = useTheme();

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'pending':
        return theme.palette.warning.main;
      case 'in-progress':
        return theme.palette.primary.main;
      case 'resolved':
        return theme.palette.success.main;
      case 'rejected':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusLabel = (status: Report['status']) => {
    switch (status) {
      case 'pending':
        return 'Bekliyor';
      case 'in-progress':
        return 'İşlemde';
      case 'resolved':
        return 'Çözüldü';
      case 'rejected':
        return 'Reddedildi';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: Report['priority']) => {
    switch (priority) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Card
      onClick={() => onClick?.(report)}
      sx={{
        background: `linear-gradient(135deg, ${alpha('#ffffff', 0.08)}, ${alpha('#ffffff', 0.02)})`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha('#ffffff', 0.1)}`,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: `0 12px 24px ${alpha('#000000', 0.2)}`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            }
          : {},
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${getStatusColor(report.status)}, ${alpha(getStatusColor(report.status), 0.7)})`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box
          display="flex"
          alignItems="flex-start"
          justifyContent="space-between"
          mb={2}
        >
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Chip
                label={getStatusLabel(report.status)}
                size="small"
                sx={{
                  backgroundColor: alpha(getStatusColor(report.status), 0.1),
                  color: getStatusColor(report.status),
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: getPriorityColor(report.priority),
                }}
              />
            </Box>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 0.5,
                lineHeight: 1.3,
              }}
            >
              {report.title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontSize: '0.75rem',
              }}
            >
              {report.category}
            </Typography>
          </Box>

          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <MoreIcon />
          </IconButton>
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 3,
            lineHeight: 1.6,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {report.description}
        </Typography>

        {/* Footer */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={0.5}>
            <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              {report.location}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={0.5}>
            <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              {formatDate(report.createdAt)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ReportCard;
