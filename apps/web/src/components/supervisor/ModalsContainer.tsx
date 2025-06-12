import React from 'react';
import {
  AssignReportModal,
  ViewAssignmentModal,
  ReportDetailModal,
  ForwardReportModal,
  RejectReportModal,
} from './modals';
import type { SharedReport } from '@kentnabiz/shared';

interface ModalState {
  assign: { open: boolean; report: SharedReport | null };
  viewAssignment: { open: boolean; report: SharedReport | null };
  reportDetail: { open: boolean; report: SharedReport | null };
  forwardReport: { open: boolean; report: SharedReport | null };
  rejectReport: { open: boolean; report: SharedReport | null };
}

interface ModalsContainerProps {
  modals: ModalState;
  onCloseAssignModal: () => void;
  onCloseViewAssignmentModal: () => void;
  onCloseReportDetailModal: () => void;
  onCloseForwardModal: () => void;
  onCloseRejectModal: () => void;
  onConfirmForward: (
    reportId: number,
    targetDepartmentId: number,
    reason: string
  ) => Promise<void>;
  onConfirmReject: (
    reportId: string,
    reason: string,
    rejectionCategory: string
  ) => Promise<void>;
  // Report actions
  onAssignToTeam: (report: SharedReport) => void;
  onForwardReport: (report: SharedReport) => void;
  onApproveReport: (report: SharedReport) => void;
  onRejectReport: (report: SharedReport) => void;
  onViewDetails: (report: SharedReport) => void;
  onViewAssigned: (report: SharedReport) => void;
  onViewHistory: (report: SharedReport) => void;
  onDeleteReport: (report: SharedReport) => void;
  onReopenReport: (report: SharedReport) => void;
}

export const ModalsContainer: React.FC<ModalsContainerProps> = ({
  modals,
  onCloseAssignModal,
  onCloseViewAssignmentModal,
  onCloseReportDetailModal,
  onCloseForwardModal,
  onCloseRejectModal,
  onConfirmForward,
  onConfirmReject,
  // Report actions
  onAssignToTeam,
  onForwardReport,
  onApproveReport,
  onRejectReport,
  onViewDetails,
  onViewAssigned,
  onViewHistory,
  onDeleteReport,
  onReopenReport,
}) => {
  return (
    <>
      {/* Assign Report Modal */}
      {modals.assign.report && (
        <AssignReportModal
          open={modals.assign.open}
          onClose={onCloseAssignModal}
          report={modals.assign.report}
        />
      )}

      {/* View Assignment Modal */}
      <ViewAssignmentModal
        open={modals.viewAssignment.open}
        onClose={onCloseViewAssignmentModal}
        report={modals.viewAssignment.report}
      />

      {/* Report Detail Modal */}
      <ReportDetailModal
        open={modals.reportDetail.open}
        onClose={onCloseReportDetailModal}
        report={modals.reportDetail.report}
        onAssign={onAssignToTeam}
        onForward={onForwardReport}
        onApprove={onApproveReport}
        onReject={onRejectReport}
        onViewDetails={onViewDetails}
        onViewAssignment={onViewAssigned}
        onViewHistory={onViewHistory}
        onDelete={onDeleteReport}
        onReopen={onReopenReport}
      />

      {/* Forward Report Modal */}
      <ForwardReportModal
        open={modals.forwardReport.open}
        onClose={onCloseForwardModal}
        report={modals.forwardReport.report}
        onConfirm={onConfirmForward}
      />

      {/* Reject Report Modal */}
      <RejectReportModal
        open={modals.rejectReport.open}
        onClose={onCloseRejectModal}
        report={modals.rejectReport.report}
        onConfirm={onConfirmReject}
      />
    </>
  );
};
