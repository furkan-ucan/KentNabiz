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

  // Query key, parametreleri ve user context'ini içerir - bunlar değiştiğinde query yeniden çalışır
  const queryKey = [
    'supervisorReports',
    params,
    currentUser?.departmentId,
    currentUser?.sub,
  ];

  return useQuery({
    queryKey,
    queryFn: () => {
      // Eğer kullanıcının departmanı varsa, filtreler arasına ekle
      const queryParams = {
        ...params,
        departmentId:
          params.departmentId || currentUser?.departmentId || undefined,
      };

      return reportService.getSupervisorReports(queryParams);
    },
    staleTime: 3 * 60 * 1000, // 3 dakika - daha uzun stale time
    gcTime: 10 * 60 * 1000, // 10 dakika - daha uzun cache time
    refetchOnWindowFocus: false, // Performance için window focus'ta refetch yapma
    placeholderData: previousData => previousData, // TanStack Query v5 için keepPreviousData
    enabled: !!currentUser, // Sadece kullanıcı giriş yapmışsa çalıştır
    retry: 2, // Daha fazla retry
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

/**
 * Departman sorumlusu için istatistikleri getiren hook
 */
const useSupervisorStats = () => {
  const currentUser = getCurrentUser();

  return useQuery({
    queryKey: ['supervisorStats', currentUser?.departmentId],
    queryFn: () => reportService.getSupervisorStats(),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    enabled: !!currentUser,
  });
};

export { useSupervisorStats };
