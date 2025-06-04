import { useQuery } from '@tanstack/react-query';
import {
  getMyReports,
  getMyReportsStats,
  GetMyReportsParams,
} from '../services/reportService';

// React Query key factory
export const reportKeys = {
  all: ['reports'] as const,
  myReports: () => [...reportKeys.all, 'my'] as const,
  myReportsWithParams: (params: GetMyReportsParams) =>
    [...reportKeys.myReports(), params] as const,
  myStats: () => [...reportKeys.all, 'my', 'stats'] as const,
};

// Hook for fetching my reports with pagination and filters
export const useMyReports = (params: GetMyReportsParams = {}) => {
  return useQuery({
    queryKey: reportKeys.myReportsWithParams(params),
    queryFn: () => getMyReports(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};

// Hook for fetching my reports statistics
export const useMyReportsStats = () => {
  return useQuery({
    queryKey: reportKeys.myStats(),
    queryFn: getMyReportsStats,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });
};
