import { ReportStatus, UserRole } from '@KentNabiz/shared';
import { allowedTransitions } from '../constants/report-transitions.constants';

export function canTransition(
  roles: UserRole[],
  fromStatus: ReportStatus,
  toStatus: ReportStatus
): boolean {
  if (!fromStatus || !toStatus) return false;
  return roles.some(role => allowedTransitions[role]?.[fromStatus]?.includes(toStatus));
}
