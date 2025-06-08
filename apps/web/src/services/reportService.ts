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
}

export const reportService = {
  // Departman sorumlusu için raporları getir
  async getSupervisorReports(
    filters: ReportFilters = {},
    pagination: PaginationParams = {}
  ): Promise<ReportsResponse> {
    const params = new URLSearchParams();

    // Filtreler
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.departmentId)
      params.append('departmentId', filters.departmentId.toString());
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.search) params.append('search', filters.search);

    // Sayfalama
    if (pagination.page) params.append('page', pagination.page.toString());
    if (pagination.limit) params.append('limit', pagination.limit.toString());
    if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);

    const response = await api.get(`/reports/supervisor?${params.toString()}`);
    return response.data;
  },

  // Departman sorumlusu için istatistikleri getir
  async getSupervisorStats(departmentId?: number): Promise<ReportStats> {
    const params = departmentId ? `?departmentId=${departmentId}` : '';
    const response = await api.get(`/reports/supervisor/stats${params}`);
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
