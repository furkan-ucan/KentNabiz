import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Report } from '../../../reports/entities/report.entity';
import { JwtPayload as AuthUser } from '../../../auth/interfaces/jwt-payload.interface';

// Core types for analytics
export interface CountResult {
  count: string;
}

export interface AvgDaysResult {
  avgDays: string;
}

export interface DashboardCountResult {
  count: number;
  reportIds: number[];
}

export interface CountsResponse {
  [key: string]: DashboardCountResult;
}

@Injectable()
export class CoreAnalyticsService {
  protected readonly logger = new Logger(CoreAnalyticsService.name);

  constructor(
    @InjectRepository(Report)
    protected readonly reportRepository: Repository<Report>,
    protected readonly dataSource: DataSource
  ) {}

  /**
   * Refresh analytics materialized view
   */
  async refreshAnalyticsView(): Promise<Date> {
    const query = 'REFRESH MATERIALIZED VIEW report_analytics_mv';
    await this.dataSource.query(query);
    return new Date();
  } /**
   * Get debug database status for troubleshooting
   */
  async getDebugDatabaseStatus(authUser: AuthUser) {
    this.logger.log(`Debug request from user: ${authUser.sub}`);
    try {
      // Check reports table
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const reportStatsResult = await this.dataSource.query(`
        SELECT
          COUNT(*) as total_reports,
          COUNT(CASE WHEN status = 'DONE' THEN 1 END) as resolved_reports,
          COUNT(CASE WHEN status != 'DONE' THEN 1 END) as pending_reports,
          MAX(created_at) as latest_report_date,
          MAX(updated_at) as latest_update_date
        FROM reports
        WHERE deleted_at IS NULL
      `);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const reportStats = reportStatsResult[0] || {};

      // Check assignments table
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const assignmentStatsResult = await this.dataSource.query(`
        SELECT
          COUNT(*) as total_assignments,
          COUNT(CASE WHEN accepted_at IS NOT NULL THEN 1 END) as accepted_assignments,
          MAX(assigned_at) as latest_assignment,
          MAX(accepted_at) as latest_acceptance
        FROM assignments
        WHERE deleted_at IS NULL
      `);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const assignmentStats = assignmentStatsResult[0] || {};

      // Check materialized view
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const mvStatsResult = await this.dataSource.query(`
        SELECT
          COUNT(*) as mv_record_count,
          MAX(created_at) as latest_mv_date
        FROM report_analytics_mv
      `);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const mvStats = mvStatsResult[0] || {};

      return {
        timestamp: new Date().toISOString(),
        user: {
          id: authUser.sub,
          roles: authUser.roles,
        },
        database: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          reports: reportStats,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          assignments: assignmentStats,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          materializedView: mvStats,
        },
      };
    } catch (error) {
      this.logger.error('Debug query failed:', error);
      throw error;
    }
  }
}
