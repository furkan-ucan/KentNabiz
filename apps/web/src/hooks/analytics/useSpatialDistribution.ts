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
    refetchOnWindowFocus: false, // Pencere odaklandığında yeniden fetch yapma
    placeholderData: (previousData: SpatialDistributionResponse | undefined) =>
      previousData, // Önceki veriyi placeholder olarak kullan
    // Bu sayede yeni veri gelene kadar eski veri ekranda kalır, loading göstermez
  });
};

export type SpatialDistributionData = SpatialDistributionResponse | undefined;
