import { useQuery } from '@tanstack/react-query';
import {
  analyticsService,
  SpatialDistributionResponse,
} from '@/services/analyticsService';
import { AnalyticsFilters } from './useAnalyticsFilters';

export const useSpatialDistribution = (filters: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['spatialDistribution', filters],
    queryFn: () => analyticsService.getSpatialDistribution(filters),
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika
  });
};

export type SpatialDistributionData = SpatialDistributionResponse | undefined;
