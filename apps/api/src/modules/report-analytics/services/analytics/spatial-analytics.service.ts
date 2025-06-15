import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtPayload as AuthUser } from '../../../auth/interfaces/jwt-payload.interface';
import { UserRole } from '@kentnabiz/shared';
import { Report } from '../../../reports/entities/report.entity';
import { CoreAnalyticsService } from './core-analytics.service';

interface CoordinateResult {
  latitude: number;
  longitude: number;
}

interface HeatmapDataPoint {
  latitude: number;
  longitude: number;
  weight: number;
}

interface ClusterDataPoint {
  center_latitude: number;
  center_longitude: number;
  report_count: number;
  avg_resolution_days: number;
  most_common_category: string;
}

interface QueryParams {
  [key: string]: string | number | Date;
}

@Injectable()
export class SpatialAnalyticsService extends CoreAnalyticsService {
  /**
   * Get spatial distribution of reports with optional bounding box filter
   */
  async getSpatialDistribution(
    filters: {
      startDate: string;
      endDate: string;
      departmentId?: number;
      categoryId?: number;
      status?: string;
      bbox?: string; // west,south,east,north
    },
    authUser?: AuthUser
  ): Promise<{
    reports: Report[];
    totalCount: number;
  }> {
    const { startDate, endDate, departmentId, categoryId, status, bbox } = filters;

    let queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.category', 'category')
      .leftJoinAndSelect('report.currentDepartment', 'department')
      .leftJoinAndSelect('report.user', 'user')
      .where('report.deletedAt IS NULL')
      .andWhere('report.createdAt >= :startDate', { startDate })
      .andWhere('report.createdAt <= :endDate', { endDate });

    // Apply filters
    if (departmentId) {
      queryBuilder = queryBuilder.andWhere('report.currentDepartmentId = :departmentId', {
        departmentId,
      });
    }

    if (categoryId) {
      queryBuilder = queryBuilder.andWhere('report.categoryId = :categoryId', { categoryId });
    }

    if (status) {
      queryBuilder = queryBuilder.andWhere('report.status = :status', { status });
    }

    // Apply bounding box filter using PostGIS
    if (bbox) {
      const bboxParts = bbox.split(',').map(part => parseFloat(part));
      if (bboxParts.length !== 4 || bboxParts.some(part => isNaN(part))) {
        throw new BadRequestException('Invalid bbox format. Expected: west,south,east,north');
      }

      const [west, south, east, north] = bboxParts;

      // Create a bounding box polygon using PostGIS ST_MakeEnvelope
      queryBuilder = queryBuilder.andWhere(
        `
        ST_Within(
          report.location,
          ST_MakeEnvelope(:west, :south, :east, :north, 4326)
        )
      `,
        { west, south, east, north }
      );
    } // Role-based filtering - departman supervisorü kendi departmanının verilerini görür
    if (
      authUser &&
      (authUser.roles.includes(UserRole.TEAM_MEMBER) ||
        authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR))
    ) {
      if (authUser.departmentId) {
        queryBuilder = queryBuilder.andWhere('report.currentDepartmentId = :userDeptId', {
          userDeptId: authUser.departmentId,
        });
      }
    }

    // Add spatial data selection - extract coordinates
    queryBuilder = queryBuilder
      .addSelect('ST_Y(report.location)', 'latitude')
      .addSelect('ST_X(report.location)', 'longitude');

    // Get total count for pagination
    const totalCount = await queryBuilder.getCount();

    // Get the reports with spatial data
    const reports = await queryBuilder
      .orderBy('report.createdAt', 'DESC')
      .limit(1000) // Limit for performance
      .getMany(); // Add computed latitude/longitude to each report
    const reportsWithCoords = await Promise.all(
      reports.map(async report => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const coords = await this.dataSource.query(
          `
          SELECT ST_Y(location) as latitude, ST_X(location) as longitude
          FROM reports
          WHERE id = $1
        `,
          [report.id]
        );

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const firstCoord = (coords[0] as CoordinateResult) || null;
        return {
          ...report,
          latitude: firstCoord?.latitude || null,
          longitude: firstCoord?.longitude || null,
        };
      })
    );

    return {
      reports: reportsWithCoords as Report[],
      totalCount,
    };
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
  ): Promise<{
    points: Array<{
      latitude: number;
      longitude: number;
      weight: number;
    }>;
  }> {
    const { startDate, endDate, departmentId, categoryId, bbox } = filters;

    let whereConditions = ['r.deleted_at IS NULL'];
    const queryParams: QueryParams = {};

    // Helper function to add parameters safely
    const addParam = (value: string | number | Date): string => {
      const paramIndex = Object.keys(queryParams).length + 1;
      queryParams[paramIndex] = value;
      return `$${paramIndex}`;
    };

    if (startDate) {
      whereConditions.push(`r.created_at >= ${addParam(startDate)}`);
    }
    if (endDate) {
      whereConditions.push(`r.created_at <= ${addParam(endDate)}`);
    }
    if (departmentId) {
      whereConditions.push(`r.current_department_id = ${addParam(departmentId)}`);
    }
    if (categoryId) {
      whereConditions.push(`r.category_id = ${addParam(categoryId)}`);
    }

    // Apply bounding box filter
    if (bbox) {
      const bboxParts = bbox.split(',').map(part => parseFloat(part));
      if (bboxParts.length === 4 && !bboxParts.some(part => isNaN(part))) {
        const [west, south, east, north] = bboxParts;
        const westParam = addParam(west);
        const southParam = addParam(south);
        const eastParam = addParam(east);
        const northParam = addParam(north);
        whereConditions.push(
          `ST_Within(r.location, ST_MakeEnvelope(${westParam}, ${southParam}, ${eastParam}, ${northParam}, 4326))`
        );
      }
    } // Role-based filtering - departman supervisorü kendi departmanının verilerini görür
    if (
      authUser &&
      (authUser.roles.includes(UserRole.TEAM_MEMBER) ||
        authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR))
    ) {
      if (authUser.departmentId) {
        whereConditions.push(`r.current_department_id = ${addParam(authUser.departmentId)}`);
      }
    }

    const whereClause = whereConditions.join(' AND ');

    // Aggregate reports by location with weight based on count and support
    const heatmapQuery = `
      SELECT
        ST_Y(r.location) as latitude,
        ST_X(r.location) as longitude,
        COUNT(*) + COALESCE(AVG(r.support_count), 0) as weight
      FROM reports r
      WHERE ${whereClause}
      GROUP BY ST_Y(r.location), ST_X(r.location)
      HAVING ST_Y(r.location) IS NOT NULL AND ST_X(r.location) IS NOT NULL
      ORDER BY weight DESC
      LIMIT 500
    `; // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.dataSource.query(heatmapQuery, Object.values(queryParams));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const points = result.map((row: HeatmapDataPoint) => ({
      latitude: parseFloat(String(row.latitude)),
      longitude: parseFloat(String(row.longitude)),
      weight: parseFloat(String(row.weight)),
    })) as HeatmapDataPoint[];

    return { points };
  }

  /**
   * Get cluster analysis of reports by geographic regions
   */
  async getClusterAnalysis(
    filters: {
      startDate?: string;
      endDate?: string;
      departmentId?: number;
      clusterRadius?: number; // in meters, default 1000m
    },
    authUser?: AuthUser
  ): Promise<{
    clusters: Array<{
      centerLatitude: number;
      centerLongitude: number;
      reportCount: number;
      averageResolutionDays: number | null;
      mostCommonCategory: string | null;
    }>;
  }> {
    const { startDate, endDate, departmentId, clusterRadius = 1000 } = filters;

    let whereConditions = ['r.deleted_at IS NULL'];
    const queryParams: QueryParams = { 1: clusterRadius };

    // Helper function to add parameters safely
    const addParam = (value: string | number | Date): string => {
      const paramIndex = Object.keys(queryParams).length + 1;
      queryParams[paramIndex] = value;
      return `$${paramIndex}`;
    };

    if (startDate) {
      whereConditions.push(`r.created_at >= ${addParam(startDate)}`);
    }
    if (endDate) {
      whereConditions.push(`r.created_at <= ${addParam(endDate)}`);
    }
    if (departmentId) {
      whereConditions.push(`r.current_department_id = ${addParam(departmentId)}`);
    } // Role-based filtering - departman supervisorü kendi departmanının verilerini görür
    if (
      authUser &&
      (authUser.roles.includes(UserRole.TEAM_MEMBER) ||
        authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR))
    ) {
      if (authUser.departmentId) {
        whereConditions.push(`r.current_department_id = ${addParam(authUser.departmentId)}`);
      }
    }

    const whereClause = whereConditions.join(' AND ');

    // Use ST_ClusterDBSCAN for geographic clustering
    const clusterQuery = `
      WITH clustered_reports AS (
        SELECT
          r.id,
          r.location,
          r.status,
          r.created_at,
          r.resolved_at,
          rc.code as category_code,
          ST_ClusterDBSCAN(r.location, eps := $1, minpoints := 2) OVER() AS cluster_id
        FROM reports r
        LEFT JOIN report_categories rc ON r.category_id = rc.id
        WHERE ${whereClause}
          AND r.location IS NOT NULL
      ),
      cluster_stats AS (
        SELECT
          cluster_id,
          ST_Y(ST_Centroid(ST_Collect(location))) as center_latitude,
          ST_X(ST_Centroid(ST_Collect(location))) as center_longitude,
          COUNT(*) as report_count,
          AVG(
            CASE
              WHEN status = 'DONE' AND resolved_at IS NOT NULL
              THEN EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400.0
              ELSE NULL
            END
          ) as avg_resolution_days,
          MODE() WITHIN GROUP (ORDER BY category_code) as most_common_category
        FROM clustered_reports
        WHERE cluster_id IS NOT NULL
        GROUP BY cluster_id
        HAVING COUNT(*) >= 3
      )
      SELECT
        center_latitude,
        center_longitude,
        report_count,
        avg_resolution_days,
        most_common_category
      FROM cluster_stats
      ORDER BY report_count DESC
      LIMIT 20
    `; // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.dataSource.query(clusterQuery, Object.values(queryParams)); // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const clusters = result.map((row: ClusterDataPoint) => ({
      centerLatitude: parseFloat(String(row.center_latitude)),
      centerLongitude: parseFloat(String(row.center_longitude)),
      reportCount: parseInt(String(row.report_count)),
      averageResolutionDays: row.avg_resolution_days
        ? parseFloat(String(row.avg_resolution_days))
        : null,
      mostCommonCategory: String(row.most_common_category),
    }));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { clusters };
  }
}
