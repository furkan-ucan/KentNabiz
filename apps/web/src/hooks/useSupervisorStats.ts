import { useQuery } from '@tanstack/react-query';
import { reportService, type ReportStats } from '../services/reportService';

export const useSupervisorStats = () => {
  return useQuery<ReportStats>({
    queryKey: ['supervisor-stats'],
    queryFn: () => reportService.getSupervisorStats(),
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika (eski cacheTime)
    refetchOnWindowFocus: false,
  });
};
