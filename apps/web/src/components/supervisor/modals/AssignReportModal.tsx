import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListSubheader,
  CircularProgress,
  SelectChangeEvent,
  Skeleton,
  Box,
  Typography,
  Chip,
  Stack,
  Alert,
  Card,
  CardContent,
  Fade,
  Zoom,
  Tooltip,
} from '@mui/material';
import {
  Group,
  // PersonAdd, // Kaldırıldı - artık kullanılmıyor
  Info,
  CheckCircle,
  Speed,
  Assignment,
} from '@mui/icons-material';
import { useSuggestedTeams } from '@/hooks/useSuggestedTeams';
import { useDepartmentTeams } from '@/hooks/useDepartmentTeams';
// import { useTeamMembers } from '@/hooks/useTeamMembers'; // Kullanılmıyor - sadece takım seçimi
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { TeamStatus } from '@kentnabiz/shared'; // axios yerine api lib kullan

interface AssignReportModalProps {
  open: boolean;
  onClose: () => void;
  report: {
    id: number;
    departmentId?: number;
    categoryId?: number;
    currentDepartment?: { id: number };
    // Diğer gerekli alanlar eklenebilir
  };
}

export const AssignReportModal: React.FC<AssignReportModalProps> = ({
  open,
  onClose,
  report,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  // const [selectedUserId, setSelectedUserId] = useState<string>(''); // Kaldırıldı - sadece takım seçimi
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const queryClient = useQueryClient();
  // CSS animasyonları için stil tanımları
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      @keyframes bounceIn {
        0% { transform: scale(0.3); opacity: 0; }
        50% { transform: scale(1.05); }
        70% { transform: scale(0.9); }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes fadeInUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);
  const departmentId = report.departmentId ?? report.currentDepartment?.id ?? 0;
  const {
    data: suggestedTeams = [],
    isLoading: isLoadingSuggested,
    error: suggestedTeamsError,
  } = useSuggestedTeams(report.id, departmentId);
  const {
    data: allTeamsResp,
    isLoading: isLoadingTeams,
    error: allTeamsError,
  } = useDepartmentTeams(departmentId, true, true); // Sadece müsait takımları çek

  const allTeams = React.useMemo(
    () => allTeamsResp?.data || [],
    [allTeamsResp]
  );
  // const { data: teamMembers = [], isLoading: isLoadingMembers } = useTeamMembers(Number(selectedTeamId), departmentId); // Kaldırıldı - sadece takım seçimi// Güvenlik kontrolü: suggestedTeams'in array olduğundan emin ol
  const safesugestedTeams = React.useMemo(
    () => (Array.isArray(suggestedTeams) ? suggestedTeams : []),
    [suggestedTeams]
  ); // Debug için konsola yazdır
  React.useEffect(() => {
    console.log('🔍 AssignReportModal Debug Info:');
    console.log('Report:', report);
    console.log('Department ID:', departmentId);
    console.log('suggestedTeams raw:', suggestedTeams);
    console.log('safesugestedTeams:', safesugestedTeams);
    console.log('allTeamsResp:', allTeamsResp);
    console.log('allTeams:', allTeams);
    console.log('isLoadingSuggested:', isLoadingSuggested);
    console.log('isLoadingTeams:', isLoadingTeams);
    if (suggestedTeamsError)
      console.error('❌ Suggested teams error:', suggestedTeamsError);
    if (allTeamsError) console.error('❌ All teams error:', allTeamsError);
  }, [
    report,
    departmentId,
    suggestedTeams,
    safesugestedTeams,
    allTeamsResp,
    allTeams,
    isLoadingSuggested,
    isLoadingTeams,
    suggestedTeamsError,
    allTeamsError,
  ]);

  // Diğer takımlar: önerilenlerde olmayanlar
  const suggestedTeamIds = safesugestedTeams.map(t => t.id);
  const otherTeams = allTeams.filter(t => !suggestedTeamIds.includes(t.id));
  const assignToTeamMutation = useMutation({
    mutationFn: async ({
      reportId,
      teamId,
    }: {
      reportId: number;
      teamId: number;
    }) => {
      console.log(`🔄 Assigning report ${reportId} to team ${teamId}`);
      const response = await api.patch(
        `/reports/${reportId}/assign-team/${teamId}`
      );
      console.log('✅ Assignment successful:', response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log('🔄 Invalidating queries after successful assignment...');
      // Tüm rapor ilişkili query'leri agresif şekilde yenile
      queryClient.invalidateQueries({
        queryKey: ['reports'],
        refetchType: 'all',
      });
      queryClient.invalidateQueries({
        queryKey: ['statusCounts'],
        refetchType: 'all',
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboardData'],
        refetchType: 'all',
      });
      queryClient.invalidateQueries({
        queryKey: ['supervisorReports'],
        refetchType: 'all',
      });

      // Specific report için de refetch
      queryClient.refetchQueries({ queryKey: ['supervisorReports'] });
      queryClient.refetchQueries({ queryKey: ['statusCounts'] });

      setErrorMessage(''); // Hata mesajını temizle
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000); // Biraz daha uzun bekle ki cache güncellensin
    },
    onError: (error: unknown) => {
      console.error('❌ Assignment failed:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string }; status?: number };
        };
        const errorMsg =
          axiosError.response?.data?.message ||
          `API Hatası (${axiosError.response?.status || 'Bilinmeyen'})`;
        setErrorMessage(errorMsg);
      } else {
        setErrorMessage('Takım ataması sırasında bir hata oluştu.');
      }
    },
  });

  // assignToUserMutation kaldırıldı - sadece takım seçimi

  const isAssigning = assignToTeamMutation.status === 'pending';
  const handleClose = () => {
    setSelectedTeamId('');
    // setSelectedUserId(''); // Kaldırıldı
    setShowSuccess(false);
    setErrorMessage(''); // Hata mesajını temizle
    onClose();
  };

  const handleTeamChange = (event: SelectChangeEvent<string>) => {
    setSelectedTeamId(event.target.value);
    // setSelectedUserId(''); // Artık gerekli değil
  };

  // handleUserChange kaldırıldı - sadece takım seçimi

  const handleAssign = () => {
    if (selectedTeamId) {
      assignToTeamMutation.mutate({
        reportId: report.id,
        teamId: Number(selectedTeamId),
      });
    }
  };

  // Team status helper function
  const getTeamStatusDisplay = (status: TeamStatus) => {
    switch (status) {
      case TeamStatus.AVAILABLE:
        return { label: 'Müsait', color: 'success' as const };
      case TeamStatus.ON_DUTY:
        return { label: 'Görevde', color: 'warning' as const };
      case TeamStatus.OFF_DUTY:
        return { label: 'Vardiya Dışı', color: 'default' as const };
      case TeamStatus.INACTIVE:
        return { label: 'Pasif', color: 'error' as const };
      default:
        return { label: status, color: 'default' as const };
    }
  };
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
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
          textAlign: 'center',
          py: 3,
          borderBottom: '1px solid #475569',
        }}
      >
        <Zoom in={open} timeout={600}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={2}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                animation: 'pulse 2s infinite',
              }}
            >
              {' '}
              <Assignment sx={{ fontSize: 32, color: '#ffd700' }} />
              <Group sx={{ fontSize: 28, color: '#ffd700' }} />
            </Box>{' '}
            <Typography variant="h5" component="span" fontWeight="600">
              Takım Atama Sistemi
            </Typography>
          </Stack>
        </Zoom>
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
          Önerilen takımlar ile hızlı ve doğru atama
        </Typography>
      </DialogTitle>{' '}
      <DialogContent
        sx={{
          pt: 3,
          px: 3,
          backgroundColor: '#0f172a',
          color: '#e2e8f0',
        }}
      >
        {/* Hata Mesajı */}
        {errorMessage && (
          <Fade in={!!errorMessage}>
            <Box>
              <Alert
                severity="error"
                onClose={() => setErrorMessage('')}
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(244, 67, 54, 0.3)',
                  backgroundColor: '#7f1d1d',
                  color: '#fecaca',
                  '& .MuiAlert-icon': {
                    color: '#fecaca',
                  },
                }}
              >
                <Typography variant="body2">{errorMessage}</Typography>
              </Alert>
            </Box>
          </Fade>
        )}
        {/* Başarı Mesajı */}
        <Fade in={showSuccess}>
          <Box>
            {showSuccess && (
              <Alert
                severity="success"
                icon={<CheckCircle />}
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
                  '& .MuiAlert-icon': {
                    fontSize: '28px',
                  },
                  animation: 'bounceIn 0.6s ease-out',
                }}
              >
                {' '}
                <Typography variant="body1" fontWeight="600">
                  🎉 Rapor başarıyla atandı!
                  {selectedTeamId &&
                    ` Takım: ${allTeams.find(t => t.id === parseInt(selectedTeamId))?.name || 'Seçilen Takım'}`}
                  <br />
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{ opacity: 0.8 }}
                  >
                    {new Date().toLocaleString('tr-TR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    tarihinde atandı. Modal kapatılıyor...
                  </Typography>
                </Typography>
              </Alert>
            )}
          </Box>
        </Fade>
        {/* Bilgi Kartı */}{' '}
        <Card
          sx={{
            mb: 3,
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: '1px solid #334155',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          <CardContent sx={{ py: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                  color: 'white',
                }}
              >
                <Speed />
              </Box>
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="600"
                  sx={{ color: '#f1f5f9' }}
                >
                  Akıllı Atama Önerileri
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  Sistem, rapor kategorisi ve takım uzmanlıklarına göre en uygun
                  takımları önerir
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
        {/* Takım Seçimi */}
        <Box sx={{ mb: 3 }}>
          {' '}
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: '#f1f5f9',
            }}
          >
            <Assignment sx={{ color: '#3b82f6' }} />
            Takım Seçimi
          </Typography>
          <FormControl
            fullWidth
            sx={{
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
            <InputLabel>Takım Seç</InputLabel>
            {isLoadingSuggested || isLoadingTeams ? (
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={56}
                  sx={{ borderRadius: 1, backgroundColor: '#334155' }}
                />
                <Stack direction="row" spacing={1}>
                  <Skeleton
                    variant="rectangular"
                    width="30%"
                    height={20}
                    sx={{ borderRadius: 1, backgroundColor: '#334155' }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width="40%"
                    height={20}
                    sx={{ borderRadius: 1, backgroundColor: '#334155' }}
                  />
                </Stack>
              </Stack>
            ) : (
              <Select
                value={selectedTeamId}
                onChange={handleTeamChange}
                label="Takım Seç"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 400,
                      borderRadius: 12,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                      backgroundColor: '#1e293b',
                      color: '#e2e8f0',
                    },
                  },
                }}
              >
                {/* Önerilen Takımlar Başlığı */}{' '}
                <ListSubheader
                  sx={{
                    background:
                      'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
                    color: '#f1f5f9',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 1.5,
                    fontSize: '0.95rem',
                  }}
                >
                  <Assignment fontSize="small" sx={{ color: '#ffd700' }} />
                  🎯 Önerilen Takımlar
                </ListSubheader>
                {safesugestedTeams.length === 0 ? (
                  <MenuItem
                    disabled
                    sx={{
                      py: 2,
                      color: '#64748b',
                      backgroundColor: '#1e293b',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        color: '#64748b',
                        width: '100%',
                      }}
                    >
                      <Info fontSize="small" />
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight="500"
                          color="#64748b"
                        >
                          Bu rapor için uygun öneri bulunamadı
                        </Typography>
                        <Typography variant="caption" color="#475569">
                          Kategori-uzmanlık eşleşmesi bulunamadı
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ) : (
                  safesugestedTeams.map(team => (
                    <MenuItem
                      key={team.id}
                      value={team.id}
                      sx={{
                        pl: 4,
                        py: 1.5,
                        color: '#e2e8f0',
                        '&:hover': {
                          background:
                            'linear-gradient(135deg, #334155 0%, #475569 50%)',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#3b82f6',
                          color: '#ffffff',
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        width="100%"
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background:
                              'linear-gradient(135deg, #42a5f5 0%, #7e57c2 100%)',
                            color: 'white',
                          }}
                        >
                          <Assignment fontSize="small" />
                        </Box>{' '}
                        <Box flex={1}>
                          <Typography variant="body1" fontWeight="500">
                            {team.name}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            label={getTeamStatusDisplay(team.status).label}
                            size="small"
                            color={getTeamStatusDisplay(team.status).color}
                            variant="outlined"
                          />
                          <Tooltip title="Sistem tarafından önerilen takım">
                            <Chip
                              label="✨ Önerilen"
                              size="small"
                              sx={{
                                background:
                                  'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)',
                                color: 'black',
                                fontWeight: 'bold',
                              }}
                            />
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </MenuItem>
                  ))
                )}
                {/* Diğer Takımlar Başlığı */}{' '}
                <ListSubheader
                  sx={{
                    background:
                      'linear-gradient(135deg, #475569 0%, #334155 100%)',
                    color: '#cbd5e1',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 1.5,
                    fontSize: '0.95rem',
                  }}
                >
                  <Group fontSize="small" />
                  👥 Diğer Takımlar
                </ListSubheader>
                {otherTeams.length === 0 ? (
                  <MenuItem
                    disabled
                    sx={{
                      py: 2,
                      color: '#64748b',
                      backgroundColor: '#1e293b',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        color: '#64748b',
                        width: '100%',
                      }}
                    >
                      <Info fontSize="small" />
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight="500"
                          color="#64748b"
                        >
                          Departmanda başka takım bulunamadı
                        </Typography>
                        <Typography variant="caption" color="#475569">
                          Tüm takımlar zaten önerildi
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ) : (
                  otherTeams.map(team => (
                    <MenuItem
                      key={team.id}
                      value={team.id}
                      sx={{
                        pl: 4,
                        py: 1.5,
                        color: '#e2e8f0',
                        '&:hover': {
                          background:
                            'linear-gradient(135deg, #334155 0%, #475569 100%)',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#3b82f6',
                          color: '#ffffff',
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        width="100%"
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background:
                              'linear-gradient(135deg, #475569 0%, #334155 100%)',
                            color: '#cbd5e1',
                          }}
                        >
                          <Group fontSize="small" />
                        </Box>
                        <Box flex={1}>
                          <Typography
                            variant="body1"
                            fontWeight="500"
                            color="#e2e8f0"
                          >
                            {team.name}
                          </Typography>
                        </Box>
                        <Chip
                          label={getTeamStatusDisplay(team.status).label}
                          size="small"
                          color={getTeamStatusDisplay(team.status).color}
                          variant="outlined"
                        />
                      </Stack>
                    </MenuItem>
                  ))
                )}
              </Select>
            )}
          </FormControl>
        </Box>
        {/* Takım seçimi tamamlandı - artık kullanıcı seçimi yok */}
        {/* No Available Teams Warning */}
        {!isLoadingTeams && allTeams.length === 0 && (
          <Alert
            severity="warning"
            sx={{
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(255, 152, 0, 0.3)',
              backgroundColor: '#92400e',
              color: '#fef3c7',
              '& .MuiAlert-icon': {
                color: '#fbbf24',
              },
            }}
          >
            <Typography variant="body2" color="#fef3c7">
              <strong>Bu departmanda şu anda müsait takım bulunmuyor.</strong>
            </Typography>
            <Typography
              variant="caption"
              color="#fde68a"
              sx={{ mt: 1, display: 'block' }}
            >
              Tüm takımlar görevde, vardiya dışında veya pasif durumda. Lütfen
              daha sonra tekrar deneyin veya sistem yöneticisi ile iletişime
              geçin.
            </Typography>
          </Alert>
        )}{' '}
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 2,
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderTop: '1px solid #475569',
        }}
      >
        <Button
          onClick={handleClose}
          disabled={isAssigning}
          size="large"
          sx={{
            minWidth: 100,
            color: '#94a3b8',
            '&:hover': {
              background: '#334155',
              color: '#e2e8f0',
            },
          }}
        >
          İptal
        </Button>{' '}
        <Button
          onClick={handleAssign}
          disabled={!selectedTeamId || isAssigning || allTeams.length === 0}
          variant="contained"
          size="large"
          sx={{
            minWidth: 140,
            height: 48,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
              boxShadow: '0 6px 20px rgba(59, 130, 246, 0.6)',
              transform: 'translateY(-2px)',
            },
            '&:disabled': {
              background: '#475569',
              color: '#64748b',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {isAssigning ? (
            <Stack direction="row" alignItems="center" spacing={1}>
              <CircularProgress size={20} color="inherit" />
              <span>Atanıyor...</span>
            </Stack>
          ) : (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Assignment />
              <span>Ata</span>
            </Stack>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
