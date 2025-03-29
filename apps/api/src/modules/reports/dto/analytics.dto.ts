// Analitik verileri için DTO'lar
export class AnalyticsFilterDto {
  startDate?: Date;
  endDate?: Date;
  last7Days?: boolean;
  last30Days?: boolean;
  lastQuarter?: boolean;
  lastYear?: boolean;
  department?: string;
  status?: string;
  type?: string;
  userId?: number;
  limit?: number;
}

export class DashboardStatsResponseDto {
  totalReports!: number;
  totalResolvedReports!: number;
  totalPendingReports!: number;
  totalRejectedReports!: number;
  averageResolutionTime!: number;
  statusDistribution!: Array<{ status: string; count: number }>;
  departmentDistribution!: Array<{ department: string; count: number }>;
  typeDistribution!: Array<{ type: string; count: number }>;
  dailyReportCounts!: Array<{ date: string; count: number }>;
  weeklyReportCounts!: Array<{ weekStart: string; weekEnd: string; count: number }>;
  monthlyReportCounts!: Array<{ year: number; month: number; count: number }>;
  resolutionTimeByDepartment!: Array<ResolutionTimeDto>;
  regionalDensity!: Array<RegionalDensityDto>;
}

export class StatusCountDto {
  status!: string;
  count!: number;
}

export class DepartmentCountDto {
  department!: string;
  count!: number;
}

export class TypeCountDto {
  type!: string;
  count!: number;
}

export class DailyCountDto {
  date!: string;
  count!: number;
}

export class WeeklyCountDto {
  weekStart!: string;
  weekEnd!: string;
  count!: number;
}

export class MonthlyCountDto {
  year!: number;
  month!: number;
  count!: number;
}

export class ResolutionTimeDto {
  department!: string;
  averageResolutionTime!: number;
  minResolutionTime!: number;
  maxResolutionTime!: number;
  reportsCount!: number;
}

export class RegionalDensityDto {
  location!: {
    type: string;
    coordinates: [number, number];
  };
  reportsCount!: number;
  radius?: number;
}

export class DistrictCountDto {
  district!: string;
  count!: number;
}

export class DepartmentChangeAnalyticsDto {
  departmentChanges!: Array<{ fromDepartment: string; toDepartment: string; count: number }>;
  departmentChangeCount!: Array<{ department: string; changesFrom: number }>;
  departmentChangeToCount!: Array<{ department: string; changesTo: number }>;
}

export class DepartmentPerformanceDto {
  department!: string;
  totalReports!: number;
  resolvedReports!: number;
  pendingReports!: number;
  averageResolutionTime!: number;
  performanceScore!: number;
}
