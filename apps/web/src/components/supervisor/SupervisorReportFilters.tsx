import React from 'react';
import {
  Box,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Stack,
  Typography,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { ReportStatus } from '@kentnabiz/shared';

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

interface SupervisorReportFiltersProps {
  filterStatus: ReportStatus | 'ALL';
  setFilterStatus: (status: ReportStatus | 'ALL') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusConfig: Record<ReportStatus, StatusConfig>;
}

export const SupervisorReportFilters: React.FC<
  SupervisorReportFiltersProps
> = ({
  filterStatus,
  setFilterStatus,
  searchQuery,
  setSearchQuery,
  statusConfig,
}) => {
  return (
    <Stack spacing={2}>
      {/* Search and Status Filter Row */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems="stretch"
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
          sx={{ flex: 1 }}
          size="small"
          variant="outlined"
        />

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Durum Filtresi</InputLabel>
          <Select
            value={filterStatus}
            onChange={e =>
              setFilterStatus(e.target.value as ReportStatus | 'ALL')
            }
            label="Durum Filtresi"
          >
            <MenuItem value="ALL">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip
                  size="small"
                  label="Tümü"
                  color="default"
                  sx={{ mr: 1 }}
                />
                Tüm Durumlar
              </Box>
            </MenuItem>
            {Object.entries(statusConfig).map(([status, config]) => (
              <MenuItem key={status} value={status}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip
                    size="small"
                    label={config.label}
                    color={config.color}
                    sx={{ mr: 1 }}
                  />
                  {config.label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Active Filters Display */}
      {(filterStatus !== 'ALL' || searchQuery) && (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Aktif Filtreler:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {filterStatus !== 'ALL' && (
              <Chip
                label={`Durum: ${statusConfig[filterStatus]?.label}`}
                color={statusConfig[filterStatus]?.color}
                size="small"
                onDelete={() => setFilterStatus('ALL')}
                deleteIcon={<ClearIcon />}
              />
            )}
            {searchQuery && (
              <Chip
                label={`Arama: "${searchQuery}"`}
                color="default"
                size="small"
                onDelete={() => setSearchQuery('')}
                deleteIcon={<ClearIcon />}
              />
            )}
          </Stack>
        </Box>
      )}
    </Stack>
  );
};
