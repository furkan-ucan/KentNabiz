import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Report } from '../../reports/entities/report.entity';
import { JwtPayload as AuthUser } from '../../auth/interfaces/jwt-payload.interface';

// Import all specialized analytics services
import { CoreAnalyticsService } from './analytics/core-analytics.service';
import { DashboardAnalyticsService } from './analytics/dashboard-analytics.service';
import { SummaryAnalyticsService } from './analytics/summary-analytics.service';
import { SpatialAnalyticsService } from './analytics/spatial-analytics.service';
import { ETLAnalyticsService } from './analytics/etl-analytics.service';

// Re-export interfaces for backward compatibility
export type {
  CountResult,
  AvgDaysResult,
  DashboardCountResult,
  CountsResponse,
} from './analytics/core-analytics.service';

export type {
  DashboardStatsResult,
  SummaryStatsResponse,
} from './analytics/dashboard-analytics.service';

export type {
  ReopenedReportsResult,
  TrendingIssueResult,
  CitizenInteractionResult,
} from './analytics/summary-analytics.service';

// Import DTOs
import { CitizenSummaryDto } from '../dto/citizen-summary.dto';

@Injectable()
export class ReportAnalyticsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly dataSource: DataSource,
    private readonly coreAnalyticsService: CoreAnalyticsService,
    private readonly dashboardAnalyticsService: DashboardAnalyticsService,
    private readonly summaryAnalyticsService: SummaryAnalyticsService,
    private readonly spatialAnalyticsService: SpatialAnalyticsService,
    private readonly etlAnalyticsService: ETLAnalyticsService
  ) {}

  // =============================================================================
  // CITIZEN & DASHBOARD ANALYTICS
  // =============================================================================

  /**
   * Get citizen summary statistics for homepage
   */
  async getCitizenSummary(authUser?: AuthUser): Promise<CitizenSummaryDto> {
    return this.dashboardAnalyticsService.getCitizenSummary(authUser);
  }

  /**
   * Get dashboard statistics for admin/team users
   */
  async getDashboardStats(authUser?: AuthUser) {
    return this.dashboardAnalyticsService.getDashboardStats(authUser);
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
  ) {
    return this.dashboardAnalyticsService.getDashboardCounts(filters, authUser);
  }

  // =============================================================================
  // SUMMARY ANALYTICS
  // =============================================================================

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
  ) {
    return this.summaryAnalyticsService.getSummaryStats(filters, authUser);
  }

  /**
   * Get count of reopened reports
   */
  async getReopenedReportsCount(
    filters: {
      startDate?: string;
      endDate?: string;
      departmentId?: number;
    },
    authUser?: AuthUser
  ) {
    return this.summaryAnalyticsService.getReopenedReportsCount(filters, authUser);
  }

  /**
   * Get trending issue category
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
  ) {
    return this.summaryAnalyticsService.getTrendingIssue(filters, authUser);
  }

  /**
   * Get citizen interaction score
   */
  async getCitizenInteractionScore(
    filters: {
      startDate?: string;
      endDate?: string;
      departmentId?: number;
    },
    authUser?: AuthUser
  ) {
    return this.summaryAnalyticsService.getCitizenInteractionScore(filters, authUser);
  }

  // =============================================================================
  // SPATIAL ANALYTICS
  // =============================================================================

  /**
   * Get spatial distribution of reports
   */
  async getSpatialDistribution(
    filters: {
      startDate: string;
      endDate: string;
      departmentId?: number;
      categoryId?: number;
      status?: string;
      bbox?: string;
    },
    authUser?: AuthUser
  ) {
    return this.spatialAnalyticsService.getSpatialDistribution(filters, authUser);
  }

  /**
   * Get heatmap data for spatial visualization
   */
  async getHeatmapData(
    filters: {
      startDate?: string;
      endDate?: string;
      departmentId?: number;
      categoryId?: number;
      bbox?: string;
    },
    authUser?: AuthUser
  ) {
    return this.spatialAnalyticsService.getHeatmapData(filters, authUser);
  }

  /**
   * Get cluster analysis of reports
   */
  async getClusterAnalysis(
    filters: {
      startDate?: string;
      endDate?: string;
      departmentId?: number;
      clusterRadius?: number;
    },
    authUser?: AuthUser
  ) {
    return this.spatialAnalyticsService.getClusterAnalysis(filters, authUser);
  }

  // =============================================================================
  // CORE ANALYTICS & UTILITIES
  // =============================================================================

  /**
   * Refresh analytics materialized view
   */
  async refreshAnalyticsView(): Promise<Date> {
    return this.coreAnalyticsService.refreshAnalyticsView();
  }

  /**
   * Get debug database status
   */
  async getDebugDatabaseStatus(authUser: AuthUser) {
    return this.coreAnalyticsService.getDebugDatabaseStatus(authUser);
  }

  // =============================================================================
  // ETL & DATA WAREHOUSE
  // =============================================================================

  /**
   * Populate fact_reports table from clean_reports_vw (ETL process)
   */
  async populateFactReports(): Promise<void> {
    return this.etlAnalyticsService.populateFactReports();
  }

  /**
   * Manual ETL trigger for admin endpoint
   */
  async triggerManualETL(): Promise<{ success: boolean; message: string }> {
    return this.etlAnalyticsService.triggerManualETL();
  }

  /**
   * Get ETL status and statistics
   */
  async getETLStatus() {
    return this.etlAnalyticsService.getETLStatus();
  }

  /**
   * Validate data quality after ETL
   */
  async validateDataQuality() {
    return this.etlAnalyticsService.validateDataQuality();
  }
}
