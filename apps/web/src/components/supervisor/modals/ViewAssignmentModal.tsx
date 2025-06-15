import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Avatar,
  Paper,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Group as GroupIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { AssigneeType, AssignmentStatus } from '@kentnabiz/shared';
import type { SharedReport } from '@kentnabiz/shared';

interface ViewAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  report: SharedReport | null;
  isLoading?: boolean;
}

// Utility function to get active assignment for a report
const getActiveAssignment = (report: SharedReport) => {
  // Önce assignments array'inde aktif atama ara
  const activeAssignment = report.assignments?.find(
    assignment => assignment.status === AssignmentStatus.ACTIVE
  );

  if (activeAssignment) {
    return activeAssignment;
  } // Eğer assignments array'inde bulunamazsa, assignedToEmployee field'ını kontrol et
  if (report.assignedToEmployee) {
    // assignedToEmployee varsa, bir dummy assignment objesi oluştur
    return {
      id: 0, // Dummy ID
      reportId: report.id,
      assigneeType: AssigneeType.USER,
      assigneeUser: report.assignedToEmployee,
      assigneeTeam: undefined,
      assignedBy: undefined,
      status: AssignmentStatus.ACTIVE,
      assignedAt: report.createdAt || new Date().toISOString(), // Rapor oluşturma tarihini kullan
      completedAt: undefined,
    };
  }

  return null;
};

// Function to format assignment status
const getStatusConfig = (status: AssignmentStatus) => {
  switch (status) {
    case AssignmentStatus.ACTIVE:
      return { label: 'Aktif', color: 'success' as const };
    case AssignmentStatus.COMPLETED:
      return { label: 'Tamamlandı', color: 'info' as const };
    case AssignmentStatus.CANCELLED:
      return { label: 'İptal Edildi', color: 'default' as const };
    default:
      return { label: status, color: 'default' as const };
  }
};

export const ViewAssignmentModal: React.FC<ViewAssignmentModalProps> = ({
  open,
  onClose,
  report,
  isLoading = false,
}) => {
  if (!report) return null;

  const activeAssignment = getActiveAssignment(report);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: 400,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <AssignmentIcon color="primary" />
          <Typography variant="h6" component="span">
            Atama Detayları
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={4}
          >
            <CircularProgress />
          </Box>
        ) : !activeAssignment ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Bu rapor için aktif bir atama bulunamadı.
          </Alert>
        ) : (
          <Box>
            {/* Rapor Bilgileri */}
            <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Rapor Bilgileri
              </Typography>
              <Typography variant="body1" fontWeight="medium" gutterBottom>
                {report.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {report.address}
              </Typography>
            </Paper>

            {/* Atama Bilgileri */}
            <Box mb={3}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Atama Bilgileri
                </Typography>
                <Chip
                  label={getStatusConfig(activeAssignment.status).label}
                  color={getStatusConfig(activeAssignment.status).color}
                  size="small"
                />
              </Box>
              {activeAssignment.assigneeType === AssigneeType.TEAM &&
              activeAssignment.assigneeTeam ? (
                <Paper
                  elevation={0}
                  sx={{ p: 2, border: 1, borderColor: 'divider' }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <GroupIcon />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" gutterBottom>
                        {activeAssignment.assigneeTeam.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Takım Ataması
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />{' '}
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <BusinessIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        Takım ID: {activeAssignment.assigneeTeam.id}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                      <BusinessIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        Departman ID:{' '}
                        {activeAssignment.assigneeTeam.departmentId}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ) : activeAssignment.assigneeType === AssigneeType.USER &&
                activeAssignment.assigneeUser ? (
                <Paper
                  elevation={0}
                  sx={{ p: 2, border: 1, borderColor: 'divider' }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <PersonIcon />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" gutterBottom>
                        {'fullName' in activeAssignment.assigneeUser
                          ? activeAssignment.assigneeUser.fullName
                          : activeAssignment.assigneeUser.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Bireysel Atama
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />{' '}
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        Kullanıcı ID: {activeAssignment.assigneeUser.id}
                      </Typography>
                    </Box>

                    {'title' in activeAssignment.assigneeUser &&
                      activeAssignment.assigneeUser.title && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <BusinessIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            Pozisyon: {activeAssignment.assigneeUser.title}
                          </Typography>
                        </Box>
                      )}
                  </Box>
                </Paper>
              ) : (
                <Alert severity="warning">
                  Atama bilgileri eksik veya hatalı.
                </Alert>
              )}{' '}
              {/* Atama Tarihi */}
              {activeAssignment.assignedAt && (
                <Box display="flex" alignItems="center" gap={1} mt={2}>
                  <CalendarIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {' '}
                    Atama Tarihi:{' '}
                    {(() => {
                      try {
                        const date = new Date(activeAssignment.assignedAt);
                        if (isNaN(date.getTime())) {
                          return 'Tarih bilgisi mevcut değil';
                        }
                        return date.toLocaleString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                      } catch {
                        return 'Tarih bilgisi mevcut değil';
                      }
                    })()}
                  </Typography>
                </Box>
              )}
              {/* Atama Eden */}
              {activeAssignment.assignedBy && (
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Atama Eden:{' '}
                    {
                      ('fullName' in activeAssignment.assignedBy
                        ? activeAssignment.assignedBy.fullName
                        : activeAssignment.assignedBy.name) as string
                    }
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
};
