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
} from '@mui/material';
import { SharedReport, ReportStatus, ReportSubStatus } from '@kentnabiz/shared';

interface RejectReportModalProps {
  open: boolean;
  onClose: () => void;
  report: SharedReport | null;
  onConfirm: (
    reportId: string,
    reason: string,
    rejectionCategory: string
  ) => Promise<void>;
}

// Rejection categories for OPEN reports (invalid citizen reports)
const OPEN_REJECTION_CATEGORIES = [
  { id: 'duplicate', name: 'Tekrarlanan Rapor' },
  { id: 'invalid-location', name: 'Geçersiz Konum' },
  { id: 'not-municipal', name: 'Belediye Sorumluluğunda Değil' },
  { id: 'insufficient-info', name: 'Yetersiz Bilgi' },
  { id: 'spam', name: 'Spam/Kötüye Kullanım' },
  { id: 'resolved-already', name: 'Zaten Çözülmüş' },
  { id: 'out-of-scope', name: 'Kapsam Dışı' },
  { id: 'other', name: 'Diğer' },
];

// Rejection categories for PENDING_APPROVAL reports (quality issues)
const PENDING_APPROVAL_REJECTION_CATEGORIES = [
  { id: 'incomplete-work', name: 'Tamamlanmamış İş' },
  { id: 'poor-quality', name: 'Kalitesiz İş' },
  { id: 'incorrect-solution', name: 'Yanlış Çözüm' },
  { id: 'missing-documentation', name: 'Eksik Belgelendirme' },
  { id: 'safety-issues', name: 'Güvenlik Sorunları' },
  { id: 'not-according-to-specs', name: 'Şartnamelere Uygun Değil' },
  { id: 'other', name: 'Diğer' },
];

export const RejectReportModal: React.FC<RejectReportModalProps> = ({
  open,
  onClose,
  report,
  onConfirm,
}) => {
  const [rejectionCategory, setRejectionCategory] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (!isLoading) {
      setRejectionCategory('');
      setReason('');
      setError(null);
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (!report || !rejectionCategory.trim() || !reason.trim()) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onConfirm(String(report.id), reason, rejectionCategory);
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Reddetme işlemi başarısız.'
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
  // Determine rejection context based on report status
  const isPendingApproval =
    report.status === ReportStatus.IN_PROGRESS &&
    report.subStatus === ReportSubStatus.PENDING_APPROVAL;

  const rejectionCategories = isPendingApproval
    ? PENDING_APPROVAL_REJECTION_CATEGORIES
    : OPEN_REJECTION_CATEGORIES;
  const modalTitle = isPendingApproval
    ? 'İşi Geri Çevir'
    : 'Raporu Geçersiz Say';
  const modalDescription = isPendingApproval
    ? 'Tamamlanan işi geri çevir ve takıma sebepini bildir'
    : 'Vatandaş raporunu geçersiz say ve sebepini bildir';
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      {' '}
      <DialogTitle
        sx={{
          background: 'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{ color: '#ff6b6b', fontWeight: 600 }}
        >
          {modalTitle}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 0.5 }}
        >
          {modalDescription}
        </Typography>
      </DialogTitle>{' '}
      <DialogContent
        sx={{ background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)' }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            gutterBottom
          >
            Reddedilecek Rapor
          </Typography>
          <Box
            sx={{
              p: 2,
              background: 'linear-gradient(145deg, #0d1117 0%, #161b22 100%)',
              borderRadius: 1,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {' '}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: '#ffffff' }}
              >
                #{String(report.id).slice(-8).toUpperCase()}
              </Typography>
              <Chip
                label={report.category?.name || 'Kategorisiz'}
                size="small"
                sx={{
                  background:
                    'linear-gradient(145deg, #4ade80 0%, #22c55e 100%)',
                  color: '#000000',
                  fontWeight: 500,
                  border: 'none',
                }}
              />
              <Chip
                label={report.status}
                size="small"
                sx={{
                  background:
                    getStatusColor(report.status) === 'error'
                      ? 'linear-gradient(145deg, #ef4444 0%, #dc2626 100%)'
                      : getStatusColor(report.status) === 'warning'
                        ? 'linear-gradient(145deg, #f59e0b 0%, #d97706 100%)'
                        : getStatusColor(report.status) === 'info'
                          ? 'linear-gradient(145deg, #3b82f6 0%, #2563eb 100%)'
                          : getStatusColor(report.status) === 'success'
                            ? 'linear-gradient(145deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(145deg, #6b7280 0%, #4b5563 100%)',
                  color: '#ffffff',
                  fontWeight: 500,
                  border: 'none',
                }}
              />
            </Box>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}
            >
              {report.description}
            </Typography>
            {report.address && (
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
              >
                📍 {report.address}
              </Typography>
            )}
          </Box>
        </Box>{' '}
        <Alert
          severity="warning"
          sx={{
            mb: 3,
            background: 'linear-gradient(145deg, #451a03 0%, #78350f 100%)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            color: '#fbbf24',
            '& .MuiAlert-icon': {
              color: '#fbbf24',
            },
          }}
        >
          <Typography variant="body2" sx={{ color: '#fbbf24' }}>
            <strong>Dikkat:</strong> Bu işlem geri alınamaz.{' '}
            {isPendingApproval
              ? 'İş geri çevrildiğinde takıma bildirim gönderilecek ve durum "IN_PROGRESS" olarak değiştirilecektir.'
              : 'Rapor reddedildiğinde vatandaşa bildirim gönderilecek ve durum "REJECTED" olarak değiştirilecektir.'}
          </Typography>
        </Alert>{' '}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': { color: '#4ade80' },
            }}
          >
            Reddetme Kategorisi
          </InputLabel>
          <Select
            value={rejectionCategory}
            onChange={e => setRejectionCategory(e.target.value)}
            label="Reddetme Kategorisi"
            disabled={isLoading}
            sx={{
              color: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 1,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#4ade80',
              },
              '& .MuiSelect-icon': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  background:
                    'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '& .MuiMenuItem-root': {
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: 'rgba(77, 222, 128, 0.1)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(77, 222, 128, 0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(77, 222, 128, 0.3)',
                      },
                    },
                  },
                },
              },
            }}
          >
            {rejectionCategories.map(category => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>{' '}
        <TextField
          label="Reddetme Nedeni (Detay)"
          multiline
          rows={4}
          fullWidth
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder={
            isPendingApproval
              ? 'Takıma gönderilecek detaylı geri bildirim yazın (neden yetersiz, ne eksik, nasıl düzeltilmeli)...'
              : 'Vatandaşa gönderilecek ayrıntılı açıklama yazın (neden geçersiz, hangi prosedürü izlemeli)...'
          }
          disabled={isLoading}
          sx={{
            mb: 2,
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: '#4ade80',
              },
            },
            '& .MuiOutlinedInput-root': {
              color: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 1,
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#4ade80',
              },
              '& textarea::placeholder': {
                color: 'rgba(255, 255, 255, 0.5)',
                opacity: 1,
              },
            },
          }}
          required
        />{' '}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              background: 'linear-gradient(145deg, #7f1d1d 0%, #991b1b 100%)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              '& .MuiAlert-icon': {
                color: '#fca5a5',
              },
            }}
          >
            {error}
          </Alert>
        )}
      </DialogContent>{' '}
      <DialogActions
        sx={{
          px: 3,
          pb: 2,
          background: 'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Button
          onClick={handleClose}
          disabled={isLoading}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          İptal
        </Button>
        <Button
          onClick={() => void handleConfirm()}
          variant="contained"
          disabled={isLoading || !rejectionCategory.trim() || !reason.trim()}
          startIcon={
            isLoading ? (
              <CircularProgress size={16} sx={{ color: '#ffffff' }} />
            ) : null
          }
          sx={{
            background: 'linear-gradient(145deg, #ef4444 0%, #dc2626 100%)',
            color: '#ffffff',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(145deg, #dc2626 0%, #b91c1c 100%)',
            },
            '&:disabled': {
              background: 'rgba(239, 68, 68, 0.3)',
              color: 'rgba(255, 255, 255, 0.5)',
            },
          }}
        >
          {isLoading
            ? isPendingApproval
              ? 'Geri Çevriliyor...'
              : 'Reddediliyor...'
            : isPendingApproval
              ? 'Geri Çevir'
              : 'Geçersiz Say'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
