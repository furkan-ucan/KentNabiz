import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Skeleton,
  Stack,
} from '@mui/material';
import { SharedReport, ReportStatus } from '@kentnabiz/shared';
import { useDepartments } from '@/hooks/useDepartments';

interface ForwardReportModalProps {
  open: boolean;
  onClose: () => void;
  report: SharedReport | null;
  onConfirm: (
    reportId: number,
    targetDepartmentId: number,
    reason: string
  ) => Promise<void>;
}

// Mock departments - gerçek uygulamada API'den gelecek - KALDIRILIYOR
// const DEPARTMENTS = [
//   { id: 'public-works', name: 'Fen İşleri Müdürlüğü' },
//   { id: 'environment', name: 'Çevre ve Şehircilik Müdürlüğü' },
//   { id: 'traffic', name: 'Trafik Müdürlüğü' },
//   { id: 'water', name: 'Su ve Kanalizasyon Müdürlüğü' },
//   { id: 'parks', name: 'Park ve Bahçeler Müdürlüğü' },
//   { id: 'cleaning', name: 'Temizlik İşleri Müdürlüğü' },
// ];

export const ForwardReportModal: React.FC<ForwardReportModalProps> = ({
  open,
  onClose,
  report,
  onConfirm,
}) => {
  const [targetDepartmentId, setTargetDepartmentId] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Departmanları API'den çek
  const {
    data: departments = [],
    isLoading: departmentsLoading,
    error: departmentsError,
  } = useDepartments(open);

  const handleClose = () => {
    if (!isLoading) {
      setTargetDepartmentId('');
      setReason('');
      setError(null);
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (!report || !targetDepartmentId || !reason.trim()) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onConfirm(report.id, targetDepartmentId, reason);
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Yönlendirme işlemi başarısız.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.OPEN:
        return 'error';
      case ReportStatus.IN_REVIEW:
        return 'warning';
      case ReportStatus.IN_PROGRESS:
        return 'info';
      case ReportStatus.DONE:
        return 'success';
      case ReportStatus.REJECTED:
        return 'error';
      default:
        return 'default';
    }
  };

  if (!report) return null;
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#e2e8f0',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
          color: '#f1f5f9',
          borderBottom: '1px solid #475569',
        }}
      >
        <Typography variant="h6" component="div">
          Raporu Başka Departmana Yönlendir
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          backgroundColor: '#0f172a',
          color: '#e2e8f0',
        }}
      >
        {' '}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="#94a3b8" gutterBottom>
            Yönlendirilecek Rapor
          </Typography>
          <Box
            sx={{
              p: 2,
              bgcolor: '#334155',
              borderRadius: 1,
              border: '1px solid #475569',
            }}
          >
            {' '}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {' '}
              <Typography variant="body1" fontWeight="medium" color="#e2e8f0">
                #{String(report.id).slice(-8).toUpperCase()}
              </Typography>{' '}
              <Chip
                label={report.category?.name || 'Kategorisiz'}
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  borderColor: '#3b82f6',
                  color: '#60a5fa',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                }}
              />
              <Chip
                label={report.status}
                size="small"
                color={getStatusColor(report.status)}
                sx={{
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  color: '#a5b4fc',
                }}
              />
            </Box>
            <Typography variant="body2" color="#94a3b8">
              {report.description}
            </Typography>
            {report.address && (
              <Typography variant="caption" color="#64748b">
                📍 {report.address}
              </Typography>
            )}
          </Box>
        </Box>{' '}
        {departmentsError && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              backgroundColor: '#7f1d1d',
              color: '#fecaca',
              '& .MuiAlert-icon': {
                color: '#fecaca',
              },
            }}
          >
            Departmanlar yüklenirken hata oluştu. Lütfen tekrar deneyin.
          </Alert>
        )}{' '}
        <FormControl
          fullWidth
          sx={{
            mb: 3,
            '& .MuiInputLabel-root': {
              color: '#94a3b8',
            },
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#1e293b',
              '& fieldset': {
                borderColor: '#475569',
              },
              '&:hover fieldset': {
                borderColor: '#64748b',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#3b82f6',
              },
              '& .MuiSelect-select': {
                color: '#e2e8f0',
              },
            },
          }}
        >
          <InputLabel>Hedef Departman</InputLabel>
          {departmentsLoading ? (
            <Stack spacing={1}>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={56}
                sx={{ borderRadius: 1, backgroundColor: '#334155' }}
              />
            </Stack>
          ) : (
            <Select
              value={targetDepartmentId}
              onChange={e => setTargetDepartmentId(Number(e.target.value))}
              label="Hedef Departman"
              disabled={isLoading}
              MenuProps={{
                PaperProps: {
                  style: {
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                  },
                },
              }}
            >
              {departments
                .filter(
                  dept =>
                    dept.isActive && dept.id !== report?.currentDepartment?.id
                ) // Mevcut departmanı hariç tut
                .map(dept => (
                  <MenuItem key={dept.id} value={dept.id}>
                    <Box>
                      <Typography variant="body1">{dept.name}</Typography>
                      {dept.description && (
                        <Typography variant="caption" color="text.secondary">
                          {dept.description}
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                ))}
              {departments.filter(
                dept =>
                  dept.isActive && dept.id !== report?.currentDepartment?.id
              ).length === 0 && (
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    Yönlendirebilecek başka departman bulunamadı
                  </Typography>
                </MenuItem>
              )}
            </Select>
          )}
        </FormControl>
        <TextField
          label="Yönlendirme Nedeni"
          multiline
          rows={3}
          fullWidth
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Bu raporu neden başka bir departmana yönlendiriyorsunuz?"
          disabled={isLoading}
          sx={{ mb: 2 }}
        />
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isLoading} color="inherit">
          İptal
        </Button>{' '}
        <Button
          onClick={() => void handleConfirm()}
          variant="contained"
          disabled={
            isLoading ||
            !targetDepartmentId ||
            !reason.trim() ||
            departmentsLoading
          }
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
        >
          {isLoading ? 'Yönlendiriliyor...' : 'Yönlendir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
