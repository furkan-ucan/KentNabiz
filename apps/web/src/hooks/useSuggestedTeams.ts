import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { TeamStatus } from '@kentnabiz/shared';

export interface SuggestedTeam {
  id: number;
  name: string;
  departmentId: number;
  status: TeamStatus;
  memberCount?: number;
  specializations?: string[];
}

export function useSuggestedTeams(reportId: number, departmentId?: number) {
  return useQuery<SuggestedTeam[]>({
    queryKey: ['suggestedTeams', reportId, departmentId],
    queryFn: async () => {
      console.log(
        `🔍 Fetching suggested teams for report ${reportId}, department ${departmentId}`
      );
      try {
        const { data } = await api.get(`/reports/${reportId}/suggested-teams`);
        console.log('✅ Suggested teams API response:', data);
        // API response: { data: [...] } formatında geliyor, array'i döndür
        const result = Array.isArray(data) ? data : data.data || [];
        console.log('📋 Processed suggested teams:', result);
        return result;
      } catch (error: unknown) {
        console.error('❌ Error fetching suggested teams:', error);
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as {
            response?: { data?: unknown; status?: number };
          };
          console.error('Response data:', axiosError.response?.data);
          console.error('Response status:', axiosError.response?.status);
        }
        // Hata durumunda boş array döndür, böylece UI bozulmaz
        return [];
      }
    },
    enabled: !!reportId,
    retry: 2,
    retryDelay: 1000,
  });
}
