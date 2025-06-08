import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Grid,
} from '@mui/material';
import { SupervisorReportTable } from '@/components/supervisor/SupervisorReportTable';
import { useDashboardStore } from '@/store/dashboardStore';
import { useSupervisorReports } from '@/hooks/useSupervisorReports';
import { useStatusCounts } from '@/hooks/useStatusCounts';
import { ReportStatus } from '@kentnabiz/shared';
import type { SharedReport } from '@kentnabiz/shared';

export const SupervisorDashboardPage: React.FC = () => {
  const { filters, setFilters, selectedReport, setSelectedReport } =
    useDashboardStore();
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
  });

  // Filtrelenmiş veri çekme (tablo için)
  const { data, isLoading } = useSupervisorReports(pagination);
  // Status sayıları için ayrı API çağrısı (filtresiz)
  const { data: statusCounts, isLoading: statusCountsLoading } =
    useStatusCounts();
  const reports = data?.data || [];
  const totalCount = data?.meta.total || 0;
  // Dashboard istatistikleri status counts'tan hesaplanır
  const pendingReports =
    (statusCounts?.[ReportStatus.OPEN] || 0) +
    (statusCounts?.[ReportStatus.IN_REVIEW] || 0);
  const resolvedToday = statusCounts?.[ReportStatus.DONE] || 0; // Geçici olarak, gerçekte bugünkü çözülen raporlar olmalı

  const handleStatusFilter = (status: ReportStatus[]) => {
    console.log('Status filter called with:', status);
    setFilters({ status });
  };

  // Report action handlers
  const handleViewDetails = (reportId: number) => {
    console.log('Viewing details for report:', reportId);
    // TODO: Navigate to report details page
  };

  const handleAssignToTeam = (reportId: number) => {
    console.log('Assigning report to team:', reportId);
    // TODO: Open assign to team modal
  };

  const handleTransferDepartment = (reportId: number) => {
    console.log('Transferring report to department:', reportId);
    // TODO: Open transfer modal
  };
  const handleViewHistory = (reportId: number) => {
    console.log('Viewing history for report:', reportId);
    // TODO: Open history modal
  };
  const handleRowClick = (report: SharedReport) => {
    setSelectedReport(report);
  };

  const statusChips = [
    {
      label: 'Tümü',
      count: statusCounts?.total || 0,
      active: !filters.status || filters.status.length === 0,
      onClick: () => setFilters({ status: undefined }),
      color: 'default' as const,
    },
    {
      label: 'Yeni Gelen',
      count: statusCounts?.[ReportStatus.OPEN] || 0,
      active:
        Array.isArray(filters.status) &&
        filters.status.length === 1 &&
        filters.status.includes(ReportStatus.OPEN),
      onClick: () => handleStatusFilter([ReportStatus.OPEN]),
      color: 'primary' as const,
    },
    {
      label: 'İnceleniyor',
      count: statusCounts?.[ReportStatus.IN_REVIEW] || 0,
      active:
        Array.isArray(filters.status) &&
        filters.status.length === 1 &&
        filters.status.includes(ReportStatus.IN_REVIEW),
      onClick: () => handleStatusFilter([ReportStatus.IN_REVIEW]),
      color: 'info' as const,
    },
    {
      label: 'Sahada',
      count: statusCounts?.[ReportStatus.IN_PROGRESS] || 0,
      active:
        Array.isArray(filters.status) &&
        filters.status.length === 1 &&
        filters.status.includes(ReportStatus.IN_PROGRESS),
      onClick: () => handleStatusFilter([ReportStatus.IN_PROGRESS]),
      color: 'warning' as const,
    },
    {
      label: 'Tamamlandı',
      count: statusCounts?.[ReportStatus.DONE] || 0,
      active:
        Array.isArray(filters.status) &&
        filters.status.length === 1 &&
        filters.status.includes(ReportStatus.DONE),
      onClick: () => handleStatusFilter([ReportStatus.DONE]),
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
        handleStatusFilter([ReportStatus.REJECTED, ReportStatus.CANCELLED]),
      color: 'error' as const,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Sayfa Başlığı */}
      <Typography variant="h4" gutterBottom>
        Komuta Merkezi
      </Typography>{' '}
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Kent raporlarını izleyin, yönetin ve ekiplerinizi koordine edin
      </Typography>
      {/* 3-Sütun Responsive Layout */}
      <Grid container spacing={3}>
        {/* Sol Sütun - Filtreler ve Hızlı Aksiyonlar */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Stack spacing={2}>
            {/* Status Filtreleri */}
            <Card>
              <CardContent>
                {' '}
                <Typography variant="h6" gutterBottom>
                  Durum Filtreleri
                </Typography>
                <Stack spacing={1}>
                  {statusCountsLoading
                    ? // Loading skeleton for status chips
                      Array.from({ length: 6 }).map((_, index) => (
                        <Box key={index} sx={{ height: 32, width: '100%' }}>
                          <Typography variant="body2">Loading...</Typography>
                        </Box>
                      ))
                    : statusChips.map(chip => (
                        <Chip
                          key={chip.label}
                          label={`${chip.label} (${chip.count})`}
                          variant={chip.active ? 'filled' : 'outlined'}
                          color={chip.active ? chip.color : 'default'}
                          onClick={chip.onClick}
                          sx={{
                            justifyContent: 'flex-start',
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: chip.active
                                ? undefined
                                : `${chip.color === 'default' ? 'grey' : chip.color}.50`,
                            },
                          }}
                        />
                      ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Hızlı İstatistikler */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bugünkü Özet
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    {' '}
                    <Typography variant="body2" color="text.secondary">
                      Çözülen Raporlar
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {resolvedToday}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Bekleyen İncelemeler
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {pendingReports}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Orta Sütun - Ana Rapor Tablosu */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              {' '}
              <Typography variant="h6" gutterBottom>
                Kent Raporları
              </Typography>
              <SupervisorReportTable
                reports={reports}
                rowCount={totalCount}
                isLoading={isLoading}
                paginationModel={pagination}
                onPaginationModelChange={setPagination}
                onRowClick={handleRowClick}
                onViewDetails={handleViewDetails}
                onAssignToTeam={handleAssignToTeam}
                onTransferDepartment={handleTransferDepartment}
                onViewHistory={handleViewHistory}
              />{' '}
            </CardContent>
          </Card>
        </Grid>

        {/* Sağ Sütun - Detay Paneli ve Harita */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Stack spacing={2}>
            {/* Seçili Rapor Detayları */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Rapor Detayı
                </Typography>
                {selectedReport ? (
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Başlık
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {selectedReport.title}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Açıklama
                      </Typography>
                      <Typography variant="body2">
                        {selectedReport.description || 'Açıklama yok'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Adres
                      </Typography>
                      <Typography variant="body2">
                        {selectedReport.address}{' '}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Durum
                      </Typography>
                      <Chip
                        label={
                          {
                            [ReportStatus.OPEN]: 'Yeni Gelen',
                            [ReportStatus.IN_REVIEW]: 'İnceleniyor',
                            [ReportStatus.IN_PROGRESS]: 'Sahada',
                            [ReportStatus.DONE]: 'Çözüldü',
                            [ReportStatus.REJECTED]: 'Reddedildi',
                            [ReportStatus.CANCELLED]: 'İptal Edildi',
                          }[selectedReport.status] || selectedReport.status
                        }
                        color={
                          (
                            {
                              [ReportStatus.OPEN]: 'primary',
                              [ReportStatus.IN_REVIEW]: 'info',
                              [ReportStatus.IN_PROGRESS]: 'warning',
                              [ReportStatus.DONE]: 'success',
                              [ReportStatus.REJECTED]: 'error',
                              [ReportStatus.CANCELLED]: 'default',
                            } as const
                          )[selectedReport.status] || 'default'
                        }
                        size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Oluşturulma Tarihi
                      </Typography>
                      <Typography variant="body2">
                        {new Date(selectedReport.createdAt).toLocaleDateString(
                          'tr-TR',
                          {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </Typography>
                    </Box>
                    {selectedReport.assignedToEmployee && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Atanan Kişi
                        </Typography>
                        <Typography variant="body2">
                          {selectedReport.assignedToEmployee.fullName}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Bir rapor seçerek detaylarını görüntüleyin
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Mini Harita */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Konum Görünümü
                </Typography>
                <Box
                  sx={{
                    height: 200,
                    backgroundColor: 'grey.100',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Harita Görünümü
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};
