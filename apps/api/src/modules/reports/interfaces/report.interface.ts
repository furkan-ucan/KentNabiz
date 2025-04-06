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
  status: ReportStatus; // Use imported enum
  type: ReportType; // Use imported enum
  categoryId: number;
  department: MunicipalityDepartment; // Use imported enum
  userId: number;
  adminId?: number;
  departmentChangeReason?: string;
  previousDepartment?: string; // Consider using MunicipalityDepartment type here too if applicable
  createdAt: Date;
  updatedAt: Date;
  reportMedias?: IReportMedia[]; // Use API-internal media interface
  departmentHistory?: IDepartmentChange[]; // Use API-internal history interface
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
  oldDepartment: MunicipalityDepartment; // Use imported enum
  newDepartment: MunicipalityDepartment; // Use imported enum
  reason?: string; // Made optional
  changedByDepartment?: MunicipalityDepartment; // Use imported enum
  createdAt: Date;
}

// API-Internal Find Options
export interface IReportFindOptions {
  id?: number;
  userId?: number;
  status?: ReportStatus; // Use imported enum
  type?: ReportType; // Use imported enum
  department?: MunicipalityDepartment; // Use imported enum
  categoryId?: number; // Added categoryId
  limit?: number;
  offset?: number;
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
