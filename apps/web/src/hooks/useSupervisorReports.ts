import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/reportService';
import { useDashboardStore } from '@/store/dashboardStore';
import type {
  ReportsResponse,
  PaginationParams,
} from '@/services/reportService';

export const useSupervisorReports = (pagination: PaginationParams) => {
  const filters = useDashboardStore(state => state.filters);

  // Query key artık hem filtreleri hem de sayfalama bilgisini içerecek
  const queryKey = ['supervisorReports', { ...filters, ...pagination }];

  return useQuery<ReportsResponse, Error>({
    queryKey: queryKey,
    queryFn: () =>
      reportService.getSupervisorReports({ ...filters, ...pagination }),
    staleTime: 1000 * 60,
    placeholderData: previousData => previousData,
  });
};
