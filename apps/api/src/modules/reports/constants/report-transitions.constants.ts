import { ReportStatus, UserRole } from '@KentNabiz/shared';

export const allowedTransitions: Record<UserRole, Partial<Record<ReportStatus, ReportStatus[]>>> = {
  /* VATANDAŞ */
  [UserRole.CITIZEN]: {
    [ReportStatus.OPEN]: [ReportStatus.CANCELLED],
  },

  /* EKİP ÜYESİ */
  [UserRole.TEAM_MEMBER]: {
    [ReportStatus.IN_REVIEW]: [ReportStatus.IN_PROGRESS],
    [ReportStatus.IN_PROGRESS]: [ReportStatus.DONE], // DONE == “PENDING_APPROVAL”
    [ReportStatus.REJECTED]: [ReportStatus.IN_PROGRESS],
  },

  /* DEPARTMAN SORUMLUSU */
  [UserRole.DEPARTMENT_SUPERVISOR]: {
    [ReportStatus.OPEN]: [ReportStatus.IN_REVIEW, ReportStatus.REJECTED, ReportStatus.CANCELLED],
    [ReportStatus.IN_REVIEW]: [ReportStatus.IN_PROGRESS, ReportStatus.REJECTED],
    [ReportStatus.IN_PROGRESS]: [ReportStatus.DONE, ReportStatus.REJECTED],
    [ReportStatus.DONE]: [ReportStatus.IN_REVIEW, ReportStatus.IN_PROGRESS],
    [ReportStatus.REJECTED]: [ReportStatus.IN_REVIEW],
  },

  /* SİSTEM YÖNETİCİSİ */
  [UserRole.SYSTEM_ADMIN]: {
    [ReportStatus.OPEN]: Object.values(ReportStatus),
    [ReportStatus.IN_REVIEW]: Object.values(ReportStatus),
    [ReportStatus.IN_PROGRESS]: Object.values(ReportStatus),
    [ReportStatus.DONE]: [
      ReportStatus.OPEN,
      ReportStatus.IN_REVIEW,
      ReportStatus.IN_PROGRESS,
      ReportStatus.REJECTED,
    ],
    [ReportStatus.REJECTED]: [
      ReportStatus.OPEN,
      ReportStatus.IN_REVIEW,
      ReportStatus.IN_PROGRESS,
      ReportStatus.DONE,
    ],
    [ReportStatus.CANCELLED]: [ReportStatus.OPEN],
  },
};
