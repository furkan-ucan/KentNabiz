import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  alpha,
  useTheme,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Paper,
  Divider,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  SwapHoriz as SwapHorizIcon,
  ErrorOutline as ErrorIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
} from '@mui/x-data-grid';
import { ReportStatus } from '@kentnabiz/shared';
import type { SharedReport } from '@kentnabiz/shared';

interface StatusConfig {
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

interface SupervisorReportsSectionProps {
  reports: SharedReport[];
  rowCount: number;
  isLoading: boolean;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  statusConfig: Record<ReportStatus, StatusConfig>;
  onViewDetails: (id: number) => void;
  onAssignToTeam: (id: number) => void;
  onViewHistory: (id: number) => void;
  onTransferDepartment: (id: number) => void;
  filterStatus: ReportStatus | 'ALL';
  setFilterStatus: (status: ReportStatus | 'ALL') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onClearFilters: () => void;
}

export const SupervisorReportsSection: React.FC<
  SupervisorReportsSectionProps
> = ({
  reports,
  rowCount,
  isLoading,
  paginationModel,
  onPaginationModelChange,
  statusConfig,
  onViewDetails,
  onAssignToTeam,
  onViewHistory,
  onTransferDepartment,
  filterStatus,
  setFilterStatus,
  searchQuery,
  setSearchQuery,
  onClearFilters,
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

  const hasActiveFilters = filterStatus !== 'ALL' || searchQuery;

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="medium" color="primary">
          #{params.value}
        </Typography>
      ),
    },
    {
      field: 'title',
      headerName: 'Rapor Detayları',
      flex: 2,
      minWidth: 280,
      renderCell: (params: GridRenderCellParams<SharedReport>) => (
        <Box sx={{ py: 1 }}>
          <Typography
            variant="body2"
            fontWeight="medium"
            sx={{
              mb: 0.5,
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {params.row.title}
          </Typography>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}
          >
            <LocationIcon
              sx={{
                fontSize: 14,
                color: 'text.secondary',
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {params.row.address}
            </Typography>
          </Box>
          {params.row.description && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {params.row.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Durum',
      width: 140,
      renderCell: (params: GridRenderCellParams<SharedReport>) => {
        const config = statusConfig[params.row.status];
        return (
          <Chip
            label={config?.label || params.row.status}
            color={config?.color || 'default'}
            size="small"
            variant="filled"
            sx={{
              fontWeight: 'medium',
              fontSize: '0.75rem',
            }}
          />
        );
      },
    },
    {
      field: 'assignedToEmployee',
      headerName: 'Atanan Kişi',
      width: 160,
      renderCell: (params: GridRenderCellParams<SharedReport>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography
            variant="body2"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {params.row.assignedToEmployee?.fullName || 'Atanmadı'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Oluşturulma',
      width: 140,
      type: 'dateTime',
      valueGetter: ({ value }: { value: string }) => new Date(value),
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <ScheduleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Box>
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              {new Date(params.value as Date).toLocaleDateString('tr-TR')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(params.value as Date).toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<SharedReport>) => (
        <IconButton
          size="small"
          onClick={event => handleMenuOpen(event, params.row.id)}
          aria-label="Aksiyon menüsü"
          sx={{
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Header with Title and Filter Controls */}
      <Box
        sx={{ p: 3, backgroundColor: alpha(theme.palette.primary.main, 0.02) }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          {' '}
          <Box>
            <Typography
              variant="h5"
              fontWeight="700"
              sx={{
                mb: 0.5,
                color: 'text.primary',
                letterSpacing: '-0.02em',
              }}
            >
              Rapor Yönetim Merkezi
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 500,
              }}
            >
              Departmanınıza ait raporları görüntüleyin, filtreleyin ve yönetin
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              label={`Toplam ${rowCount} rapor`}
              size="medium"
              color="primary"
              variant="filled"
              sx={{
                fontWeight: 600,
                px: 1,
              }}
            />
            {hasActiveFilters && (
              <Tooltip title="Tüm filtreleri temizle" arrow>
                <Button
                  size="small"
                  onClick={onClearFilters}
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 1.5,
                  }}
                >
                  Temizle
                </Button>
              </Tooltip>
            )}
          </Box>
        </Box>{' '}
        {/* Filter Controls */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            backgroundColor: 'background.paper',
            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            borderRadius: 2,
            boxShadow: theme.shadows[2],
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
            <FilterIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 20 }} />
            <Typography variant="h6" fontWeight="600" color="text.primary">
              Filtreleme ve Arama
            </Typography>
          </Box>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            alignItems="stretch"
          >
            <TextField
              placeholder="Rapor başlığı, açıklama veya adresinde ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchQuery('')}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                          color: 'error.main',
                        },
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: alpha(theme.palette.grey[50], 0.5),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.grey[50], 0.8),
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'background.paper',
                  },
                },
              }}
              size="medium"
              variant="outlined"
            />{' '}
            <FormControl size="medium" sx={{ minWidth: 240 }}>
              <InputLabel sx={{ fontWeight: 500 }}>Durum Filtresi</InputLabel>
              <Select
                value={filterStatus}
                onChange={e =>
                  setFilterStatus(e.target.value as ReportStatus | 'ALL')
                }
                label="Durum Filtresi"
                sx={{
                  backgroundColor: alpha(theme.palette.grey[50], 0.5),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.grey[50], 0.8),
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'background.paper',
                  },
                }}
              >
                {/* ALL: Tüm durumları göster */}
                <MenuItem value="ALL">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                      size="small"
                      label="Tümü"
                      color="default"
                      sx={{
                        mr: 1.5,
                        fontWeight: 500,
                      }}
                    />
                    <Typography variant="body2" fontWeight="500">
                      Tüm Durumlar
                    </Typography>
                  </Box>
                </MenuItem>
                {/* Gerçek ReportStatus değerleri */}
                {Object.entries(statusConfig).map(([status, config]) => (
                  <MenuItem key={status} value={status}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip
                        size="small"
                        label={config.label}
                        color={config.color}
                        sx={{
                          mr: 1.5,
                          fontWeight: 500,
                        }}
                      />
                      <Typography variant="body2" fontWeight="500">
                        {config.label}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>{' '}
          {/* Active Filters Display */}
          {hasActiveFilters && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Typography
                  variant="subtitle2"
                  color="text.primary"
                  sx={{
                    fontWeight: 600,
                    mr: 1,
                  }}
                >
                  Aktif Filtreler:
                </Typography>
                <Button
                  size="small"
                  onClick={onClearFilters}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    minWidth: 'auto',
                    px: 1,
                    py: 0.5,
                  }}
                  color="primary"
                >
                  Tümünü Temizle
                </Button>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {filterStatus !== 'ALL' && (
                  <Chip
                    label={`Durum: ${statusConfig[filterStatus]?.label}`}
                    color={statusConfig[filterStatus]?.color}
                    size="medium"
                    onDelete={() => setFilterStatus('ALL')}
                    deleteIcon={<ClearIcon />}
                    sx={{
                      fontWeight: 500,
                      '& .MuiChip-deleteIcon': {
                        fontSize: 16,
                      },
                    }}
                  />
                )}
                {searchQuery && (
                  <Chip
                    label={`Arama: "${searchQuery}"`}
                    color="default"
                    size="medium"
                    onDelete={() => setSearchQuery('')}
                    deleteIcon={<ClearIcon />}
                    sx={{
                      fontWeight: 500,
                      '& .MuiChip-deleteIcon': {
                        fontSize: 16,
                      },
                    }}
                  />
                )}
              </Stack>
            </Box>
          )}
        </Paper>
      </Box>{' '}
      {/* Data Grid */}
      <Box sx={{ height: 650 }}>
        <DataGrid
          rows={reports || []}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChange}
          rowCount={rowCount || 0}
          loading={isLoading}
          paginationMode="server"
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          sx={{
            border: 'none',
            backgroundColor: 'background.paper',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: theme.shadows[1],
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              py: 1.5,
              px: 2,
              fontSize: '0.875rem',
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              },
              '&:nth-of-type(even)': {
                backgroundColor: alpha(theme.palette.grey[50], 0.4),
              },
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                },
              },
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: alpha(theme.palette.grey[100], 0.9),
              borderBottom: `2px solid ${alpha(theme.palette.divider, 0.15)}`,
              borderRadius: 0,
            },
            '& .MuiDataGrid-columnHeader': {
              px: 2,
              py: 1.5,
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,
              fontSize: '0.875rem',
              color: theme.palette.text.primary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
              backgroundColor: alpha(theme.palette.grey[50], 0.6),
              px: 2,
              py: 1,
            },
            '& .MuiDataGrid-toolbarContainer': {
              padding: theme.spacing(1, 2),
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              backgroundColor: alpha(theme.palette.grey[50], 0.3),
            },
            '& .MuiTablePagination-root': {
              color: theme.palette.text.secondary,
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows':
              {
                fontSize: '0.875rem',
                fontWeight: 500,
              },
            '& .MuiDataGrid-virtualScroller': {
              '&::-webkit-scrollbar': {
                width: 8,
                height: 8,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: alpha(theme.palette.grey[200], 0.3),
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(theme.palette.grey[400], 0.6),
                borderRadius: 4,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.grey[500], 0.8),
                },
              },
            },
          }}
          slots={{
            loadingOverlay: () => (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
                flexDirection="column"
                sx={{
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(4px)',
                }}
              >
                <CircularProgress
                  size={56}
                  thickness={4}
                  sx={{
                    color: theme.palette.primary.main,
                    mb: 2,
                  }}
                />
                <Typography
                  variant="body1"
                  color="text.primary"
                  sx={{
                    mt: 2,
                    fontWeight: 600,
                  }}
                >
                  Raporlar yükleniyor...
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    fontSize: '0.8rem',
                  }}
                >
                  Veriler getiriliyor, lütfen bekleyin
                </Typography>
              </Box>
            ),
            noRowsOverlay: () => (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
                flexDirection="column"
                sx={{
                  py: 6,
                  px: 3,
                }}
              >
                <ErrorIcon
                  sx={{
                    fontSize: 72,
                    color: alpha(theme.palette.text.disabled, 0.6),
                    mb: 3,
                  }}
                />
                <Typography
                  color="text.primary"
                  variant="h6"
                  sx={{
                    mb: 1.5,
                    fontWeight: 600,
                  }}
                >
                  {hasActiveFilters
                    ? 'Filtrelere uygun rapor bulunamadı'
                    : 'Henüz rapor bulunmuyor'}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  sx={{
                    maxWidth: 400,
                    lineHeight: 1.6,
                  }}
                >
                  {hasActiveFilters
                    ? 'Seçili filtrelere uygun rapor bulunmuyor. Filtreleri temizleyerek tekrar deneyin.'
                    : 'Departmanınıza ait herhangi bir rapor bulunmuyor. Yeni raporlar geldiğinde burada görünecektir.'}
                </Typography>
                {hasActiveFilters && (
                  <Button
                    variant="outlined"
                    onClick={onClearFilters}
                    sx={{
                      mt: 3,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                    startIcon={<ClearIcon />}
                  >
                    Filtreleri Temizle
                  </Button>
                )}
              </Box>
            ),
          }}
        />
      </Box>{' '}
      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            minWidth: 260,
            boxShadow: theme.shadows[16],
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            py: 1,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 0,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedReportId) {
              onViewDetails(selectedReportId);
            }
            handleMenuClose();
          }}
          sx={{
            py: 1.5,
            px: 2,
            mx: 1,
            borderRadius: 1,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <VisibilityIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="Detayları Görüntüle"
            secondary="Rapor detaylarını incele"
            primaryTypographyProps={{
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
            secondaryTypographyProps={{
              fontSize: '0.75rem',
              color: 'text.secondary',
            }}
          />
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedReportId) {
              onAssignToTeam(selectedReportId);
            }
            handleMenuClose();
          }}
          sx={{
            py: 1.5,
            px: 2,
            mx: 1,
            borderRadius: 1,
            '&:hover': {
              backgroundColor: alpha(theme.palette.info.main, 0.08),
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <AssignmentIcon fontSize="small" color="info" />
          </ListItemIcon>
          <ListItemText
            primary="Ekibe/Kişiye Ata"
            secondary="Raporu bir kişi/ekibe ata"
            primaryTypographyProps={{
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
            secondaryTypographyProps={{
              fontSize: '0.75rem',
              color: 'text.secondary',
            }}
          />
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedReportId) {
              onTransferDepartment(selectedReportId);
            }
            handleMenuClose();
          }}
          sx={{
            py: 1.5,
            px: 2,
            mx: 1,
            borderRadius: 1,
            '&:hover': {
              backgroundColor: alpha(theme.palette.warning.main, 0.08),
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <SwapHorizIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText
            primary="Departmana Yönlendir"
            secondary="Başka departmana yönlendir"
            primaryTypographyProps={{
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
            secondaryTypographyProps={{
              fontSize: '0.75rem',
              color: 'text.secondary',
            }}
          />
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedReportId) {
              onViewHistory(selectedReportId);
            }
            handleMenuClose();
          }}
          sx={{
            py: 1.5,
            px: 2,
            mx: 1,
            borderRadius: 1,
            '&:hover': {
              backgroundColor: alpha(theme.palette.secondary.main, 0.08),
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <HistoryIcon fontSize="small" color="secondary" />
          </ListItemIcon>
          <ListItemText
            primary="Geçmişi Görüntüle"
            secondary="Rapor işlem geçmişi"
            primaryTypographyProps={{
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
            secondaryTypographyProps={{
              fontSize: '0.75rem',
              color: 'text.secondary',
            }}
          />
        </MenuItem>
      </Menu>
    </Card>
  );
};
