import {
  SharedReport,
  ReportStatus,
  ReportType,
  Paginated,
} from '@kentnabiz/shared';
import apiClient from '../../../lib/api/client';
import type { CreateReportFormData } from '../types/createReportForm.types';

// My Reports API params
export interface GetMyReportsParams {
  page?: number;
  limit?: number;
  status?: ReportStatus | ReportStatus[];
  reportType?: ReportType;
  search?: string;
}

// My Reports Stats
export interface MyReportsStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  byType: {
    [key in ReportType]: number;
  };
}

// Get my reports with pagination and filters
export const getMyReports = async (
  params: GetMyReportsParams = {}
): Promise<Paginated<SharedReport>> => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.status) {
    if (Array.isArray(params.status)) {
      params.status.forEach(s => searchParams.append('status', s));
    } else {
      searchParams.set('status', params.status);
    }
  }
  if (params.reportType) searchParams.set('reportType', params.reportType);
  if (params.search) searchParams.set('search', params.search);

  const response = await apiClient.get(
    `/reports/my-reports?${searchParams.toString()}`
  );

  // API response: { data: { data: { data: [...], total, ... } } }
  // Her durumda Paginated<SharedReport> döndür
  if (
    response.data?.data?.data &&
    Array.isArray(response.data.data.data.data)
  ) {
    return response.data.data.data;
  }
  if (response.data?.data && Array.isArray(response.data.data.data)) {
    return response.data.data;
  }
  if (Array.isArray(response.data.data)) {
    return response.data;
  }
  throw new Error('API yanıtı beklenen formatta değil');
};

// Get my reports statistics
export const getMyReportsStats = async (): Promise<MyReportsStats> => {
  const response = await apiClient.get('/reports/my-reports/stats');

  // Handle nested data wrapper format from API
  return response.data.data || response.data;
};

/**
 * Dashboard-specific report fetching functions
 * These replace the mock data hooks with real API calls
 */

/**
 * Fetch active reports for dashboard (IN_PROGRESS, IN_REVIEW, ASSIGNED)
 */
export const fetchActiveReports = async (
  limit = 3
): Promise<Paginated<SharedReport>> => {
  return getMyReports({
    limit,
    status: [
      ReportStatus.OPEN,
      ReportStatus.IN_REVIEW,
      ReportStatus.IN_PROGRESS,
    ],
  });
};

/**
 * Fetch solved reports for dashboard (DONE, CLOSED)
 */
export const fetchSolvedReports = async (
  limit = 3
): Promise<Paginated<SharedReport>> => {
  return getMyReports({
    limit,
    status: ReportStatus.DONE,
  });
};

/**
 * Fetch all user's active reports (for detailed view)
 */
export const fetchMyActiveReports = async (
  limit = 10
): Promise<Paginated<SharedReport>> => {
  return getMyReports({
    limit,
    status: ReportStatus.IN_PROGRESS,
  });
};

/**
 * Combined function to fetch dashboard reports with multiple statuses
 */
export const fetchDashboardReports = async () => {
  try {
    const [activeReports, solvedReports] = await Promise.all([
      fetchActiveReports(3),
      fetchSolvedReports(3),
    ]);

    return {
      activeReports,
      solvedReports,
    };
  } catch (error) {
    console.error('[reportService] Error fetching dashboard reports:', error);
    throw error;
  }
};

// Create a new report
export const createReport = async (data: CreateReportFormData) => {
  // 1. reportMedias kontrolü - TODO: Handle file uploads properly
  const reportMedias = undefined;

  // 2. location dönüşümü
  const location =
    data.location &&
    typeof data.location.lat === 'number' &&
    typeof data.location.lng === 'number'
      ? { latitude: data.location.lat, longitude: data.location.lng }
      : undefined;

  // 3. Payload oluştur - Updated for CIMER-like flow
  // reportType artık gönderilmiyor, backend kategoriden otomatik atayacak
  const payload = {
    title: data.title,
    description: data.description,
    location,
    address: data.address,
    departmentCode: data.departmentCode, // Required - selected department
    categoryId: data.categoryId, // Required - selected category (filtered by department)
    reportMedias,
    // Note: reportType will be auto-assigned by backend from category.defaultReportType
    // Note: mainCategoryId is legacy field, not used in new flow
  };

  // 4. Logla
  console.log(
    'API_PAYLOAD_GONDERILECEK (CIMER FLOW):',
    JSON.stringify(payload, null, 2)
  );
  console.log('FORM_DATA_RECEIVED (CIMER FLOW):', {
    departmentCode: data.departmentCode,
    categoryId: data.categoryId,
    title: data.title,
    address: data.address,
    // reportType: 'BACKEND_WILL_AUTO_ASSIGN',
  });

  // 5. API çağrısı
  const response = await apiClient.post('/reports', payload);

  // 6. Response'u logla (debugging için)
  console.log('API_RESPONSE_ALINDI:', JSON.stringify(response.data, null, 2));
  return response.data.data || response.data;
};
