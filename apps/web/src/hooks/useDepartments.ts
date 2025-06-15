import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Department {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface DepartmentsResponse {
  data: Department[];
  total: number;
}

export function useDepartments(enabled = true) {
  return useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      console.log('🔍 Fetching departments...');
      const { data } = await api.get('/reports/departments');
      console.log('✅ Departments API response:', data);
      // API /reports/departments endpoint'i { data: Department[] } formatında dönüyor
      return data.data || data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 dakika cache
    gcTime: 10 * 60 * 1000, // 10 dakika cache (cacheTime eskidi)
  });
}
