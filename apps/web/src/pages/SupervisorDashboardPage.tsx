import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Grid,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
} from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import {
  useSupervisorReports,
  useSupervisorStats,
} from '../hooks/useSupervisorReports';
import { ReportStatus } from '@kentnabiz/shared';
import type { SharedReport } from '@kentnabiz/shared';

// Status mapping for Turkish labels and colors
const statusConfig: Record<
  ReportStatus,
  {
    label: string;
    color:
      | 'default'
      | 'primary'
      | 'secondary'
      | 'error'
      | 'info'
      | 'success'
      | 'warning';
  }
> = {
  [ReportStatus.OPEN]: { label: 'Yeni Gelen', color: 'primary' },
  [ReportStatus.IN_REVIEW]: { label: 'İnceleniyor', color: 'info' },
  [ReportStatus.IN_PROGRESS]: { label: 'Sahadaki Görev', color: 'warning' },
  [ReportStatus.DONE]: { label: 'Tamamlandı', color: 'success' },
  [ReportStatus.REJECTED]: { label: 'Reddedildi', color: 'error' },
  [ReportStatus.CANCELLED]: { label: 'İptal Edildi', color: 'error' },
};

interface KPICardProps {
  title: string;
  value: number | string;
  description: string;
  color: string;
  onClick?: () => void;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  description,
  color,
  onClick,
}) => (
  <Card elevation={2} sx={{ height: '100%' }}>
    <CardActionArea onClick={onClick} disabled={!onClick}>
      <CardContent>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography
          variant="h3"
          component="div"
          color={color}
          fontWeight="bold"
        >
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </CardActionArea>
  </Card>
);

export const SupervisorDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Local state for filters and pagination
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  // API calls
  const {
    data: reportsData,
    isLoading: reportsLoading,
    isError: reportsError,
    error: reportsErrorDetail,
    refetch: refetchReports,
  } = useSupervisorReports({
    page: paginationModel.page + 1, // API 1-based, DataGrid 0-based
    limit: paginationModel.pageSize,
    status: filterStatus === 'ALL' ? undefined : filterStatus,
    search: searchQuery || undefined,
  });

  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useSupervisorStats();

  // Handle pagination change
  const handlePaginationModelChange = (newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
  };

  // Handle KPI card clicks for filtering
  const handleKPICardClick = (status: ReportStatus) => {
    setFilterStatus(status);
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  // Handle refresh
  const handleRefresh = () => {
    refetchReports();
    refetchStats();
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilterStatus('ALL');
    setSearchQuery('');
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  // Menu handlers
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    reportId: number
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedReportId(reportId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReportId(null);
  };

  const handleViewDetails = () => {
    if (selectedReportId) {
      navigate(`/reports/${selectedReportId}`);
    }
    handleMenuClose();
  };

  const handleAssignToTeam = () => {
    // TODO: Ekipe atama modalı açılacak
    console.log('Assign to team:', selectedReportId);
    handleMenuClose();
  };

  const handleViewHistory = () => {
    // TODO: Geçmiş modalı açılacak
    console.log('View history:', selectedReportId);
    handleMenuClose();
  };

  const handleTransferDepartment = () => {
    // TODO: Departman transfer modalı açılacak
    console.log('Transfer department:', selectedReportId);
    handleMenuClose();
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      type: 'number',
    },
    {
      field: 'title',
      headerName: 'Başlık',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<SharedReport>) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.address}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Durum',
      width: 150,
      renderCell: (params: GridRenderCellParams<SharedReport>) => {
        const config = statusConfig[params.row.status];
        return (
          <Chip
            label={config.label}
            color={config.color}
            size="small"
            variant="filled"
          />
        );
      },
    },
    {
      field: 'assignedToEmployee',
      headerName: 'Atanan',
      width: 150,
      renderCell: (params: GridRenderCellParams<SharedReport>) => (
        <Typography variant="body2">
          {params.row.assignedToEmployee?.fullName || 'Atanmadı'}
        </Typography>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Oluşturulma',
      width: 140,
      type: 'dateTime',
      valueGetter: ({ value }: { value: string }) => new Date(value),
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {new Date(params.value as Date).toLocaleDateString('tr-TR')}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams<SharedReport>) => (
        <IconButton
          size="small"
          onClick={event => handleMenuOpen(event, params.row.id)}
          aria-label="Aksiyon menüsü"
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box p={3}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Departman Yönetim Paneli
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={reportsLoading || statsLoading}
        >
          Yenile
        </Button>
      </Box>{' '}
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Yeni Gelen Rapor"
            value={statsData?.pending || 0}
            description="Onay bekleyen yeni raporlar"
            color="primary.main"
            onClick={() => handleKPICardClick(ReportStatus.OPEN)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Sahadaki Aktif Görev"
            value={statsData?.inProgress || 0}
            description="Sahada devam eden işler"
            color="warning.main"
            onClick={() => handleKPICardClick(ReportStatus.IN_PROGRESS)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Onay Bekleyen"
            value={statsData?.resolved || 0}
            description="Tamamlandı, onay bekliyor"
            color="success.main"
            onClick={() => handleKPICardClick(ReportStatus.DONE)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Ortalama Çözüm"
            value={
              statsData?.averageResolutionTime
                ? `${statsData?.averageResolutionTime.toFixed(1)} Gün`
                : 'Hesaplanıyor'
            }
            description="Son 30 günün ortalaması"
            color="info.main"
          />
        </Grid>
      </Grid>
      {/* Filters */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="center"
        >
          <TextField
            placeholder="Rapor başlığı veya adresinde ara..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
            size="small"
          />

          <Select
            value={filterStatus}
            onChange={e =>
              setFilterStatus(e.target.value as ReportStatus | 'ALL')
            }
            size="small"
            startAdornment={<FilterIcon sx={{ mr: 1 }} />}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="ALL">Tüm Durumlar</MenuItem>
            {Object.entries(statusConfig).map(([status, config]) => (
              <MenuItem key={status} value={status}>
                {config.label}
              </MenuItem>
            ))}
          </Select>

          <Button variant="outlined" onClick={handleClearFilters} size="small">
            Filtreleri Temizle
          </Button>
        </Stack>
      </Paper>
      {/* Error handling */}
      {reportsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Raporlar yüklenirken hata oluştu: {reportsErrorDetail?.message}
          <Button onClick={handleRefresh} size="small" sx={{ ml: 1 }}>
            Tekrar Dene
          </Button>
        </Alert>
      )}
      {/* Data Table */}
      <Paper elevation={1}>
        <DataGrid
          rows={reportsData?.data || []}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          rowCount={reportsData?.meta.total || 0}
          loading={reportsLoading}
          paginationMode="server"
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
          }}
          slots={{
            loadingOverlay: () => (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="200px"
              >
                <CircularProgress />
              </Box>
            ),
            noRowsOverlay: () => (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="200px"
              >
                <Typography color="text.secondary">
                  {filterStatus !== 'ALL' || searchQuery
                    ? 'Filtrelere uygun rapor bulunamadı'
                    : 'Henüz rapor bulunmuyor'}
                </Typography>
              </Box>
            ),
          }}
        />
      </Paper>
      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 200 },
        }}
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Detayları Görüntüle" />
        </MenuItem>
        <MenuItem onClick={handleAssignToTeam}>
          <ListItemIcon>
            <AssignmentIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Ekibe/Kişiye Ata" />
        </MenuItem>
        <MenuItem onClick={handleTransferDepartment}>
          <ListItemIcon>
            <SwapHorizIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Departmana Yönlendir" />
        </MenuItem>
        <MenuItem onClick={handleViewHistory}>
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Geçmişi Görüntüle" />
        </MenuItem>
      </Menu>
    </Box>
  );
};
