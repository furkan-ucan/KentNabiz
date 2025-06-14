import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/reportService';

export const useSupportedReportsCount = () => {
  return useQuery({
    queryKey: ['supportedReportsCount'],
    queryFn: () => reportService.getSupportedReportsCount(),
    staleTime: 1000 * 60 * 5, // 5 dakika cache
    refetchInterval: 1000 * 60 * 10, // 10 dakikada bir otomatik güncelle
  });
};
