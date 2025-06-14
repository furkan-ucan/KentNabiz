// apps/web/src/components/dashboard/ActiveReports.tsx
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  alpha,
  useTheme,
  Skeleton,
} from '@mui/material';
import { AlertTriangle as ReportIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ReportCard } from './ReportCard';
import { useMyActiveReports } from '@/hooks/useMyReports';
import { SharedReport } from '@kentnabiz/shared';

interface ActiveReportsProps {
  // Props'ları optional yapıyoruz çünkü artık veriyi hook'tan alacağız
  reports?: SharedReport[];
  loading?: boolean;
  onReportClick?: (report: SharedReport) => void;
}

export const ActiveReports = ({
  reports: propReports,
  loading: propLoading = false,
  onReportClick,
}: ActiveReportsProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // API'den aktif raporları çek (tüm aktif raporları al ki toplam sayıyı bilelim)
  const {
    data: activeReportsData,
    isLoading: apiLoading,
    error,
  } = useMyActiveReports(50); // Yeterli sayıda al

  // Prop'lardan gelen veriler varsa onları kullan, yoksa API'den gelen verileri kullan
  const allReports =
    propReports || (activeReportsData ? activeReportsData.data : []);
  const reports = allReports.slice(0, 2); // Sadece ilk 2'sini göster
  const totalActiveReports = allReports.length;
  const remainingReports = Math.max(0, totalActiveReports - 2); // Geri kalan rapor sayısı
  const loading = propLoading || apiLoading;

  const handleReportClick = (report: SharedReport) => {
    if (onReportClick) {
      onReportClick(report);
    } else {
      navigate(`/dashboard/reports/${report.id}`);
    }
  };

  const handleViewAllClick = () => {
    navigate('/dashboard/reports?status=OPEN');
  };

  // Hata durumunda mesaj göster
  if (error && !propReports) {
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
            Raporlarınız yüklenirken bir hata oluştu.
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
              gap: 1.5,
              fontSize: { xs: '1.1rem', md: '1.25rem' },
            }}
          >
            <ReportIcon size={24} color={theme.palette.primary.main} />
            Aktif Raporlarım
            {!loading && totalActiveReports > 0 && (
              <Box
                component="span"
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                {totalActiveReports}
              </Box>
            )}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleViewAllClick}
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
            {remainingReports > 0
              ? `Tümünü Gör (+${remainingReports})`
              : 'Tümünü Gör'}
          </Button>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 2, md: 3 },
          }}
        >
          {loading ? (
            Array.from(new Array(2)).map((_, index) => (
              <Box key={index}>
                <Skeleton
                  variant="rectangular"
                  height={140}
                  sx={{ borderRadius: 2 }}
                />
              </Box>
            ))
          ) : reports.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Henüz aktif raporunuz bulunmuyor
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Yeni bir rapor oluşturmak için + butonunu kullanabilirsiniz
              </Typography>
            </Box>
          ) : (
            <>
              {reports.map(report => (
                <Box key={report.id}>
                  <ReportCard report={report} onClick={handleReportClick} />
                </Box>
              ))}
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
