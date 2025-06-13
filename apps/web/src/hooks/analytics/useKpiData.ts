// apps/web/src/hooks/analytics/useKpiData.ts
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  analyticsService,
  SummaryStatsResponse,
  StrategicKpisResponse,
} from '@/services/analyticsService';
import { AnalyticsFilters } from './useAnalyticsFilters';

export interface CombinedKpiData extends SummaryStatsResponse {
  [key: string]:
    | number
    | { count: number; reportIds: number[] }
    | StrategicKpisResponse
    | undefined;
  UNASSIGNED?: { count: number; reportIds: number[] };
  PENDING_APPROVAL?: { count: number; reportIds: number[] };
  IN_PROGRESS?: { count: number; reportIds: number[] };
  OVERDUE?: { count: number; reportIds: number[] };
  OPEN?: { count: number; reportIds: number[] };
  DONE?: { count: number; reportIds: number[] };
  // Strategic KPIs
  strategicKpis?: StrategicKpisResponse;
}

export const useKpiData = (filters: AnalyticsFilters) => {
  // Default tarih değerleri ayarla
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date.toISOString().split('T')[0];
  };
  const getDefaultEndDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // MANTIKLI FİLTRELEME STRATEJİSİ:

  // 1. PERFORMANS METRİKLERİ: status filtresi HARİÇ, diğer filtreler DAHİL
  // (Çözüm süresi, müdahale süresi, başarı oranı gibi genel performans göstergeleri)
  const performanceFilters: AnalyticsFilters = {
    startDate: filters.startDate || getDefaultStartDate(),
    endDate: filters.endDate || getDefaultEndDate(),
    departmentId: filters.departmentId,
    categoryId: filters.categoryId,
    status: null, // Status HARİÇ - genel performansı gösterir
  };

  // 2. DURUM KARTLARI: status filtresi HARİÇ, diğer filtreler DAHİL
  // (UNASSIGNED, IN_PROGRESS, DONE gibi durum bazlı sayılar)
  const statusCountFilters: AnalyticsFilters = {
    startDate: filters.startDate || getDefaultStartDate(),
    endDate: filters.endDate || getDefaultEndDate(),
    departmentId: filters.departmentId,
    categoryId: filters.categoryId,
    status: null, // Status HARİÇ - tüm durumları gösterir
  };

  // 3. STRATEJİK KPI'LAR: TÜM filtreler DAHİL
  // (Yeniden açılan, trend analizi, vatandaş etkileşimi)
  const strategicFilters: AnalyticsFilters = {
    startDate: filters.startDate || getDefaultStartDate(),
    endDate: filters.endDate || getDefaultEndDate(),
    departmentId: filters.departmentId,
    categoryId: filters.categoryId,
    status: filters.status, // Status DAHİL - filtreli analiz
  };
  const results = useQueries({
    queries: [
      {
        queryKey: ['analytics', 'summary-stats', performanceFilters],
        queryFn: () => analyticsService.fetchSummaryStats(performanceFilters),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
      },
      {
        queryKey: ['analytics', 'counts', statusCountFilters],
        queryFn: () =>
          analyticsService.fetchCounts(statusCountFilters, [
            'UNASSIGNED',
            'PENDING_APPROVAL',
            'IN_PROGRESS',
            'OVERDUE',
            'OPEN',
            'DONE',
          ]),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
      },
      {
        queryKey: ['analytics', 'strategic-kpis', strategicFilters],
        queryFn: () => analyticsService.fetchStrategicKpis(strategicFilters),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
      },
    ],
  });

  const summaryQuery = results[0];
  const countsQuery = results[1];
  const strategicKpisQuery = results[2]; // Combine data from both endpoints into a single object
  const data = useMemo<CombinedKpiData | null>(() => {
    if (!summaryQuery.data || !countsQuery.data) return null; // BAŞARI ORANI HESAPLAMA MANTIGI:
    // Toplam rapor sayısını summary stats'tan al (doğru kaynak)
    // Count verisi status bazlı olduğu için toplam hesaplamada YANLIŞ sonuç verir
    const totalReports = summaryQuery.data.totalReportCount || 0;

    const doneCount = countsQuery.data.DONE?.count || 0;
    const calculatedResolutionRate =
      totalReports > 0 ? (doneCount / totalReports) * 100 : 0;

    return {
      ...summaryQuery.data,
      ...countsQuery.data,
      // Performance metrics'ten gelen değerleri kullan,
      // sadece başarı oranını count'tan eziyoruz
      resolutionRate: parseFloat(calculatedResolutionRate.toFixed(1)),
      totalReportCount: totalReports,
      // Strategic KPIs (filtrelere göre değişir)
      strategicKpis: strategicKpisQuery.data,
    };
  }, [summaryQuery.data, countsQuery.data, strategicKpisQuery.data]);
  const isLoading =
    summaryQuery.isLoading ||
    countsQuery.isLoading ||
    strategicKpisQuery.isLoading;
  const error =
    summaryQuery.error || countsQuery.error || strategicKpisQuery.error;
  const isError =
    summaryQuery.isError || countsQuery.isError || strategicKpisQuery.isError;

  // Debug log KPI data
  console.log('🎯 KPI Data Debug:', {
    combinedData: data,
    totalReportCount: data?.totalReportCount,
    summaryData: summaryQuery.data,
    countsData: countsQuery.data,
    isLoading,
    isError,
    filters,
  });

  return {
    data,
    isLoading,
    isError,
    error, // Individual query states for debugging
    summaryQuery: {
      data: summaryQuery.data,
      isLoading: summaryQuery.isLoading,
      error: summaryQuery.error,
    },
    countsQuery: {
      data: countsQuery.data,
      isLoading: countsQuery.isLoading,
      error: countsQuery.error,
    },
    strategicKpisQuery: {
      data: strategicKpisQuery.data,
      isLoading: strategicKpisQuery.isLoading,
      error: strategicKpisQuery.error,
    },
  };
};
