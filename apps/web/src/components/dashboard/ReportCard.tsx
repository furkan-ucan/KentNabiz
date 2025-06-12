// apps/web/src/components/dashboard/ReportCard.tsx

import React from 'react';
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
import { SharedReport, ReportStatus } from '@kentnabiz/shared';

export interface Report {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'done' | 'rejected';
  category: string;
  location: string;
  createdAt: string;
  isSupportedByCurrentUser?: boolean;
}

interface ReportCardProps {
  report: SharedReport;
  onClick?: (report: SharedReport) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onClick }) => {
  const theme = useTheme();

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.OPEN:
        return theme.palette.warning.main;
      case ReportStatus.IN_PROGRESS:
        return theme.palette.primary.main;
      case ReportStatus.DONE:
        return theme.palette.success.main;
      case ReportStatus.REJECTED:
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusLabel = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.OPEN:
        return 'Bekliyor';
      case ReportStatus.IN_PROGRESS:
        return 'İşlemde';
      case ReportStatus.DONE:
        return 'Tamamlandı';
      case ReportStatus.REJECTED:
        return 'Reddedildi';
      default:
        return status;
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('tr-TR', {
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
              {report.category?.name || 'Kategori belirtilmemiş'}
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
              {report.address || 'Konum belirtilmemiş'}
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
