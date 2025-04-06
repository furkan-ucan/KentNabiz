// packages/shared/src/types/department.types.ts
import { MunicipalityDepartment, ReportType } from './report.types'; // Import shared enums

/**
 * Represents the shared data structure for a Department.
 */
export interface SharedDepartment {
  id: number;
  code: MunicipalityDepartment; // Use the shared enum for code
  name: string;
  description?: string | null; // Match entity (nullable text)
  isActive: boolean;
  responsibleReportTypes: ReportType[]; // Use shared enum
}
