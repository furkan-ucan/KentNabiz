import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  reportService,
  ReportsResponse,
  ReportFilters,
  PaginationParams,
} from '../services/reportService';
import { getCurrentUser } from '../utils/auth';

export interface UseSupervisorReportsParams
  extends ReportFilters,
    PaginationParams {}

/**
 * Departman sorumlusu için raporları getiren TanStack Query hook'u
 * Filtreleri ve sayfalamayı backend'de işler (server-side)
 */
export const useSupervisorReports = (
  params: UseSupervisorReportsParams = {}
): UseQueryResult<ReportsResponse, Error> => {
  const currentUser = getCurrentUser();

  // Query key, parametreleri içerir - parametreler değiştiğinde query yeniden çalışır
  const queryKey = ['supervisorReports', params, currentUser?.departmentId];

  return useQuery({
    queryKey,
    queryFn: () => {
      // Eğer kullanıcının departmanı varsa, filtreler arasına ekle
      const queryParams = {
        ...params,
        departmentId: params.departmentId || currentUser?.departmentId,
      };

      return reportService.getSupervisorReports(params, queryParams);
    },
    staleTime: 1000 * 60, // 1 dakika
    gcTime: 1000 * 60 * 5, // 5 dakika (formerly cacheTime)
    refetchOnWindowFocus: true,
    placeholderData: previousData => previousData, // TanStack Query v5 için keepPreviousData
    enabled: !!currentUser, // Sadece kullanıcı giriş yapmışsa çalıştır
  });
};

/**
 * Departman sorumlusu için istatistikleri getiren hook
 */
export const useSupervisorStats = () => {
  const currentUser = getCurrentUser();

  return useQuery({
    queryKey: ['supervisorStats', currentUser?.departmentId],
    queryFn: () =>
      reportService.getSupervisorStats(currentUser?.departmentId || undefined),
    staleTime: 1000 * 30, // 30 saniye (istatistikler daha sık güncellenebilir)
    gcTime: 1000 * 60 * 2, // 2 dakika
    refetchOnWindowFocus: true,
    enabled: !!currentUser,
  });
};
