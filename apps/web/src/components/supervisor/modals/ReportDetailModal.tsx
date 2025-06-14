// apps/web/src/components/supervisor/ReportDetailModal.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Link,
  useTheme,
  alpha,
  Theme,
  Stack,
} from '@mui/material';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { SxProps } from '@mui/system';
import {
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  Label as StatusIcon,
  Business as DepartmentIcon,
  AssignmentInd as AssignedToIcon,
  Image as ImageIcon,
  Videocam as VideoIcon,
  Attachment as AttachmentIcon,
  History as HistoryIcon,
  MailOutline as MailIcon,
  // PhoneIcon UserInfo'da olmadığı için kaldırıldı
} from '@mui/icons-material';
import {
  SharedReport,
  ReportStatus,
  ReportMedia,
  ReportStatusHistory,
  UserInfo,
} from '@kentnabiz/shared';
import { ReportActionsMenu } from '../tables/ReportActionsMenu';

// Rapor durumları için renk ve etiket yapılandırması
const statusConfig: Record<
  ReportStatus,
  { label: string; color: string; icon?: React.ReactElement }
> = {
  [ReportStatus.OPEN]: {
    label: 'Açık',
    color: 'error.main',
    icon: <StatusIcon />,
  },
  [ReportStatus.IN_REVIEW]: {
    label: 'İncelemede',
    color: 'warning.main',
    icon: <StatusIcon />,
  },
  [ReportStatus.IN_PROGRESS]: {
    label: 'İşlemde',
    color: 'info.main',
    icon: <StatusIcon />,
  },
  [ReportStatus.DONE]: {
    label: 'Tamamlandı',
    color: 'success.main',
    icon: <StatusIcon />,
  },
  [ReportStatus.REJECTED]: {
    label: 'Reddedildi',
    color: 'text.secondary',
    icon: <StatusIcon />,
  },
  [ReportStatus.CANCELLED]: {
    label: 'İptal Edildi',
    color: 'text.disabled',
    icon: <StatusIcon />,
  },
};

interface ReportDetailModalProps {
  open: boolean;
  onClose: () => void;
  report: SharedReport | null;
  // ReportActionsMenu handlers for dropdown mode
  onAssign?: (report: SharedReport) => void;
  onForward?: (report: SharedReport) => void;
  onApprove?: (report: SharedReport) => void;
  onReject?: (report: SharedReport) => void;
  onViewDetails?: (report: SharedReport) => void;
  onViewAssignment?: (report: SharedReport) => void;
  onViewHistory?: (report: SharedReport) => void;
  onDelete?: (report: SharedReport) => void;
  onReopen?: (report: SharedReport) => void;
}

const formatDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Geçersiz Tarih';
  }
};

// UserInfo'dan gösterilecek kullanıcı adı ve baş harfleri almak için yardımcı fonksiyon
const getUserDisplayDetails = (
  user: UserInfo | undefined | null
): { displayName: string; avatarInitials: string } => {
  if (!user) return { displayName: 'N/A', avatarInitials: '?' };

  let displayName = 'N/A';
  let avatarInitials = '';

  if (user.fullName) {
    // Öncelikle fullName'i kullan
    displayName = user.fullName;
    // Parantez içindeki ek bilgiyi (örn: " (Emekli Öğretmen)") temizle
    const nameOnly = user.fullName.replace(/\\s*\\([^)]*\\)/g, '').trim();
    const nameParts = nameOnly.split(' ');

    if (nameParts.length > 0 && nameParts[0]) {
      avatarInitials = nameParts[0][0].toUpperCase();
      if (nameParts.length > 1 && nameParts[1]) {
        avatarInitials += nameParts[1][0].toUpperCase();
      } else if (nameParts[0].length > 1) {
        // Tek kelimelik isim için (örn: "Admin" -> "AD")
        avatarInitials += nameParts[0][1]?.toUpperCase() || '';
      }
    }
  } else if (user.email) {
    // fullName yoksa email'i kullan
    displayName = user.email;
    const emailPrefix = user.email.split('@')[0];
    if (emailPrefix) {
      avatarInitials = emailPrefix.substring(0, 2).toUpperCase();
    }
  }

  // Avatar baş harflerinin en fazla 2 karakter olmasını ve boş olmamasını sağla
  if (avatarInitials.length > 2) {
    avatarInitials = avatarInitials.substring(0, 2);
  }
  if (!avatarInitials) {
    avatarInitials = '?';
  }

  return { displayName, avatarInitials };
};

const DetailItem: React.FC<{
  icon: React.ReactElement<SvgIconProps>;
  label: string;
  value?: React.ReactNode;
}> = ({ icon, label, value }) => {
  const iconProps = icon.props || {};
  const existingSx = (iconProps.sx || {}) as SxProps<Theme>;

  return (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <Box display="flex" alignItems="center" mb={1}>
        {React.cloneElement(icon, {
          ...iconProps,
          sx: { ...existingSx, mr: 1.5, color: 'text.secondary' },
        })}
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          {label}:
        </Typography>
      </Box>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Typography variant="body1" sx={{ wordBreak: 'break-word', pl: 4.5 }}>
          {value || 'N/A'}
        </Typography>
      ) : (
        <Box pl={4.5}>
          {value || (
            <Typography variant="body1" color="text.secondary">
              N/A
            </Typography>
          )}
        </Box>
      )}
    </Grid>
  );
};

const UserDetail: React.FC<{ user: UserInfo | undefined; title: string }> = ({
  user,
  title,
}) => {
  const theme = useTheme();
  const { displayName, avatarInitials } = getUserDisplayDetails(user);

  if (!user)
    return <DetailItem icon={<PersonIcon />} label={title} value="Bilgi Yok" />;
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Box display="flex" alignItems="center" mb={1}>
        <PersonIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          {title}:
        </Typography>
      </Box>
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          ml: 4.5,
          backgroundColor: alpha(theme.palette.grey[500], 0.05),
        }}
      >
        <Box display="flex" alignItems="center">
          <Avatar
            sx={{
              mr: 1.5,
              width: 36,
              height: 36,
              bgcolor: theme.palette.primary.main,
              color: 'white',
            }}
          >
            {avatarInitials}
          </Avatar>
          <Box>
            <Typography variant="body1" fontWeight="500">
              {displayName}
            </Typography>
            {user.email && (
              <Box display="flex" alignItems="center" mt={0.2}>
                <MailIcon
                  sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary' }}
                />
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Grid>
  );
};

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  open,
  onClose,
  report,
  // ReportActionsMenu handlers
  onAssign,
  onForward,
  onApprove,
  onReject,
  onViewDetails,
  onViewAssignment,
  onViewHistory,
  onDelete,
  onReopen,
}) => {
  const theme = useTheme();
  if (!report) return null;

  const currentStatus = statusConfig[report.status] || {
    label: report.status,
    color: 'text.primary',
  };

  const getMediaIcon = (mediaType: string): React.ReactElement => {
    if (mediaType.startsWith('image/')) return <ImageIcon />;
    if (mediaType.startsWith('video/')) return <VideoIcon />;
    return <AttachmentIcon />;
  };
  const assignedTo = report.assignedToEmployee
    ? getUserDisplayDetails(report.assignedToEmployee).displayName
    : report.assignments && report.assignments.length > 0
      ? report.assignments[0].assigneeTeam
        ? `Takım: ${report.assignments[0].assigneeTeam.name}`
        : report.assignments[0].assigneeUser
          ? getUserDisplayDetails({
              id: report.assignments[0].assigneeUser.id,
              fullName:
                (
                  report.assignments[0].assigneeUser as {
                    id: number;
                    fullName?: string;
                    name?: string;
                    email: string;
                  }
                ).fullName ||
                (
                  report.assignments[0].assigneeUser as {
                    id: number;
                    fullName?: string;
                    name?: string;
                    email: string;
                  }
                ).name ||
                'Bilinmeyen',
              email: report.assignments[0].assigneeUser.email,
            }).displayName
          : 'Belirtilmemiş'
      : 'Atanmamış';

  // Atama tarihini al
  const assignmentDate =
    report.assignments && report.assignments.length > 0
      ? report.assignments[0].assignedAt
      : undefined;

  // Kabul edilme tarihini al
  const acceptedDate =
    report.assignments && report.assignments.length > 0
      ? report.assignments[0].acceptedAt
      : undefined;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
    >
      {' '}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1.5,
        }}
      >
        <Box>
          <Typography variant="h5" component="div" fontWeight={600}>
            Rapor Detayları: #{report.id}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {report.title}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <ReportActionsMenu
            report={report}
            mode="dropdown"
            onAssign={onAssign}
            onForward={onForward}
            onApprove={onApprove}
            onReject={onReject}
            onViewDetails={onViewDetails}
            onViewAssignment={onViewAssignment}
            onViewHistory={onViewHistory}
            onDelete={onDelete}
            onReopen={onReopen}
          />{' '}
          <IconButton onClick={onClose} aria-label="kapat">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{ backgroundColor: alpha(theme.palette.grey[500], 0.03) }}
      >
        {' '}
        <Grid container spacing={2.5} py={2}>
          <Grid size={{ xs: 12 }}>
            <Paper
              elevation={0}
              sx={{ p: 2, border: `1px solid ${theme.palette.divider}` }}
            >
              {' '}
              <Grid container spacing={2.5}>
                <DetailItem
                  icon={<StatusIcon />}
                  label="Durum"
                  value={
                    <Chip
                      label={currentStatus.label}
                      size="medium"
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontWeight: 'bold',
                      }}
                    />
                  }
                />
                <DetailItem
                  icon={<CategoryIcon />}
                  label="Kategori"
                  value={report.category?.name}
                />
                <DetailItem
                  icon={<DepartmentIcon />}
                  label="Departman"
                  value={report.currentDepartment?.name}
                />{' '}
                <DetailItem
                  icon={<CalendarIcon />}
                  label="Oluşturulma Tarihi"
                  value={formatDate(report.createdAt)}
                />
                <DetailItem
                  icon={<CalendarIcon />}
                  label="Son Güncelleme"
                  value={formatDate(report.updatedAt)}
                />
                {assignmentDate && (
                  <DetailItem
                    icon={<AssignedToIcon />}
                    label="Atama Tarihi"
                    value={formatDate(assignmentDate)}
                  />
                )}
                {acceptedDate && (
                  <DetailItem
                    icon={<AssignedToIcon />}
                    label="Kabul Edilme Tarihi"
                    value={formatDate(acceptedDate)}
                  />
                )}
                <DetailItem
                  icon={<AssignedToIcon />}
                  label="Atanan"
                  value={assignedTo}
                />
                {report.description && (
                  <Grid size={{ xs: 12 }}>
                    <DetailItem
                      icon={<DescriptionIcon />}
                      label="Açıklama"
                      value={
                        <Typography
                          variant="body1"
                          sx={{
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {report.description}
                        </Typography>
                      }
                    />
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
          <UserDetail user={report.user} title="Raporlayan Kullanıcı" />
          {report.assignedToEmployee && (
            <UserDetail
              user={report.assignedToEmployee}
              title="Atanan Yetkili"
            />
          )}{' '}
          {/* Adres Bilgileri */}
          <Grid size={{ xs: 12 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mt: 2.5,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
              >
                <LocationIcon sx={{ mr: 1, color: 'primary.main' }} /> Adres
                Bilgileri
              </Typography>{' '}
              <Grid container spacing={2}>
                <DetailItem
                  icon={<LocationIcon />}
                  label="Açık Adres"
                  value={report.address}
                />
                <DetailItem
                  icon={<LocationIcon />}
                  label="Enlem"
                  value={report.location?.coordinates?.[1]?.toString()}
                />
                <DetailItem
                  icon={<LocationIcon />}
                  label="Boylam"
                  value={report.location?.coordinates?.[0]?.toString()}
                />
              </Grid>
            </Paper>
          </Grid>{' '}
          {/* Medya Dosyaları */}
          {report.reportMedias && report.reportMedias.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mt: 2.5,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                >
                  <ImageIcon sx={{ mr: 1, color: 'primary.main' }} /> Medya
                  Dosyaları ({report.reportMedias.length})
                </Typography>
                <List dense>
                  {report.reportMedias.map(
                    (item: ReportMedia, index: number) => (
                      <ListItem
                        key={index}
                        divider={index < report.reportMedias!.length - 1}
                      >
                        <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>
                          {getMediaIcon(item.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Link
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {item.filename || `Medya ${index + 1}`}
                            </Link>
                          }
                          secondary={`${item.type}${item.size ? ` - ${(item.size / 1024).toFixed(1)} KB` : ''}`}
                        />
                      </ListItem>
                    )
                  )}
                </List>
              </Paper>
            </Grid>
          )}{' '}
          {/* Rapor Geçmişi */}
          {report.statusHistory && report.statusHistory.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mt: 2.5,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                >
                  <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} /> Rapor
                  Geçmişi
                </Typography>
                <List dense>
                  {report.statusHistory
                    .sort(
                      (a, b) =>
                        new Date(b.changedAt).getTime() -
                        new Date(a.changedAt).getTime()
                    )
                    .map((historyItem: ReportStatusHistory, index: number) => (
                      <ListItem
                        key={index}
                        divider={index < report.statusHistory!.length - 1}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 'auto',
                            mr: 1.5,
                            alignSelf: 'flex-start',
                            mt: 0.5,
                          }}
                        >
                          {statusConfig[historyItem.status]?.icon || (
                            <StatusIcon />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box
                              component="span"
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <Typography
                                variant="body2"
                                component="span"
                                sx={{
                                  fontWeight: 'bold',
                                  color:
                                    statusConfig[historyItem.status]?.color ||
                                    'text.primary',
                                }}
                              >
                                {statusConfig[historyItem.status]?.label ||
                                  historyItem.status}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                component="span"
                              >
                                {formatDate(historyItem.changedAt)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <>
                              {historyItem.notes && (
                                <Typography
                                  variant="caption"
                                  display="block"
                                  sx={{ mt: 0.5 }}
                                >
                                  {historyItem.notes}
                                </Typography>
                              )}
                              {historyItem.changedByUser && (
                                <Typography
                                  variant="caption"
                                  display="block"
                                  sx={{ mt: 0.5, fontStyle: 'italic' }}
                                >
                                  Değiştiren:{' '}
                                  {
                                    getUserDisplayDetails(
                                      historyItem.changedByUser
                                    ).displayName
                                  }
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                </List>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" color="primary">
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDetailModal;
