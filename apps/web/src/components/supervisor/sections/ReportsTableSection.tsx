import React, { useCallback } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { SupervisorReportTable } from '../tables/SupervisorReportTable';
import { ReportStatus } from '@kentnabiz/shared';
import type { SharedReport } from '@kentnabiz/shared';

interface ReportsTableSectionProps {
  reports: SharedReport[];
  totalCount: number;
  isLoading: boolean;
  pagination: { page: number; pageSize: number };
  onPaginationChange: (model: { page: number; pageSize: number }) => void;
  onViewDetails: (report: SharedReport) => void;
  onAssignToTeam: (report: SharedReport) => void;
  onViewHistory: (report: SharedReport) => void;
  onViewAssigned: (report: SharedReport) => void;
  onForwardReport: (report: SharedReport) => void;
  onRejectReport: (report: SharedReport) => void;
  onApproveReport: (report: SharedReport) => void;
  onDeleteReport: (report: SharedReport) => void;
  onReopenReport: (report: SharedReport) => void;
}

export const ReportsTableSection: React.FC<ReportsTableSectionProps> = ({
  reports,
  totalCount,
  isLoading,
  pagination,
  onPaginationChange,
  onViewDetails,
  onAssignToTeam,
  onViewHistory,
  onViewAssigned,
  onForwardReport,
  onRejectReport,
  onApproveReport,
  onDeleteReport,
  onReopenReport,
}) => {
  const handleReportClick = useCallback(
    (report: SharedReport) => {
      onViewDetails(report);
    },
    [onViewDetails]
  );

  return (
    <Card sx={{ height: 'fit-content' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Kent Raporları
        </Typography>
        <SupervisorReportTable
          reports={reports}
          rowCount={totalCount}
          isLoading={isLoading}
          paginationModel={pagination}
          onPaginationModelChange={onPaginationChange}
          onViewDetails={onViewDetails}
          onAssignToTeam={onAssignToTeam}
          onViewHistory={onViewHistory}
          onReportClick={handleReportClick}
          onViewAssignment={onViewAssigned}
          onForwardReport={onForwardReport}
          onRejectReport={onRejectReport}
          onApproveReport={onApproveReport}
          onDeleteReport={onDeleteReport}
          onReopenReport={onReopenReport}
          statusConfig={{
            [ReportStatus.OPEN]: { label: 'Yeni Gelen', color: 'primary' },
            [ReportStatus.IN_REVIEW]: { label: 'İnceleniyor', color: 'info' },
            [ReportStatus.IN_PROGRESS]: { label: 'Sahada', color: 'warning' },
            [ReportStatus.DONE]: { label: 'Çözüldü', color: 'success' },
            [ReportStatus.REJECTED]: { label: 'Reddedildi', color: 'error' },
            [ReportStatus.CANCELLED]: {
              label: 'İptal Edildi',
              color: 'default',
            },
          }}
        />
      </CardContent>
    </Card>
  );
};
