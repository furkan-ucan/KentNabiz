import { api } from '../lib/api';
import type { SharedReport, ReportStatus } from '@kentnabiz/shared';

export interface ReportFilters {
  status?: ReportStatus | ReportStatus[];
  category?: string;
  priority?: string;
  departmentId?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  supported?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ReportsResponse {
  data: SharedReport[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ReportStats {
  totalReports: number;
  totalPendingReports: number;
  totalResolvedReports: number;
  totalRejectedReports: number;
  averageResolutionTime?: number; // Milisaniye cinsinden ortalama çözüm süresi
  statusDistribution: Array<{ status: string; count: number }>;
}

export interface StatusCounts {
  [key: string]: number | undefined;
  OPEN?: number;
  IN_REVIEW?: number;
  IN_PROGRESS?: number;
  DONE?: number;
  REJECTED?: number;
  CANCELLED?: number;
  total?: number;
}

export const reportService = {
  // Departman sorumlusu için raporları getir
  async getSupervisorReports(
    queryParams: ReportFilters & PaginationParams = {}
  ): Promise<ReportsResponse> {
    const params = new URLSearchParams();

    // Filtreler
    if (queryParams.status) {
      // Status array ise (ACTIVE filter için), her birini ayrı ayrı ekle
      // Status tek değer ise (gerçek ReportStatus), direkt ekle
      if (Array.isArray(queryParams.status)) {
        queryParams.status.forEach(status => params.append('status', status));
      } else {
        params.append('status', queryParams.status);
      }
    }
    if (queryParams.category) params.append('category', queryParams.category);
    if (queryParams.priority) params.append('priority', queryParams.priority);
    if (queryParams.departmentId)
      params.append('departmentId', queryParams.departmentId.toString());
    if (queryParams.dateFrom) params.append('dateFrom', queryParams.dateFrom);
    if (queryParams.dateTo) params.append('dateTo', queryParams.dateTo);
    if (queryParams.search) params.append('search', queryParams.search);
    if (queryParams.supported !== undefined)
      params.append('supported', queryParams.supported.toString());

    // Sayfalama
    if (queryParams.page) params.append('page', queryParams.page.toString());
    if (queryParams.limit) params.append('limit', queryParams.limit.toString());
    if (queryParams.sortBy) params.append('sortBy', queryParams.sortBy);
    if (queryParams.sortOrder)
      params.append('sortOrder', queryParams.sortOrder);

    const response = await api.get(`/reports?${params.toString()}`);

    // Hem eski hem yeni backend response formatını destekle
    const backendData = response.data;
    // Eğer data.data varsa (yeni format), yoksa data kullan
    const reportsArray = Array.isArray(backendData.data)
      ? backendData.data
      : Array.isArray(backendData.data?.data)
        ? backendData.data.data
        : [];
    const total = backendData.total ?? backendData.data?.total ?? 0;
    const page = backendData.page ?? backendData.data?.page ?? 1;
    const limit = backendData.limit ?? backendData.data?.limit ?? 10;
    return {
      data: reportsArray,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Departman sorumlusu için istatistikleri getir
  async getSupervisorStats(): Promise<ReportStats> {
    const response = await api.get(`/report-analytics/dashboard`);

    // Backend'den gelen response formatını handle et
    const backendData = response.data.data || response.data;

    console.log('Backend stats response:', response.data);
    console.log('Mapped backend data:', backendData);

    return {
      totalReports: backendData.totalReports || 0,
      totalPendingReports: backendData.totalPendingReports || 0,
      totalResolvedReports: backendData.totalResolvedReports || 0,
      totalRejectedReports: backendData.totalRejectedReports || 0,
      averageResolutionTime: backendData.averageResolutionTime,
      statusDistribution: backendData.statusDistribution || [],
    };
  },
  // Rapor detayını getir
  async getReport(id: number): Promise<SharedReport> {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  // Rapor durumunu güncelle (sadece departman sorumlusu)
  async updateReportStatus(
    id: number,
    status: ReportStatus,
    note?: string
  ): Promise<SharedReport> {
    const response = await api.patch(`/reports/${id}/status`, { status, note });
    return response.data;
  },

  // Raporu departman ekibine ata
  async assignReport(id: number, assigneeId: number): Promise<SharedReport> {
    const response = await api.patch(`/reports/${id}/assign`, { assigneeId });
    return response.data;
  },

  // Durum sayılarını getir
  async getStatusCounts(): Promise<StatusCounts> {
    const response = await api.get('/reports/status-counts');
    // API'den gelen veri {data: {OPEN: 0, ...}} formatında olduğu için data.data'ya erişiyoruz
    return response.data.data || response.data;
  },

  // Raporu onayla (sadece departman sorumlusu)
  async approveReport(id: number, notes?: string): Promise<SharedReport> {
    const response = await api.patch(`/reports/${id}/approve`, { notes });
    return response.data;
  },

  // Raporu reddet (sadece departman sorumlusu)
  async rejectReport(id: number, reason: string): Promise<SharedReport> {
    const response = await api.patch(`/reports/${id}/reject`, { reason });
    return response.data;
  },

  // Raporu başka departmana yönlendir
  async forwardReport(
    id: number,
    departmentId: number,
    reason: string
  ): Promise<{ success: boolean; message: string; reportId: number }> {
    const response = await api.patch(`/reports/${id}/forward`, {
      departmentId,
      reason,
    });
    return response.data;
  },

  // Desteklenen rapor sayısını getir
  async getSupportedReportsCount(): Promise<{ count: number }> {
    const response = await api.get('/reports/supported-count');
    return response.data;
  },
};
