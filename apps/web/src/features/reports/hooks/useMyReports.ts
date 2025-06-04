import { useQuery } from '@tanstack/react-query';
import { getMyReports, GetMyReportsParams } from '../services/reportService';
import { useAppSelector } from '@/hooks/redux';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { ReportStatus, SharedReport } from '@kentnabiz/shared';

export const useMyReports = (params: GetMyReportsParams = {}) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return useQuery({
    queryKey: ['reports', 'my', params],
    queryFn: () => getMyReports(params),
    enabled: isAuthenticated, // Sadece login olmuş kullanıcılar için çalıştır
    staleTime: 2 * 60 * 1000, // 2 dakika
    gcTime: 5 * 60 * 1000, // 5 dakika
    retry: 2,
  });
};

// Aktif raporlar için hook (IN_REVIEW, IN_PROGRESS)
export const useActiveReports = (limit: number = 3) => {
  return useMyReports({
    status: [
      ReportStatus.OPEN,
      ReportStatus.IN_REVIEW,
      ReportStatus.IN_PROGRESS,
    ],
    limit,
  });
};

// Çözülmüş raporlar için hook
export const useResolvedReports = (limit: number = 3) => {
  return useMyReports({
    status: ReportStatus.DONE,
    limit,
  });
};

// Bekleyen raporlar için hook
export const usePendingReports = (limit: number = 3) => {
  return useMyReports({
    status: ReportStatus.OPEN,
    limit,
  });
};

// Dashboard için optimize edilmiş hook (sadece gerekli veriler)
export const useReportsDashboard = () => {
  const activeReports = useActiveReports(3);
  const resolvedReports = useResolvedReports(3);

  return {
    activeReports: {
      ...activeReports,
      data: activeReports.data?.data || [], // Paginated response'dan data array'ini al
    },
    resolvedReports: {
      ...resolvedReports,
      data: resolvedReports.data?.data || [],
    },
    isLoading: activeReports.isLoading || resolvedReports.isLoading,
    error: activeReports.error || resolvedReports.error,
  };
};

// ReportCard için optimized data selector
export const selectReportCardData = (reports: SharedReport[]) => {
  return reports.map(report => ({
    id: report.id,
    title: report.title,
    excerpt:
      report.description?.substring(0, 100) +
        (report.description?.length > 100 ? '...' : '') ||
      'Açıklama bulunmuyor', // Generate excerpt from description
    status: report.status,
    reportType: report.type,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    supportCount: 0, // Bu alan SharedReport'ta yok
    commentCount: 0, // Bu alan SharedReport'ta yok
    imageUrl: report.reportMedias?.[0]?.url, // First image as imageUrl
    location:
      report.location && 'coordinates' in report.location
        ? {
            latitude: report.location.coordinates[1],
            longitude: report.location.coordinates[0],
          }
        : undefined,
  }));
};
