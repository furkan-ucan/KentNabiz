/**
 * @file report.analytics.interface.ts
 * @author [Your Name]
 * @date [Date]
 * @license [Your License]
 * @version 1.0
 * @description Bu dosya, rapor analizleri için gerekli olan arayüzleri içerir.
 * @module report.analytics.interface
 */

import { Point } from 'geojson';
import { ReportStatus, ReportType, MunicipalityDepartment } from './report.interface';

/**
 * Rapor analiz verilerini temsil eden arayüzler
 */

// Sayısal analiz sonuçlarında kullanılacak temel arayüz
export interface IBaseCount {
  count: number;
}

// Durum bazlı rapor dağılımı
export interface IStatusCount extends IBaseCount {
  status: ReportStatus;
}

// Departman bazlı rapor dağılımı
export interface IDepartmentCount extends IBaseCount {
  department: MunicipalityDepartment;
}

// Kategori bazlı rapor dağılımı
export interface ITypeCount extends IBaseCount {
  type: ReportType;
}

// Günlük rapor dağılımı
export interface IDailyCount extends IBaseCount {
  date: string; // ISO formatında tarih (YYYY-MM-DD)
}

// Haftalık rapor dağılımı
export interface IWeeklyCount extends IBaseCount {
  weekStart: string; // Hafta başlangıç tarihi (YYYY-MM-DD)
  weekEnd: string; // Hafta bitiş tarihi (YYYY-MM-DD)
}

// Aylık rapor dağılımı
export interface IMonthlyCount extends IBaseCount {
  year: number;
  month: number; // 1-12 arası
}

// Çözüm süresi analizi
export interface IResolutionTime {
  department: MunicipalityDepartment;
  averageResolutionTime: number; // Milisaniye cinsinden
  minResolutionTime: number;
  maxResolutionTime: number;
  reportsCount: number;
}

// Bölgesel yoğunluk analizi
export interface IRegionalDensity {
  location: Point;
  reportsCount: number;
  radius?: number; // Opsiyonel, metre cinsinden grup yarıçapı
}

// Kompleks dashboard veri yapısı
export interface IDashboardStats {
  totalReports: number;
  totalResolvedReports: number;
  totalPendingReports: number;
  totalRejectedReports: number;
  averageResolutionTime: number; // Milisaniye cinsinden
  statusDistribution: IStatusCount[];
  departmentDistribution: IDepartmentCount[];
  typeDistribution: ITypeCount[];
  dailyReportCounts: IDailyCount[];
  weeklyReportCounts: IWeeklyCount[];
  monthlyReportCounts: IMonthlyCount[];
  resolutionTimeByDepartment: IResolutionTime[];
  regionalDensity: IRegionalDensity[];
}

// Zaman bazlı filtreleme için arayüz
export interface ITimeFilter {
  startDate?: Date;
  endDate?: Date;
  last7Days?: boolean;
  last30Days?: boolean;
  lastQuarter?: boolean;
  lastYear?: boolean;
}

// Analiz filtresi için arayüz
export interface IAnalyticsFilter extends ITimeFilter {
  department?: MunicipalityDepartment;
  status?: ReportStatus;
  type?: ReportType;
  userId?: number;
  regionFilter?: {
    latitude: number;
    longitude: number;
    radius: number; // metre cinsinden
  };
}
