// apps/web/src/components/dashboard/NearbyReports.tsx

import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  alpha,
  useTheme,
  Skeleton,
  IconButton,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { TrendingUp as TrendingUpIcon, ThumbsUp, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ReportCard } from './ReportCard';
import { useMyLocationNearbyReports } from '@/hooks/useNearbyReports';
import { useReportSupport } from '@/hooks/useReportSupport';
import { isAuthenticated } from '@/utils/auth';
import { SharedReport, ReportStatus } from '@kentnabiz/shared';

interface NearbyReportsProps {
  loading?: boolean;
  radius?: number; // metre cinsinden
}

export const NearbyReports = ({
  loading: propLoading = false,
  radius = 2000,
}: NearbyReportsProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const userIsAuthenticated = isAuthenticated();

  // API'den yakındaki raporları çek
  const {
    data: nearbyReportsData,
    isLoading: apiLoading,
    error,
    locationError,
    isLocationLoading,
  } = useMyLocationNearbyReports({
    radius,
    limit: 2, // Dashboard'da sadece 2 rapor gösterelim
    status: [
      ReportStatus.OPEN,
      ReportStatus.IN_PROGRESS,
      ReportStatus.IN_REVIEW,
    ], // Sadece aktif raporlar
  });

  // Destek verme hook'u - sadece login olan kullanıcılar için
  const {
    supportReport,
    unsupportReport,
    isLoading: isSupportLoading,
  } = useReportSupport();

  // Loading state'leri birleştir
  const loading = propLoading || apiLoading || isLocationLoading;

  // API'den gelen verileri güvenli şekilde işle
  let reports: SharedReport[] = [];

  if (nearbyReportsData) {
    try {
      // Console log'dan gördüğümüz yapıya göre: data.data array'i olması gerekiyor
      let dataArray: unknown[] = [];

      if (nearbyReportsData.data) {
        // Eğer nearbyReportsData.data bir array ise
        if (Array.isArray(nearbyReportsData.data)) {
          dataArray = nearbyReportsData.data;
        }
        // Eğer nearbyReportsData.data bir obje ise ve içinde data array'i varsa
        else if (
          typeof nearbyReportsData.data === 'object' &&
          nearbyReportsData.data !== null
        ) {
          const nestedData = (nearbyReportsData.data as { data?: unknown[] })
            .data;
          if (Array.isArray(nestedData)) {
            dataArray = nestedData;
          }
        }
      }

      reports = dataArray as SharedReport[];
    } catch (error) {
      console.error('Error converting reports:', error);
    }
  }

  const handleReportClick = (report: SharedReport) => {
    navigate(`/reports/${report.id}`);
  };

  const handleSupportClick = (
    report: SharedReport,
    event: React.MouseEvent
  ) => {
    event.stopPropagation(); // Kart tıklamasını engellemek için

    // Authentication kontrolü
    if (!userIsAuthenticated) {
      console.warn('User not authenticated - cannot support report');
      return;
    }

    // Destek durumuna göre farklı işlemler yap
    if (report.isSupportedByCurrentUser) {
      // Desteği kaldır
      unsupportReport({ reportId: report.id });
    } else {
      // Destek ver
      supportReport({ reportId: report.id });
    }
  };

  // Konum hatası varsa
  if (locationError && !propLoading) {
    return (
      <Card
        sx={{
          backgroundColor: 'background.paper',
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
          borderRadius: 3,
          flex: 1,
          boxShadow: 'none',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <MapPin size={24} color={theme.palette.error.main} />
            <Typography variant="h6" color="error.main">
              Konum Hatası
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {locationError}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Yakındaki raporları görmek için konum izni gereklidir.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // API hatası varsa
  if (error && !propLoading) {
    return (
      <Card
        sx={{
          backgroundColor: 'background.paper',
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
          borderRadius: 3,
          flex: 1,
          boxShadow: 'none',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography color="error.main" textAlign="center">
            Yakındaki raporlar yüklenirken bir hata oluştu.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        backgroundColor: 'background.paper',
        border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
        borderRadius: 3,
        flex: 1,
        boxShadow: 'none',
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
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: '1.1rem', md: '1.25rem' },
            }}
          >
            <TrendingUpIcon size={24} color={theme.palette.primary.main} />
            Yakınımdaki Raporlar
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              navigate('/reports/nearby');
            }}
            sx={{
              color: 'primary.main',
              fontWeight: 500,
              borderColor: alpha(theme.palette.primary.main, 0.3),
              px: 2,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                borderColor: 'primary.main',
              },
            }}
          >
            Haritada Gör
          </Button>
        </Box>

        {/* İSTEDİĞİNİZ KULLANIM İLE GRID ARTIK DOĞRU ÇALIŞACAK */}
        <Grid container spacing={2}>
          {loading ? (
            Array.from(new Array(2)).map((_, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={`nearby-skeleton-${index}`}>
                <Skeleton
                  variant="rectangular"
                  height={180}
                  sx={{ borderRadius: 3 }}
                />
              </Grid>
            ))
          ) : reports.length > 0 ? (
            reports.map(report => (
              <Grid size={{ xs: 12, md: 6 }} key={report.id}>
                <Box>
                  <ReportCard report={report} onClick={handleReportClick} />
                  {/* Destek Butonu - Sadece giriş yapmış kullanıcılar için */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mt: 1,
                      px: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {/* Mock destek sayısı - gerçek API implement edildiğinde değiştirilecek */}
                      {Math.floor(Math.random() * 15) + 1} kişi destekledi
                    </Typography>
                    <Tooltip
                      title={
                        !userIsAuthenticated
                          ? 'Bu özelliği kullanmak için giriş yapın'
                          : report.isSupportedByCurrentUser
                            ? 'Desteği kaldır'
                            : 'Bu rapora destek ver'
                      }
                    >
                      <IconButton
                        size="small"
                        onClick={event => handleSupportClick(report, event)}
                        disabled={!userIsAuthenticated || isSupportLoading}
                        sx={{
                          color: report.isSupportedByCurrentUser
                            ? theme.palette.primary.main
                            : theme.palette.text.secondary,
                          backgroundColor: report.isSupportedByCurrentUser
                            ? alpha(theme.palette.primary.main, 0.1)
                            : 'transparent',
                          '&:hover': {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.15
                            ),
                            color: theme.palette.primary.main,
                          },
                          '&:disabled': {
                            opacity: 0.6,
                          },
                        }}
                      >
                        <ThumbsUp size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Grid>
            ))
          ) : (
            <Grid size={12}>
              <Box
                sx={{
                  textAlign: 'center',
                  py: 4,
                  color: 'text.secondary',
                }}
              >
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Yakınınızda henüz rapor bulunmuyor
                </Typography>
                <Typography variant="body2">
                  {radius}m yarıçapında aktif rapor bulunamadı
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};
