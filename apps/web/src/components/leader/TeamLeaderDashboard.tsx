import React, { useState } from 'react';
import { Box, Paper, Typography, Alert } from '@mui/material';
import { ReportStatus } from '@kentnabiz/shared';
import { TeamReportsList } from './TeamReportsList';
import { ReportDetailPanelForLeader } from './ReportDetailPanelForLeader';
import { InteractiveTeamMap } from './InteractiveTeamMap';
import { useMyTeamReports } from '@/hooks/useMyTeamReports';

/**
 * Takım lideri dashboard ana bileşeni
 * Sol tarafta takım raporları listesi, sağ tarafta seçili raporun detayları
 */
export const TeamLeaderDashboard: React.FC = () => {
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'ALL'>(
    'IN_REVIEW' as ReportStatus
  );

  // Gerçek API'den takım raporlarını getir
  const {
    data: reports = [],
    isLoading,
    error,
    refetch,
  } = useMyTeamReports({
    status: filterStatus === 'ALL' ? undefined : filterStatus,
  });

  // Filtreleme artık API tarafında yapılıyor, ama yine de client-side filtre uygulayalım
  const filteredReports = reports.filter(report => {
    if (filterStatus === 'ALL') return true;
    return report.status === filterStatus;
  });

  const selectedReport = selectedReportId
    ? reports.find(r => r.id === selectedReportId)
    : null;

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Raporlar yüklenirken bir hata oluştu: {error.message}
          <br />
          <Typography
            component="span"
            sx={{
              cursor: 'pointer',
              textDecoration: 'underline',
              color: 'primary.main',
            }}
            onClick={() => void refetch()}
          >
            Tekrar dene
          </Typography>
        </Alert>
      </Box>
    );
  }
  return (
    <Box sx={{ display: 'flex', gap: 2, height: '75vh' }}>
      {/* Sol Panel - Rapor Listesi */}
      <Paper
        elevation={2}
        sx={{ width: '350px', display: 'flex', flexDirection: 'column' }}
      >
        <Box sx={{ p: 2 }}>
          <TeamReportsList
            reports={filteredReports}
            isLoading={isLoading}
            selectedReportId={selectedReportId}
            onSelectReport={setSelectedReportId}
            onFilterChange={status => setFilterStatus(status)}
          />
        </Box>
      </Paper>

      {/* Orta Panel - İnteraktif Harita */}
      <Paper
        elevation={2}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: '400px',
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" component="h2">
            Takım Raporları Haritası
          </Typography>
          <Typography variant="body2" color="text.secondary">
            İslahiye bölgesindeki raporları harita üzerinde görüntüleyin
          </Typography>
        </Box>
        <Box sx={{ flex: 1, position: 'relative' }}>
          <InteractiveTeamMap
            reports={filteredReports}
            selectedReportId={selectedReportId}
            onSelectReport={setSelectedReportId}
          />
        </Box>
      </Paper>

      {/* Sağ Panel - Rapor Detayları */}
      <Paper
        elevation={2}
        sx={{
          width: '400px',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '100%',
        }}
      >
        {' '}
        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          {' '}
          {selectedReport ? (
            <ReportDetailPanelForLeader
              report={selectedReport}
              onRefresh={() => void refetch()}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'text.secondary',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Rapor Seçin
              </Typography>{' '}
              <Typography variant="body2" textAlign="center">
                Detayları görmek için sol panelden bir rapor seçin veya harita
                üzerindeki pinlere tıklayın.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};
