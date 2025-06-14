import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { SharedReport, ReportStatus } from '@kentnabiz/shared';

type ReportFilters = {
  status?: ReportStatus | 'ALL';
};

/**
 * Giriş yapmış kullanıcının (takım lideri) takımına atanmış raporları getiren hook.
 * @param filters - Raporları filtrelemek için kullanılacak kriterler (örn: status)
 */
export const useMyTeamReports = (filters: ReportFilters = {}) => {
  return useQuery<SharedReport[], Error>({
    // Query key'i filtreleri de içermeli ki, filtre değiştiğinde veri yeniden çekilsin.
    queryKey: ['myTeamReports', filters],
    queryFn: async () => {
      // 'ALL' filtresi geldiğinde status parametresini göndermemek için kontrol
      const params =
        filters.status && filters.status !== 'ALL'
          ? { status: filters.status }
          : {};

      const response = await api.get('/teams/my-team/reports', { params });

      // API'nizin response yapısına göre ayarlayın.
      // Eğer { data: [...] } ise response.data.data, direkt array ise response.data
      return response.data.data;
    },
    staleTime: 1 * 60 * 1000, // 1 dakika
    refetchOnWindowFocus: true,
  });
};
