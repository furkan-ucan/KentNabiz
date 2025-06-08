import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  alpha,
  useTheme,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  SwapHoriz as SwapHorizIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
} from '@mui/x-data-grid';
import { ReportStatus } from '@kentnabiz/shared';
import type { SharedReport } from '@kentnabiz/shared';

interface SupervisorReportTableProps {
  reports: SharedReport[];
  rowCount: number;
  isLoading: boolean;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  onRowClick?: (report: SharedReport) => void;
  onViewDetails?: (reportId: number) => void;
  onAssignToTeam?: (reportId: number) => void;
  onTransferDepartment?: (reportId: number) => void;
  onViewHistory?: (reportId: number) => void;
}

// Status konfigürasyonu - Türkçe etiketler ve renkler
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
  [ReportStatus.IN_PROGRESS]: { label: 'Sahada', color: 'warning' },
  [ReportStatus.DONE]: { label: 'Çözüldü', color: 'success' },
  [ReportStatus.REJECTED]: { label: 'Reddedildi', color: 'error' },
  [ReportStatus.CANCELLED]: { label: 'İptal Edildi', color: 'default' },
};

export const SupervisorReportTable: React.FC<SupervisorReportTableProps> = ({
  reports,
  rowCount,
  isLoading,
  paginationModel,
  onPaginationModelChange,
  onRowClick,
  onViewDetails,
  onAssignToTeam,
  onTransferDepartment,
  onViewHistory,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

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
  const columns: GridColDef[] = [
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams<SharedReport>) => (
        <IconButton
          size="small"
          onClick={event => {
            event.stopPropagation(); // Satır tıklamasını engelle
            handleMenuOpen(event, params.row.id);
          }}
          aria-label="Aksiyon menüsü"
        >
          <MoreVertIcon />
        </IconButton>
      ),
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
            label={config?.label || params.row.status} // Fallback to status if config not found
            color={config?.color || 'default'}
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
      valueGetter: (_value: unknown, row: SharedReport) => {
        // String'i Date objesine çevir
        const dateValue = row.createdAt;
        if (!dateValue) return null;
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? null : date;
      },
      renderCell: (params: GridRenderCellParams<SharedReport>) => {
        const date = new Date(params.row.createdAt);
        const isValidDate = !isNaN(date.getTime());

        return (
          <Typography variant="body2">
            {isValidDate
              ? date.toLocaleDateString('tr-TR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              : 'Bilinmiyor'}
          </Typography>
        );
      },
    },
  ];

  return (
    <>
      {' '}
      <DataGrid
        rows={reports || []}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        rowCount={rowCount || 0}
        loading={isLoading}
        paginationMode="server"
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        autoHeight
        onRowClick={params => {
          if (onRowClick) {
            onRowClick(params.row);
          }
        }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
            '&:nth-of-type(even)': {
              backgroundColor: alpha(theme.palette.grey[50], 0.3),
            },
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: alpha(theme.palette.grey[100], 0.8),
            borderBottom: `2px solid ${alpha(theme.palette.divider, 0.12)}`,
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            backgroundColor: alpha(theme.palette.grey[50], 0.3),
          },
        }}
        slots={{
          loadingOverlay: () => (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="200px"
              flexDirection="column"
            >
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Raporlar yükleniyor...
              </Typography>
            </Box>
          ),
          noRowsOverlay: () => (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="200px"
              flexDirection="column"
            >
              <ErrorIcon
                sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}
              />
              <Typography color="text.secondary" variant="h6">
                Filtrelere uygun rapor bulunamadı veya henüz rapor yok.
              </Typography>
            </Box>
          ),
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 200 },
        }}
      >
        {' '}
        <MenuItem
          onClick={() => {
            if (selectedReportId && onViewDetails) {
              onViewDetails(selectedReportId);
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Detayları Görüntüle" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedReportId && onAssignToTeam) {
              onAssignToTeam(selectedReportId);
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <AssignmentIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Ekibe/Kişiye Ata" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedReportId && onTransferDepartment) {
              onTransferDepartment(selectedReportId);
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <SwapHorizIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Departmana Yönlendir" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedReportId && onViewHistory) {
              onViewHistory(selectedReportId);
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Geçmişi Görüntüle" />
        </MenuItem>
      </Menu>
    </>
  );
};
