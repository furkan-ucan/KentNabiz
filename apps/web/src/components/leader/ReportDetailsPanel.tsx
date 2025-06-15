import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Stack,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { SharedReport, ReportStatus } from '@kentnabiz/shared';

interface ReportDetailsPanelProps {
  report: SharedReport;
  onStatusUpdate: (reportId: number, newStatus: ReportStatus) => void;
}

const statusConfig: Record<
  ReportStatus,
  {
    color:
      | 'default'
      | 'primary'
      | 'secondary'
      | 'error'
      | 'info'
      | 'success'
      | 'warning';
    label: string;
  }
> = {
  OPEN: { color: 'error', label: 'Açık' },
  IN_REVIEW: { color: 'warning', label: 'İncelemede' },
  IN_PROGRESS: { color: 'info', label: 'İşlemde' },
  DONE: { color: 'success', label: 'Tamamlandı' },
  REJECTED: { color: 'default', label: 'Reddedildi' },
  CANCELLED: { color: 'default', label: 'İptal Edildi' },
};

export const ReportDetailsPanel: React.FC<ReportDetailsPanelProps> = ({
  report,
  onStatusUpdate,
}) => {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ReportStatus>(report.status);
  const [updateNote, setUpdateNote] = useState('');

  const handleStatusUpdate = () => {
    if (newStatus !== report.status) {
      onStatusUpdate(report.id, newStatus);
    }
    setStatusDialogOpen(false);
    setUpdateNote('');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Başlık ve Durum */}
      <Box sx={{ mb: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            {report.title}
          </Typography>
          <Chip
            label={statusConfig[report.status].label}
            color={statusConfig[report.status].color}
            variant="filled"
          />
        </Stack>
      </Box>

      {/* Ana İçerik */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Stack spacing={3}>
          {/* Açıklama */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Açıklama
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {report.description}
              </Typography>
            </CardContent>
          </Card>

          {/* Bilgiler */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Rapor Bilgileri
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon color="action" fontSize="small" />
                  <Typography variant="body2">
                    <strong>Adres:</strong> {report.address}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CategoryIcon color="action" fontSize="small" />
                  <Typography variant="body2">
                    <strong>Kategori:</strong>{' '}
                    {report.category.name || 'Belirtilmemiş'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="action" fontSize="small" />
                  <Typography variant="body2">
                    <strong>Vatandaş:</strong> {report.user.fullName}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon color="action" fontSize="small" />
                  <Typography variant="body2">
                    <strong>Oluşturulma:</strong> {formatDate(report.createdAt)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon color="action" fontSize="small" />
                  <Typography variant="body2">
                    <strong>Son Güncelleme:</strong>{' '}
                    {formatDate(report.updatedAt)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Koordinatlar */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Konum Koordinatları
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enlem: {report.location.coordinates[1]}
                <br />
                Boylam: {report.location.coordinates[0]}
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      {/* Aksiyonlar */}
      <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setStatusDialogOpen(true)}
            fullWidth
          >
            Durumu Güncelle
          </Button>
        </Stack>
      </Box>

      {/* Durum Güncelleme Dialog'u */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Rapor Durumunu Güncelle</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Yeni Durum</InputLabel>
              <Select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as ReportStatus)}
                label="Yeni Durum"
              >
                {Object.entries(statusConfig).map(([status, config]) => (
                  <MenuItem key={status} value={status}>
                    {config.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Güncelleme Notu (Opsiyonel)"
              multiline
              rows={3}
              value={updateNote}
              onChange={e => setUpdateNote(e.target.value)}
              placeholder="Bu durum değişikliği hakkında bir not ekleyin..."
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>İptal</Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={newStatus === report.status}
          >
            Güncelle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
