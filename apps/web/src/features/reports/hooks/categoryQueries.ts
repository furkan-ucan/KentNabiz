/**
 * Category Queries - React Query hooks for category data
 */

import { useQuery } from '@tanstack/react-query';
import {
  fetchMainCategories,
  fetchSubCategories,
  fetchCategoriesByDepartment,
} from '@/services/categoryService';
import type {
  SharedReportCategory,
  MunicipalityDepartment,
} from '@kentnabiz/shared';

export const RQ_KEY_MAIN_CATEGORIES = 'mainCategories';
export const RQ_KEY_SUB_CATEGORIES = 'subCategories';
export const RQ_KEY_CATEGORIES_BY_DEPARTMENT = 'categoriesByDepartment';

/**
 * Hook to fetch main categories (parent categories)
 * These are the top-level categories like "ULAŞIM İHBAR", "GASKİ", etc.
 */
export function useMainCategories() {
  return useQuery<SharedReportCategory[], Error>({
    queryKey: [RQ_KEY_MAIN_CATEGORIES],
    queryFn: fetchMainCategories,
    staleTime: Infinity, // Main categories don't change frequently
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch sub-categories for a given parent category
 * @param parentId - ID of the parent category
 * @param enabled - Whether to enable the query (default: true when parentId is provided)
 */
export function useSubCategories(parentId?: number, enabled = true) {
  return useQuery<SharedReportCategory[], Error>({
    queryKey: [RQ_KEY_SUB_CATEGORIES, parentId],
    queryFn: () => fetchSubCategories(parentId!),
    enabled: enabled && !!parentId && parentId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * YENI: Departmana göre kategorileri getirir (CIMER benzeri akış için)
 * @param departmentCode - Departman kodu
 * @param enabled - Query'yi aktif etmek için (default: true when departmentCode is provided)
 */
export function useCategoriesByDepartment(
  departmentCode?: MunicipalityDepartment,
  enabled = true
) {
  return useQuery<SharedReportCategory[], Error>({
    queryKey: [RQ_KEY_CATEGORIES_BY_DEPARTMENT, departmentCode],
    queryFn: () => fetchCategoriesByDepartment(departmentCode!),
    enabled: enabled && !!departmentCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
