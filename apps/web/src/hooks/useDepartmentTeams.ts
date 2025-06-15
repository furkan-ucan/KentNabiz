import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { TeamStatus } from '@kentnabiz/shared';

export interface Team {
  id: number;
  name: string;
  departmentId: number;
  memberCount?: number;
  status: TeamStatus;
}

interface DepartmentTeamsResponse {
  data: Team[];
  meta: {
    total: number;
  };
}

/**
 * Belirli bir departmanın takımlarını getiren hook
 * @param departmentId - Takımları getirilecek departman ID'si
 * @param enabled - Query'yi etkinleştir/devre dışı bırak
 * @param onlyAvailable - Sadece müsait takımları getir (varsayılan: true)
 */
export const useDepartmentTeams = (
  departmentId?: number,
  enabled = true,
  onlyAvailable = true
) => {
  return useQuery<DepartmentTeamsResponse>({
    queryKey: ['department-teams', departmentId, onlyAvailable],
    queryFn: async () => {
      if (!departmentId) {
        throw new Error('Department ID is required');
      }
      const params = onlyAvailable ? '?status=AVAILABLE' : '';
      const response = await api.get(
        `/teams/department/${departmentId}${params}`
      );
      return response.data;
    },
    enabled: enabled && !!departmentId,
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika
  });
};
