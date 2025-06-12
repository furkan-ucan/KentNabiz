// apps/web/src/hooks/analytics/useKpiMetrics.ts
import { useQuery } from '@tanstack/react-query';
import { AnalyticsFilters } from './useAnalyticsFilters';

interface KpiMetricsData {
  totalReports: number;
  resolvedReports: number;
  pendingReports: number;
  resolutionRate: string;
  avgResolutionTimeHours: string;
  avgInterventionTimeHours: string;
  avgFirstResponseTimeHours: string;
}

export const useKpiMetrics = (filters: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['kpiMetrics', filters],
    queryFn: async (): Promise<KpiMetricsData> => {
      const params = new URLSearchParams();

      // Default tarih aralığı: Son 30 gün
      const endDate = filters.endDate || new Date().toISOString().split('T')[0];
      const startDate =
        filters.startDate ||
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];

      // Zorunlu parametreler
      params.append('startDate', startDate);
      params.append('endDate', endDate);
      // Opsiyonel filtreler
      if (filters.departmentId)
        params.append('departmentId', filters.departmentId);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.status) params.append('status', filters.status);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch(
        `http://localhost:3000/api/report-analytics/kpi-metrics?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`KPI metrics fetch failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 dakika
    refetchOnWindowFocus: false,
  });
};
