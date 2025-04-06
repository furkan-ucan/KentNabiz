// packages/shared/src/types/report.types.ts
import { Point } from 'geojson'; // Dependency: pnpm add -D -F @kentnabiz/shared @types/geojson

// --- Enums defined here as the Single Source of Truth ---

/** Defines the possible statuses of a report, based on API usage. */
export enum ReportStatus {
  REPORTED = 'REPORTED',
  IN_PROGRESS = 'IN_PROGRESS',
  DEPARTMENT_CHANGED = 'DEPARTMENT_CHANGED',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

/** Defines the possible types/categories of a report, based on API usage. */
export enum ReportType {
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
export enum MunicipalityDepartment {
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

// --- Shared Report Interface ---
// Represents the common data structure for a report expected by clients (Web/Mobile)
// based on what the API typically exposes (e.g., via DTOs).
export interface SharedReport {
  id: number; // Changed to number
  title: string;
  description: string;
  status: ReportStatus; // Use shared enum
  type: ReportType; // Use shared enum
  location: Point; // Use standard GeoJSON Point
  address: string; // Added separate address field
  userId: number; // Changed from submittedBy (use number)
  adminId?: number; // Added optional adminId
  categoryId?: number; // Added optional categoryId
  department?: MunicipalityDepartment; // Added optional department (use shared enum)
  // Example for simplified media info - adjust if API DTO returns different structure
  reportMedias?: {
    id: number;
    url: string;
    thumbnailUrl?: string;
    type: string; // Or a shared MediaType enum if one exists
  }[];
  createdAt: Date;
  updatedAt: Date;
  // Consider adding categoryName or departmentName if the API usually includes
  // these resolved names in responses and clients need them directly.
}

// Removed API DTO Helper Types (CreateReportDto, UpdateReportDto) and ReportAnalytics
// These belong in the API layer (apps/api/src/modules/reports/dto or interfaces)
