import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Raw, FindOptionsWhere, FindOperator } from 'typeorm'; // Use FindOptionsWhere, FindOperator
import { Report } from '../entities/report.entity';
import { DepartmentHistory } from '../entities/department-history.entity';
import {
  IDashboardStats,
  IStatusCount,
  IDepartmentCount,
  ITypeCount,
  IDailyCount,
  IWeeklyCount,
  IMonthlyCount,
  IResolutionTime,
  IRegionalDensity,
  IAnalyticsFilter,
  ITimeFilter,
  IDepartmentChangeAnalytics, // Assuming this is correctly defined and exported now
} from '../interfaces/report.analytics.interface';
import { ReportStatus, MunicipalityDepartment, ReportType } from '../interfaces/report.interface';
import { Point } from 'geojson';

// Type guard to check if an object is a valid GeoJSON Point
function isGeoJsonPoint(obj: unknown): obj is Point {
  if (typeof obj !== 'object' || obj === null) return false;
  const point = obj as Point; // Tentative cast for property access
  return (
    point.type === 'Point' &&
    Array.isArray(point.coordinates) &&
    point.coordinates.length === 2 &&
    typeof point.coordinates[0] === 'number' &&
    typeof point.coordinates[1] === 'number'
  );
}

// --- Raw query result interfaces ---
// Define interfaces for the raw results returned by TypeORM's getRawMany()
// This improves type safety when mapping the raw results.
interface RawStatusCount {
  status: string;
  count: string;
}
interface RawDepartmentCount {
  department: string;
  count: string;
}
interface RawTypeCount {
  type: string;
  count: string;
}
interface RawDailyCount {
  date: string;
  count: string;
}
interface RawWeeklyCount {
  week_start: string;
  week_end: string;
  count: string;
}
interface RawMonthlyCount {
  year: string;
  month: string;
  count: string;
}
interface RawResolutionTime {
  department: string;
  avg_time: string | null;
  min_time: string | null;
  max_time: string | null;
  count: string;
}
interface RawRegionalDensity {
  location: string | null;
  count: string;
}
interface RawDistrictCount {
  district: string;
  count: string;
}
interface RawDepartmentChange {
  from_department: string;
  to_department: string;
  count: string;
}
interface RawDepartmentChangeCount {
  department: string;
  changes_from: string;
}
interface RawDepartmentChangeToCount {
  department: string;
  changes_to: string;
}
// --- End Raw interfaces ---

@Injectable()
export class ReportAnalyticsService {
  private readonly logger = new Logger(ReportAnalyticsService.name);

  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(DepartmentHistory)
    private readonly departmentHistoryRepository: Repository<DepartmentHistory>
  ) {}

  /**
   * Helper function to create a time filter condition for TypeORM 'where' clause.
   * Returns only the condition for 'createdAt', suitable for merging into a larger where clause.
   */
  private getTimeFilterCondition(filter: ITimeFilter): FindOperator<Date> | undefined {
    let startDate: Date | undefined;
    let endDate: Date | undefined = new Date(); // Default end date is now

    if (filter.startDate && filter.endDate) {
      startDate = filter.startDate;
      endDate = filter.endDate;
    } else if (filter.last7Days) {
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
    } else if (filter.last30Days) {
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
    } else if (filter.lastQuarter) {
      startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 3);
    } else if (filter.lastYear) {
      startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 1);
    }

    if (startDate) {
      // Between is typically inclusive, adjust if exclusive end date is needed
      return Between(startDate, endDate);
    }

    return undefined; // Return undefined if no time filter applies
  }

  /**
   * Helper function to build the TypeORM 'where' clause object (FindOptionsWhere) from filters.
   */
  private buildFilterQuery(filter?: IAnalyticsFilter): FindOptionsWhere<Report> {
    if (!filter) {
      return {};
    }

    const whereClause: FindOptionsWhere<Report> = {};

    // Time filter
    const timeCondition = this.getTimeFilterCondition(filter);
    if (timeCondition) {
      whereClause.createdAt = timeCondition;
    }

    // Other filters matching Report entity properties
    if (filter.department) {
      whereClause.department = filter.department;
    }
    if (filter.status) {
      whereClause.status = filter.status;
    }
    if (filter.type) {
      whereClause.type = filter.type;
    }
    if (filter.userId) {
      whereClause.userId = filter.userId;
    }
    if (filter.categoryId !== undefined) {
      // Check for undefined explicitly if 0 is a valid ID
      whereClause.categoryId = filter.categoryId;
    }
    // Add other direct filters here...

    // NOTE: Region filter (if implemented) would need QueryBuilder and ST_DWithin,
    // it cannot be directly added to this simple FindOptionsWhere object.
    // Methods using regionFilter would need to apply it separately.

    return whereClause;
  }

  /**
   * Complex dashboard data aggregation.
   */
  async getDashboardStats(filter?: IAnalyticsFilter): Promise<IDashboardStats> {
    this.logger.debug(`Fetching dashboard stats with filter: ${JSON.stringify(filter)}`);
    try {
      // Fetch all stats concurrently
      const [
        totalReports,
        statusDistribution,
        departmentDistribution,
        typeDistribution,
        dailyReportCounts,
        weeklyReportCounts,
        monthlyReportCounts,
        resolutionTimeByDepartment,
        regionalDensity,
      ] = await Promise.all([
        this.getTotalReports(filter),
        this.getStatusDistribution(filter),
        this.getDepartmentDistribution(filter),
        this.getTypeDistribution(filter),
        this.getDailyReportCounts(filter),
        this.getWeeklyReportCounts(filter),
        this.getMonthlyReportCounts(filter),
        this.getResolutionTimeByDepartment(filter),
        this.getRegionalDensity(filter),
      ]);

      // Calculate derived stats
      const totalResolvedReports =
        statusDistribution.find(s => s.status === ReportStatus.RESOLVED)?.count || 0;
      const totalPendingReports =
        (statusDistribution.find(s => s.status === ReportStatus.REPORTED)?.count || 0) +
        (statusDistribution.find(s => s.status === ReportStatus.IN_PROGRESS)?.count || 0) +
        (statusDistribution.find(s => s.status === ReportStatus.DEPARTMENT_CHANGED)?.count || 0);
      const totalRejectedReports =
        statusDistribution.find(s => s.status === ReportStatus.REJECTED)?.count || 0;

      // Calculate overall average resolution time (weighted average)
      const totalWeightedTime = resolutionTimeByDepartment.reduce(
        (sum, d) => sum + d.averageResolutionTime * d.reportsCount,
        0
      );
      const totalResolvedCountForAvg = resolutionTimeByDepartment.reduce(
        (sum, d) => sum + d.reportsCount,
        0
      );
      const averageResolutionTime =
        totalResolvedCountForAvg > 0 ? totalWeightedTime / totalResolvedCountForAvg : 0;

      return {
        totalReports,
        totalResolvedReports,
        totalPendingReports,
        totalRejectedReports,
        averageResolutionTime,
        statusDistribution,
        departmentDistribution,
        typeDistribution,
        dailyReportCounts,
        weeklyReportCounts,
        monthlyReportCounts,
        resolutionTimeByDepartment,
        regionalDensity,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching dashboard stats: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined
      );
      throw error; // Re-throw error for global exception filter
    }
  }

  /**
   * Total report count based on filter.
   */
  async getTotalReports(filter?: IAnalyticsFilter): Promise<number> {
    const whereClause = this.buildFilterQuery(filter);
    return this.reportRepository.count({ where: whereClause });
  }

  /**
   * Report distribution by status.
   */
  async getStatusDistribution(filter?: IAnalyticsFilter): Promise<IStatusCount[]> {
    const whereClause = this.buildFilterQuery(filter);
    const qb = this.reportRepository.createQueryBuilder('report');

    qb.select('report.status', 'status')
      .addSelect('COUNT(report.id)', 'count')
      .where(whereClause)
      .groupBy('report.status');

    const statusCounts = await qb.getRawMany<RawStatusCount>();

    return statusCounts.map(item => ({
      status: item.status as ReportStatus,
      count: parseInt(item.count, 10),
    }));
  }

  /**
   * Report distribution by department.
   */
  async getDepartmentDistribution(filter?: IAnalyticsFilter): Promise<IDepartmentCount[]> {
    const whereClause = this.buildFilterQuery(filter);
    const qb = this.reportRepository.createQueryBuilder('report');

    qb.select('report.department', 'department')
      .addSelect('COUNT(report.id)', 'count')
      .where(whereClause)
      .groupBy('report.department');

    const departmentCounts = await qb.getRawMany<RawDepartmentCount>();

    return departmentCounts.map(item => ({
      department: item.department as MunicipalityDepartment,
      count: parseInt(item.count, 10),
    }));
  }

  /**
   * Report distribution by type.
   */
  async getTypeDistribution(filter?: IAnalyticsFilter): Promise<ITypeCount[]> {
    const whereClause = this.buildFilterQuery(filter);
    const qb = this.reportRepository.createQueryBuilder('report');

    qb.select('report.type', 'type')
      .addSelect('COUNT(report.id)', 'count')
      .where(whereClause)
      .groupBy('report.type');

    const typeCounts = await qb.getRawMany<RawTypeCount>();

    return typeCounts.map(item => ({
      type: item.type as ReportType,
      count: parseInt(item.count, 10),
    }));
  }

  /**
   * Daily report counts.
   */
  async getDailyReportCounts(filter?: IAnalyticsFilter): Promise<IDailyCount[]> {
    const whereClause = this.buildFilterQuery(filter);
    const qb = this.reportRepository.createQueryBuilder('report');

    qb.select(`DATE_TRUNC('day', report.created_at)::date`, 'date') // Cast to date for clean output
      .addSelect('COUNT(report.id)', 'count')
      .where(whereClause)
      .groupBy('date')
      .orderBy('date', 'ASC');

    const dailyCounts = await qb.getRawMany<RawDailyCount>();

    return dailyCounts.map(item => ({
      // The result 'date' should already be in YYYY-MM-DD format due to ::date cast
      date: item.date, // Assuming the DB returns it as string in correct format
      count: parseInt(item.count, 10),
    }));
  }

  /**
   * Weekly report counts.
   */
  async getWeeklyReportCounts(filter?: IAnalyticsFilter): Promise<IWeeklyCount[]> {
    const whereClause = this.buildFilterQuery(filter);
    const qb = this.reportRepository.createQueryBuilder('report');

    const weekStartExpr = `DATE_TRUNC('week', report.created_at)::date`;
    const weekEndExpr = `(DATE_TRUNC('week', report.created_at) + interval '6 days')::date`;

    qb.select(weekStartExpr, 'week_start')
      .addSelect(weekEndExpr, 'week_end')
      .addSelect('COUNT(report.id)', 'count')
      .where(whereClause)
      // --- FIX: Group by both expressions used in SELECT (or their aliases) ---
      .groupBy('week_start, week_end')
      // --- END FIX ---
      .orderBy('week_start', 'ASC');

    const weeklyCounts = await qb.getRawMany<RawWeeklyCount>();

    return weeklyCounts.map(item => ({
      weekStart: item.week_start,
      weekEnd: item.week_end,
      count: parseInt(item.count, 10),
    }));
  }

  /**
   * Monthly report counts.
   */
  async getMonthlyReportCounts(filter?: IAnalyticsFilter): Promise<IMonthlyCount[]> {
    const whereClause = this.buildFilterQuery(filter);
    const qb = this.reportRepository.createQueryBuilder('report');

    qb.select('EXTRACT(YEAR FROM report.created_at)::int', 'year') // Cast to integer
      .addSelect('EXTRACT(MONTH FROM report.created_at)::int', 'month') // Cast to integer
      .addSelect('COUNT(report.id)', 'count')
      .where(whereClause)
      .groupBy('year, month')
      .orderBy('year', 'ASC')
      .addOrderBy('month', 'ASC');

    const monthlyCounts = await qb.getRawMany<RawMonthlyCount>();

    return monthlyCounts.map(item => ({
      // Ensure these are numbers after parseInt
      year: parseInt(item.year, 10),
      month: parseInt(item.month, 10),
      count: parseInt(item.count, 10),
    }));
  }

  /**
   * Resolution time metrics by department.
   */
  async getResolutionTimeByDepartment(filter?: IAnalyticsFilter): Promise<IResolutionTime[]> {
    // Apply base filters, ensure status is RESOLVED
    const whereClause = this.buildFilterQuery({
      ...filter,
      status: ReportStatus.RESOLVED,
    });
    // Ensure only reports where resolution happened AFTER creation are considered
    whereClause.updatedAt = Raw(alias => `${alias} > report.created_at`);

    const qb = this.reportRepository.createQueryBuilder('report');

    const timeDiffExpr = `EXTRACT(EPOCH FROM (report.updated_at - report.created_at)) * 1000`; // Milliseconds

    qb.select('report.department', 'department')
      .addSelect(`AVG(${timeDiffExpr})`, 'avg_time')
      .addSelect(`MIN(${timeDiffExpr})`, 'min_time')
      .addSelect(`MAX(${timeDiffExpr})`, 'max_time')
      .addSelect('COUNT(report.id)', 'count')
      .where(whereClause)
      .groupBy('report.department');

    const resolutionTimes = await qb.getRawMany<RawResolutionTime>();

    return resolutionTimes.map(item => ({
      department: item.department as MunicipalityDepartment,
      averageResolutionTime: item.avg_time !== null ? parseFloat(item.avg_time) : 0,
      minResolutionTime: item.min_time !== null ? parseFloat(item.min_time) : 0,
      maxResolutionTime: item.max_time !== null ? parseFloat(item.max_time) : 0,
      reportsCount: parseInt(item.count, 10),
    }));
  }

  /**
   * Regional report density using PostGIS clustering.
   */
  async getRegionalDensity(filter?: IAnalyticsFilter): Promise<IRegionalDensity[]> {
    const whereClause = this.buildFilterQuery(filter);
    // Main QueryBuilder instance
    const qb = this.reportRepository.createQueryBuilder('report');

    // --- FIX: Subquery needs to output original geometry/geography ---
    const subQuery = qb
      .clone() // Clone for subquery
      .select('report.id', 'report_id')
      // Select the ORIGINAL location column (geography/geometry)
      .addSelect('report.location', 'original_location')
      // Calculate cluster ID
      .addSelect('ST_ClusterDBSCAN(report.location::geometry, 500, 3) OVER ()', 'cluster_id')
      .where(whereClause); // Apply filters

    // Main query groups by cluster_id and uses original_location
    const mainQb = this.reportRepository.manager
      .createQueryBuilder() // Use manager to query from subquery result
      .select('sub.cluster_id', 'cluster_id')
      // Collect the ORIGINAL geometry/geography, cast to geometry if needed by ST_Collect/ST_Centroid
      .addSelect(
        `ST_AsGeoJSON(ST_Centroid(ST_Collect(sub.original_location::geometry)))`,
        'location'
      )
      .addSelect('COUNT(sub.report_id)', 'count')
      .from(`(${subQuery.getQuery()})`, 'sub') // FROM the subquery result
      .setParameters(subQuery.getParameters())
      .where('sub.cluster_id IS NOT NULL')
      .groupBy('sub.cluster_id');
    // --- END FIX ---

    try {
      const regionalDensity = await mainQb.getRawMany<
        RawRegionalDensity & { cluster_id: number }
      >();

      return regionalDensity
        .map(item => {
          let parsedJson: unknown;
          try {
            if (!item.location) {
              this.logger.warn('Null location string received from DB in getRegionalDensity');
              return null;
            }
            parsedJson = JSON.parse(item.location);

            if (isGeoJsonPoint(parsedJson)) {
              return {
                location: parsedJson,
                reportsCount: parseInt(item.count, 10),
              };
            } else {
              this.logger.warn(
                'Invalid GeoJSON Point structure received in getRegionalDensity:',
                JSON.stringify(parsedJson)
              );
              return null;
            }
          } catch (e) {
            this.logger.error(
              'Error parsing GeoJSON string in getRegionalDensity:',
              e,
              'Raw string:',
              item.location
            );
            return null;
          }
        })
        .filter((item): item is IRegionalDensity => item !== null);
    } catch (error) {
      this.logger.error(
        `PostGIS query failed in getRegionalDensity: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined
      );
      this.logger.debug(`Failed SQL (Regional Density): ${mainQb.getSql()}`); // Log the SQL
      this.logger.debug(`Parameters: ${JSON.stringify(mainQb.getParameters())}`); // Log parameters
      return [];
    }
  }

  /**
   * Most reported districts based on address parsing.
   */
  async getMostReportedDistricts(
    filter?: IAnalyticsFilter,
    limit = 10
  ): Promise<{ district: string; count: number }[]> {
    const whereClause = this.buildFilterQuery(filter);
    const qb = this.reportRepository.createQueryBuilder('report');

    // Assuming address format "District, City..."
    qb.select("TRIM(SPLIT_PART(report.address, ',', 1))", 'district')
      .addSelect('COUNT(report.id)', 'count')
      .where(whereClause)
      .andWhere("report.address IS NOT NULL AND report.address != ''")
      .groupBy('district')
      .orderBy('count', 'DESC')
      .limit(limit);

    const districtCounts = await qb.getRawMany<RawDistrictCount>();

    return districtCounts
      .map(item => ({
        district: item.district, // Already trimmed by query
        count: parseInt(item.count, 10),
      }))
      .filter(item => item.district && item.district.length > 0); // Filter empty/null districts
  }

  /**
   * Reports pending for more than a specified number of days (default 30).
   */
  async getLongPendingReports(filter?: IAnalyticsFilter, daysPending = 30): Promise<Report[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysPending);

    // Build query excluding resolved/rejected and older than threshold
    const whereClause = this.buildFilterQuery({
      ...filter,
      endDate: thresholdDate, // Only reports created before this date
      status: undefined, // Explicitly remove status from base filter
      // Keep other filters like department, type, userId, categoryId if provided
    });

    // Apply the NOT IN status condition using Raw
    whereClause.status = Raw(alias => `${alias} NOT IN (:...statuses)`, {
      statuses: [ReportStatus.RESOLVED, ReportStatus.REJECTED],
    });

    return this.reportRepository.find({
      where: whereClause,
      order: {
        createdAt: 'ASC',
      },
    });
  }

  /**
   * Department change analytics.
   */
  async getDepartmentChangeAnalytics(filter?: ITimeFilter): Promise<IDepartmentChangeAnalytics> {
    // Only use time filter for history table queries
    const timeWhereClause = this.getTimeFilterCondition(filter || {}); // Get only the time condition
    const baseQb = this.departmentHistoryRepository.createQueryBuilder('history');
    // Apply time filter if it exists
    if (timeWhereClause) {
      baseQb.where({ createdAt: timeWhereClause });
    }

    // --- Get From/To counts ---
    const departmentChangesQuery = baseQb
      .clone() // Clone base query builder
      .select('history.old_department', 'from_department')
      .addSelect('history.new_department', 'to_department')
      .addSelect('COUNT(*)', 'count')
      // where condition already applied from baseQb if time filter exists
      .groupBy('history.old_department, history.new_department');
    const departmentChanges = await departmentChangesQuery.getRawMany<RawDepartmentChange>();

    // --- Get total changes FROM each department ---
    const changesFromQuery = baseQb
      .clone()
      .select('history.old_department', 'department')
      .addSelect('COUNT(*)', 'changes_from')
      // where condition applied from baseQb
      .groupBy('history.old_department');
    const departmentChangeCount = await changesFromQuery.getRawMany<RawDepartmentChangeCount>();

    // --- Get total changes TO each department ---
    const changesToQuery = baseQb
      .clone()
      .select('history.new_department', 'department')
      .addSelect('COUNT(*)', 'changes_to')
      // where condition applied from baseQb
      .groupBy('history.new_department');
    const departmentChangeToCount = await changesToQuery.getRawMany<RawDepartmentChangeToCount>();

    return {
      departmentChanges: departmentChanges.map(item => ({
        fromDepartment: item.from_department,
        toDepartment: item.to_department,
        count: parseInt(item.count, 10),
      })),
      departmentChangeCount: departmentChangeCount.map(item => ({
        department: item.department,
        changesFrom: parseInt(item.changes_from, 10),
      })),
      departmentChangeToCount: departmentChangeToCount.map(item => ({
        department: item.department,
        changesTo: parseInt(item.changes_to, 10),
      })),
    };
  }
}
