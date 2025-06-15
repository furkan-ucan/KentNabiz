import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  analyticsService,
  FunnelStatsResponse,
} from '@/services/analyticsService';
import { AnalyticsFilters } from './useAnalyticsFilters';

// Recharts için formatlanmış veri tipi
export interface FunnelChartData {
  name: string;
  value: number;
}

/**
 * Funnel Chart verilerini çeken ve Recharts formatına dönüştüren hook
 */
export const useFunnelData = (filters: AnalyticsFilters) => {
  // API'den veri çekme
  const {
    data: rawData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['funnelData', filters],
    queryFn: async () => {
      const result = await analyticsService.getFunnelStats(filters);
      return result;
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika
    refetchOnWindowFocus: false,
    placeholderData: (previousData: FunnelStatsResponse | undefined) =>
      previousData,
  });

  // Debug: Sadece geliştirme modunda minimal log
  if (process.env.NODE_ENV === 'development' && error) {
    console.warn('⚠️ Funnel Data Error:', error);
  } // Recharts formatına dönüştürme
  const funnelData = useMemo((): FunnelChartData[] => {
    if (!rawData) return []; // Backend response structure: check if data is wrapped
    const hasDataWrapper =
      'data' in rawData && typeof rawData.data === 'object';
    const actualData = hasDataWrapper
      ? (rawData as { data: FunnelStatsResponse }).data
      : rawData;

    // Sayıları güvenli şekilde parse et
    const totalReports = Number(actualData.totalReports) || 0;
    const assignedReports = Number(actualData.assignedReports) || 0;
    const resolvedReports = Number(actualData.resolvedReports) || 0;

    // Debug: Sadece beklenmeyen durumlar için log
    if (
      process.env.NODE_ENV === 'development' &&
      totalReports > 0 &&
      assignedReports === 0
    ) {
      console.warn(
        '⚠️ Funnel Data: No assigned reports despite having total reports'
      );
    }

    return [
      { name: 'Toplam Gelen', value: totalReports },
      { name: 'İşleme Alınan', value: assignedReports },
      { name: 'Başarıyla Çözülen', value: resolvedReports },
    ];
  }, [rawData]); // Dönüşüm oranlarını hesaplama
  const conversionRates = useMemo(() => {
    if (!rawData) {
      return {
        assignmentRate: 0,
        resolutionRate: 0,
        overallSuccessRate: 0,
      };
    } // Veri yapısını kontrol et - wrapped data format
    const hasDataWrapper =
      'data' in rawData && typeof rawData.data === 'object';
    const actualData = hasDataWrapper
      ? (rawData as { data: FunnelStatsResponse }).data
      : rawData;

    // Sayıları güvenli şekilde parse et
    const totalReports = Number(actualData.totalReports) || 0;
    const assignedReports = Number(actualData.assignedReports) || 0;
    const resolvedReports = Number(actualData.resolvedReports) || 0;

    if (totalReports === 0) {
      return {
        assignmentRate: 0,
        resolutionRate: 0,
        overallSuccessRate: 0,
      };
    }

    return {
      assignmentRate: (assignedReports / totalReports) * 100,
      resolutionRate:
        assignedReports > 0 ? (resolvedReports / assignedReports) * 100 : 0,
      overallSuccessRate: (resolvedReports / totalReports) * 100,
    };
  }, [rawData]);

  return {
    data: funnelData,
    rawData,
    conversionRates,
    isLoading,
    error,
  };
};
