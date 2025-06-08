import { api } from '../lib/api';
import type { SharedReport, ReportStatus } from '@kentnabiz/shared';

export interface ReportFilters {
  status?: ReportStatus;
  category?: string;
  priority?: string;
  departmentId?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
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
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  averageResolutionTime?: number; // Gün cinsinden ortalama çözüm süresi
}

export const reportService = {
  // Departman sorumlusu için raporları getir
  async getSupervisorReports(
    queryParams: ReportFilters & PaginationParams = {}
  ): Promise<ReportsResponse> {
    const params = new URLSearchParams();

    // Filtreler
    if (queryParams.status) params.append('status', queryParams.status);
    if (queryParams.category) params.append('category', queryParams.category);
    if (queryParams.priority) params.append('priority', queryParams.priority);
    if (queryParams.departmentId)
      params.append('departmentId', queryParams.departmentId.toString());
    if (queryParams.dateFrom) params.append('dateFrom', queryParams.dateFrom);
    if (queryParams.dateTo) params.append('dateTo', queryParams.dateTo);
    if (queryParams.search) params.append('search', queryParams.search);

    // Sayfalama
    if (queryParams.page) params.append('page', queryParams.page.toString());
    if (queryParams.limit) params.append('limit', queryParams.limit.toString());
    if (queryParams.sortBy) params.append('sortBy', queryParams.sortBy);
    if (queryParams.sortOrder)
      params.append('sortOrder', queryParams.sortOrder);

    const response = await api.get(`/reports?${params.toString()}`);
    return response.data;
  },

  // Departman sorumlusu için istatistikleri getir
  async getSupervisorStats(): Promise<ReportStats> {
    const response = await api.get(`/report-analytics/dashboard`);
    return response.data;
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
};
