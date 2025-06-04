import { useQuery } from '@tanstack/react-query';
import { Paginated, SharedReport } from '@kentnabiz/shared';
import {
  fetchActiveReports,
  fetchSolvedReports,
  fetchMyActiveReports,
} from '../services/reportService';

/**
 * Hook for fetching active reports for dashboard
 * @param limit - Number of reports to fetch (default: 3)
 */
export function useActiveReports(limit = 3) {
  return useQuery<Paginated<SharedReport>, Error>({
    queryKey: ['dashboardActiveReports', limit],
    queryFn: () => fetchActiveReports(limit),
    staleTime: 0, // invalidate sonrası her zaman refetch
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for fetching solved reports for dashboard
 * @param limit - Number of reports to fetch (default: 3)
 */
export function useSolvedReports(limit = 3) {
  return useQuery<Paginated<SharedReport>, Error>({
    queryKey: ['dashboardSolvedReports', limit],
    queryFn: () => fetchSolvedReports(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for fetching user's personal active reports
 * @param limit - Number of reports to fetch (default: 5)
 */
export function useMyActiveReports(limit = 5) {
  return useQuery<Paginated<SharedReport>, Error>({
    queryKey: ['myActiveReports', limit],
    queryFn: () => fetchMyActiveReports(limit),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for fetching user's personal resolved reports
 * @param limit - Number of reports to fetch (default: 5)
 */
export function useMyResolvedReports(limit = 5) {
  return useQuery<Paginated<SharedReport>, Error>({
    queryKey: ['myResolvedReports', limit],
    queryFn: () => fetchSolvedReports(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes (resolved reports change less frequently)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook for fetching recent community reports (all users)
 * @param limit - Number of reports to fetch (default: 6)
 */
export function useRecentCommunityReports(limit = 6) {
  return useQuery<Paginated<SharedReport>, Error>({
    queryKey: ['recentCommunityReports', limit],
    queryFn: async () => {
      // For now, fetch mixed active and solved reports from user's reports
      // TODO: Replace with actual community reports endpoint when available
      const [activeReports, solvedReports] = await Promise.all([
        fetchActiveReports(Math.ceil(limit / 2)),
        fetchSolvedReports(Math.floor(limit / 2)),
      ]);

      // Combine and slice to limit
      return {
        data: [
          ...(activeReports.data || []),
          ...(solvedReports.data || []),
        ].slice(0, limit),
        total: (activeReports.total || 0) + (solvedReports.total || 0),
        page: 1,
        limit,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}
