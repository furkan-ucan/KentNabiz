import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Box,
  Divider,
  Paper,
} from '@mui/material';
import {
  ReportProblem as UnassignedIcon,
  HourglassTop as PendingIcon,
  Assignment as ProgressIcon,
  Replay as ReopenedIcon,
  AccessTime as OverdueIcon,
  CheckCircle as DoneIcon,
  Cancel as RejectedIcon,
} from '@mui/icons-material';
import { ReportStatus } from '@kentnabiz/shared';

interface FilterState {
  status?: ReportStatus | ReportStatus[];
  subStatus?: string;
  assignment?: 'unassigned' | 'assigned';
  overdue?: boolean;
  reopened?: boolean;
}

interface EnhancedFiltersProps {
  statusCounts?: Record<string, number | undefined>;
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  isLoading?: boolean;
}

interface FilterChipData {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'info'
    | 'warning'
    | 'success'
    | 'error';
  icon?: React.ReactElement;
}

const OptimizedFilterChip = React.memo<{ chip: FilterChipData; index: number }>(
  ({ chip, index }) => (
    <Chip
      key={`${chip.label}-${index}`}
      label={`${chip.label} (${chip.count})`}
      variant={chip.active ? 'filled' : 'outlined'}
      color={chip.active ? chip.color : 'default'}
      icon={chip.icon}
      onClick={chip.onClick}
      sx={{
        justifyContent: 'flex-start',
        cursor: 'pointer',
        transition: 'none !important',
        willChange: 'transform',
        transform: 'translateZ(0)',
        '&:hover': {
          backgroundColor: chip.active
            ? undefined
            : `${chip.color === 'default' ? 'grey' : chip.color}.50`,
        },
        '&:active': {
          transform: 'translateZ(0) scale(0.95)',
        },
        contain: 'layout style paint',
      }}
    />
  )
);
OptimizedFilterChip.displayName = 'OptimizedFilterChip';

export const EnhancedFilters: React.FC<EnhancedFiltersProps> = ({
  statusCounts,
  filters,
  onFiltersChange,
  isLoading = false,
}) => {
  // Hızlı Filtreler (Analitik Panel KPI'larının karşılığı)
  const quickFilters = useMemo(
    () => [
      {
        label: 'Atanmamış',
        count: statusCounts?.unassigned || 0,
        active: filters.assignment === 'unassigned',
        onClick: () =>
          onFiltersChange({
            status: [ReportStatus.OPEN],
            assignment: 'unassigned',
            subStatus: undefined,
            overdue: undefined,
            reopened: undefined,
          }),
        color: 'error' as const,
        icon: <UnassignedIcon fontSize="small" />,
      },
      {
        label: 'Onay Bekleyen',
        count: statusCounts?.pendingApproval || 0,
        active: filters.subStatus === 'PENDING_APPROVAL',
        onClick: () =>
          onFiltersChange({
            status: [ReportStatus.IN_PROGRESS],
            subStatus: 'PENDING_APPROVAL',
            assignment: undefined,
            overdue: undefined,
            reopened: undefined,
          }),
        color: 'warning' as const,
        icon: <PendingIcon fontSize="small" />,
      },
      {
        label: 'Geciken Görevler',
        count: statusCounts?.overdue || 0,
        active: filters.overdue === true,
        onClick: () =>
          onFiltersChange({
            status: [ReportStatus.IN_PROGRESS],
            overdue: true,
            assignment: undefined,
            subStatus: undefined,
            reopened: undefined,
          }),
        color: 'error' as const,
        icon: <OverdueIcon fontSize="small" />,
      },
      {
        label: 'Yeniden Açılan',
        count: statusCounts?.reopened || 0,
        active: filters.reopened === true,
        onClick: () =>
          onFiltersChange({
            reopened: true,
            status: undefined,
            assignment: undefined,
            subStatus: undefined,
            overdue: undefined,
          }),
        color: 'warning' as const,
        icon: <ReopenedIcon fontSize="small" />,
      },
    ],
    [statusCounts, filters, onFiltersChange]
  );

  // Standard Durum Filtreleri
  const statusFilters = useMemo(
    () => [
      {
        label: 'Tümü',
        count: statusCounts?.total || 0,
        active:
          !filters.status &&
          !filters.assignment &&
          !filters.overdue &&
          !filters.reopened &&
          !filters.subStatus,
        onClick: () =>
          onFiltersChange({
            status: undefined,
            assignment: undefined,
            subStatus: undefined,
            overdue: undefined,
            reopened: undefined,
          }),
        color: 'default' as const,
      },
      {
        label: 'Yeni Gelen',
        count: statusCounts?.[ReportStatus.OPEN] || 0,
        active:
          (Array.isArray(filters.status) &&
            filters.status.length === 1 &&
            filters.status.includes(ReportStatus.OPEN) &&
            !filters.assignment &&
            !filters.overdue &&
            !filters.reopened &&
            !filters.subStatus) ||
          filters.status === ReportStatus.OPEN,
        onClick: () =>
          onFiltersChange({
            status: [ReportStatus.OPEN],
            assignment: undefined,
            subStatus: undefined,
            overdue: undefined,
            reopened: undefined,
          }),
        color: 'primary' as const,
      },
      {
        label: 'Sahada',
        count: statusCounts?.[ReportStatus.IN_PROGRESS] || 0,
        active:
          (Array.isArray(filters.status) &&
            filters.status.length === 1 &&
            filters.status.includes(ReportStatus.IN_PROGRESS) &&
            !filters.assignment &&
            !filters.overdue &&
            !filters.reopened &&
            !filters.subStatus) ||
          filters.status === ReportStatus.IN_PROGRESS,
        onClick: () =>
          onFiltersChange({
            status: [ReportStatus.IN_PROGRESS],
            assignment: undefined,
            subStatus: undefined,
            overdue: undefined,
            reopened: undefined,
          }),
        color: 'info' as const,
        icon: <ProgressIcon fontSize="small" />,
      },
      {
        label: 'Tamamlandı',
        count: statusCounts?.[ReportStatus.DONE] || 0,
        active:
          (Array.isArray(filters.status) &&
            filters.status.length === 1 &&
            filters.status.includes(ReportStatus.DONE) &&
            !filters.assignment &&
            !filters.overdue &&
            !filters.reopened &&
            !filters.subStatus) ||
          filters.status === ReportStatus.DONE,
        onClick: () =>
          onFiltersChange({
            status: [ReportStatus.DONE],
            assignment: undefined,
            subStatus: undefined,
            overdue: undefined,
            reopened: undefined,
          }),
        color: 'success' as const,
        icon: <DoneIcon fontSize="small" />,
      },
      {
        label: 'Reddedildi/İptal',
        count:
          (statusCounts?.[ReportStatus.REJECTED] || 0) +
          (statusCounts?.[ReportStatus.CANCELLED] || 0),
        active:
          Array.isArray(filters.status) &&
          filters.status.length === 2 &&
          filters.status.includes(ReportStatus.REJECTED) &&
          filters.status.includes(ReportStatus.CANCELLED) &&
          !filters.assignment &&
          !filters.overdue &&
          !filters.reopened &&
          !filters.subStatus,
        onClick: () =>
          onFiltersChange({
            status: [ReportStatus.REJECTED, ReportStatus.CANCELLED],
            assignment: undefined,
            subStatus: undefined,
            overdue: undefined,
            reopened: undefined,
          }),
        color: 'secondary' as const,
        icon: <RejectedIcon fontSize="small" />,
      },
    ],
    [statusCounts, filters, onFiltersChange]
  );

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Filtreler
        </Typography>

        {/* Hızlı Filtreler (Öncelikli İşler) */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1.5, color: 'primary.main', fontWeight: 600 }}
          >
            Hızlı Filtreler (Öncelikli İşler)
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {quickFilters.map((chip, index) => (
              <OptimizedFilterChip
                key={`quick-${chip.label}`}
                chip={chip}
                index={index}
              />
            ))}
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Duruma Göre Filtrele */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1.5, color: 'text.secondary', fontWeight: 600 }}
          >
            Duruma Göre Filtrele
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {statusFilters.map((chip, index) => (
              <OptimizedFilterChip
                key={`status-${chip.label}`}
                chip={chip}
                index={index}
              />
            ))}
          </Stack>
        </Box>

        {isLoading && (
          <Paper
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Yükleniyor...
            </Typography>
          </Paper>
        )}
      </CardContent>
    </Card>
  );
};
