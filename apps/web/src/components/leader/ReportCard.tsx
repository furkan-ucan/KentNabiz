import { Box, Typography, Paper, Chip } from '@mui/material';
import { SharedReport, ReportStatus } from '@kentnabiz/shared';
import { AccessTime, LocationOn } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ReportCardProps {
  report: SharedReport;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

const statusMap: Record<
  ReportStatus,
  {
    label: string;
    color: 'primary' | 'secondary' | 'warning' | 'success' | 'error' | 'info';
  }
> = {
  [ReportStatus.OPEN]: { label: 'Açık', color: 'primary' },
  [ReportStatus.IN_REVIEW]: { label: 'Beklemede', color: 'info' },
  [ReportStatus.IN_PROGRESS]: { label: 'İşlemde', color: 'warning' },
  [ReportStatus.DONE]: { label: 'Tamamlandı', color: 'success' },
  [ReportStatus.REJECTED]: { label: 'Reddedildi', color: 'error' },
  [ReportStatus.CANCELLED]: { label: 'İptal Edildi', color: 'secondary' },
};

export function ReportCard({ report, isSelected, onSelect }: ReportCardProps) {
  const timeAgo = formatDistanceToNow(new Date(report.updatedAt), {
    addSuffix: true,
    locale: tr,
  });
  const statusInfo = statusMap[report.status] || {
    label: 'Bilinmiyor',
    color: 'secondary',
  };

  return (
    <Paper
      elevation={isSelected ? 4 : 1}
      onClick={() => onSelect(report.id)}
      sx={{
        p: 2,
        mb: 2,
        cursor: 'pointer',
        borderLeft: `5px solid`,
        borderColor: isSelected ? 'primary.main' : `${statusInfo.color}.main`,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 3,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold" noWrap>
          {report.title}
        </Typography>
        <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
      </Box>
      <Typography
        variant="body2"
        color="text.secondary"
        noWrap
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
      >
        <LocationOn fontSize="small" /> {report.address}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}
      >
        <AccessTime fontSize="small" /> {timeAgo} güncellendi
      </Typography>
    </Paper>
  );
}
