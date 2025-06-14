import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { SharedReport, ReportStatus } from '@kentnabiz/shared';

interface MyReportsResponse {
  data: SharedReport[];
  total: number;
  page: number;
  limit: number;
}

interface MyReportsFilters {
  status?: ReportStatus[] | ReportStatus | 'ALL';
  page?: number;
  limit?: number;
}

/**
 * Giriş yapmış kullanıcının kendi raporlarını getiren hook (CITIZEN için).
 * Kullanıcının oluşturduğu tüm raporları getirir.
 * @param filters - Raporları filtrelemek için kullanılacak kriterler
 */
export const useMyReports = (filters: MyReportsFilters = {}) => {
  return useQuery<MyReportsResponse, Error>({
    queryKey: ['myReports', filters],
    queryFn: async () => {
      try {
        // API parametrelerini hazırla
        const params: Record<string, string | number> = {
          page: filters.page || 1,
          limit: filters.limit || 10,
        };

        // Status filtresi varsa ekle
        if (filters.status && filters.status !== 'ALL') {
          if (Array.isArray(filters.status)) {
            // Birden fazla status için
            params.status = filters.status.join(',');
          } else {
            // Tek status için
            params.status = filters.status;
          }
        }

        console.log('🔍 MyReports API Request params:', params);

        const response = await api.get('/reports/my-reports', { params });

        console.log('✅ MyReports API Response:', response.data);

        return response.data;
      } catch (error) {
        console.error('❌ MyReports API Error:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 dakika
    refetchOnWindowFocus: true,
    enabled: true, // Her zaman aktif
  });
};

/**
 * Kullanıcının aktif raporlarını getiren helper hook.
 * Sadece OPEN, IN_REVIEW, IN_PROGRESS durumundaki raporları getirir.
 */
export const useMyActiveReports = (limit: number = 5) => {
  return useMyReports({
    status: [
      ReportStatus.OPEN,
      ReportStatus.IN_REVIEW,
      ReportStatus.IN_PROGRESS,
    ],
    limit,
    page: 1,
  });
};

/**
 * Kullanıcının tamamlanan raporlarını getiren helper hook.
 * Sadece DONE durumundaki raporları getirir.
 */
export const useMyCompletedReports = (limit: number = 10) => {
  return useMyReports({
    status: ReportStatus.DONE,
    limit,
    page: 1,
  });
};
