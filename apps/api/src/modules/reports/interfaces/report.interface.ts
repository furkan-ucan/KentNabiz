/**
 * @file report.interface.ts
 * @author [Your Name]
 * @date [Date]
 * @license [Your License]
 * @version 1.1
 * @description Bu dosya, API rapor modülü için GEREKLİ OLAN DAHİLİ arayüzleri içerir.
 *              Paylaşılan enumlar @kentnabiz/shared paketinden import edilir.
 * @module report.interface (API Dahili)
 */

import { Point } from 'geojson';
// --- Import Enums from Shared Package ---
import { ReportStatus, ReportType, MunicipalityDepartment } from '@KentNabiz/shared'; // Adjust import path if necessary
// --- End Import ---

// --- REMOVED Enum Definitions ---

// --- KEEP API-INTERNAL INTERFACES ---

export interface IReportCategory {
  id: number;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  parentId?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  children?: IReportCategory[];
}

export interface ICategoryTree extends IReportCategory {
  children: ICategoryTree[];
}

// Interface representing the full internal structure, closer to the DB Entity
export interface IReport {
  id: number;
  title: string;
  description: string;
  location: Point;
  address: string;
  status: ReportStatus;
  reportType?: ReportType;
  currentDepartmentId: number;
  currentDepartment?: { id: number; code: MunicipalityDepartment; name: string };
  userId: number;
  assignedEmployeeId?: number;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  reportMedias?: IReportMedia[];
  departmentHistory?: IDepartmentChange[];
}

// API-Internal Media Interface
export interface IReportMedia {
  id: number;
  reportId: number;
  url: string;
  type: string; // Or use a MediaType enum if defined
  createdAt: Date;
  updatedAt: Date;
}

// API-Internal Department Change Interface
export interface IDepartmentChange {
  id: number;
  reportId: number;
  previousDepartmentId?: number;
  previousDepartment?: { id: number; code: MunicipalityDepartment; name: string };
  newDepartmentId: number;
  newDepartment?: { id: number; code: MunicipalityDepartment; name: string };
  reason?: string;
  changedByUserId?: number;
  changedByUser?: { id: number; fullName: string };
  changedAt: Date;
}

// API-Internal Find Options
export interface IReportFindOptions {
  id?: number;
  userId?: number;
  status?: ReportStatus; // Use imported enum
  reportType?: ReportType; // type -> reportType olarak güncellendi
  departmentCode?: MunicipalityDepartment; // department -> departmentCode olarak güncellendi ve eklendi
  categoryId?: number; // Korundu
  limit?: number; // Korundu
  offset?: number; // Korundu
  withinRadius?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

// API-Internal Spatial Query Result
export interface ISpatialQueryResult {
  data: IReport[]; // Uses the API-Internal IReport
  total: number;
  page: number;
  limit: number;
}

// API-Internal Update Data Structure
// TODO: Convert to a DTO class
export interface UpdateReportData {
  title?: string;
  description?: string;
  type?: ReportType; // Use imported enum
  status?: ReportStatus; // Use imported enum
  location?: Point;
  address?: string;
  department?: MunicipalityDepartment; // Use imported enum
  departmentChangeReason?: string;
  departmentChangedBy?: number;
  departmentChangedAt?: Date;
  resolvedAt?: Date;
  reportMedias?: Array<{
    // Keep simple structure or use Partial<IReportMedia>?
    url: string;
    type: string;
  }>;
  categoryId?: number;
}

// --- END KEEP API-INTERNAL INTERFACES ---
