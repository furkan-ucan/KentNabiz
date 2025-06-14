import React from 'react';
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  alpha,
  useTheme,
} from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
} from '@mui/x-data-grid';
import {
  ReportStatus,
  AssignmentStatus,
  AssigneeType,
} from '@kentnabiz/shared';
import type { SharedReport } from '@kentnabiz/shared';
import { ReportActionsMenu } from './ReportActionsMenu';

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

interface SupervisorReportTableProps {
  reports: SharedReport[];
  rowCount: number;
  isLoading: boolean;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  statusConfig: Record<ReportStatus, StatusConfig>;
  onViewDetails: (report: SharedReport) => void;
  onAssignToTeam: (report: SharedReport) => void;
  onViewHistory: (report: SharedReport) => void;
  // ReportActionsMenu handlers for hybrid mode
  onReportClick?: (report: SharedReport) => void;
  onViewAssignment?: (report: SharedReport) => void;
  onForwardReport?: (report: SharedReport) => void;
  onRejectReport?: (report: SharedReport) => void;
  onApproveReport?: (report: SharedReport) => void;
  onDeleteReport?: (report: SharedReport) => void;
  onReopenReport?: (report: SharedReport) => void;
}

export const SupervisorReportTable: React.FC<SupervisorReportTableProps> =
  React.memo(
    ({
      reports,
      rowCount,
      isLoading,
      paginationModel,
      onPaginationModelChange,
      statusConfig,
      onViewDetails,
      onAssignToTeam,
      onViewHistory,
      // ReportActionsMenu handlers
      onReportClick,
      onViewAssignment,
      onForwardReport,
      onRejectReport,
      onApproveReport,
      onDeleteReport,
      onReopenReport,
    }) => {
      const theme = useTheme();

      // Utility function to get active assignment for a report
      const getActiveAssignment = (report: SharedReport) => {
        // Önce assignments array'inde aktif atama ara
        const activeAssignment = report.assignments?.find(
          assignment => assignment.status === AssignmentStatus.ACTIVE
        );

        if (activeAssignment) {
          return activeAssignment;
        }
        // Eğer assignments array'inde bulunamazsa, assignedToEmployee field'ını kontrol et
        if (report.assignedToEmployee) {
          return {
            id: 0,
            reportId: report.id,
            assigneeType: AssigneeType.USER,
            assigneeUser: report.assignedToEmployee,
            assigneeTeam: undefined,
            assignedBy: undefined,
            status: AssignmentStatus.ACTIVE,
            assignedAt: report.createdAt || new Date().toISOString(), // Rapor oluşturma tarihini kullan
            completedAt: undefined,
          };
        }

        return null;
      };

      // Function to get assignee display name with assignment date
      const getAssigneeDisplayInfo = (report: SharedReport) => {
        const activeAssignment = getActiveAssignment(report);

        if (!activeAssignment) {
          return {
            name: 'Atanmadı',
            date: null,
          };
        }

        let assigneeName = 'Bilinmiyor';
        if (
          activeAssignment.assigneeType === AssigneeType.TEAM &&
          activeAssignment.assigneeTeam
        ) {
          assigneeName = activeAssignment.assigneeTeam.name;
        } else if (
          activeAssignment.assigneeType === AssigneeType.USER &&
          activeAssignment.assigneeUser
        ) {
          assigneeName =
            (
              activeAssignment.assigneeUser as {
                fullName?: string;
                name?: string;
              }
            ).fullName ||
            (
              activeAssignment.assigneeUser as {
                fullName?: string;
                name?: string;
              }
            ).name ||
            'Bilinmeyen Kullanıcı';
        }

        return {
          name: assigneeName,
          date: activeAssignment.assignedAt,
        };
      };

      const columns: GridColDef[] = [
        // 1. ID Column
        {
          field: 'id',
          headerName: 'ID',
          width: 80,
          sortable: true,
        },
        // 2. Status Column
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
        }, // 3. Title Column with Priority Indicator
        {
          field: 'title',
          headerName: 'Başlık',
          flex: 1,
          minWidth: 200,
          renderCell: (params: GridRenderCellParams<SharedReport>) => {
            const isHighPriority =
              params.row.status === ReportStatus.OPEN &&
              params.row.supportCount !== undefined &&
              params.row.supportCount >= 5;
            return (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  py: 1,
                }}
              >
                <Typography variant="body2" fontWeight="medium">
                  {params.row.title}
                </Typography>
                {isHighPriority && (
                  <Chip
                    size="small"
                    label={`${params.row.supportCount} kişi destekliyor`}
                    color="warning"
                    variant="outlined"
                    sx={{
                      fontSize: '0.7rem',
                      height: '22px',
                      alignSelf: 'flex-start',
                    }}
                  />
                )}
              </Box>
            );
          },
        },
        // 4. Assignee Column
        {
          field: 'assignedToEmployee',
          headerName: 'Atanan',
          width: 220,
          renderCell: (params: GridRenderCellParams<SharedReport>) => {
            const assigneeInfo = getAssigneeDisplayInfo(params.row);
            return (
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {assigneeInfo.name}
                </Typography>
                {assigneeInfo.date && (
                  <Typography variant="caption" color="text.secondary">
                    {(() => {
                      try {
                        const date = new Date(assigneeInfo.date);
                        if (isNaN(date.getTime())) {
                          return '';
                        }
                        return date.toLocaleString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                      } catch {
                        return '';
                      }
                    })()}
                  </Typography>
                )}
              </Box>
            );
          },
        },
        // 5. Category Column
        {
          field: 'category',
          headerName: 'Kategori',
          width: 120,
          renderCell: (params: GridRenderCellParams<SharedReport>) => (
            <Typography variant="body2">
              {params.row.category?.name || 'Belirtilmemiş'}
            </Typography>
          ),
        },
        // 6. Address Column
        {
          field: 'address',
          headerName: 'Adres',
          width: 200,
          renderCell: (params: GridRenderCellParams<SharedReport>) => (
            <Typography variant="caption" color="text.secondary">
              {params.row.address || 'Adres bilgisi yok'}
            </Typography>
          ),
        },
        // 7. Created At Column
        {
          field: 'createdAt',
          headerName: 'Oluşturulma',
          width: 140,
          type: 'dateTime',
          valueGetter: (value: string) => {
            try {
              return new Date(value);
            } catch {
              return new Date();
            }
          },
          renderCell: (params: GridRenderCellParams<SharedReport>) => (
            <Typography variant="body2">
              {(() => {
                try {
                  const date = new Date(params.row.createdAt);
                  if (isNaN(date.getTime())) {
                    return 'Tarih bilgisi yok';
                  }
                  return date.toLocaleString('tr-TR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                } catch {
                  return 'Tarih bilgisi yok';
                }
              })()}
            </Typography>
          ),
        },
        // 8. Quick Actions Column - Hybrid mode with quick buttons + menu
        {
          field: 'quickActions',
          headerName: 'Hızlı Aksiyonlar',
          width: 280,
          sortable: false,
          filterable: false,
          renderCell: (params: GridRenderCellParams<SharedReport>) => (
            <ReportActionsMenu
              report={params.row}
              onAssign={onAssignToTeam}
              onForward={onForwardReport}
              onApprove={onApproveReport}
              onReject={onRejectReport}
              onViewDetails={onViewDetails}
              onViewAssignment={onViewAssignment}
              onViewHistory={onViewHistory}
              onDelete={onDeleteReport}
              onReopen={onReopenReport}
              mode="hybrid"
            />
          ),
        },
      ];

      return (
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
          rowHeight={80}
          onRowClick={params => {
            console.log('Row clicked:', params.row);
            if (onReportClick && typeof onReportClick === 'function') {
              onReportClick(params.row);
            } else {
              console.warn('onReportClick is not a function:', onReportClick);
            }
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
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
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
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
      );
    }
  );

SupervisorReportTable.displayName = 'SupervisorReportTable';
