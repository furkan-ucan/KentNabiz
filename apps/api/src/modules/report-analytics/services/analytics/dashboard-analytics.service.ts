import { Injectable } from '@nestjs/common';
import { Between } from 'typeorm';
import { ReportStatus, UserRole } from '@kentnabiz/shared';
import { JwtPayload as AuthUser } from '../../../auth/interfaces/jwt-payload.interface';
import { CitizenSummaryDto } from '../../dto/citizen-summary.dto';
import {
  CoreAnalyticsService,
  CountResult,
  AvgDaysResult,
  CountsResponse,
} from './core-analytics.service';

export interface DashboardStatsResult {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  myReports: number;
  averageResolutionTime: number;
}

export interface SummaryStatsResponse {
  avgResolutionDays: number;
  avgInterventionHours: number;
  avgFirstResponseHours: number;
  resolutionRate: number;
  totalReportCount: number;
}

@Injectable()
export class DashboardAnalyticsService extends CoreAnalyticsService {
  /**
   * Get citizen summary statistics for homepage
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
    const reportsResolvedThisMonth = await this.reportRepository.count({
      where: {
        status: ReportStatus.DONE,
        resolvedAt: Between(startOfMonth, startOfNextMonth),
      },
    });

    // 3) Aktif Katkıda Bulunan Vatandaşlar (Distinct userId)
    const contributorResult = (await this.reportRepository
      .createQueryBuilder('report')
      .select('COUNT(DISTINCT(report.userId))', 'count')
      .getRawOne()) as CountResult | null;

    const activeCitizenContributors = contributorResult?.count
      ? parseInt(contributorResult.count, 10)
      : 0;

    // 4) Ortalama Çözüm Süresi (gün olarak)
    const avgResolutionResult = (await this.reportRepository
      .createQueryBuilder('report')
      .select('AVG(EXTRACT(EPOCH FROM (report.resolvedAt - report.createdAt)) / 86400)', 'avgDays')
      .where('report.status = :status', { status: ReportStatus.DONE })
      .andWhere('report.resolvedAt IS NOT NULL')
      .getRawOne()) as AvgDaysResult | null;

    const averageResolutionTimeDays = avgResolutionResult?.avgDays
      ? parseFloat(avgResolutionResult.avgDays)
      : null;

    // 5) Bekleyen Raporlar
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
   * Get dashboard statistics for admin/team users
   */
  async getDashboardStats(authUser?: AuthUser): Promise<DashboardStatsResult> {
    const totalReports = await this.reportRepository.count();
    const pendingReports = await this.reportRepository.count({
      where: [
        { status: ReportStatus.OPEN },
        { status: ReportStatus.IN_REVIEW },
        { status: ReportStatus.IN_PROGRESS },
      ],
    });
    const resolvedReports = await this.reportRepository.count({
      where: { status: ReportStatus.DONE },
    });

    let myReports = 0;
    if (authUser?.sub) {
      myReports = await this.reportRepository.count({
        where: { userId: authUser.sub },
      });
    } // Calculate average resolution time in days
    let averageResolutionTime = 0;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const avgResolutionResult = await this.dataSource.query(`
        SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400), 0) as avg_days
        FROM reports
        WHERE status = 'DONE' AND resolved_at IS NOT NULL AND deleted_at IS NULL
      `);

      if (Array.isArray(avgResolutionResult) && avgResolutionResult.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        averageResolutionTime = Number(avgResolutionResult[0]?.avg_days) || 0;
      }
    } catch {
      // Default to 0 if query fails
      averageResolutionTime = 0;
    }

    return {
      totalReports,
      pendingReports,
      resolvedReports,
      myReports,
      averageResolutionTime,
    };
  }

  /**
   * Get dashboard counts with filters
   */
  async getDashboardCounts(
    filters: {
      startDate?: string;
      endDate?: string;
      departmentId?: number;
      categoryId?: number;
      status?: string;
    },
    authUser?: AuthUser
  ): Promise<CountsResponse> {
    const { startDate, endDate, departmentId, categoryId, status } = filters;

    let baseQuery = this.reportRepository.createQueryBuilder('report');

    // Apply date filters
    if (startDate) {
      baseQuery = baseQuery.andWhere('report.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      baseQuery = baseQuery.andWhere('report.createdAt <= :endDate', { endDate });
    }

    // Apply filters
    if (departmentId) {
      baseQuery = baseQuery.andWhere('report.currentDepartmentId = :departmentId', {
        departmentId,
      });
    }
    if (categoryId) {
      baseQuery = baseQuery.andWhere('report.categoryId = :categoryId', { categoryId });
    }
    if (status) {
      baseQuery = baseQuery.andWhere('report.status = :status', { status });
    } // Role-based filtering - departman supervisorü kendi departmanının verilerini görür
    if (
      authUser &&
      (authUser.roles.includes(UserRole.TEAM_MEMBER) ||
        authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR))
    ) {
      if (authUser.departmentId) {
        baseQuery = baseQuery.andWhere('report.currentDepartmentId = :userDeptId', {
          userDeptId: authUser.departmentId,
        });
      }
    } // Get detailed report data with assignments for KPI calculations
    const allReports = await baseQuery
      .leftJoinAndSelect('report.assignments', 'assignment')
      .select([
        'report.id',
        'report.status',
        'report.subStatus',
        'report.createdAt',
        'assignment.id',
        'assignment.assignedAt',
      ])
      .getMany();

    const reportIds = allReports.map(r => r.id);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Basic status counts
    const totalCount = allReports.length;
    const openCount = allReports.filter(r => r.status === ReportStatus.OPEN).length;
    const inReviewCount = allReports.filter(r => r.status === ReportStatus.IN_REVIEW).length;
    const inProgressCount = allReports.filter(r => r.status === ReportStatus.IN_PROGRESS).length;
    const doneCount = allReports.filter(r => r.status === ReportStatus.DONE).length;
    const rejectedCount = allReports.filter(r => r.status === ReportStatus.REJECTED).length;

    // KPI-specific calculations
    // UNASSIGNED: OPEN status and no assignments
    const unassignedReports = allReports.filter(
      r => r.status === ReportStatus.OPEN && (!r.assignments || r.assignments.length === 0)
    ); // PENDING_APPROVAL: IN_PROGRESS status with PENDING_APPROVAL sub_status
    // (takım işi tamamladı, supervisor onayı bekliyor)
    const pendingApprovalReports = allReports.filter(
      r => r.status === ReportStatus.IN_PROGRESS && r.subStatus === 'PENDING_APPROVAL'
    );

    // OVERDUE: IN_PROGRESS status and older than 7 days
    const overdueReports = allReports.filter(
      r => r.status === ReportStatus.IN_PROGRESS && r.createdAt < sevenDaysAgo
    );

    return {
      total: { count: totalCount, reportIds },
      open: {
        count: openCount,
        reportIds: allReports.filter(r => r.status === ReportStatus.OPEN).map(r => r.id),
      },
      inReview: {
        count: inReviewCount,
        reportIds: allReports.filter(r => r.status === ReportStatus.IN_REVIEW).map(r => r.id),
      },
      inProgress: {
        count: inProgressCount,
        reportIds: allReports.filter(r => r.status === ReportStatus.IN_PROGRESS).map(r => r.id),
      },
      done: {
        count: doneCount,
        reportIds: allReports.filter(r => r.status === ReportStatus.DONE).map(r => r.id),
      },
      rejected: {
        count: rejectedCount,
        reportIds: allReports.filter(r => r.status === ReportStatus.REJECTED).map(r => r.id),
      },

      // Frontend KPI kartları için yeni alanlar
      UNASSIGNED: { count: unassignedReports.length, reportIds: unassignedReports.map(r => r.id) },
      PENDING_APPROVAL: {
        count: pendingApprovalReports.length,
        reportIds: pendingApprovalReports.map(r => r.id),
      },
      IN_PROGRESS: {
        count: inProgressCount,
        reportIds: allReports.filter(r => r.status === ReportStatus.IN_PROGRESS).map(r => r.id),
      },
      OVERDUE: { count: overdueReports.length, reportIds: overdueReports.map(r => r.id) },
      OPEN: {
        count: openCount,
        reportIds: allReports.filter(r => r.status === ReportStatus.OPEN).map(r => r.id),
      },
      DONE: {
        count: doneCount,
        reportIds: allReports.filter(r => r.status === ReportStatus.DONE).map(r => r.id),
      },
    };
  }
}
