import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Chip, Stack, Box } from '@mui/material';
import { ReportStatus } from '@kentnabiz/shared';

interface FilterState {
  status?: ReportStatus | ReportStatus[];
}

interface StatusFiltersProps {
  statusCounts?: Record<string, number | undefined>;
  filters: FilterState;
  onStatusFilter: (status: ReportStatus[]) => void;
  onSetFilters: (filters: Partial<FilterState>) => void;
  isLoading?: boolean;
}

// Type definition for chip props
interface ChipData {
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
}

// Memoized optimized chip renderer for best INP performance
const OptimizedChip = React.memo<{ chip: ChipData; index: number }>(
  ({ chip, index }) => (
    <Chip
      key={`${chip.label}-${index}`}
      label={`${chip.label} (${chip.count})`}
      variant={chip.active ? 'filled' : 'outlined'}
      color={chip.active ? chip.color : 'default'}
      onClick={chip.onClick}
      sx={{
        justifyContent: 'flex-start',
        cursor: 'pointer',
        // Remove ALL transitions for optimal INP
        transition: 'none !important',
        // Use GPU acceleration for transforms
        willChange: 'transform',
        transform: 'translateZ(0)', // Force GPU layer
        // Fast hover with contain property for performance
        '&:hover': {
          backgroundColor: chip.active
            ? undefined
            : `${chip.color === 'default' ? 'grey' : chip.color}.50`,
          // No transition on hover for instant feedback
        },
        // Ultra-fast active state - immediate visual feedback
        '&:active': {
          transform: 'translateZ(0) scale(0.95)', // GPU accelerated
          // No transition - immediate feedback
        },
        // Optimize rendering with CSS containment
        contain: 'layout style paint',
      }}
    />
  )
);
OptimizedChip.displayName = 'OptimizedChip';

export const StatusFilters: React.FC<StatusFiltersProps> = ({
  statusCounts,
  filters,
  onStatusFilter,
  onSetFilters,
  isLoading = false,
}) => {
  // Memoized status chips for optimal re-render prevention
  const statusChips = useMemo(
    () => [
      {
        label: 'Tümü',
        count: statusCounts?.total || 0,
        active:
          !filters.status ||
          (Array.isArray(filters.status) && filters.status.length === 0) ||
          filters.status === undefined,
        onClick: () => onSetFilters({ status: undefined }),
        color: 'default' as const,
      },
      {
        label: 'Yeni Gelen',
        count: statusCounts?.[ReportStatus.OPEN] || 0,
        active:
          (Array.isArray(filters.status) &&
            filters.status.length === 1 &&
            filters.status.includes(ReportStatus.OPEN)) ||
          filters.status === ReportStatus.OPEN,
        onClick: () => onStatusFilter([ReportStatus.OPEN]),
        color: 'primary' as const,
      },
      {
        label: 'İnceleniyor',
        count: statusCounts?.[ReportStatus.IN_REVIEW] || 0,
        active:
          Array.isArray(filters.status) &&
          filters.status.length === 1 &&
          filters.status.includes(ReportStatus.IN_REVIEW),
        onClick: () => onStatusFilter([ReportStatus.IN_REVIEW]),
        color: 'info' as const,
      },
      {
        label: 'Sahada',
        count: statusCounts?.[ReportStatus.IN_PROGRESS] || 0,
        active:
          Array.isArray(filters.status) &&
          filters.status.length === 1 &&
          filters.status.includes(ReportStatus.IN_PROGRESS),
        onClick: () => onStatusFilter([ReportStatus.IN_PROGRESS]),
        color: 'warning' as const,
      },
      {
        label: 'Tamamlandı',
        count: statusCounts?.[ReportStatus.DONE] || 0,
        active:
          Array.isArray(filters.status) &&
          filters.status.length === 1 &&
          filters.status.includes(ReportStatus.DONE),
        onClick: () => onStatusFilter([ReportStatus.DONE]),
        color: 'success' as const,
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
          filters.status.includes(ReportStatus.CANCELLED),
        onClick: () =>
          onStatusFilter([ReportStatus.REJECTED, ReportStatus.CANCELLED]),
        color: 'error' as const,
      },
    ],
    [statusCounts, filters.status, onStatusFilter, onSetFilters]
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Durum Filtreleri
        </Typography>
        <Stack spacing={1}>
          {isLoading
            ? // Loading skeleton for status chips
              Array.from({ length: 6 }).map((_, index) => (
                <Box key={index} sx={{ height: 32, width: '100%' }}>
                  <Typography variant="body2">Loading...</Typography>
                </Box>
              ))
            : statusChips.map((chip, index) => (
                <OptimizedChip
                  key={`${chip.label}-${index}`}
                  chip={chip}
                  index={index}
                />
              ))}
        </Stack>
      </CardContent>
    </Card>
  );
};
