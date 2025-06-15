import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  analyticsService,
  CategoryDistributionResponse,
} from '@/services/analyticsService';
import { AnalyticsFilters } from './useAnalyticsFilters';

// Horizontal Bar Chart için formatlanmış veri tipi
export interface CategoryChartData {
  id: string;
  name: string;
  code?: string;
  value: number;
  color?: string;
}

/**
 * Category Distribution verilerini çeken ve chart formatına dönüştüren hook
 * En sorunlu kategorileri horizontal bar chart için hazırlar
 */
export const useCategoryDistribution = (
  filters: AnalyticsFilters,
  limit: number = 10
) => {
  // API'den veri çekme
  const {
    data: rawData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['categoryDistribution', filters, limit],
    queryFn: async () => {
      const result = await analyticsService.getCategoryDistribution({
        ...filters,
        limit,
      });
      return result;
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika
    refetchOnWindowFocus: false,
    placeholderData: (
      previousData: CategoryDistributionResponse[] | undefined
    ) => previousData,
  }); // Chart formatına dönüştürme
  const chartData = useMemo((): CategoryChartData[] => {
    if (!rawData || !Array.isArray(rawData)) {
      return [];
    }

    // Renk paleti (horizontal bar chart için)
    const colors = [
      '#1f77b4', // mavi
      '#ff7f0e', // turuncu
      '#2ca02c', // yeşil
      '#d62728', // kırmızı
      '#9467bd', // mor
      '#8c564b', // kahverengi
      '#e377c2', // pembe
      '#7f7f7f', // gri
      '#bcbd22', // zeytin
      '#17becf', // cyan
    ];

    const chartData = rawData.map(
      (
        item: CategoryDistributionResponse,
        index: number
      ): CategoryChartData => ({
        id: item.categoryId.toString(),
        name: item.categoryName,
        code: item.categoryCode,
        value: item.count,
        color: colors[index % colors.length],
      })
    );

    return chartData;
  }, [rawData]);

  // Toplam rapor sayısı (opsiyonel istatistik)
  const totalReports = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  // En yüksek değer (chart scaling için)
  const maxValue = useMemo(() => {
    return Math.max(...chartData.map(item => item.value), 0);
  }, [chartData]);

  return {
    data: chartData,
    rawData,
    isLoading,
    error,
    totalReports,
    maxValue,
    isEmpty: chartData.length === 0,
  };
};
