// services/categoryService.ts
import apiClient from '../lib/api/client';
import type {
  SharedReportCategory,
  MunicipalityDepartment,
  ReportType,
} from '@kentnabiz/shared';

// CategoryResponseDto is equivalent to SharedReportCategory with id
type CategoryResponseDto = SharedReportCategory & {
  departmentId: number;
  defaultReportType: ReportType;
};

const CATEGORIES_ENDPOINT = '/report-categories';

export const categoryService = {
  /**
   * Tüm kategorileri getirir (düz liste)
   */ async fetchCategories(
    includeInactive: boolean = false
  ): Promise<CategoryResponseDto[]> {
    const response = await apiClient.get<CategoryResponseDto[]>(
      CATEGORIES_ENDPOINT,
      {
        params: { includeInactive },
      }
    );
    return response.data;
  },

  /**
   * YENI: Departmana göre kategorileri getirir (CIMER benzeri akış için)
   */
  async fetchCategoriesByDepartment(
    departmentCode: MunicipalityDepartment
  ): Promise<CategoryResponseDto[]> {
    console.log(
      '--- fetchCategoriesByDepartment CALLED for departmentCode:',
      departmentCode
    );
    try {
      const response = await apiClient.get<CategoryResponseDto[]>(
        CATEGORIES_ENDPOINT,
        {
          params: { departmentCode },
        }
      );
      console.log(
        `API ${CATEGORIES_ENDPOINT}?departmentCode=${departmentCode} RAW RESPONSE:`,
        response
      );
      console.log('Response data type:', typeof response.data);
      console.log('Response data structure:', response.data);

      if (Array.isArray(response.data)) {
        console.log(
          'Categories by department fetched successfully, count:',
          response.data.length
        );
        return response.data;
      } else {
        console.warn(
          '[fetchCategoriesByDepartment] Unexpected API response structure:',
          response.data
        );
        return [];
      }
    } catch (err) {
      console.error('fetchCategoriesByDepartment ERROR:', err);
      throw err;
    }
  },

  /**
   * Ana kategorileri getirir (parentId null olanlar)
   */ async fetchMainCategories(): Promise<CategoryResponseDto[]> {
    console.log('--- fetchMainCategories CALLED ---');
    try {
      // API'den gelen yanıt: { data: CategoryResponseDto[] } şeklinde wrapper obje
      const response = await apiClient.get<{ data: CategoryResponseDto[] }>(
        `${CATEGORIES_ENDPOINT}/parent/0`
      );
      console.log('API /report-categories/parent/0 RAW RESPONSE:', response);
      console.log('Response data type:', typeof response.data);
      console.log('Response data structure:', response.data);

      // Asıl kategori dizisi response.data.data içinde
      if (response.data && Array.isArray(response.data.data)) {
        console.log(
          'Extracting category array from response.data.data, length:',
          response.data.data.length
        );
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        // Fallback: API doğrudan dizi dönerse (beklenmeyen durum)
        console.log('API response.data is already an array (fallback case)');
        return response.data;
      } else {
        console.warn(
          '[fetchMainCategories] Unexpected API response structure:',
          response.data
        );
        return [];
      }
    } catch (err) {
      console.error('fetchMainCategories ERROR:', err);
      throw err;
    }
  },
  /**
   * Belirli bir ana kategorinin alt kategorilerini getirir
   */ async fetchSubCategories(
    parentId: number
  ): Promise<CategoryResponseDto[]> {
    console.log('--- fetchSubCategories CALLED for parentId:', parentId);
    try {
      const response = await apiClient.get<{ data: CategoryResponseDto[] }>(
        `${CATEGORIES_ENDPOINT}/parent/${parentId}`
      );
      console.log(
        `API /report-categories/parent/${parentId} RAW RESPONSE:`,
        response
      );

      // Asıl kategori dizisi response.data.data içinde
      if (response.data && Array.isArray(response.data.data)) {
        console.log(
          'Extracting sub-category array from response.data.data, length:',
          response.data.data.length
        );
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        // Fallback: API doğrudan dizi dönerse
        console.log('API response.data is already an array (fallback case)');
        return response.data;
      } else {
        console.warn(
          '[fetchSubCategories] Unexpected API response structure:',
          response.data
        );
        return [];
      }
    } catch (err) {
      console.error('fetchSubCategories ERROR:', err);
      throw err;
    }
  },

  /**
   * ID'ye göre tek kategori getirir
   */ async fetchCategoryById(id: number): Promise<CategoryResponseDto> {
    const response = await apiClient.get<CategoryResponseDto>(
      `${CATEGORIES_ENDPOINT}/${id}`
    );
    return response.data;
  },

  /**
   * Koda göre tek kategori getirir
   */ async fetchCategoryByCode(code: string): Promise<CategoryResponseDto> {
    const response = await apiClient.get<CategoryResponseDto>(
      `${CATEGORIES_ENDPOINT}/code/${code}`
    );
    return response.data;
  },
};

// Export individual functions for easier use in hooks
export const fetchCategoriesByDepartment =
  categoryService.fetchCategoriesByDepartment;
export const fetchMainCategories = categoryService.fetchMainCategories;
export const fetchSubCategories = categoryService.fetchSubCategories;
export const fetchCategoryById = categoryService.fetchCategoryById;
export const fetchCategoryByCode = categoryService.fetchCategoryByCode;
