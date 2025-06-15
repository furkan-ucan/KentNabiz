import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface TeamMember {
  id: number;
  fullName: string;
  // Diğer alanlar eklenebilir
}

export function useTeamMembers(teamId: number | null, departmentId?: number) {
  return useQuery<TeamMember[]>({
    queryKey: ['teamMembers', teamId, departmentId],
    queryFn: async () => {
      if (!teamId) return [];
      const { data } = await axios.get(`/api/teams/${teamId}/members`);
      // API response: { data: [...] } formatında geliyor, array'i döndür
      return Array.isArray(data) ? data : data.data || [];
    },
    enabled: !!teamId,
  });
}
