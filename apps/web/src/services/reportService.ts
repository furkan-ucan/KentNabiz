import { api } from '../lib/api';
import type { SharedReport } from '@kentnabiz/shared';
import { ReportStatus } from '@kentnabiz/shared';

export interface ReportFilters {
  status?: ReportStatus | ReportStatus[];
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
  totalReports: number;
  totalPendingReports: number;
  totalResolvedReports: number;
  totalRejectedReports: number;
  averageResolutionTime?: number; // Milisaniye cinsinden ortalama çözüm süresi
  statusDistribution: Array<{ status: string; count: number }>;
}

// Status sayıları için özel interface
export interface StatusCounts {
  [ReportStatus.OPEN]: number;
  [ReportStatus.IN_REVIEW]: number;
  [ReportStatus.IN_PROGRESS]: number;
  [ReportStatus.DONE]: number;
  [ReportStatus.REJECTED]: number;
  [ReportStatus.CANCELLED]: number;
  total: number;
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

  // Status sayıları için özel API çağrısı (filtresiz)
  async getStatusCounts(): Promise<StatusCounts> {
    try {
      // Önce yeni endpoint'i dene
      const response = await api.get('/reports/status-counts');
      const data = response.data.data || response.data;

      return {
        [ReportStatus.OPEN]: data[ReportStatus.OPEN] || 0,
        [ReportStatus.IN_REVIEW]: data[ReportStatus.IN_REVIEW] || 0,
        [ReportStatus.IN_PROGRESS]: data[ReportStatus.IN_PROGRESS] || 0,
        [ReportStatus.DONE]: data[ReportStatus.DONE] || 0,
        [ReportStatus.REJECTED]: data[ReportStatus.REJECTED] || 0,
        [ReportStatus.CANCELLED]: data[ReportStatus.CANCELLED] || 0,
        total: data.total || 0,
      };
    } catch {
      // Eğer endpoint yoksa, fallback to existing method
      console.warn(
        'Status counts endpoint not available, falling back to full data fetch'
      );

      // Mevcut API endpoint'lerini kullanarak status sayılarını hesapla
      // Büyük limit ile tüm departman raporlarını çek (filtresiz)
      const allReports = await this.getSupervisorReports({ limit: 1000 });

      const counts: StatusCounts = {
        [ReportStatus.OPEN]: 0,
        [ReportStatus.IN_REVIEW]: 0,
        [ReportStatus.IN_PROGRESS]: 0,
        [ReportStatus.DONE]: 0,
        [ReportStatus.REJECTED]: 0,
        [ReportStatus.CANCELLED]: 0,
        total: allReports.meta.total,
      };

      // Her raporu kontrol et ve ilgili status sayısını artır
      allReports.data.forEach(report => {
        if (report.status in counts) {
          counts[report.status]++;
        }
      });

      return counts;
    }
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
