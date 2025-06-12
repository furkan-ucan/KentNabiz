import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Stack, Grid, Snackbar, Alert } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { reportService } from '@/services/reportService';
import {
  StatusFilters,
  QuickStats,
  ReportsTableSection,
  ReportsMapSection,
  ModalsContainer,
} from '@/components/supervisor';

import { useDashboardStore } from '@/store/dashboardStore';
import { useSupervisorReports } from '@/hooks/useSupervisorReports';
import { useStatusCounts } from '@/hooks/useStatusCounts';

import { getCurrentUser } from '@/utils/auth';
import { useAuthChangeDetection } from '@/hooks/useAuthChangeDetection';
import { ReportStatus } from '@kentnabiz/shared';
import type { SharedReport } from '@kentnabiz/shared';

export const SupervisorDashboardPage: React.FC = React.memo(() => {
  // Auth değişikliklerini izle ve cache'i temizle
  useAuthChangeDetection();

  const { filters, setFilters } = useDashboardStore();
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
  });

  // Tüm modal state'lerini tek bir objede birleştir (performans için)
  const [modals, setModals] = useState({
    assign: { open: false, report: null as SharedReport | null },
    viewAssignment: { open: false, report: null as SharedReport | null },
    reportDetail: { open: false, report: null as SharedReport | null },
    forwardReport: { open: false, report: null as SharedReport | null },
    rejectReport: { open: false, report: null as SharedReport | null },
  });

  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Filtrelenmiş veri çekme (tablo için) - filters'ı da geçiyoruz
  const { data, isLoading } = useSupervisorReports({
    ...pagination,
    ...filters,
  });
  // Status sayıları için ayrı API çağrısı (filtresiz)
  const { data: statusCounts, isLoading: statusCountsLoading } =
    useStatusCounts();

  // Memoize computed values for better performance
  const reports = useMemo(() => data?.data || [], [data?.data]);
  const totalCount = useMemo(() => data?.meta.total || 0, [data?.meta.total]);

  const queryClient = useQueryClient();

  // Supervisor departmanı değiştiğinde cache'leri temizle
  useEffect(() => {
    const user = getCurrentUser?.();
    if (user?.departmentId) {
      // Departman değişimi tespit edildiğinde ilgili cache'leri invalidate et
      queryClient.invalidateQueries({
        queryKey: ['departmentTeams', user.departmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['suggestedTeams'],
      });
      queryClient.invalidateQueries({
        queryKey: ['teamMembers'],
      });
    }
  }, [queryClient]);

  // Optimized pagination handler with useCallback
  const handlePaginationChange = useCallback(
    (model: { page: number; pageSize: number }) => {
      setPagination(model);
    },
    []
  );

  const handleStatusFilter = useCallback(
    (status: ReportStatus[]) => {
      // Check for modern scheduler API for priority scheduling
      const scheduler = (
        globalThis as typeof globalThis & {
          scheduler?: {
            postTask: (
              callback: () => void,
              options?: { priority: string }
            ) => void;
          };
        }
      ).scheduler;

      if (scheduler?.postTask) {
        scheduler.postTask(
          () => {
            setFilters({ status });
          },
          { priority: 'user-blocking' }
        );
      } else if (window.requestIdleCallback) {
        window.requestIdleCallback(
          () => {
            setFilters({ status });
          },
          { timeout: 16 }
        ); // Faster timeout for better INP
      } else {
        // Direct call for immediate response on older browsers
        setFilters({ status });
      }
    },
    [setFilters]
  );

  // Modal handler optimized with single state object
  const updateModal = useCallback(
    (
      type: keyof typeof modals,
      open: boolean,
      report: SharedReport | null = null
    ) => {
      setModals(prev => ({
        ...prev,
        [type]: { open, report },
      }));
    },
    []
  );

  // Report action handlers - optimized with immediate scheduling
  const handleViewDetails = useCallback(
    (report: SharedReport) => {
      updateModal('reportDetail', true, report);
    },
    [updateModal]
  );

  const handleAssignToTeam = useCallback(
    (report: SharedReport) => {
      updateModal('assign', true, report);
    },
    [updateModal]
  );

  const handleViewAssigned = useCallback(
    (report: SharedReport) => {
      updateModal('viewAssignment', true, report);
    },
    [updateModal]
  );

  const handleForwardReport = useCallback(
    (report: SharedReport) => {
      updateModal('forwardReport', true, report);
    },
    [updateModal]
  );

  const handleRejectReport = useCallback(
    (report: SharedReport) => {
      updateModal('rejectReport', true, report);
    },
    [updateModal]
  );

  const handleViewHistory = useCallback((report: SharedReport) => {
    console.log('Viewing history for report:', report.id);
    // TODO: Open history modal
  }, []);

  // Modal close handlers
  const handleCloseAssignModal = useCallback(() => {
    updateModal('assign', false);
  }, [updateModal]);

  const handleCloseViewAssignmentModal = useCallback(() => {
    updateModal('viewAssignment', false);
  }, [updateModal]);

  const handleCloseReportDetailModal = useCallback(() => {
    updateModal('reportDetail', false);
  }, [updateModal]);

  const handleCloseForwardModal = useCallback(() => {
    updateModal('forwardReport', false);
  }, [updateModal]);

  const handleCloseRejectModal = useCallback(() => {
    updateModal('rejectReport', false);
  }, [updateModal]);

  // Report action handlers
  const handleConfirmForward = async (
    reportId: number,
    targetDepartmentId: number,
    reason: string
  ) => {
    try {
      console.log('🔄 Forwarding report:', {
        reportId,
        targetDepartmentId,
        reason,
      });

      const response = await reportService.forwardReport(
        reportId,
        targetDepartmentId,
        reason
      );

      console.log('✅ Forward successful:', response);

      // Tüm report ilişkili query'leri yenile
      queryClient.invalidateQueries({
        queryKey: ['supervisorReports'],
        refetchType: 'all',
      });
      queryClient.invalidateQueries({
        queryKey: ['statusCounts'],
        refetchType: 'all',
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboardData'],
        refetchType: 'all',
      });

      setNotification({
        open: true,
        message: 'Rapor başarıyla yönlendirildi.',
        severity: 'success',
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['supervisorReports'] });
    } catch (error) {
      console.error('Forward error:', error);
      throw error;
    }
  };

  const handleConfirmReject = async (
    reportId: string,
    reason: string,
    rejectionCategory: string
  ) => {
    try {
      // Reddetme sebebini kategorili şekilde oluştur
      const formattedReason = rejectionCategory
        ? `[${rejectionCategory}] ${reason}`
        : reason;

      await reportService.rejectReport(parseInt(reportId), formattedReason);

      setNotification({
        open: true,
        message: 'Rapor başarıyla reddedildi.',
        severity: 'success',
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['supervisorReports'] });
    } catch (error) {
      console.error('Reject error:', error);
      setNotification({
        open: true,
        message: 'Reddetme işlemi başarısız oldu.',
        severity: 'error',
      });
      throw error;
    }
  };

  // Approve report handler
  const handleApproveReport = async (report: SharedReport) => {
    try {
      await reportService.approveReport(report.id);

      setNotification({
        open: true,
        message: 'Rapor başarıyla onaylandı.',
        severity: 'success',
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['supervisorReports'] });
    } catch (error) {
      console.error('Approve error:', error);
      setNotification({
        open: true,
        message: 'Onaylama işlemi başarısız oldu.',
        severity: 'error',
      });
    }
  };

  // Delete report handler
  const handleDeleteReport = async (report: SharedReport) => {
    if (
      window.confirm(
        `${report.title} başlıklı raporu kalıcı olarak silmek istediğinizden emin misiniz?`
      )
    ) {
      try {
        // TODO: API call to delete report
        console.log('Deleting report:', report.id);

        setNotification({
          open: true,
          message: 'Rapor başarıyla silindi.',
          severity: 'success',
        });

        // Refresh data
        queryClient.invalidateQueries({ queryKey: ['supervisorReports'] });
      } catch (error) {
        console.error('Delete error:', error);
        setNotification({
          open: true,
          message: 'Silme işlemi başarısız oldu.',
          severity: 'error',
        });
      }
    }
  };

  // Reopen report handler
  const handleReopenReport = async (report: SharedReport) => {
    try {
      // TODO: API call to reopen report
      console.log('Reopening report:', report.id);

      setNotification({
        open: true,
        message: 'Rapor yeniden açıldı.',
        severity: 'success',
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['supervisorReports'] });
    } catch (error) {
      console.error('Reopen error:', error);
      setNotification({
        open: true,
        message: 'Yeniden açma işlemi başarısız oldu.',
        severity: 'error',
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Dashboard content'i ayrı bir component olarak wrap edelim
  const dashboardContent = (
    <Box>
      {/* Sayfa Başlığı */}
      <Typography variant="h4" gutterBottom>
        Komuta Merkezi
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Kent raporlarını izleyin, yönetin ve ekiplerinizi koordine edin
      </Typography>

      {/* 3-Sütun Responsive Layout */}
      <Grid container spacing={3}>
        {/* Sol Sütun - Filtreler ve Hızlı Aksiyonlar */}
        <Grid size={{ xs: 12, md: 2 }}>
          <Stack spacing={2}>
            {/* Status Filtreleri */}
            <StatusFilters
              statusCounts={statusCounts}
              filters={filters}
              onStatusFilter={handleStatusFilter}
              onSetFilters={setFilters}
              isLoading={statusCountsLoading}
            />

            {/* Hızlı İstatistikler */}
            <QuickStats
              statusCounts={statusCounts}
              isLoading={statusCountsLoading}
            />
          </Stack>
        </Grid>

        {/* Orta Sütun - Ana Rapor Tablosu */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ReportsTableSection
            reports={reports}
            totalCount={totalCount}
            isLoading={isLoading}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            onViewDetails={handleViewDetails}
            onAssignToTeam={handleAssignToTeam}
            onViewHistory={handleViewHistory}
            onViewAssigned={handleViewAssigned}
            onForwardReport={handleForwardReport}
            onRejectReport={handleRejectReport}
            onApproveReport={report => void handleApproveReport(report)}
            onDeleteReport={report => void handleDeleteReport(report)}
            onReopenReport={report => void handleReopenReport(report)}
          />
        </Grid>

        {/* Sağ Sütun - Harita */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ReportsMapSection
            reports={reports}
            isLoading={isLoading}
            onReportClick={handleViewDetails}
          />
        </Grid>
      </Grid>

      {/* Modallar */}
      <ModalsContainer
        modals={modals}
        onCloseAssignModal={handleCloseAssignModal}
        onCloseViewAssignmentModal={handleCloseViewAssignmentModal}
        onCloseReportDetailModal={handleCloseReportDetailModal}
        onCloseForwardModal={handleCloseForwardModal}
        onCloseRejectModal={handleCloseRejectModal}
        onConfirmForward={handleConfirmForward}
        onConfirmReject={handleConfirmReject}
        onAssignToTeam={handleAssignToTeam}
        onForwardReport={handleForwardReport}
        onApproveReport={report => void handleApproveReport(report)}
        onRejectReport={handleRejectReport}
        onViewDetails={handleViewDetails}
        onViewAssigned={handleViewAssigned}
        onViewHistory={handleViewHistory}
        onDeleteReport={report => void handleDeleteReport(report)}
        onReopenReport={report => void handleReopenReport(report)}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );

  return (
    <>
      {dashboardContent}

      {/* Global notification snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
});

SupervisorDashboardPage.displayName = 'SupervisorDashboardPage';
