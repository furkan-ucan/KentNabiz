/**
 * Department Queries - React Query hooks for department data
 */

import { useQuery } from '@tanstack/react-query';
import {
  fetchDepartments,
  type Department,
} from '@/services/departmentService';
import type { MunicipalityDepartment } from '@kentnabiz/shared';

export const RQ_KEY_DEPARTMENTS = 'departments';

/**
 * Hook to fetch all active departments
 * Used in the first step of CIMER-like report creation flow
 */
export function useDepartments() {
  return useQuery<Department[], Error>({
    queryKey: [RQ_KEY_DEPARTMENTS],
    queryFn: fetchDepartments,
    staleTime: Infinity, // Departments don't change frequently
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get a department by its code from cached departments
 * @param departmentCode - The department code to find
 */
export function useDepartmentByCode(departmentCode?: MunicipalityDepartment) {
  const { data: departments, ...rest } = useDepartments();

  const department =
    departments?.find(dept => dept.code === departmentCode) || null;

  return {
    ...rest,
    data: department,
  };
}
