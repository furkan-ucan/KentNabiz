import { useQuery } from '@tanstack/react-query';
import {
  analyticsService,
  TemporalDistributionResponse,
} from '../../services/analyticsService';

export interface TemporalFilters {
  granularity: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  departmentId?: number;
}

export interface TemporalDataPoint {
  date: string;
  createdCount: number;
  resolvedCount: number;
}

export const useTemporalDistribution = (filters: TemporalFilters) => {
  return useQuery({
    queryKey: ['analytics', 'temporal', filters],
    queryFn: async (): Promise<TemporalDataPoint[]> => {
      const response = await analyticsService.getTemporalDistribution(filters);

      // API'den gelen veriyi kontrol et ve dönüştür
      if (!Array.isArray(response)) {
        console.warn(
          'Temporal distribution API response is not an array:',
          response
        );
        return [];
      }

      return response.map(
        (item: TemporalDistributionResponse): TemporalDataPoint => ({
          date: item.date || '',
          createdCount:
            typeof item.createdCount === 'number'
              ? item.createdCount
              : parseInt(String(item.createdCount), 10) || 0,
          resolvedCount:
            typeof item.resolvedCount === 'number'
              ? item.resolvedCount
              : parseInt(String(item.resolvedCount), 10) || 0,
        })
      );
    },
    staleTime: 5 * 60 * 1000, // 5 dakika cache
    enabled: !!(filters.granularity && filters.startDate && filters.endDate),
  });
};
