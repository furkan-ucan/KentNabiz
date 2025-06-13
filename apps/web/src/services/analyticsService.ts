// apps/web/src/services/analyticsService.ts
import { api } from '@/lib/api';
import { AnalyticsFilters } from '@/hooks/analytics/useAnalyticsFilters';

export interface SummaryStatsResponse {
  avgResolutionDays: number;
  avgInterventionHours: number;
  avgFirstResponseHours: number;
  resolutionRate: number;
  totalReportCount: number;
}

export interface CountsResponse {
  [key: string]: {
    count: number;
    reportIds: number[];
  };
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Convert filters to API query parameters
const buildQueryParams = (
  filters: AnalyticsFilters
): Record<string, string> => {
  const params: Record<string, string> = {};

  // Default: Son 1 yıl (365 gün) - Geniş analiz aralığı için
  // Bu sayede kullanıcı ilk açtığında anlamlı bir veri seti görür
  const endDate = filters.endDate || new Date().toISOString().split('T')[0]; // Bugün
  const startDate =
    filters.startDate ||
    new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]; // 1 yıl önce

  // Backend zorunlu parametreler - her zaman gönder
  params.startDate = startDate;
  params.endDate = endDate;

  // Opsiyonel parametreler - sadece varsa gönder
  if (filters.departmentId) {
    params.departmentId = filters.departmentId;
  }

  if (filters.categoryId) {
    params.categoryId = filters.categoryId;
  }

  if (filters.status) {
    params.status = filters.status;
  }

  return params;
};

export const analyticsService = {
  // Fetch summary statistics from /summary-stats endpoint
  async fetchSummaryStats(
    filters: AnalyticsFilters
  ): Promise<SummaryStatsResponse> {
    const params = buildQueryParams(filters);
    const response = await api.get<ApiResponse<SummaryStatsResponse>>(
      '/report-analytics/summary-stats',
      { params }
    );
    return response.data.data;
  },

  // Fetch counts from /counts endpoint
  async fetchCounts(
    filters: AnalyticsFilters,
    types: string[] = [
      'UNASSIGNED',
      'OVERDUE',
      'IN_PROGRESS',
      'IN_REVIEW',
      'DONE',
    ]
  ): Promise<CountsResponse> {
    const params = {
      ...buildQueryParams(filters),
      types: types.join(','),
    };

    const response = await api.get<ApiResponse<CountsResponse>>(
      '/report-analytics/counts',
      { params }
    );
    return response.data.data;
  },

  // Strategic KPIs için interface'ler
  async fetchStrategicKpis(
    filters: AnalyticsFilters
  ): Promise<StrategicKpisResponse> {
    const params = buildQueryParams(filters);
    const response = await api.get<ApiResponse<StrategicKpisResponse>>(
      '/report-analytics/strategic-kpis',
      { params }
    );
    return response.data.data;
  },
};

export default analyticsService;

// Strategic KPIs için interface'ler
export interface ReopenedReportsResult {
  count: number;
  reportIds: number[];
}

export interface TrendingIssueResult {
  categoryName: string | null;
  categoryCode: string | null;
  percentageIncrease: number;
  currentPeriodCount: number;
  previousPeriodCount: number;
}

export interface CitizenInteractionResult {
  totalSupports: number;
}

export interface StrategicKpisResponse {
  reopenedReports: ReopenedReportsResult;
  trendingIssue: TrendingIssueResult;
  citizenInteraction: CitizenInteractionResult;
}
