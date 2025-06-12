import React from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  History as HistoryIcon,
  DeleteOutline as DeleteIcon,
  RestartAlt as ReopenIcon,
} from '@mui/icons-material';
import { SharedReport, ReportStatus, ReportSubStatus } from '@kentnabiz/shared';

interface ReportActionsMenuProps {
  report: SharedReport;
  onAssign?: (report: SharedReport) => void;
  onForward?: (report: SharedReport) => void;
  onApprove?: (report: SharedReport) => void;
  onReject?: (report: SharedReport) => void;
  onViewDetails?: (report: SharedReport) => void;
  onViewAssignment?: (report: SharedReport) => void;
  onViewHistory?: (report: SharedReport) => void;
  onDelete?: (report: SharedReport) => void;
  onReopen?: (report: SharedReport) => void;
  mode?: 'dropdown' | 'buttons' | 'hybrid'; // hybrid = quick buttons + ... menu
}

export const ReportActionsMenu: React.FC<ReportActionsMenuProps> = React.memo(
  ({
    report,
    onAssign,
    onForward,
    onApprove,
    onReject,
    onViewDetails,
    onViewAssignment,
    onViewHistory,
    onDelete,
    onReopen,
    mode = 'dropdown',
  }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleMenuItemClick = (action: () => void) => {
      handleClose();
      action();
    };

    const handleButtonClick = (event: React.MouseEvent, action: () => void) => {
      event.stopPropagation();
      action();
    };

    // Helper function to determine primary (quick) and secondary (menu) actions based on detailed action matrix
    const getActionsForStatus = (
      report: SharedReport,
      handlers: Omit<ReportActionsMenuProps, 'report' | 'mode'>
    ) => {
      const primaryActions: Array<{
        label: string;
        handler: () => void;
        props: {
          variant?: 'text' | 'outlined' | 'contained';
          color?:
            | 'inherit'
            | 'primary'
            | 'secondary'
            | 'success'
            | 'error'
            | 'info'
            | 'warning';
          size?: 'small' | 'medium' | 'large';
        };
      }> = [];

      const secondaryActions: Array<{
        label: string;
        handler: () => void;
        icon?: React.ReactNode;
      }> = []; // Check if report has active assignment (used in some status checks)
      // const hasActiveAssignment = report.assignments?.some(a => a.status === 'ACTIVE');

      // Status-based action matrix implementation
      switch (report.status) {
        case ReportStatus.OPEN: // Quick Actions for OPEN status
          if (handlers.onAssign) {
            primaryActions.push({
              label: 'Ata',
              handler: () => handlers.onAssign!(report),
              props: { variant: 'contained', color: 'primary' },
            });
          }
          if (handlers.onForward) {
            primaryActions.push({
              label: 'Yönlendir',
              handler: () => handlers.onForward!(report),
              props: { variant: 'outlined', color: 'info' },
            });
          }
          if (handlers.onReject) {
            primaryActions.push({
              label: 'Geçersiz', // OPEN rapor için farklı label - vatandaş raporunu geçersiz say
              handler: () => handlers.onReject!(report),
              props: { variant: 'outlined', color: 'error' },
            });
          }
          // Menu Actions for OPEN status
          if (handlers.onViewDetails) {
            secondaryActions.push({
              label: 'Detaylar',
              handler: () => handlers.onViewDetails!(report),
              icon: <ViewIcon fontSize="small" />,
            });
          }
          if (handlers.onViewHistory) {
            secondaryActions.push({
              label: 'Geçmiş',
              handler: () => handlers.onViewHistory!(report),
              icon: <HistoryIcon fontSize="small" />,
            });
          }
          if (handlers.onDelete) {
            secondaryActions.push({
              label: 'Sil',
              handler: () => handlers.onDelete!(report),
              icon: <DeleteIcon fontSize="small" />,
            });
          }
          break;
        case ReportStatus.IN_REVIEW:
          // Quick Actions for IN_REVIEW status
          if (handlers.onAssign) {
            primaryActions.push({
              label: 'Atamayı Değiştir', // Revize edilmiş: IN_REVIEW durumunda daha anlamlı
              handler: () => handlers.onAssign!(report),
              props: { variant: 'contained', color: 'primary' },
            });
          }
          if (handlers.onForward) {
            primaryActions.push({
              label: 'Yönlendir',
              handler: () => handlers.onForward!(report),
              props: { variant: 'outlined', color: 'info' },
            });
          }
          // Menu Actions for IN_REVIEW status
          if (handlers.onViewDetails) {
            secondaryActions.push({
              label: 'Detaylar',
              handler: () => handlers.onViewDetails!(report),
              icon: <ViewIcon fontSize="small" />,
            });
          }
          if (handlers.onViewHistory) {
            secondaryActions.push({
              label: 'Geçmiş',
              handler: () => handlers.onViewHistory!(report),
              icon: <HistoryIcon fontSize="small" />,
            });
          }
          break;
        case ReportStatus.IN_PROGRESS: {
          // Check if this is PENDING_APPROVAL subStatus (tamamlanmış iş onay bekliyor)
          const isPendingApproval =
            report.subStatus === ReportSubStatus.PENDING_APPROVAL;

          if (isPendingApproval) {
            // Quick Actions for PENDING_APPROVAL subStatus
            if (handlers.onApprove) {
              primaryActions.push({
                label: 'Onayla',
                handler: () => handlers.onApprove!(report),
                props: { variant: 'contained', color: 'success' },
              });
            }
            if (handlers.onReject) {
              primaryActions.push({
                label: 'Geri Çevir', // PENDING_APPROVAL için farklı label - tamamlanan işi geri çevir
                handler: () => handlers.onReject!(report),
                props: { variant: 'outlined', color: 'error' },
              });
            }
          }
          // No quick actions for other IN_PROGRESS states

          // Menu Actions for all IN_PROGRESS states
          if (handlers.onViewDetails) {
            secondaryActions.push({
              label: 'Detaylar',
              handler: () => handlers.onViewDetails!(report),
              icon: <ViewIcon fontSize="small" />,
            });
          }
          if (handlers.onViewHistory) {
            secondaryActions.push({
              label: 'Geçmiş',
              handler: () => handlers.onViewHistory!(report),
              icon: <HistoryIcon fontSize="small" />,
            });
          }
          break;
        }
        case ReportStatus.DONE:
          // No quick actions for DONE status - only menu actions
          if (handlers.onViewDetails) {
            secondaryActions.push({
              label: 'Detaylar',
              handler: () => handlers.onViewDetails!(report),
              icon: <ViewIcon fontSize="small" />,
            });
          }
          if (handlers.onViewHistory) {
            secondaryActions.push({
              label: 'Geçmiş',
              handler: () => handlers.onViewHistory!(report),
              icon: <HistoryIcon fontSize="small" />,
            });
          }
          if (handlers.onReopen) {
            secondaryActions.push({
              label: 'Yeniden Aç',
              handler: () => handlers.onReopen!(report),
              icon: <ReopenIcon fontSize="small" />,
            });
          }
          break;
        case ReportStatus.REJECTED:
        case ReportStatus.CANCELLED:
          // No quick actions for REJECTED/CANCELLED - only menu actions
          if (handlers.onViewDetails) {
            secondaryActions.push({
              label: 'Detaylar',
              handler: () => handlers.onViewDetails!(report),
              icon: <ViewIcon fontSize="small" />,
            });
          }
          if (handlers.onViewHistory) {
            secondaryActions.push({
              label: 'Geçmiş',
              handler: () => handlers.onViewHistory!(report),
              icon: <HistoryIcon fontSize="small" />,
            });
          }
          break;
        default:
          // No quick actions for other statuses - only menu actions
          if (handlers.onViewDetails) {
            secondaryActions.push({
              label: 'Detaylar',
              handler: () => handlers.onViewDetails!(report),
              icon: <ViewIcon fontSize="small" />,
            });
          }
          if (handlers.onViewHistory) {
            secondaryActions.push({
              label: 'Geçmiş',
              handler: () => handlers.onViewHistory!(report),
              icon: <HistoryIcon fontSize="small" />,
            });
          }
          break;
      }

      return { primaryActions, secondaryActions };
    };
    // Mode-based rendering
    const { primaryActions, secondaryActions } = getActionsForStatus(report, {
      onAssign,
      onForward,
      onApprove,
      onReject,
      onViewDetails,
      onViewAssignment,
      onViewHistory,
      onDelete,
      onReopen,
    });
    // Hybrid Mode - Quick buttons + ... menu for comprehensive actions
    if (mode === 'hybrid') {
      return (
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          onClick={e => e.stopPropagation()}
        >
          {/* Quick Action Buttons */}
          {primaryActions.map(action => (
            <Button
              key={action.label}
              size="small"
              onClick={e => handleButtonClick(e, action.handler)}
              sx={{
                minWidth: 'auto',
                px: 1.5,
                py: 0.5,
                fontSize: '0.75rem',
                textTransform: 'none',
              }}
              {...action.props}
            >
              {action.label}
            </Button>
          ))}

          {/* Secondary Actions Menu */}
          {secondaryActions.length > 0 && (
            <>
              <Tooltip title="Diğer İşlemler">
                <IconButton
                  size="small"
                  onClick={handleClick}
                  aria-label="diğer işlemler"
                  sx={{
                    ml: 0.5,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    minWidth: 200,
                    maxWidth: 280,
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {secondaryActions.map(action => (
                  <MenuItem
                    key={action.label}
                    onClick={() => handleMenuItemClick(action.handler)}
                  >
                    {action.icon && <ListItemIcon>{action.icon}</ListItemIcon>}
                    <ListItemText primary={action.label} />
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Stack>
      );
    }
    // Buttons Mode - Only quick actions as buttons
    if (mode === 'buttons') {
      if (primaryActions.length === 0) {
        return (
          <Typography variant="caption" color="text.secondary">
            -
          </Typography>
        );
      }

      return (
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
          {primaryActions.map(action => (
            <Button
              key={action.label}
              size="small"
              onClick={e => handleButtonClick(e, action.handler)}
              sx={{
                minWidth: 'auto',
                px: 1.5,
                py: 0.5,
                fontSize: '0.75rem',
                textTransform: 'none',
              }}
              {...action.props}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      );
    }
    // Dropdown Mode - All actions in menu
    if (secondaryActions.length === 0) {
      return (
        <Typography variant="caption" color="text.secondary">
          -
        </Typography>
      );
    }

    return (
      <>
        <Tooltip title="İşlemler">
          <IconButton
            size="small"
            onClick={handleClick}
            sx={{
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              minWidth: 200,
              maxWidth: 280,
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {secondaryActions.map(action => (
            <MenuItem
              key={action.label}
              onClick={() => handleMenuItemClick(action.handler)}
            >
              {action.icon && <ListItemIcon> {action.icon}</ListItemIcon>}
              <ListItemText primary={action.label} />
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }
);

ReportActionsMenu.displayName = 'ReportActionsMenu';
