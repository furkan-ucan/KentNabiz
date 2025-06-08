import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/reportService';
import type { StatusCounts } from '@/services/reportService';

export const useStatusCounts = () => {
  return useQuery<StatusCounts, Error>({
    queryKey: ['statusCounts'],
    queryFn: () => reportService.getStatusCounts(),
    staleTime: 1000 * 60 * 2, // 2 dakika cache
    refetchInterval: 1000 * 60 * 5, // 5 dakikada bir otomatik güncelle
  });
};
