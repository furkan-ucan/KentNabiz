import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Visibility,
  Share,
  LocationOn,
  CalendarToday,
} from '@mui/icons-material';
import { SharedReport, ReportStatus } from '@kentnabiz/shared';

interface EnhancedPopupProps {
  report: SharedReport;
  onViewDetails?: (reportId: number) => void;
  onShareReport?: (reportId: number) => void;
}

const statusConfig: Record<
  ReportStatus,
  { color: 'error' | 'warning' | 'info' | 'success' | 'default'; label: string }
> = {
  OPEN: { color: 'error', label: 'Açık' },
  IN_REVIEW: { color: 'warning', label: 'İncelemede' },
  IN_PROGRESS: { color: 'info', label: 'İşlemde' },
  DONE: { color: 'success', label: 'Tamamlandı' },
  REJECTED: { color: 'default', label: 'Reddedildi' },
  CANCELLED: { color: 'default', label: 'İptal Edildi' },
};

export const EnhancedPopup: React.FC<EnhancedPopupProps> = ({
  report,
  onViewDetails,
  onShareReport,
}) => {
  const statusInfo = statusConfig[report.status];
  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Box sx={{ minWidth: 250, maxWidth: 300, p: 1 }}>
      {/* Başlık */}
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          mb: 1,
          color: '#1976d2',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {report.title}
      </Typography>

      {/* Durum */}
      <Box sx={{ mb: 1 }}>
        {' '}
        <Chip
          label={statusInfo.label}
          color={statusInfo.color}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      </Box>

      {/* Açıklama */}
      {report.description && (
        <Typography
          variant="body2"
          sx={{
            mb: 1,
            color: 'text.secondary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {report.description}
        </Typography>
      )}

      <Divider sx={{ my: 1 }} />

      {/* Meta bilgiler */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
        <LocationOn sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          {report.address || 'Konum bilgisi mevcut'}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <CalendarToday
          sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }}
        />{' '}
        <Typography variant="caption" color="text.secondary">
          {formatDate(report.createdAt)}
        </Typography>
      </Box>

      {/* Aksiyon butonları */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
        <Button
          size="small"
          variant="contained"
          startIcon={<Visibility />}
          onClick={() => onViewDetails?.(report.id)}
          sx={{
            flex: 1,
            fontSize: '0.75rem',
            py: 0.5,
          }}
        >
          Detaylar
        </Button>

        <IconButton
          size="small"
          onClick={() => onShareReport?.(report.id)}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Share sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default EnhancedPopup;
