import apiClient from '../lib/api/client';
import type { MunicipalityDepartment } from '@kentnabiz/shared';

export interface Department {
  id: number;
  code: MunicipalityDepartment;
  name: string;
  description?: string;
  isActive: boolean;
}

const DEPARTMENTS_ENDPOINT = '/reports/departments';

export const departmentService = {
  /**
   * Aktif departmanları getirir
   */
  async fetchDepartments(): Promise<Department[]> {
    console.log('--- fetchDepartments CALLED ---');
    try {
      const response = await apiClient.get<Department[]>(DEPARTMENTS_ENDPOINT);
      console.log('API /reports/departments RAW RESPONSE:', response);
      console.log('Response data type:', typeof response.data);
      console.log('Response data structure:', response.data);

      if (Array.isArray(response.data)) {
        console.log(
          'Departments fetched successfully, count:',
          response.data.length
        );
        return response.data;
      } else {
        console.warn(
          '[fetchDepartments] Unexpected API response structure:',
          response.data
        );
        return [];
      }
    } catch (err) {
      console.error('fetchDepartments ERROR:', err);
      throw err;
    }
  },

  /**
   * Kod ile departman getirir
   */
  async fetchDepartmentByCode(
    code: MunicipalityDepartment
  ): Promise<Department | null> {
    try {
      const departments = await this.fetchDepartments();
      return departments.find(dept => dept.code === code) || null;
    } catch (err) {
      console.error('fetchDepartmentByCode ERROR:', err);
      throw err;
    }
  },
};

// Export individual functions for easier use in hooks
export const fetchDepartments = departmentService.fetchDepartments;
export const fetchDepartmentByCode = departmentService.fetchDepartmentByCode;
