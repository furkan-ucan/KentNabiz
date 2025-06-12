// apps/web/src/pages/MyReportsPage.tsx
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Alert,
  Skeleton,
  Pagination,
  useTheme,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { useMyReports } from '@/hooks/useMyReports';
import { ReportCard } from '@/components/dashboard/ReportCard';
import { ReportStatus, SharedReport } from '@kentnabiz/shared';

// Status seçenekleri
const statusOptions = [
  { value: '', label: 'Tümü' },
  { value: ReportStatus.OPEN, label: 'Açık' },
  { value: ReportStatus.IN_PROGRESS, label: 'İşlemde' },
  { value: ReportStatus.IN_REVIEW, label: 'İncelemede' },
  { value: ReportStatus.DONE, label: 'Tamamlandı' },
  { value: ReportStatus.REJECTED, label: 'Reddedildi' },
];

// Status renklerini döndüren helper
const getStatusColor = (status: ReportStatus) => {
  switch (status) {
    case ReportStatus.OPEN:
      return 'warning';
    case ReportStatus.IN_PROGRESS:
      return 'info';
    case ReportStatus.IN_REVIEW:
      return 'secondary';
    case ReportStatus.DONE:
      return 'success';
    case ReportStatus.REJECTED:
      return 'error';
    default:
      return 'default';
  }
};

export const MyReportsPage: React.FC = () => {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  // URL'den parametreleri al
  const statusFilter = searchParams.get('status') || '';
  const searchQuery = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');

  // Local state
  const [searchInput, setSearchInput] = useState(searchQuery);

  // API'den raporları getir
  const {
    data: reportsData,
    isLoading,
    error,
  } = useMyReports({
    status: statusFilter as ReportStatus,
    page: currentPage,
    limit: 12, // Sayfa başına 12 rapor
  });

  const reports = reportsData?.data || [];
  const totalPages = reportsData ? Math.ceil(reportsData.total / 12) : 0;

  // Filter değişiklikleri
  const handleStatusChange = (status: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (status) {
      newParams.set('status', status);
    } else {
      newParams.delete('status');
    }
    newParams.set('page', '1'); // Sayfa 1'e reset
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set('search', searchInput.trim());
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1'); // Sayfa 1'e reset
    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };
  const handleReportClick = (report: SharedReport) => {
    window.location.href = `/dashboard/reports/${report.id}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Başlık */}
      <Box sx={{ mb: 4 }}>
        {' '}
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            fontDisplay: 'swap',
          }}
        >
          Raporlarım
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gönderdiğiniz tüm raporları görüntüleyin ve durumlarını takip edin
        </Typography>
      </Box>

      {/* Filtreler */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Filtreler
            </Typography>
          </Box>{' '}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
              alignItems: 'center',
            }}
          >
            {/* Status Filtresi */}
            <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
              <FormControl fullWidth size="small">
                <InputLabel>Durum</InputLabel>
                <Select
                  value={statusFilter}
                  label="Durum"
                  onChange={e => handleStatusChange(e.target.value)}
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Arama */}
            <Box sx={{ minWidth: 300, flex: '2 1 300px' }}>
              <form onSubmit={handleSearchSubmit}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Rapor başlığı veya açıklama ara..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </form>
            </Box>

            {/* Aktif Filtreler */}
            <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {statusFilter && (
                  <Chip
                    label={
                      statusOptions.find(s => s.value === statusFilter)?.label
                    }
                    color={getStatusColor(statusFilter)}
                    size="small"
                    onDelete={() => handleStatusChange('')}
                  />
                )}
                {searchQuery && (
                  <Chip
                    label={`Arama: ${searchQuery}`}
                    size="small"
                    onDelete={() => {
                      setSearchInput('');
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('search');
                      setSearchParams(newParams);
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Rapor Listesi */}
      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          Raporlar yüklenirken hata oluştu: {error.message}
        </Alert>
      ) : isLoading ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 3,
          }}
        >
          {Array.from(new Array(6)).map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              height={200}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Box>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Rapor bulunamadı
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bu kriterlere uygun rapor bulunmuyor. Filtreleri değiştirmeyi
                deneyin.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Sonuç Sayısı */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Toplam {reportsData?.total || 0} rapor bulundu
            </Typography>
          </Box>{' '}
          {/* Rapor Grid */}
          <Grid container spacing={3}>
            {reports.map(report => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={report.id}>
                <ReportCard report={report} onClick={handleReportClick} />
              </Grid>
            ))}
          </Grid>
          {/* Sayfalama */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => handlePageChange(page)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};
