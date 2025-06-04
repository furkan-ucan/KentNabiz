// apps/web/src/features/reports/hooks/useMyReportsQuery.ts
import { useQuery } from '@tanstack/react-query';
import { Paginated, SharedReport } from '@kentnabiz/shared';
import { getMyReports, GetMyReportsParams } from '../services/reportService';

export const RQ_KEY_MY_REPORTS_LIST = 'myReportsList'; // Sabit query key

export function useMyReports(params: GetMyReportsParams = {}) {
  return useQuery<Paginated<SharedReport>, Error>({
    queryKey: [RQ_KEY_MY_REPORTS_LIST, params],
    queryFn: () => getMyReports(params),
    staleTime: 2 * 60 * 1000, // 2 dakika
    gcTime: 5 * 60 * 1000, // 5 dakika
    // keepPreviousData: true, // Sayfalama sırasında eski veriyi göstermek için faydalı olabilir
  });
}
