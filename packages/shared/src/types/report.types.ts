// packages/shared/src/types/report.types.ts
import { Point } from 'geojson';

// UPDATED Report Statuses (in English)
export enum ReportStatus {
  SUBMITTED = 'SUBMITTED', // Citizen created, assigned to initial department
  UNDER_REVIEW = 'UNDER_REVIEW', // Department Supervisor or Employee is reviewing
  FORWARDED = 'FORWARDED', // Forwarded from one department to another (was DEPARTMENT_CHANGED)
  ASSIGNED_TO_EMPLOYEE = 'ASSIGNED_TO_EMPLOYEE', // Assigned to an employee by Department Supervisor
  FIELD_WORK_IN_PROGRESS = 'FIELD_WORK_IN_PROGRESS', // Employee or Supervisor started fieldwork (a form of old IN_PROGRESS)
  PENDING_APPROVAL = 'PENDING_APPROVAL', // Employee completed, awaiting Supervisor's approval
  RESOLVED = 'RESOLVED', // Department Supervisor approved (was RESOLVED)
  REJECTED = 'REJECTED', // Department Supervisor/Admin rejected (was REJECTED)
  AWAITING_INFORMATION = 'AWAITING_INFORMATION', // Awaiting additional info from citizen or other unit
}

/** Defines the possible types/categories of a report, based on API usage. */
export enum ReportType { // This can remain the same for now, update if needed
  POTHOLE = 'POTHOLE',
  ROAD_DAMAGE = 'ROAD_DAMAGE',
  ROAD_SIGN = 'ROAD_SIGN',
  ROAD_MARKING = 'ROAD_MARKING',
  ROAD_CONSTRUCTION = 'ROAD_CONSTRUCTION',
  ROAD_MAINTENANCE = 'ROAD_MAINTENANCE',
  ROAD_CLEANING = 'ROAD_CLEANING',
  ROAD_REPAIR = 'ROAD_REPAIR',
  ROAD_BLOCK = 'ROAD_BLOCK',
  TRAFFIC_LIGHT = 'TRAFFIC_LIGHT',
  STREET_LIGHT = 'STREET_LIGHT',
  ELECTRICITY_OUTAGE = 'ELECTRICITY_OUTAGE',
  WATER_LEAKAGE = 'WATER_LEAKAGE',
  LITTER = 'LITTER',
  GRAFFITI = 'GRAFFITI',
  PARK_DAMAGE = 'PARK_DAMAGE',
  TREE_ISSUE = 'TREE_ISSUE',
  PARKING_VIOLATION = 'PARKING_VIOLATION',
  PUBLIC_TRANSPORT = 'PUBLIC_TRANSPORT',
  PUBLIC_TRANSPORT_VIOLATION = 'PUBLIC_TRANSPORT_VIOLATION',
  PUBLIC_TRANSPORT_STOP = 'PUBLIC_TRANSPORT_STOP',
  PUBLIC_TRANSPORT_VEHICLE = 'PUBLIC_TRANSPORT_VEHICLE',
  GARBAGE_COLLECTION = 'GARBAGE_COLLECTION',
  OTHER = 'OTHER',
  // NOTE: POTHOLE_REPAIR, ROAD_RECONSTRUCTION etc. were removed as they weren't in the API's enum version.
  //       Add them back here if needed across all apps.
}

/** Defines the possible municipal departments handling reports, based on API usage. */
// NOTE: Keeping this enum in sync with the `Department` entity on the API side is important.
// Perhaps the department entity's `code` or `name` field could be used directly instead of this enum.
// Leaving as is for now.
export enum MunicipalityDepartment { // This can remain the same for now
  ROADS = 'ROADS',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  PARKS = 'PARKS',
  TRANSPORTATION = 'TRANSPORTATION',
  WATER = 'WATER',
  ELECTRICITY = 'ELECTRICITY',
  TRAFFIC = 'TRAFFIC',
  BUILDING = 'BUILDING',
  MUNICIPALITY = 'MUNICIPALITY',
  HEALTH = 'HEALTH',
  FIRE = 'FIRE',
  OTHER = 'OTHER',
  GENERAL = 'GENERAL',
}

export interface SharedReport {
  id: number;
  title: string;
  description: string;
  status: ReportStatus; // Will use the updated enum
  type: ReportType;
  location: Point;
  address: string;
  userId: number;
  userFullName?: string; // Added for convenience
  categoryId?: number;
  categoryName?: string; // Added for convenience
  currentDepartmentId: number;
  currentDepartmentName: string;
  assignedToEmployeeId?: number;
  assignedToEmployeeFullName?: string;
  reportMedias?: {
    id: number;
    url: string;
    thumbnailUrl?: string;
    type: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  statusHistory?: {
    status: ReportStatus;
    changedAt: Date;
    changedByUserId?: number;
    notes?: string;
  }[];
  departmentHistory?: {
    departmentId: number;
    departmentName: string;
    changedAt: Date;
    changedByUserId?: number;
    reason?: string;
  }[];
}

// Removed API DTO Helper Types (CreateReportDto, UpdateReportDto) and ReportAnalytics
// These belong in the API layer (apps/api/src/modules/reports/dto or interfaces)
