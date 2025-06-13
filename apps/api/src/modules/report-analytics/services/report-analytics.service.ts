import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource } from 'typeorm';
import { Report } from '../../reports/entities/report.entity';
import { CitizenSummaryDto } from '../dto/citizen-summary.dto';
import { ReportStatus, UserRole } from '@kentnabiz/shared';
import { JwtPayload as AuthUser } from '../../auth/interfaces/jwt-payload.interface';

// TypeORM getRawOne() sonuçları için tip tanımları
interface CountResult {
  count: string;
}

interface AvgDaysResult {
  avgDays: string;
}

// Yeni modüler yapı için interface'ler - EXPORTED
export interface DashboardCountResult {
  count: number;
  reportIds: number[];
}

export interface CountsResponse {
  [key: string]: DashboardCountResult;
}

export interface SummaryStatsResponse {
  avgResolutionDays: number;
  avgInterventionHours: number;
  avgFirstResponseHours: number;
  resolutionRate: number;
  totalReportCount: number;
}

// Strategic KPIs için yeni interface'ler
export interface ReopenedReportsResult {
  count: number;
  reportIds: number[];
}

// Funnel Chart için interface
export interface FunnelStatsResult {
  totalReports: number;
  assignedReports: number;
  resolvedReports: number;
}

export interface TrendingIssueResult {
  categoryName: string | null;
  categoryCode: string | null;
  percentageIncrease: number;
  currentPeriodCount: number;
  previousPeriodCount: number;
}

export interface CitizenInteractionResult {
  totalSupports: number;
}

// Temporal Trend Chart için interface'ler
export interface TemporalQueryDto {
  granularity: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  departmentId?: number;
}

export interface TemporalDataPoint {
  date: string;
  createdCount: number;
  resolvedCount: number;
}

// Debug fonksiyonu için veri tip tanımları
interface DebugReportData {
  total_reports: string;
  resolved_reports: string;
  pending_reports: string;
  latest_report_date: Date | null;
  latest_update_date: Date | null;
}

interface DebugAssignmentData {
  total_assignments: string;
  accepted_assignments: string;
  latest_assignment: Date | null;
  latest_acceptance: Date | null;
}

export interface DashboardStatsResult {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  myReports: number;
  averageResolutionTime: number;
}

@Injectable()
export class ReportAnalyticsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private dataSource: DataSource
  ) {}

  /**
   * Vatandaş ana sayfası için gereken beş metrik:
   * 1) totalReportsResolvedAllTime  = status = 'DONE'
   * 2) reportsResolvedThisMonth     = aynı kriter, bu ay içinde
   * 3) activeCitizenContributors    = DISTINCT(userId) sayısı (en az bir rapor göndermiş)
   * 4) averageResolutionTimeDays    = Ortalama çözüm süresi (gün olarak)
   * 5) pendingReportsCount          = OPEN, IN_REVIEW, IN_PROGRESS durumundaki raporlar
   */
  async getCitizenSummary(_authUser?: AuthUser): Promise<CitizenSummaryDto> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based; Ocak = 0, Şubat = 1, …

    // Bu ayın başlangıç ve bitiş tarihleri
    const startOfMonth = new Date(year, month, 1, 0, 0, 0);
    const startOfNextMonth = new Date(year, month + 1, 1, 0, 0, 0);

    // 1) Toplam Çözülen Raporlar (All-Time)
    const totalResolvedAllTime = await this.reportRepository.count({
      where: {
        status: ReportStatus.DONE,
      },
    });

    // 2) Bu Ay Çözülen Raporlar
    // resolvedAt tarihinin bu ay içinde olması gerekiyor
    const reportsResolvedThisMonth = await this.reportRepository.count({
      where: {
        status: ReportStatus.DONE,
        resolvedAt: Between(startOfMonth, startOfNextMonth),
      },
    }); // 3) Aktif Katkıda Bulunan Vatandaşlar (Distinct userId)
    // "reports" tablosundaki benzersiz userId sayısı
    const contributorResult = (await this.reportRepository
      .createQueryBuilder('report')
      .select('COUNT(DISTINCT(report.userId))', 'count')
      .getRawOne()) as CountResult | null;

    const activeCitizenContributors = contributorResult?.count
      ? parseInt(contributorResult.count, 10)
      : 0;

    // 4) Ortalama Çözüm Süresi (gün olarak)
    // DONE durumundaki raporlar için createdAt ile resolvedAt arasındaki fark
    const avgResolutionResult = (await this.reportRepository
      .createQueryBuilder('report')
      .select('AVG(EXTRACT(EPOCH FROM (report.resolvedAt - report.createdAt)) / 86400)', 'avgDays')
      .where('report.status = :status', { status: ReportStatus.DONE })
      .andWhere('report.resolvedAt IS NOT NULL')
      .getRawOne()) as AvgDaysResult | null;

    const averageResolutionTimeDays = avgResolutionResult?.avgDays
      ? parseFloat(avgResolutionResult.avgDays)
      : null;

    // 5) Bekleyen Rapor Sayısı (OPEN, IN_REVIEW, IN_PROGRESS)
    const pendingReportsCount = await this.reportRepository.count({
      where: [
        { status: ReportStatus.OPEN },
        { status: ReportStatus.IN_REVIEW },
        { status: ReportStatus.IN_PROGRESS },
      ],
    });

    return {
      totalReportsResolvedAllTime: totalResolvedAllTime,
      reportsResolvedThisMonth,
      activeCitizenContributors,
      averageResolutionTimeDays,
      pendingReportsCount,
    };
  }

  /**
   * Dashboard stats for citizen dashboard
   * Maps from citizen summary to dashboard format
   */
  async getDashboardStats(authUser?: AuthUser): Promise<DashboardStatsResult> {
    const summary = await this.getCitizenSummary();

    // Kullanıcının kendi rapor sayısı (eğer authenticated ise)
    let myReports = 0;
    if (authUser) {
      myReports = await this.reportRepository.count({
        where: { userId: authUser.sub },
      });
    }

    // Toplam rapor sayısı (tüm durumlar)
    const totalReports = await this.reportRepository.count();

    // Frontend'in beklediği format
    return {
      totalReports, // Tüm raporlar
      pendingReports: summary.pendingReportsCount || 0,
      resolvedReports: summary.totalReportsResolvedAllTime, // Sadece çözülen raporlar
      myReports,
      averageResolutionTime: Math.round(summary.averageResolutionTimeDays || 0),
    };
  }

  /**
   * KPI Metrics - Materialized View kullanarak performanslı analiz
   * Tarih aralığı ve departman filtrelerine göre temel KPI metriklerini hesaplar
   */

  /**
   * Materialized View'ı manuel olarak yeniler
   * Production'da cron job ile otomatik yapılmalı
   */
  async refreshAnalyticsView(): Promise<Date> {
    await this.dataSource.query('REFRESH MATERIALIZED VIEW report_analytics_mv;');
    return new Date();
  }

  /**
   * DEBUG: Veritabanı durumunu kontrol etmek için
   * Gerçek rapor sayıları vs Materialized View karşılaştırması
   */
  async getDebugDatabaseStatus(authUser: AuthUser) {
    const departmentFilter = authUser.departmentId;
    const isAdmin = authUser.roles.includes(UserRole.SYSTEM_ADMIN);

    // Admin kullanıcıları için departman filtresi opsiyonel
    if (!isAdmin && !departmentFilter) {
      throw new Error('Department ID is required for this analysis.');
    }

    // 1. Gerçek reports tablosundan veri
    const realReportsQuery = isAdmin
      ? `
        SELECT
          COUNT(*) as total_reports,
          COUNT(*) FILTER (WHERE status = 'DONE') as resolved_reports,
          COUNT(*) FILTER (WHERE status IN ('OPEN', 'IN_REVIEW', 'IN_PROGRESS')) as pending_reports,
          MAX(created_at) as latest_report_date,
          MAX(updated_at) as latest_update_date
        FROM reports
        WHERE deleted_at IS NULL;
      `
      : `
        SELECT
          COUNT(*) as total_reports,
          COUNT(*) FILTER (WHERE status = 'DONE') as resolved_reports,
          COUNT(*) FILTER (WHERE status IN ('OPEN', 'IN_REVIEW', 'IN_PROGRESS')) as pending_reports,
          MAX(created_at) as latest_report_date,
          MAX(updated_at) as latest_update_date
        FROM reports
        WHERE deleted_at IS NULL
          AND current_department_id = $1;
      `;

    // 2. Materialized View'dan veri
    const mvQuery = isAdmin
      ? `
        SELECT
          COUNT(*) as total_reports,
          COUNT(*) FILTER (WHERE status = 'DONE') as resolved_reports,
          COUNT(*) FILTER (WHERE status IN ('OPEN', 'IN_REVIEW', 'IN_PROGRESS')) as pending_reports,
          MAX(created_at) as latest_report_date,
          MAX(updated_at) as latest_update_date
        FROM report_analytics_mv;
      `
      : `
        SELECT
          COUNT(*) as total_reports,
          COUNT(*) FILTER (WHERE status = 'DONE') as resolved_reports,
          COUNT(*) FILTER (WHERE status IN ('OPEN', 'IN_REVIEW', 'IN_PROGRESS')) as pending_reports,
          MAX(created_at) as latest_report_date,
          MAX(updated_at) as latest_update_date
        FROM report_analytics_mv
        WHERE department_id = $1;
      `;

    // 3. Assignments tablosu kontrol
    const assignmentsQuery = isAdmin
      ? `
        SELECT
          COUNT(*) as total_assignments,
          COUNT(*) FILTER (WHERE accepted_at IS NOT NULL) as accepted_assignments,
          MAX(assigned_at) as latest_assignment,
          MAX(accepted_at) as latest_acceptance
        FROM assignments a
        JOIN reports r ON a.report_id = r.id
        WHERE a.deleted_at IS NULL
          AND r.deleted_at IS NULL;
      `
      : `
        SELECT
          COUNT(*) as total_assignments,
          COUNT(*) FILTER (WHERE accepted_at IS NOT NULL) as accepted_assignments,
          MAX(assigned_at) as latest_assignment,
          MAX(accepted_at) as latest_acceptance
        FROM assignments a
        JOIN reports r ON a.report_id = r.id
        WHERE a.deleted_at IS NULL
          AND r.deleted_at IS NULL
          AND r.current_department_id = $1;
      `;

    // Type-safe veri alımı with proper assertions
    const queryParams = isAdmin ? [] : [departmentFilter];
    const realDataResult = (await this.dataSource.query(
      realReportsQuery,
      queryParams
    )) as unknown as DebugReportData[];
    const mvDataResult = (await this.dataSource.query(
      mvQuery,
      queryParams
    )) as unknown as DebugReportData[];
    const assignmentDataResult = (await this.dataSource.query(
      assignmentsQuery,
      queryParams
    )) as unknown as DebugAssignmentData[];

    const realData: DebugReportData = realDataResult?.[0] || {
      total_reports: '0',
      resolved_reports: '0',
      pending_reports: '0',
      latest_report_date: null,
      latest_update_date: null,
    };
    const mvData: DebugReportData = mvDataResult?.[0] || {
      total_reports: '0',
      resolved_reports: '0',
      pending_reports: '0',
      latest_report_date: null,
      latest_update_date: null,
    };
    const assignmentData: DebugAssignmentData = assignmentDataResult?.[0] || {
      total_assignments: '0',
      accepted_assignments: '0',
      latest_assignment: null,
      latest_acceptance: null,
    };

    return {
      departmentId: departmentFilter,
      realReportsTable: {
        totalReports: parseInt(realData.total_reports || '0', 10),
        resolvedReports: parseInt(realData.resolved_reports || '0', 10),
        pendingReports: parseInt(realData.pending_reports || '0', 10),
        latestReportDate: realData.latest_report_date,
        latestUpdateDate: realData.latest_update_date,
      },
      materializedView: {
        totalReports: parseInt(mvData.total_reports || '0', 10),
        resolvedReports: parseInt(mvData.resolved_reports || '0', 10),
        pendingReports: parseInt(mvData.pending_reports || '0', 10),
        latestReportDate: mvData.latest_report_date,
        latestUpdateDate: mvData.latest_update_date,
      },
      assignments: {
        totalAssignments: parseInt(assignmentData.total_assignments || '0', 10),
        acceptedAssignments: parseInt(assignmentData.accepted_assignments || '0', 10),
        latestAssignment: assignmentData.latest_assignment,
        latestAcceptance: assignmentData.latest_acceptance,
      },
      dataSyncStatus: {
        isInSync:
          parseInt(realData.total_reports || '0', 10) === parseInt(mvData.total_reports || '0', 10),
        difference:
          parseInt(realData.total_reports || '0', 10) - parseInt(mvData.total_reports || '0', 10),
      },
    };
  }

  /**
   * Yeni modüler yapı: Dashboard sayıları ve report ID'leri
   * KPI kartlarına tıklandığında drill-down için kullanılacak
   */
  async getDashboardCounts(
    filters: {
      startDate: string;
      endDate: string;
      departmentId?: number;
      categoryId?: string;
      status?: string;
    },
    types: string[],
    authUser: AuthUser
  ): Promise<CountsResponse> {
    // Admin değilse kendi departmanını kullan
    const effectiveDepartmentId = authUser.roles?.includes(UserRole.SYSTEM_ADMIN)
      ? filters.departmentId
      : authUser.departmentId;

    const whereClauses = this._buildWhereClause({
      ...filters,
      departmentId: effectiveDepartmentId || undefined,
    });

    // Her tip için COUNT ve reportIds array'i oluştur
    const caseQueries = types
      .map(type => {
        const condition = this._getConditionForType(type);
        return `
        COUNT(*) FILTER (WHERE ${condition}) AS "${type}_count",
        ARRAY_AGG(report_id) FILTER (WHERE ${condition}) AS "${type}_ids"
      `;
      })
      .join(', ');

    const query = `
      SELECT ${caseQueries}
      FROM report_analytics_mv
      WHERE ${whereClauses.sql}
    `;

    // TypeORM query her zaman any döndürür, bu normal davranış
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.dataSource.query(query, whereClauses.params);

    // Sonucu frontend'in beklediği formata dönüştür
    const formattedResult: CountsResponse = {};
    if (Array.isArray(result) && result.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const rawData = result[0];
      for (const type of types) {
        const countKey = `${type}_count`;
        const idsKey = `${type}_ids`;
        formattedResult[type] = {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          count: parseInt(String(rawData[countKey] || '0'), 10),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          reportIds: Array.isArray(rawData[idsKey])
            ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              (rawData[idsKey] as number[]).filter((id: number) => id !== null)
            : [],
        };
      }
    }

    return formattedResult;
  }

  /**
   * Yeni modüler yapı: Sadece özet istatistikleri
   * Ortalama, oran gibi hesaplamalı metrikler
   */
  async getSummaryStats(
    filters: {
      startDate: string;
      endDate: string;
      departmentId?: number;
      categoryId?: string;
      status?: string;
    },
    authUser: AuthUser
  ): Promise<SummaryStatsResponse> {
    // Admin değilse kendi departmanını kullan
    const effectiveDepartmentId = authUser.roles?.includes(UserRole.SYSTEM_ADMIN)
      ? filters.departmentId
      : authUser.departmentId;

    const whereClauses = this._buildWhereClause({
      ...filters,
      departmentId: effectiveDepartmentId || undefined,
    });

    const query = `
      SELECT
        -- Ortalama çözüm süresini saat olarak hesapla
        AVG(CASE
          WHEN status = 'DONE' AND resolution_duration_seconds > 0 AND resolution_duration_seconds < 7776000
          THEN resolution_duration_seconds
        END) / 3600.0 AS avg_resolution_hours,

        -- Ortalama müdahale süresini saat olarak hesapla
        AVG(CASE
          WHEN intervention_duration_seconds > 0 AND intervention_duration_seconds < 7776000
          THEN intervention_duration_seconds
        END) / 3600.0 AS avg_intervention_hours,

        -- İlk müdahale süresini hesapla
        AVG(CASE
          WHEN first_assigned_at IS NOT NULL AND first_assigned_at > created_at
          THEN EXTRACT(EPOCH FROM (first_assigned_at - created_at)) / 3600.0
        END) AS avg_first_response_hours,

        -- Toplam rapor sayısı
        COUNT(*) AS total_report_count,

        -- Çözülen rapor sayısı
        COUNT(*) FILTER (WHERE status = 'DONE') AS resolved_report_count
      FROM report_analytics_mv
      WHERE ${whereClauses.sql}
    `;

    // TypeORM query her zaman any döndürür, bu normal davranış
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.dataSource.query(query, whereClauses.params);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = Array.isArray(result) && result.length > 0 ? result[0] : {};

    // Helper fonksiyonu ile güvenli veri çıkarma
    const safeParseInt = (value: unknown): number => {
      if (value === null || value === undefined) return 0;
      if (typeof value === 'number') return Math.floor(value);
      if (typeof value === 'string') return parseInt(value, 10) || 0;
      return 0;
    };

    const safeParseFloat = (value: unknown): number => {
      if (value === null || value === undefined) return 0;
      if (typeof value === 'number') return value;
      if (typeof value === 'string') return parseFloat(value) || 0;
      return 0;
    };

    const totalReports = safeParseInt((data as Record<string, unknown>).total_report_count);
    const resolvedReports = safeParseInt((data as Record<string, unknown>).resolved_report_count);
    const resolutionRate = totalReports > 0 ? (resolvedReports / totalReports) * 100 : 0;

    return {
      avgResolutionDays:
        safeParseFloat((data as Record<string, unknown>).avg_resolution_hours) / 24, // Saatten güne çevir
      avgInterventionHours: safeParseFloat(
        (data as Record<string, unknown>).avg_intervention_hours
      ),
      avgFirstResponseHours: safeParseFloat(
        (data as Record<string, unknown>).avg_first_response_hours
      ),
      resolutionRate: parseFloat(resolutionRate.toFixed(1)),
      totalReportCount: totalReports,
    };
  }

  /**
   * Helper method: Farklı count tipleri için koşulları döndür
   */
  private _getConditionForType(type: string): string {
    switch (type) {
      case 'PENDING_APPROVAL':
        // sub_status kolonu olmadığı için status'a göre ayarlayalım
        return "status = 'IN_REVIEW'";
      case 'UNASSIGNED':
        return "status = 'OPEN' AND first_assigned_at IS NULL";
      case 'OVERDUE':
        return "status = 'IN_PROGRESS' AND created_at < NOW() - INTERVAL '7 days'";
      case 'RESOLVED_TODAY':
        return "status = 'DONE' AND DATE(updated_at) = CURRENT_DATE";
      case 'IN_PROGRESS':
        return "status = 'IN_PROGRESS'";
      case 'OPEN':
        return "status = 'OPEN'";
      case 'DONE':
        return "status = 'DONE'";
      case 'REJECTED':
        return "status = 'REJECTED'";
      case 'CANCELLED':
        return "status = 'CANCELLED'";
      default:
        return '1=0'; // Bilinmeyen tip için hiçbir şey döndürme
    }
  }

  /**
   * Helper method: Filtrelerden WHERE koşulu oluştur
   */
  private _buildWhereClause(filters: {
    startDate: string;
    endDate: string;
    departmentId?: number;
    categoryId?: string;
    status?: string;
  }): { sql: string; params: (string | number)[] } {
    const conditions = ['created_at >= $1', 'created_at <= $2'];
    const params = [filters.startDate, filters.endDate];

    if (filters.departmentId) {
      conditions.push(`department_id = $${params.length + 1}`);
      params.push(filters.departmentId.toString());
    }

    if (filters.categoryId) {
      conditions.push(`category_code = $${params.length + 1}`);
      params.push(filters.categoryId);
    }

    if (filters.status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(filters.status);
    }

    return {
      sql: conditions.join(' AND '),
      params,
    };
  }

  // ==================== STRATEGIC KPIs METHODS ====================

  /**
   * Yeniden açılan raporları hesapla
   */
  async getReopenedReportsCount(
    filters: {
      startDate: string;
      endDate: string;
      departmentId?: number;
      categoryId?: string;
    },
    authUser: AuthUser
  ): Promise<ReopenedReportsResult> {
    // Admin değilse kendi departmanını kullan
    const effectiveDepartmentId = authUser.roles?.includes(UserRole.SYSTEM_ADMIN)
      ? filters.departmentId
      : authUser.departmentId;

    // Bu karmaşık sorgu, ReportStatusHistory tablosunu kullanarak
    // DONE durumundan tekrar OPEN/IN_PROGRESS'e geçen raporları bulur
    let baseQuery = `
      SELECT
        COUNT(DISTINCT t2.report_id) as count,
        ARRAY_AGG(DISTINCT t2.report_id) as report_ids
      FROM
        report_status_history t1 -- Raporun 'DONE' olduğu anı bul
      JOIN
        report_status_history t2 ON t1.report_id = t2.report_id
      JOIN
        reports r ON t1.report_id = r.id
      WHERE
        t1.new_status = 'DONE'
        AND t2.new_status IN ('OPEN', 'IN_PROGRESS')
        AND t2.changed_at > t1.changed_at
        AND t1.changed_at BETWEEN $1 AND $2
        AND r.deleted_at IS NULL
    `;

    const params: (string | number)[] = [filters.startDate, filters.endDate];
    let paramIndex = 3;

    // Departman filtresi
    if (effectiveDepartmentId) {
      baseQuery += ` AND r.current_department_id = $${paramIndex}`;
      params.push(effectiveDepartmentId);
      paramIndex++;
    }

    // Kategori filtresi
    if (filters.categoryId) {
      baseQuery += ` AND EXISTS (
        SELECT 1 FROM report_categories rc
        WHERE rc.id = r.category_id AND rc.code = $${paramIndex}
      )`;
      params.push(filters.categoryId);
      paramIndex++;
    }

    try {
      interface ReopenedQueryResult {
        count: string;
        report_ids: number[];
      }

      const result = await this.dataSource.query(baseQuery, params);

      if (result && Array.isArray(result) && result.length > 0) {
        const row = result[0] as ReopenedQueryResult;
        return {
          count: parseInt(row.count, 10) || 0,
          reportIds: row.report_ids || [],
        };
      }

      return { count: 0, reportIds: [] };
    } catch (error) {
      console.error('Error in getReopenedReportsCount:', error);
      // Fallback: ReportStatusHistory tablosu yoksa basit yaklaşım
      return { count: 0, reportIds: [] };
    }
  }

  /**
   * Trend olan sorunu bul
   */
  async getTrendingIssue(
    filters: {
      startDate: string;
      endDate: string;
      departmentId?: number;
      categoryId?: string;
    },
    authUser: AuthUser
  ): Promise<TrendingIssueResult> {
    // Admin değilse kendi departmanını kullan
    const effectiveDepartmentId = authUser.roles?.includes(UserRole.SYSTEM_ADMIN)
      ? filters.departmentId
      : authUser.departmentId;

    // Son 7 gün vs önceki 7 gün karşılaştırması
    const endDate = new Date(filters.endDate);
    const midDate = new Date(endDate);
    midDate.setDate(endDate.getDate() - 7);
    const startDate = new Date(midDate);
    startDate.setDate(midDate.getDate() - 7);

    // İki ayrı periyot için kategori bazında rapor sayıları
    let baseQuery = `
      WITH current_period AS (
        SELECT
          category_code,
          COUNT(*) as current_count
        FROM report_analytics_mv
        WHERE created_at BETWEEN $1 AND $2
          AND category_code IS NOT NULL
    `;

    let previousPeriodQuery = `
      ), previous_period AS (
        SELECT
          category_code,
          COUNT(*) as previous_count
        FROM report_analytics_mv
        WHERE created_at BETWEEN $3 AND $4
          AND category_code IS NOT NULL
    `;

    const params: (string | number)[] = [
      midDate.toISOString(),
      endDate.toISOString(),
      startDate.toISOString(),
      midDate.toISOString(),
    ];
    let paramIndex = 5;

    // Departman filtresi
    if (effectiveDepartmentId) {
      const departmentFilter = ` AND department_id = $${paramIndex}`;
      baseQuery += departmentFilter;
      previousPeriodQuery += departmentFilter;
      params.push(effectiveDepartmentId);
      paramIndex++;
    }

    // Kategori filtresi (belirli bir kategori seçilmişse o kategoriyi dikkate al)
    if (filters.categoryId) {
      const categoryFilter = ` AND category_code = $${paramIndex}`;
      baseQuery += categoryFilter;
      previousPeriodQuery += categoryFilter;
      params.push(filters.categoryId);
    }

    const fullQuery = `
      ${baseQuery}
        GROUP BY category_code
      ${previousPeriodQuery}
        GROUP BY category_code
      )
      SELECT
        COALESCE(c.category_code, p.category_code) as category_code,
        COALESCE(c.current_count, 0) as current_count,
        COALESCE(p.previous_count, 0) as previous_count,
        CASE
          WHEN COALESCE(p.previous_count, 0) = 0 THEN
            CASE WHEN COALESCE(c.current_count, 0) > 0 THEN 999 ELSE 0 END
          ELSE
            ROUND(((COALESCE(c.current_count, 0) - COALESCE(p.previous_count, 0))::NUMERIC / p.previous_count) * 100, 2)
        END as percentage_increase
      FROM current_period c
      FULL OUTER JOIN previous_period p ON c.category_code = p.category_code
      WHERE COALESCE(c.current_count, 0) > COALESCE(p.previous_count, 0)  -- SADECE ARTAN KATEGORILER
      ORDER BY percentage_increase DESC
      LIMIT 1;
    `;

    try {
      interface TrendingQueryResult {
        category_code: string;
        current_count: string;
        previous_count: string;
        percentage_increase: string;
      }

      const result = await this.dataSource.query(fullQuery, params);

      if (result && Array.isArray(result) && result.length > 0) {
        const row = result[0] as TrendingQueryResult;
        return {
          categoryName: row.category_code || null, // TODO: Category name mapping
          categoryCode: row.category_code || null,
          percentageIncrease: parseFloat(row.percentage_increase) || 0,
          currentPeriodCount: parseInt(row.current_count, 10) || 0,
          previousPeriodCount: parseInt(row.previous_count, 10) || 0,
        };
      }

      return {
        categoryName: null,
        categoryCode: null,
        percentageIncrease: 0,
        currentPeriodCount: 0,
        previousPeriodCount: 0,
      };
    } catch (error) {
      console.error('Error in getTrendingIssue:', error);
      return {
        categoryName: null,
        categoryCode: null,
        percentageIncrease: 0,
        currentPeriodCount: 0,
        previousPeriodCount: 0,
      };
    }
  }

  /**
   * Vatandaş etkileşim skorunu hesapla
   */
  async getCitizenInteractionScore(
    filters: {
      startDate: string;
      endDate: string;
      departmentId?: number;
      categoryId?: string;
    },
    authUser: AuthUser
  ): Promise<CitizenInteractionResult> {
    // Admin değilse kendi departmanını kullan
    const effectiveDepartmentId = authUser.roles?.includes(UserRole.SYSTEM_ADMIN)
      ? filters.departmentId
      : authUser.departmentId;

    // Materialized View'dan support_count toplamını al
    let baseQuery = `
      SELECT
        COALESCE(SUM(support_count), 0) as total_supports
      FROM report_analytics_mv
      WHERE created_at BETWEEN $1 AND $2
    `;

    const params: (string | number)[] = [filters.startDate, filters.endDate];
    let paramIndex = 3;

    // Departman filtresi
    if (effectiveDepartmentId) {
      baseQuery += ` AND department_id = $${paramIndex}`;
      params.push(effectiveDepartmentId);
      paramIndex++;
    }

    // Kategori filtresi
    if (filters.categoryId) {
      baseQuery += ` AND category_code = $${paramIndex}`;
      params.push(filters.categoryId);
    }

    try {
      interface SupportCountResult {
        total_supports: string;
      }

      const result = await this.dataSource.query(baseQuery, params);

      if (result && Array.isArray(result) && result.length > 0) {
        const row = result[0] as SupportCountResult;
        return {
          totalSupports: parseInt(row.total_supports, 10) || 0,
        };
      }

      return { totalSupports: 0 };
    } catch (error) {
      console.error('Error in getCitizenInteractionScore:', error);
      // Fallback: support_count kolonu yoksa 0 döndür
      return { totalSupports: 0 };
    }
  }
}
