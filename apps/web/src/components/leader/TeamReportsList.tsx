import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  ButtonGroup,
  Skeleton,
} from '@mui/material';
import { SharedReport, ReportStatus } from '@kentnabiz/shared';
import { ReportCard } from './ReportCard';

interface TeamReportsListProps {
  reports: SharedReport[];
  isLoading: boolean;
  selectedReportId: number | null;
  onSelectReport: (id: number | null) => void;
  onFilterChange: (status: ReportStatus | 'ALL') => void;
}

type FilterStatus = ReportStatus | 'ALL';

export function TeamReportsList({
  reports,
  isLoading,
  selectedReportId,
  onSelectReport,
  onFilterChange,
}: TeamReportsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>(
    ReportStatus.IN_REVIEW
  );

  const handleFilterClick = (status: FilterStatus) => {
    setActiveFilter(status);
    onFilterChange(status);
  };

  const filteredReports = reports.filter(
    report =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Takım Görevleri ({filteredReports.length})
      </Typography>{' '}
      <ButtonGroup variant="outlined" size="small" fullWidth sx={{ mb: 2 }}>
        <Button
          variant={
            activeFilter === ReportStatus.IN_REVIEW ? 'contained' : 'outlined'
          }
          onClick={() => handleFilterClick(ReportStatus.IN_REVIEW)}
        >
          Bekleyen
        </Button>
        <Button
          variant={
            activeFilter === ReportStatus.IN_PROGRESS ? 'contained' : 'outlined'
          }
          onClick={() => handleFilterClick(ReportStatus.IN_PROGRESS)}
        >
          İşlemde
        </Button>
        <Button
          variant={activeFilter === 'ALL' ? 'contained' : 'outlined'}
          onClick={() => handleFilterClick('ALL')}
        >
          Hepsi
        </Button>
      </ButtonGroup>
      <TextField
        label="Rapor Ara..."
        variant="outlined"
        size="small"
        fullWidth
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
        {isLoading ? (
          <>
            <Skeleton variant="rectangular" height={110} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={110} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={110} sx={{ mb: 2 }} />
          </>
        ) : filteredReports.length > 0 ? (
          filteredReports.map(report => (
            <ReportCard
              key={report.id}
              report={report}
              isSelected={report.id === selectedReportId}
              onSelect={onSelectReport}
            />
          ))
        ) : (
          <Typography color="text.secondary" textAlign="center" mt={4}>
            Bu filtreye uygun rapor bulunamadı.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
