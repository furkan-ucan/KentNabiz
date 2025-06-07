// apps/web/src/pages/DashboardPage.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  alpha,
  useTheme,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Fab,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Report as ReportIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  NotificationsActive as NotificationsIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ReportCard } from '../components/dashboard/ReportCard';

// Report tipini ReportCard'dan alıyoruz
interface Report {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  category: string;
  location: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

// Mock data - gerçek API'den gelecek
const mockStats = {
  totalReports: 142,
  pendingReports: 23,
  resolvedReports: 89,
  myReports: 12,
  newTasks: 7, // Yeni istatistik eklendi
};

const mockRecentReports: Report[] = [
  {
    id: '1',
    title: 'Cadde üzerindeki çukur',
    description: 'Ana cadde üzerinde büyük bir çukur var, araçlar için tehlikeli.',
    status: 'pending' as const,
    category: 'Yol & Ulaşım',
    location: 'Atatürk Caddesi, Merkez',
    createdAt: '2024-01-15T10:30:00Z',
    priority: 'high' as const,
  },
  {
    id: '2',
    title: 'Park aydınlatma sorunu',
    description: 'Merkez parkta lambaların çoğu çalışmıyor.',
    status: 'in-progress' as const,
    category: 'Çevre & Park',
    location: 'Cumhuriyet Parkı',
    createdAt: '2024-01-14T15:20:00Z',
    priority: 'medium' as const,
  },
  {
    id: '3',
    title: 'Çöp toplama eksikliği',
    description: '3 gündür çöpler toplanmıyor, koku oluşmaya başladı.',
    status: 'resolved' as const,
    category: 'Temizlik & Atık',
    location: 'Yenimahalle, 15. Sokak',
    createdAt: '2024-01-13T09:15:00Z',
    priority: 'medium' as const,
  },
];

const mockAnnouncements = [
  {
    id: '1',
    title: 'Planlı su kesintisi',
    description: 'Yarın 09:00-17:00 arası su kesintisi olacaktır.',
    type: 'warning' as const,
    date: '2024-01-16',
  },
  {
    id: '2',
    title: 'Yeni park açılışı',
    description: 'Cumartesi günü yeni çocuk parkımızın açılışını yapacağız.',
    type: 'info' as const,
    date: '2024-01-20',
  },
];

export const DashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const stats = mockStats;
  const recentReports = mockRecentReports; // Bu "Aktif Raporlarım" için kullanılacak
  const announcements = mockAnnouncements;

  useEffect(() => {
    // Simüle loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleReportClick = (report: Report) => {
    navigate(`/reports/${report.id}`);
  };

  const getAnnouncementColor = (type: 'warning' | 'info' | 'success') => {
    switch (type) {
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
        return theme.palette.primary.main;
      case 'success':
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };  return (
    <>

      {/* Stats Grid - CSS Grid ile Eşit Genişlik ve Tutarlı Düzen */}
      <Box
        component="section"
        sx={{
          display: "grid",
          gap: { xs: 2, sm: 3 }, // Responsive gap
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",   // mobilde 2 sütun
            sm: "repeat(3, 1fr)",   // tablet 3 sütun
            md: "repeat(5, 1fr)",   // masaüstü 5 eşit sütun
          },
          mb: { xs: 4, md: 5 },
        }}
      >        {/* Stat Cards - Eşit Genişlik ve Tutarlı İç Düzen */}
        {loading ? (
          // Loading skeletons
          Array.from(new Array(5)).map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              sx={{
                height: 180,
                borderRadius: 3,
                boxShadow: 2
              }}
            />
          ))
        ) : (
          <>
            {/* Stat Card 1: Toplam Rapor */}
            <Card
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                p: { xs: 2.5, md: 3 },
                minHeight: { xs: 160, md: 180 },
                backgroundColor: 'background.paper',
                border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                borderRadius: 3,
                boxShadow: `2px 2px 6px ${alpha("#000", 0.3)}`,
                transition: "all 0.2s ease",
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `4px 4px 12px ${alpha("#000", 0.4)}`,
                },
              }}
            >
              {/* Üst: İkon + Trend */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ReportIcon sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: alpha(theme.palette.success.main, 0.15),
                    color: 'success.main',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                >
                  +12%
                </Typography>
              </Box>

              {/* Alt: Değer + Etiket */}
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography
                  variant="h3"
                  color="primary.main"
                  sx={{
                    fontSize: { xs: '1.8rem', md: '2.2rem' },
                    fontWeight: 700,
                    mb: 0.5,
                  }}
                >
                  {stats.totalReports}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                >
                  Toplam Rapor
                </Typography>
              </Box>
            </Card>

            {/* Stat Card 2: Bekleyen */}
            <Card
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                p: { xs: 2.5, md: 3 },
                minHeight: { xs: 160, md: 180 },
                backgroundColor: 'background.paper',
                border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                borderRadius: 3,
                boxShadow: `2px 2px 6px ${alpha("#000", 0.3)}`,
                transition: "all 0.2s ease",
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `4px 4px 12px ${alpha("#000", 0.4)}`,
                },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.warning.main, 0.1),
                    color: 'warning.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ScheduleIcon sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: alpha(theme.palette.error.main, 0.15),
                    color: 'error.main',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                >
                  -5%
                </Typography>
              </Box>

              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography
                  variant="h3"
                  color="warning.main"
                  sx={{
                    fontSize: { xs: '1.8rem', md: '2.2rem' },
                    fontWeight: 700,
                    mb: 0.5,
                  }}
                >
                  {stats.pendingReports}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                >
                  Bekleyen
                </Typography>
              </Box>
            </Card>

            {/* Stat Card 3: Çözülen */}
            <Card
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                p: { xs: 2.5, md: 3 },
                minHeight: { xs: 160, md: 180 },
                backgroundColor: 'background.paper',
                border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                borderRadius: 3,
                boxShadow: `2px 2px 6px ${alpha("#000", 0.3)}`,
                transition: "all 0.2s ease",
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `4px 4px 12px ${alpha("#000", 0.4)}`,
                },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                    color: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: alpha(theme.palette.success.main, 0.15),
                    color: 'success.main',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                >
                  +18%
                </Typography>
              </Box>

              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography
                  variant="h3"
                  color="success.main"
                  sx={{
                    fontSize: { xs: '1.8rem', md: '2.2rem' },
                    fontWeight: 700,
                    mb: 0.5,
                  }}
                >
                  {stats.resolvedReports}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                >
                  Çözülen
                </Typography>
              </Box>
            </Card>

            {/* Stat Card 4: Raporlarım */}
            <Card
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                p: { xs: 2.5, md: 3 },
                minHeight: { xs: 160, md: 180 },
                backgroundColor: 'background.paper',
                border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                borderRadius: 3,
                boxShadow: `2px 2px 6px ${alpha("#000", 0.3)}`,
                transition: "all 0.2s ease",
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `4px 4px 12px ${alpha("#000", 0.4)}`,
                },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                    color: 'secondary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                </Box>
                {/* Bu kartta trend yok */}
              </Box>

              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography
                  variant="h3"
                  color="secondary.main"
                  sx={{
                    fontSize: { xs: '1.8rem', md: '2.2rem' },
                    fontWeight: 700,
                    mb: 0.5,
                  }}
                >
                  {stats.myReports}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                >
                  Raporlarım
                </Typography>
              </Box>
            </Card>

            {/* Stat Card 5: Yeni Görevler */}
            <Card
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                p: { xs: 2.5, md: 3 },
                minHeight: { xs: 160, md: 180 },
                backgroundColor: 'background.paper',
                border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                borderRadius: 3,
                boxShadow: `2px 2px 6px ${alpha("#000", 0.3)}`,
                transition: "all 0.2s ease",
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `4px 4px 12px ${alpha("#000", 0.4)}`,
                },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.info.main, 0.1),
                    color: 'info.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <NotificationsIcon sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                </Box>
                {/* Bu kartta trend yok */}
              </Box>

              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography
                  variant="h3"
                  color="info.main"
                  sx={{
                    fontSize: { xs: '1.8rem', md: '2.2rem' },
                    fontWeight: 700,
                    mb: 0.5,
                  }}
                >
                  {stats.newTasks}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                >
                  Yeni Görevler
                </Typography>
              </Box>
            </Card>
          </>
        )}
      </Box>

      {/* İkiye Bölünmüş İçerik Alanı */}
      <Grid
        container
        spacing={{ xs: 3, sm: 4, md: 4 }}
        sx={{ alignItems: "stretch", mb: { xs: 4, md: 5 } }}
      >        {/* Sol Sütun: Aktif Raporlarım (Eski Son Raporlar) */}
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            display: "flex",
            flexDirection: "column"
          }}
        >
          <Card
            sx={{
              backgroundColor: 'background.paper', // Mat dark arka plan
              border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`, // İnce border
              borderRadius: 3,
              flex: 1, // Ensure card takes full height of the grid item
              boxShadow: 'none', // Mat görünüm için gölge yok
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  mb: 4,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 2, sm: 0 }
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                  }}
                >
                  <ReportIcon sx={{ color: 'primary.main', fontSize: '1.5rem' }} />
                  Aktif Raporlarım {/* Başlık güncellendi */}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/reports/active')}
                  sx={{
                    color: 'primary.main',
                    fontWeight: 500,
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    px: 2,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      borderColor: 'primary.main',
                    }
                  }}
                >
                  Tümünü Gör
                </Button>
              </Box>

              <Grid container spacing={{ xs: 2, md: 3 }}>
                {loading ? (
                  Array.from(new Array(2)).map((_, index) => (
                    <Grid size={{ xs: 12 }} key={index}>
                      <Skeleton
                        variant="rectangular"
                        height={140}
                        sx={{ borderRadius: 2 }}
                      />
                    </Grid>
                  ))
                ) : (
                  recentReports.slice(0, 2).map((report) => (
                    <Grid size={{ xs: 12 }} key={report.id}>
                      <ReportCard report={report} onClick={handleReportClick} />
                    </Grid>
                  ))
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>        {/* Sağ Sütun: Yakınımdaki Raporlar (Yeni Eklendi) */}
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            display: "flex",
            flexDirection: "column"
          }}
        >
          <Card
            sx={{
              backgroundColor: 'background.paper', // Mat dark arka plan
              border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`, // İnce border
              borderRadius: 3,
              flex: 1, // Ensure card takes full height of the grid item
              boxShadow: 'none', // Mat görünüm için gölge yok
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  mb: 4,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 2, sm: 0 }
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                  }}
                >
                  <TrendingUpIcon sx={{ color: 'primary.main', fontSize: '1.5rem' }} />
                  Yakınımdaki Raporlar
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/reports/nearby')}
                  sx={{
                    color: 'primary.main',
                    fontWeight: 500,
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    px: 2,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      borderColor: 'primary.main',
                    }
                  }}
                >
                  Haritada Gör
                </Button>
              </Box>

              {loading ? (
                Array.from(new Array(2)).map((_, index) => (
                  <Grid size={{ xs: 12 }} key={`nearby-skeleton-${index}`}>
                    <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2, mb:2 }}/>
                  </Grid>
                ))
              ) : (
                <Typography color="text.secondary">
                  Yakınınızdaki raporları görmek için konum izniniz gereklidir. (Bu bölüm geliştirilecektir)
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Duyurular Bölümü - En Alta Taşındı */}
      <Grid
        container
        spacing={{ xs: 3, sm: 4, md: 4 }}
        sx={{ alignItems: "stretch" }} // Bu satırın mb: { xs: 4, md: 5 } gibi bir alt boşluğu olmamalı, en altta.
      >
        <Grid
          size={{ xs: 12 }}
          sx={{
            display: "flex",
            flexDirection: "column"
          }}
        >          <Card
            sx={{
              backgroundColor: 'background.paper', // Mat dark arka plan
              border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`, // İnce border
              borderRadius: 3,
              flex: 1,
              boxShadow: `2px 2px 6px ${alpha("#000", 0.3)}`, // Soft shadow
              transition: "transform .1s ease, box-shadow .1s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: `3px 3px 8px ${alpha("#000", 0.4)}`,
              },
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                }}
              >
                <NotificationsIcon sx={{ color: 'secondary.main' }} />
                Duyurular
              </Typography>
              {loading ? (
                // ...existing skeleton...
                Array.from(new Array(2)).map((_, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="60%" />
                  </Box>
                ))
              ) : (
                <List disablePadding>
                  {announcements.map((announcement, index) => (
                    <ListItem
                      key={announcement.id}
                      disablePadding                      sx={{
                        mb: index < announcements.length - 1 ? 3 : 0,
                        p: { xs: 2.5, md: 3 },
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.background.paper, 0.7),
                        border: `1px solid ${alpha(theme.palette.text.primary, 0.05)}`,
                        boxShadow: `1px 1px 3px ${alpha("#000", 0.2)}`, // Soft inner shadow
                        transition: 'transform .2s ease, box-shadow .2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `2px 2px 6px ${alpha("#000", 0.3)}`,
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: getAnnouncementColor(announcement.type),
                          }}
                        />
                      </ListItemIcon>                      <ListItemText
                        primary={
                          <Typography
                            component="div"
                            variant="subtitle2"
                            sx={{ fontWeight: 600, mb: 1 }}
                          >
                            {announcement.title}
                          </Typography>
                        }
                        secondary={
                          <Box component="div">
                            <Typography
                              component="div"
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1.5, lineHeight: 1.6 }}
                            >
                              {announcement.description}
                            </Typography>
                            <Chip
                              label={announcement.date}
                              size="small"
                              sx={{
                                fontSize: '0.7rem',
                                height: 20,
                                backgroundColor: alpha(getAnnouncementColor(announcement.type), 0.1),
                                color: getAnnouncementColor(announcement.type),
                              }}
                            />
                          </Box>
                        }
                      />                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>          </Card>
        </Grid>
      </Grid>

      {/* Floating Action Button - Yeni Rapor */}
      <Fab
        color="primary"
        aria-label="Yeni Rapor Oluştur"
        onClick={() => navigate('/reports/new')}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, md: 24 },
          right: { xs: 16, md: 24 },
          zIndex: 1000,
          boxShadow: `4px 4px 12px ${alpha('#000', 0.7)}`,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `6px 6px 16px ${alpha('#000', 0.8)}`,
          },
        }}
      >
        <AddIcon />
      </Fab>
    </>
  );
};

export default DashboardPage;
