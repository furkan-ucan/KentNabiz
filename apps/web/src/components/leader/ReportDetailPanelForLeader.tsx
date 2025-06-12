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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  Badge,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  ThumbUp as ThumbUpIcon,
  Email as EmailIcon,
  Business as DepartmentIcon,
  ExpandMore as ExpandMoreIcon,
  AssignmentInd as AssignedIcon,
  PlaylistAddCheck as CompletedIcon,
  Cancel as CancelledIcon,
  CheckCircle as ActiveIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  AttachFile as FileIcon,
  PlayArrow as StartWorkIcon,
  CheckCircleOutline as CompleteWorkIcon,
  CloudUpload as UploadIcon,
  Directions as DirectionsIcon,
} from '@mui/icons-material';
import {
  SharedReport,
  ReportStatus,
  AssignmentStatus,
  AssigneeType,
} from '@kentnabiz/shared';
import {
  useAcceptAssignment,
  useCompleteWork,
  useUploadWorkProgressMedia,
} from '@/hooks/useTeamLeaderActions';

// API'den gelen status history yapısı (shared type'dan farklı)
interface ApiStatusHistory {
  id?: number;
  newStatus: string;
  newSubStatus?: string;
  previousStatus?: string;
  previousSubStatus?: string;
  changedAt: string;
  changedByUserId?: number;
  changedByUser?: {
    fullName?: string;
  };
  notes?: string;
}

interface ReportDetailPanelForLeaderProps {
  report: SharedReport;
  onRefresh?: () => void; // TEAM_MEMBER'lar için sadece refresh gerekli
}

// TEAM_MEMBER için mevcut aksiyonlar
const getAvailableActions = (report: SharedReport) => {
  const actions = [];

  // IN_REVIEW durumunda → İşi Kabul Et
  if (report.status === ReportStatus.IN_REVIEW) {
    actions.push({
      key: 'accept_assignment',
      label: 'İşi Kabul Et',
      icon: <StartWorkIcon />,
      color: 'primary' as const,
      description: 'Bu işi üzerinize alın ve çalışmaya başlayın',
    });
  }

  // IN_PROGRESS durumunda → İşi Tamamla
  if (report.status === ReportStatus.IN_PROGRESS) {
    actions.push({
      key: 'complete_work',
      label: 'İşi Tamamla',
      icon: <CompleteWorkIcon />,
      color: 'success' as const,
      description: 'İşi bitirip supervisor onayına gönderin',
    });

    actions.push({
      key: 'upload_media',
      label: 'Fotoğraf/Video Yükle',
      icon: <UploadIcon />,
      color: 'info' as const,
      description: 'Çalışma sırasında medya dosyası yükleyin',
    });
  }

  return actions;
};

const statusConfig: Record<
  string,
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
    icon: React.ReactNode;
  }
> = {
  OPEN: { color: 'error', label: 'Açık', icon: '🔴' },
  IN_REVIEW: { color: 'warning', label: 'İncelemede', icon: '🟡' },
  IN_PROGRESS: { color: 'info', label: 'İşlemde', icon: '🔵' },
  DONE: { color: 'success', label: 'Tamamlandı', icon: '🟢' },
  REJECTED: { color: 'default', label: 'Reddedildi', icon: '⚫' },
  CANCELLED: { color: 'default', label: 'İptal Edildi', icon: '⚪' },
  PENDING_APPROVAL: { color: 'warning', label: 'Onay Bekliyor', icon: '⏳' },
  FORWARDED: { color: 'info', label: 'Yönlendirildi', icon: '➡️' },
};

// Güvenli statusConfig erişimi için yardımcı fonksiyon
const getStatusConfig = (status: string | undefined | null) => {
  if (!status) {
    return {
      color: 'default' as const,
      label: 'Bilinmeyen Durum',
      icon: '❓',
    };
  }

  const config = statusConfig[status];
  if (!config) {
    console.warn('Bilinmeyen status:', status);
    // Bilinmeyen status için varsayılan değerler
    return {
      color: 'default' as const,
      label: `Bilinmeyen Durum (${status})`,
      icon: '❓',
    };
  }
  return config;
};

const assignmentStatusConfig: Record<
  AssignmentStatus,
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
    icon: React.ReactNode;
  }
> = {
  ACTIVE: {
    color: 'info',
    label: 'Aktif',
    icon: <ActiveIcon fontSize="small" />,
  },
  COMPLETED: {
    color: 'success',
    label: 'Tamamlandı',
    icon: <CompletedIcon fontSize="small" />,
  },
  CANCELLED: {
    color: 'default',
    label: 'İptal Edildi',
    icon: <CancelledIcon fontSize="small" />,
  },
};

export const ReportDetailPanelForLeader: React.FC<
  ReportDetailPanelForLeaderProps
> = ({ report, onRefresh }) => {
  // Dialog state'leri
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Form state'leri
  const [acceptNotes, setAcceptNotes] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [proofFiles, setProofFiles] = useState<File[]>([]);

  // Hook'lar
  const acceptAssignmentMutation = useAcceptAssignment();
  const completeWorkMutation = useCompleteWork();
  const uploadMediaMutation = useUploadWorkProgressMedia();

  // Mevcut aksiyonlar
  const availableActions = getAvailableActions(report);

  // İşi kabul etme
  const handleAcceptAssignment = async () => {
    try {
      await acceptAssignmentMutation.mutateAsync({
        reportId: report.id,
        payload: {
          notes: acceptNotes,
          estimatedCompletionTime: estimatedTime,
        },
      });
      setAcceptDialogOpen(false);
      setAcceptNotes('');
      setEstimatedTime('');
      onRefresh?.();
    } catch (error) {
      console.error('İş kabul edilirken hata:', error);
    }
  };

  // İşi tamamlama
  const handleCompleteWork = async () => {
    try {
      await completeWorkMutation.mutateAsync({
        reportId: report.id,
        payload: {
          resolutionNotes: completionNotes,
          mediaFiles: selectedFiles,
          proofMediaFiles: proofFiles,
        },
      });
      setCompleteDialogOpen(false);
      setCompletionNotes('');
      setSelectedFiles([]);
      setProofFiles([]);
      onRefresh?.();
    } catch (error) {
      console.error('İş tamamlanırken hata:', error);
    }
  };
  // Medya yükleme
  const handleUploadMedia = async () => {
    try {
      await uploadMediaMutation.mutateAsync({
        reportId: report.id,
        files: selectedFiles,
      });
      setUploadDialogOpen(false);
      setSelectedFiles([]);
      onRefresh?.();
    } catch (error) {
      console.error('Medya yüklenirken hata:', error);
    }
  };

  // Dosya seçme handler'ı
  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'work' | 'proof'
  ) => {
    const files = Array.from(event.target.files || []);
    if (type === 'work') {
      setSelectedFiles(files);
    } else {
      setProofFiles(files);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatDateShort = (date: Date | string) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getMediaIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon />;
    if (type.startsWith('video/')) return <VideoIcon />;
    return <FileIcon />;
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Başlık ve Durum */}
      <Box sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: 600, flex: 1 }}
          >
            {report.title}
          </Typography>{' '}
          <Stack direction="row" spacing={1}>
            <Chip
              label={getStatusConfig(report.status).label}
              color={getStatusConfig(report.status).color}
              variant="filled"
              icon={<span>{getStatusConfig(report.status).icon}</span>}
            />
            {report.supportCount && report.supportCount > 0 && (
              <Tooltip
                title={`${report.supportCount} vatandaş bu raporu destekliyor`}
              >
                <Badge badgeContent={report.supportCount} color="primary">
                  <ThumbUpIcon color="action" />
                </Badge>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Rapor ID: #{report.id} • Oluşturulma: {formatDate(report.createdAt)}
        </Typography>
      </Box>
      {/* Ana İçerik - Scrollable */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Stack spacing={2}>
          {/* Rapor Özeti */}
          <Card variant="outlined">
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <CategoryIcon color="primary" />
                Rapor Özeti
              </Typography>
              <Stack spacing={2}>
                {' '}
                <Typography
                  variant="body1"
                  sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                >
                  &ldquo;{report.description}&rdquo;
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Kategori
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {report.category.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Alt Durum
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {report.subStatus || 'Yok'}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Konum ve Adres Bilgisi */}
          <Card variant="outlined">
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <LocationIcon color="primary" />
                Konum Bilgileri
              </Typography>{' '}
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Adres
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 500, flex: 1 }}
                    >
                      {report.address}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DirectionsIcon />}
                      onClick={() => {
                        const coords = report.location.coordinates;
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`;
                        window.open(url, '_blank');
                      }}
                      sx={{
                        minWidth: 'auto',
                        fontSize: '0.75rem',
                        py: 0.5,
                        px: 1,
                      }}
                    >
                      Yol Tarifi
                    </Button>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Enlem
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontFamily: 'monospace' }}
                    >
                      {report.location.coordinates[1].toFixed(6)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Boylam
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontFamily: 'monospace' }}
                    >
                      {report.location.coordinates[0].toFixed(6)}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Vatandaş Bilgileri */}
          <Card variant="outlined">
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <PersonIcon color="primary" />
                Bildiren Vatandaş
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 56, height: 56 }}>
                  {report.user.avatar ? (
                    <img src={report.user.avatar} alt={report.user.fullName} />
                  ) : (
                    report.user.fullName.charAt(0).toUpperCase()
                  )}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {report.user.fullName}
                  </Typography>
                  {report.user.email && (
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mt: 0.5 }}
                    >
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {report.user.email}
                      </Typography>
                    </Stack>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* İşlemsel Bilgiler */}
          <Card variant="outlined">
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <DepartmentIcon color="primary" />
                İşlemsel Bilgiler
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Mevcut Departman
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {report.currentDepartment.name}
                  </Typography>
                  {report.currentDepartment.description && (
                    <Typography variant="body2" color="text.secondary">
                      {report.currentDepartment.description}
                    </Typography>
                  )}
                </Box>

                {report.assignedToEmployee && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Atanan Personel
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AssignedIcon fontSize="small" color="action" />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {report.assignedToEmployee.fullName}
                      </Typography>
                      {report.assignedToEmployee.title && (
                        <Chip
                          label={report.assignedToEmployee.title}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Box>
                )}

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Son Güncelleme
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(report.updatedAt)}
                    </Typography>
                  </Box>
                  {report.supportCount !== undefined && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Destek Sayısı
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <ThumbUpIcon fontSize="small" color="primary" />
                        {report.supportCount}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Görevlendirmeler */}
          {report.assignments && report.assignments.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  variant="h6"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <AssignmentIcon color="primary" />
                  Görevlendirmeler ({report.assignments.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Görevlendirilen</TableCell>
                        <TableCell>Tür</TableCell>
                        <TableCell>Durum</TableCell>
                        <TableCell>Atanma</TableCell>
                        <TableCell>Durumu</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {report.assignments.map(assignment => (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            {assignment.assigneeType === AssigneeType.USER
                              ? assignment.assigneeUser?.fullName ||
                                'Bilinmeyen Kullanıcı'
                              : assignment.assigneeTeam?.name ||
                                'Bilinmeyen Takım'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                assignment.assigneeType === AssigneeType.USER
                                  ? 'Kullanıcı'
                                  : 'Takım'
                              }
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                assignmentStatusConfig[assignment.status].label
                              }
                              color={
                                assignmentStatusConfig[assignment.status].color
                              }
                              size="small"
                              icon={
                                assignmentStatusConfig[assignment.status]
                                  .icon as React.ReactElement
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {formatDateShort(assignment.assignedAt)}
                          </TableCell>
                          <TableCell>
                            <Stack spacing={0.5}>
                              {assignment.acceptedAt && (
                                <Typography
                                  variant="caption"
                                  color="success.main"
                                >
                                  Kabul:{' '}
                                  {formatDateShort(assignment.acceptedAt)}
                                </Typography>
                              )}
                              {assignment.completedAt && (
                                <Typography
                                  variant="caption"
                                  color="success.main"
                                >
                                  Tamamlandı:{' '}
                                  {formatDateShort(assignment.completedAt)}
                                </Typography>
                              )}
                              {assignment.rejectedAt && (
                                <Typography
                                  variant="caption"
                                  color="error.main"
                                >
                                  Reddedildi:{' '}
                                  {formatDateShort(assignment.rejectedAt)}
                                </Typography>
                              )}
                              {assignment.cancelledAt && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  İptal:{' '}
                                  {formatDateShort(assignment.cancelledAt)}
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Medya Dosyaları */}
          {report.reportMedias && report.reportMedias.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  variant="h6"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <ImageIcon color="primary" />
                  Medya Dosyaları ({report.reportMedias.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {report.reportMedias.map(media => (
                    <Card key={media.id} variant="outlined">
                      <CardContent sx={{ py: 1.5 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          {getMediaIcon(media.type)}
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {media.filename || 'İsimsiz dosya'}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {media.type} •{' '}
                              {media.size
                                ? `${(media.size / 1024 / 1024).toFixed(2)} MB`
                                : 'Bilinmeyen boyut'}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => window.open(media.url, '_blank')}
                          >
                            Görüntüle
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Durum Geçmişi */}
          {report.statusHistory && report.statusHistory.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  variant="h6"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <HistoryIcon color="primary" />
                  Durum Geçmişi ({report.statusHistory.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {' '}
                <List dense>
                  {' '}
                  {report.statusHistory.map((history, index) => {
                    // API'den gelen veri yapısı shared type'dan farklı olduğu için type assertion kullanıyoruz
                    const historyItem = history as unknown as ApiStatusHistory;
                    const statusInfo = getStatusConfig(historyItem.newStatus);
                    return (
                      <React.Fragment key={`history-${index}`}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: statusInfo.color + '.main',
                              }}
                            >
                              <span style={{ fontSize: '14px' }}>
                                {statusInfo.icon}
                              </span>
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500 }}
                                >
                                  {statusInfo.label}
                                  {historyItem.newSubStatus &&
                                    ` (${historyItem.newSubStatus})`}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {historyItem.changedAt
                                    ? formatDateShort(historyItem.changedAt)
                                    : 'Tarih bilinmiyor'}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Box>
                                {historyItem.changedByUser?.fullName && (
                                  <Typography variant="caption" display="block">
                                    Değiştiren:{' '}
                                    {historyItem.changedByUser.fullName}
                                  </Typography>
                                )}
                                {historyItem.notes && (
                                  <Typography
                                    variant="caption"
                                    sx={{ fontStyle: 'italic' }}
                                    display="block"
                                  >
                                    &ldquo;{historyItem.notes}&rdquo;
                                  </Typography>
                                )}
                                {historyItem.previousStatus && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                  >
                                    Önceki:{' '}
                                    {
                                      getStatusConfig(
                                        historyItem.previousStatus
                                      ).label
                                    }
                                    {historyItem.previousSubStatus &&
                                      ` (${historyItem.previousSubStatus})`}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < report.statusHistory!.length - 1 && (
                          <Divider variant="inset" component="li" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </List>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Departman Geçmişi */}
          {report.departmentHistory && report.departmentHistory.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  variant="h6"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <DepartmentIcon color="primary" />
                  Departman Geçmişi ({report.departmentHistory.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {report.departmentHistory.map((history, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: 'primary.main',
                            }}
                          >
                            <DepartmentIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {history.department.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDateShort(history.changedAt)}
                              </Typography>
                            </Stack>
                          }
                          secondary={
                            <Stack spacing={0.5}>
                              {history.changedByUser && (
                                <Typography variant="caption">
                                  Değiştiren: {history.changedByUser.fullName}
                                </Typography>
                              )}{' '}
                              {history.reason && (
                                <Typography
                                  variant="caption"
                                  sx={{ fontStyle: 'italic' }}
                                >
                                  Sebep: &ldquo;{history.reason}&rdquo;
                                </Typography>
                              )}
                            </Stack>
                          }
                        />
                      </ListItem>
                      {index < report.departmentHistory!.length - 1 && (
                        <Divider variant="inset" component="li" />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}
        </Stack>
      </Box>{' '}
      {/* TEAM_MEMBER Aksiyonları */}
      <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Stack spacing={2}>
          {availableActions.map(action => (
            <Button
              key={action.key}
              variant="contained"
              color={action.color}
              startIcon={action.icon}
              onClick={() => {
                if (action.key === 'accept_assignment') {
                  setAcceptDialogOpen(true);
                } else if (action.key === 'complete_work') {
                  setCompleteDialogOpen(true);
                } else if (action.key === 'upload_media') {
                  setUploadDialogOpen(true);
                }
              }}
              fullWidth
              disabled={
                acceptAssignmentMutation.isPending ||
                completeWorkMutation.isPending ||
                uploadMediaMutation.isPending
              }
            >
              {action.label}
            </Button>
          ))}

          {availableActions.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Bu rapor için şu anda yapabileceğiniz bir işlem bulunmuyor.
            </Typography>
          )}
        </Stack>
      </Box>{' '}
      {/* İş Kabul Etme Dialog'u */}
      <Dialog
        open={acceptDialogOpen}
        onClose={() => setAcceptDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          İşi Kabul Et
          <Typography variant="body2" color="text.secondary">
            Rapor #{report.id} - {report.title}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="İş Kabul Notu (Opsiyonel)"
              multiline
              rows={3}
              value={acceptNotes}
              onChange={e => setAcceptNotes(e.target.value)}
              placeholder="Bu işi neden kabul ettiğinizi kısaca açıklayın..."
              fullWidth
            />
            <TextField
              label="Tahmini Tamamlanma Zamanı (Opsiyonel)"
              type="datetime-local"
              value={estimatedTime}
              onChange={e => setEstimatedTime(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAcceptDialogOpen(false)}>İptal</Button>
          <Button
            onClick={() => void handleAcceptAssignment()}
            variant="contained"
            disabled={acceptAssignmentMutation.isPending}
          >
            İşi Kabul Et
          </Button>
        </DialogActions>
      </Dialog>
      {/* İş Tamamlama Dialog'u */}
      <Dialog
        open={completeDialogOpen}
        onClose={() => setCompleteDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          İşi Tamamla
          <Typography variant="body2" color="text.secondary">
            Rapor #{report.id} - {report.title}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Çözüm Açıklaması *"
              multiline
              rows={4}
              value={completionNotes}
              onChange={e => setCompletionNotes(e.target.value)}
              placeholder="İşi nasıl çözdüğünüzü detaylı olarak açıklayın..."
              fullWidth
              required
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Çalışma Fotoğrafları/Videoları (Opsiyonel)
              </Typography>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={e => handleFileSelect(e, 'work')}
                style={{ marginBottom: 8 }}
              />
              {selectedFiles.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {selectedFiles.length} dosya seçildi
                </Typography>
              )}
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Kanıt Fotoğrafları/Videoları *
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                İşin tamamlandığını gösteren kanıt medyaları yükleyin
              </Typography>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={e => handleFileSelect(e, 'proof')}
                style={{ marginBottom: 8 }}
              />
              {proofFiles.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {proofFiles.length} kanıt dosyası seçildi
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialogOpen(false)}>İptal</Button>
          <Button
            onClick={() => void handleCompleteWork()}
            variant="contained"
            disabled={
              !completionNotes.trim() ||
              proofFiles.length === 0 ||
              completeWorkMutation.isPending
            }
          >
            İşi Tamamla
          </Button>
        </DialogActions>
      </Dialog>
      {/* Medya Yükleme Dialog'u */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Çalışma Medyası Yükle
          <Typography variant="body2" color="text.secondary">
            Rapor #{report.id} - {report.title}
          </Typography>
        </DialogTitle>{' '}
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Fotoğraf/Video Seçin
              </Typography>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={e => handleFileSelect(e, 'work')}
                style={{ marginBottom: 8 }}
              />
              {selectedFiles.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {selectedFiles.length} dosya seçildi
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>İptal</Button>
          <Button
            onClick={() => void handleUploadMedia()}
            variant="contained"
            disabled={
              selectedFiles.length === 0 || uploadMediaMutation.isPending
            }
          >
            Yükle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
