import { Injectable } from '@nestjs/common';
import { JwtPayload as AuthUser } from '../../../auth/interfaces/jwt-payload.interface';
import { UserRole } from '@kentnabiz/shared';
import { CoreAnalyticsService } from './core-analytics.service';

interface SummaryStatsQueryResult {
  total_count: string;
  resolved_count: string;
  avg_resolution_days: string;
  avg_first_response_hours: string;
  avg_intervention_hours: string;
}

interface TrendingQueryResult {
  category_name: string;
  category_code: string;
  percentage_increase: string;
  current_period_count: string;
  previous_period_count: string;
}

interface InteractionQueryResult {
  total_supports: string;
}

export interface SummaryStatsResponse {
  avgResolutionDays: number;
  avgInterventionHours: number;
  avgFirstResponseHours: number;
  resolutionRate: number;
  totalReportCount: number;
}

export interface ReopenedReportsResult {
  count: number;
  reportIds: number[];
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

@Injectable()
export class SummaryAnalyticsService extends CoreAnalyticsService {
  /**
   * Get summary statistics with performance metrics
   */
  async getSummaryStats(
    filters: {
      startDate?: string;
      endDate?: string;
      departmentId?: number;
      categoryId?: number;
    },
    authUser?: AuthUser
  ): Promise<SummaryStatsResponse> {
    const { startDate, endDate, departmentId, categoryId } = filters;

    // Build base conditions with type-safe parameters
    let whereConditions = ['r.deleted_at IS NULL'];
    const queryParams: (string | number | Date)[] = [];

    if (startDate) {
      whereConditions.push(`r.created_at >= $${queryParams.length + 1}`);
      queryParams.push(startDate);
    }
    if (endDate) {
      whereConditions.push(`r.created_at <= $${queryParams.length + 1}`);
      queryParams.push(endDate);
    }
    if (departmentId) {
      whereConditions.push(`r.current_department_id = $${queryParams.length + 1}`);
      queryParams.push(departmentId);
    }
    if (categoryId) {
      whereConditions.push(`r.category_id = $${queryParams.length + 1}`);
      queryParams.push(categoryId);
    } // Role-based filtering - departman supervisorü kendi departmanının verilerini görür
    if (
      authUser &&
      (authUser.roles.includes(UserRole.TEAM_MEMBER) ||
        authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR))
    ) {
      if (authUser.departmentId) {
        whereConditions.push(`r.current_department_id = $${queryParams.length + 1}`);
        queryParams.push(authUser.departmentId);
      }
    }

    const whereClause = whereConditions.join(' AND ');

    // Get all summary statistics in one query
    const summaryQuery = `
      SELECT
        -- Total report count
        COUNT(*) as total_count,

        -- Resolution rate
        COUNT(CASE WHEN r.status = 'DONE' THEN 1 END) as resolved_count,

        -- Average resolution time in days (only for resolved reports)
        AVG(
          CASE
            WHEN r.status = 'DONE' AND r.resolved_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM (r.resolved_at - r.created_at)) / 86400.0
            ELSE NULL
          END
        ) as avg_resolution_days,
          -- Average first response time in hours (time from creation to first assignment)
        AVG(
          CASE
            WHEN a.assigned_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM (a.assigned_at - r.created_at)) / 3600.0
            ELSE NULL
          END
        ) as avg_first_response_hours,

        -- Average intervention time in hours (from assignment to acceptance)
        AVG(
          CASE
            WHEN a.accepted_at IS NOT NULL AND a.assigned_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM (a.accepted_at - a.assigned_at)) / 3600.0
            ELSE NULL
          END
        ) as avg_intervention_hours
          FROM reports r
      LEFT JOIN (
        SELECT DISTINCT ON (report_id)
          report_id, assigned_at, accepted_at
        FROM assignments
        WHERE deleted_at IS NULL
        ORDER BY report_id, assigned_at ASC
      ) a ON r.id = a.report_id
      WHERE ${whereClause}
    `;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.dataSource.query(summaryQuery, queryParams);

    // Type-safe result handling
    let totalReportCount = 0;
    let resolvedCount = 0;
    let avgResolutionDays = 0;
    let avgFirstResponseHours = 0;
    let avgInterventionHours = 0;

    if (Array.isArray(result) && result.length > 0) {
      const stats = result[0] as SummaryStatsQueryResult;
      totalReportCount = parseInt(String(stats.total_count)) || 0;
      resolvedCount = parseInt(String(stats.resolved_count)) || 0;
      avgResolutionDays = parseFloat(String(stats.avg_resolution_days)) || 0;
      avgFirstResponseHours = parseFloat(String(stats.avg_first_response_hours)) || 0;
      avgInterventionHours = parseFloat(String(stats.avg_intervention_hours)) || 0;
    }

    return {
      totalReportCount,
      resolutionRate: totalReportCount > 0 ? (resolvedCount / totalReportCount) * 100 : 0,
      avgResolutionDays,
      avgFirstResponseHours,
      avgInterventionHours,
    };
  }
  /**
   * Get count of reopened reports (reports that were DONE but now have different status)
   */
  async getReopenedReportsCount(
    filters: {
      startDate?: string;
      endDate?: string;
      departmentId?: number;
    },
    authUser?: AuthUser
  ): Promise<ReopenedReportsResult> {
    const { startDate, endDate, departmentId } = filters;

    let whereConditions = ['r.deleted_at IS NULL'];
    const queryParams: (string | number | Date)[] = [];

    if (startDate) {
      whereConditions.push(`r.created_at >= $${queryParams.length + 1}`);
      queryParams.push(startDate);
    }
    if (endDate) {
      whereConditions.push(`r.created_at <= $${queryParams.length + 1}`);
      queryParams.push(endDate);
    }
    if (departmentId) {
      whereConditions.push(`r.current_department_id = $${queryParams.length + 1}`);
      queryParams.push(departmentId);
    } // Role-based filtering - departman supervisorü kendi departmanının verilerini görür
    if (
      authUser &&
      (authUser.roles.includes(UserRole.TEAM_MEMBER) ||
        authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR))
    ) {
      if (authUser.departmentId) {
        whereConditions.push(`r.current_department_id = $${queryParams.length + 1}`);
        queryParams.push(authUser.departmentId);
      }
    }

    const whereClause = whereConditions.join(' AND ');

    // Find reports that have a history of being DONE but are not currently DONE
    const reopenedQuery = `
      SELECT DISTINCT r.id
      FROM reports r
      INNER JOIN report_status_history rsh ON r.id = rsh.report_id
      WHERE ${whereClause}
        AND rsh.new_status = 'DONE'
        AND r.status != 'DONE'      ORDER BY r.id
    `;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.dataSource.query(reopenedQuery, queryParams);
    const reportIds = Array.isArray(result) ? result.map((row: { id: number }) => row.id) : [];

    return {
      count: reportIds.length,
      reportIds,
    };
  }

  /**
   * Get trending issue category (category with highest growth rate)
   */
  async getTrendingIssue(
    filters: {
      currentPeriodStart: string;
      currentPeriodEnd: string;
      previousPeriodStart: string;
      previousPeriodEnd: string;
      departmentId?: number;
    },
    authUser?: AuthUser
  ): Promise<TrendingIssueResult> {
    const {
      currentPeriodStart,
      currentPeriodEnd,
      previousPeriodStart,
      previousPeriodEnd,
      departmentId,
    } = filters;

    let additionalConditions = '';
    const queryParams: (string | number | Date)[] = [
      currentPeriodStart,
      currentPeriodEnd,
      previousPeriodStart,
      previousPeriodEnd,
    ];

    if (departmentId) {
      additionalConditions += ` AND r.current_department_id = $${queryParams.length + 1}`;
      queryParams.push(departmentId);
    } // Role-based filtering - departman supervisorü kendi departmanının verilerini görür
    if (
      authUser &&
      (authUser.roles.includes(UserRole.TEAM_MEMBER) ||
        authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR))
    ) {
      if (authUser.departmentId) {
        additionalConditions += ` AND r.current_department_id = $${queryParams.length + 1}`;
        queryParams.push(authUser.departmentId);
      }
    }

    const trendingQuery = `
      WITH current_period AS (
        SELECT
          rc.id as category_id,
          rc.name as category_name,
          rc.code as category_code,
          COUNT(r.id) as current_count
        FROM report_categories rc
        LEFT JOIN reports r ON rc.id = r.category_id
          AND r.created_at >= $1
          AND r.created_at <= $2
          AND r.deleted_at IS NULL
          ${additionalConditions}
        GROUP BY rc.id, rc.name, rc.code
      ),
      previous_period AS (
        SELECT
          rc.id as category_id,
          COUNT(r.id) as previous_count
        FROM report_categories rc
        LEFT JOIN reports r ON rc.id = r.category_id
          AND r.created_at >= $3
          AND r.created_at <= $4
          AND r.deleted_at IS NULL
          ${additionalConditions}
        GROUP BY rc.id
      )
      SELECT
        cp.category_name,
        cp.category_code,
        cp.current_count as current_period_count,
        COALESCE(pp.previous_count, 0) as previous_period_count,
        CASE
          WHEN COALESCE(pp.previous_count, 0) = 0 AND cp.current_count > 0 THEN 999.99
          WHEN COALESCE(pp.previous_count, 0) = 0 THEN 0
          ELSE ROUND(
            ((cp.current_count - COALESCE(pp.previous_count, 0))::numeric / pp.previous_count::numeric) * 100, 2
          )
        END as percentage_increase
      FROM current_period cp
      LEFT JOIN previous_period pp ON cp.category_id = pp.category_id
      WHERE cp.current_count > 0 OR COALESCE(pp.previous_count, 0) > 0
      ORDER BY percentage_increase DESC, cp.current_count DESC      LIMIT 1
    `;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.dataSource.query(trendingQuery, queryParams);

    if (!Array.isArray(result) || result.length === 0) {
      return {
        categoryName: null,
        categoryCode: null,
        percentageIncrease: 0,
        currentPeriodCount: 0,
        previousPeriodCount: 0,
      };
    }

    const trending = result[0] as TrendingQueryResult;
    return {
      categoryName: String(trending.category_name),
      categoryCode: String(trending.category_code),
      percentageIncrease: parseFloat(String(trending.percentage_increase)),
      currentPeriodCount: parseInt(String(trending.current_period_count)),
      previousPeriodCount: parseInt(String(trending.previous_period_count)),
    };
  }
  /**
   * Get citizen interaction score (total supports count)
   */
  async getCitizenInteractionScore(
    filters: {
      startDate?: string;
      endDate?: string;
      departmentId?: number;
    },
    authUser?: AuthUser
  ): Promise<CitizenInteractionResult> {
    const { startDate, endDate, departmentId } = filters;

    let whereConditions = ['r.deleted_at IS NULL'];
    const queryParams: (string | number | Date)[] = [];

    if (startDate) {
      whereConditions.push(`r.created_at >= $${queryParams.length + 1}`);
      queryParams.push(startDate);
    }
    if (endDate) {
      whereConditions.push(`r.created_at <= $${queryParams.length + 1}`);
      queryParams.push(endDate);
    }
    if (departmentId) {
      whereConditions.push(`r.current_department_id = $${queryParams.length + 1}`);
      queryParams.push(departmentId);
    } // Role-based filtering - departman supervisorü kendi departmanının verilerini görür
    if (
      authUser &&
      (authUser.roles.includes(UserRole.TEAM_MEMBER) ||
        authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR))
    ) {
      if (authUser.departmentId) {
        whereConditions.push(`r.current_department_id = $${queryParams.length + 1}`);
        queryParams.push(authUser.departmentId);
      }
    }

    const whereClause = whereConditions.join(' AND ');

    const interactionQuery = `
      SELECT COALESCE(SUM(r.support_count), 0) as total_supports
      FROM reports r      WHERE ${whereClause}
    `;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.dataSource.query(interactionQuery, queryParams);

    let totalSupports = 0;
    if (Array.isArray(result) && result.length > 0) {
      const firstRow = result[0] as InteractionQueryResult;
      totalSupports = parseInt(String(firstRow.total_supports)) || 0;
    }

    return {
      totalSupports,
    };
  }
}
