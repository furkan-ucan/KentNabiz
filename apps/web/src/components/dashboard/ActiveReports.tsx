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
import Grid from '@mui/material/Grid';
import { AlertTriangle as ReportIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ReportCard } from './ReportCard';

interface Report {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  category: string;
  location: string;
  createdAt: string;
}

interface ActiveReportsProps {
  reports: Report[];
  loading?: boolean;
  onReportClick?: (report: Report) => void;
}

export const ActiveReports = ({
  reports,
  loading = false,
  onReportClick,
}: ActiveReportsProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleReportClick = (report: Report) => {
    if (onReportClick) {
      onReportClick(report);
    } else {
      navigate(`/reports/${report.id}`);
    }
  };

  const handleViewAllClick = () => {
    navigate('/reports/active');
  };

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
            Tümünü Gör
          </Button>
        </Box>

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {loading
            ? Array.from(new Array(2)).map((_, index) => (
                <Grid size={{ xs: 12 }} key={index}>
                  <Skeleton
                    variant="rectangular"
                    height={140}
                    sx={{ borderRadius: 2 }}
                  />
                </Grid>
              ))
            : reports.slice(0, 2).map(report => (
                <Grid size={{ xs: 12 }} key={report.id}>
                  <ReportCard report={report} onClick={handleReportClick} />
                </Grid>
              ))}
        </Grid>
      </CardContent>
    </Card>
  );
};
