import { Point } from 'geojson';

export enum ReportStatus {
  REPORTED = 'REPORTED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

export enum ReportType {
  POTHOLE = 'POTHOLE',
  ROAD_DAMAGE = 'ROAD_DAMAGE',
  ROAD_BLOCK = 'ROAD_BLOCK',
  TRAFFIC_LIGHT = 'TRAFFIC_LIGHT',
  OTHER = 'OTHER',
}

export interface IReport {
  id: number;
  title: string;
  description: string;
  location: Point;
  address: string;
  status: ReportStatus;
  type: ReportType;
  userId: number;
  adminId?: number;
  createdAt: Date;
  updatedAt: Date;
  reportMedias?: IReportMedia[];
}

export interface IReportMedia {
  id: number;
  reportId: number;
  url: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReportFindOptions {
  id?: number;
  userId?: number;
  status?: ReportStatus;
  type?: ReportType;
  limit?: number;
  offset?: number;
  withinRadius?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

export interface ISpatialQueryResult {
  data: IReport[];
  total: number;
  page: number;
  limit: number;
}
