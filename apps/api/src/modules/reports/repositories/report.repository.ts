import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, DeleteResult, EntityManager } from 'typeorm';
import { Point } from 'geojson';
import { Report } from '../entities/report.entity';
import { ReportMedia } from '../entities/report-media.entity';
import { ReportSupport } from '../entities/report-support.entity';
import { IReportFindOptions, ISpatialQueryResult } from '../interfaces/report.interface';
import { ReportStatus, ReportType, MunicipalityDepartment } from '@kentnabiz/shared';
// TODO: add unit tests for custom repository methods - coverage: 9.67%

// Type-safe interfaces for report data operations
export interface CreateReportData {
  title: string;
  description: string;
  location: Point;
  address: string;
  reportType: ReportType;
  status?: ReportStatus;
  categoryId?: number;
  currentDepartmentId: number;
  departmentCode?: MunicipalityDepartment;
  reportMedias?: Array<{ url: string; type: string }>;
}

@Injectable()
export class ReportRepository {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    private dataSource: DataSource
  ) {}

  async findAll(options?: {
    limit?: number;
    page?: number;
    userId?: number;
    reportType?: ReportType;
    status?: ReportStatus | ReportStatus[];
    departmentCode?: MunicipalityDepartment;
    departmentId?: number;
    currentUserId?: number;
    bbox?: string;
    // Enhanced filters
    assignment?: 'unassigned' | 'assigned';
    subStatus?: string;
    overdue?: boolean;
    reopened?: boolean;
  }): Promise<ISpatialQueryResult> {
    const limit = options?.limit || 10;
    const page = options?.page || 1;
    const skip = (page - 1) * limit;

    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reportMedias', 'media')
      .leftJoinAndSelect('report.currentDepartment', 'departmentEntity')
      .leftJoinAndSelect('report.user', 'userEntity')
      .leftJoinAndSelect('report.assignments', 'assignments')
      .leftJoinAndSelect('assignments.assigneeUser', 'assigneeUser')
      .leftJoinAndSelect('assignments.assigneeTeam', 'assigneeTeam')
      .leftJoinAndSelect('report.category', 'categoryEntity')
      .orderBy('report.createdAt', 'DESC');

    if (options?.currentUserId) {
      queryBuilder.addSelect(subQuery => {
        return subQuery
          .select('CASE WHEN COUNT(rs.id) > 0 THEN TRUE ELSE FALSE END')
          .from(ReportSupport, 'rs')
          .where('rs.reportId = report.id')
          .andWhere('rs.userId = :currentUserId', { currentUserId: options.currentUserId });
      }, 'isSupportedByCurrentUser');
    } else {
      queryBuilder.addSelect('false', 'isSupportedByCurrentUser');
    }

    if (options?.userId) {
      queryBuilder.andWhere('report.userId = :userId', { userId: options.userId });
    }
    if (options?.reportType) {
      queryBuilder.andWhere('report.reportType = :reportType', { reportType: options.reportType });
    }
    if (options?.status) {
      if (Array.isArray(options.status) && options.status.length > 0) {
        queryBuilder.andWhere('report.status IN (:...statuses)', { statuses: options.status });
      } else if (typeof options.status === 'string') {
        queryBuilder.andWhere('report.status = :status', { status: options.status });
      }
    }
    if (options?.departmentCode) {
      queryBuilder.andWhere('departmentEntity.code = :departmentCode', {
        departmentCode: options.departmentCode,
      });
    }
    if (options?.departmentId) {
      queryBuilder.andWhere('report.currentDepartmentId = :departmentId', {
        departmentId: options.departmentId,
      });
    }

    // Enhanced Filters
    if (options?.assignment === 'unassigned') {
      // Aktif assignment'ı olmayan raporlar
      queryBuilder.andWhere('(assignments.id IS NULL OR assignments.status = :cancelledStatus)', {
        cancelledStatus: 'CANCELLED',
      });
    } else if (options?.assignment === 'assigned') {
      // Aktif assignment'ı olan raporlar
      queryBuilder.andWhere(
        'assignments.id IS NOT NULL AND assignments.status NOT IN (:...inactiveStatuses)',
        {
          inactiveStatuses: ['CANCELLED', 'COMPLETED'],
        }
      );
    }

    if (options?.subStatus) {
      queryBuilder.andWhere('report.subStatus = :subStatus', { subStatus: options.subStatus });
    }

    if (options?.overdue === true) {
      queryBuilder.andWhere('report.createdAt < :sevenDaysAgo', {
        sevenDaysAgo: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      });
    }

    if (options?.reopened === true) {
      console.log('>>> REOPENED FILTER ACTIVATED <<<');
      // Status history tablosunda DONE -> OPEN geçişi olan raporlar
      queryBuilder.innerJoin(
        'report_status_histories',
        'statusHistory',
        'statusHistory.report_id = report.id AND statusHistory.previous_status = :doneStatus AND statusHistory.new_status = :openStatus',
        { doneStatus: 'DONE', openStatus: 'OPEN' }
      );
    }

    // Spatial bbox filtering using PostGIS
    if (options?.bbox) {
      try {
        const [minLng, minLat, maxLng, maxLat] = options.bbox.split(',').map(Number);
        if (minLng && minLat && maxLng && maxLat) {
          queryBuilder.andWhere(
            `ST_Contains(ST_MakeEnvelope(:minLng, :minLat, :maxLng, :maxLat, 4326), report.location)`,
            { minLng, minLat, maxLng, maxLat }
          );
        }
      } catch {
        // Geçersiz bbox formatı durumunda sessizce devam et
        console.warn('Invalid bbox format:', options.bbox);
      }
    }

    queryBuilder.skip(skip).take(limit);

    const [reports, total] = await queryBuilder.getManyAndCount();
    const processedReports = reports.map(r => {
      // TypeORM'dan dönen ek alanlar için güvenli erişim
      const raw = r as Report & { isSupportedByCurrentUser?: boolean | string };
      let isSupported = false;
      if (typeof raw.isSupportedByCurrentUser === 'boolean') {
        isSupported = raw.isSupportedByCurrentUser;
      } else if (typeof raw.isSupportedByCurrentUser === 'string') {
        isSupported = String(raw.isSupportedByCurrentUser).toLowerCase() === 'true';
      }
      return {
        ...r,
        isSupportedByCurrentUser: isSupported,
      };
    });
    return {
      data: processedReports,
      total,
      page,
      limit,
    };
  }

  async findById(id: number, currentUserId?: number): Promise<Report | null> {
    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reportMedias', 'media')
      .leftJoinAndSelect('report.currentDepartment', 'departmentEntity')
      .leftJoinAndSelect('report.user', 'userEntity')
      .leftJoinAndSelect('report.assignments', 'assignments')
      .leftJoinAndSelect('assignments.assigneeUser', 'assigneeUser')
      .leftJoinAndSelect('assignments.assigneeTeam', 'assigneeTeam')
      .leftJoinAndSelect('report.category', 'categoryEntity')
      .where('report.id = :id', { id });

    if (currentUserId) {
      queryBuilder.addSelect(subQuery => {
        return subQuery
          .select('CASE WHEN COUNT(rs.id) > 0 THEN TRUE ELSE FALSE END')
          .from(ReportSupport, 'rs')
          .where('rs.reportId = report.id')
          .andWhere('rs.userId = :currentUserId', { currentUserId });
      }, 'isSupportedByCurrentUser');
    } else {
      queryBuilder.addSelect('false', 'isSupportedByCurrentUser');
    }

    const report = await queryBuilder.getOne();
    if (report) {
      const raw = report as unknown as Record<string, unknown>;
      report.isSupportedByCurrentUser =
        raw && typeof raw === 'object' && 'isSupportedByCurrentUser' in raw
          ? raw['isSupportedByCurrentUser'] === true ||
            String(raw['isSupportedByCurrentUser']).toLowerCase() === 'true'
          : false;
    }
    return report;
  }

  async findNearby(
    latitude: number,
    longitude: number,
    radiusInMeters: number,
    options?: {
      limit?: number;
      page?: number;
      reportType?: ReportType;
      status?: ReportStatus | ReportStatus[];
      departmentCode?: MunicipalityDepartment;
      currentUserId?: number;
    }
  ): Promise<ISpatialQueryResult> {
    const limit = options?.limit || 10;
    const page = options?.page || 1;
    const skip = (page - 1) * limit;

    const point: Point = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };

    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reportMedias', 'media')
      .leftJoinAndSelect('report.currentDepartment', 'departmentEntity')
      .leftJoinAndSelect('report.user', 'userEntity')
      .leftJoinAndSelect('report.assignments', 'assignments')
      .leftJoinAndSelect('assignments.assigneeUser', 'assigneeUser')
      .leftJoinAndSelect('assignments.assigneeTeam', 'assigneeTeam')
      .leftJoinAndSelect('report.category', 'categoryEntity')
      .addSelect(
        `ST_Distance(
          ST_Transform(report.location, 3857),
          ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON(:point), 4326), 3857)
        )`,
        'distance'
      )
      .where(
        `ST_DWithin(
          ST_Transform(report.location, 3857),
          ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON(:point), 4326), 3857),
          :radius
        )`,
        { point: JSON.stringify(point), radius: radiusInMeters }
      )
      .orderBy('distance', 'ASC');

    if (options?.currentUserId) {
      queryBuilder.addSelect(subQuery => {
        return subQuery
          .select('CASE WHEN COUNT(rs.id) > 0 THEN TRUE ELSE FALSE END')
          .from(ReportSupport, 'rs')
          .where('rs.reportId = report.id')
          .andWhere('rs.userId = :currentUserId', { currentUserId: options.currentUserId });
      }, 'isSupportedByCurrentUser');
    } else {
      queryBuilder.addSelect('false', 'isSupportedByCurrentUser');
    }

    if (options?.reportType) {
      queryBuilder.andWhere('report.reportType = :reportType', { reportType: options.reportType });
    }
    if (options?.status) {
      if (Array.isArray(options.status) && options.status.length > 0) {
        queryBuilder.andWhere('report.status IN (:...statuses)', { statuses: options.status });
      } else if (typeof options.status === 'string') {
        queryBuilder.andWhere('report.status = :status', { status: options.status });
      }
    }
    if (options?.departmentCode) {
      queryBuilder.andWhere('departmentEntity.code = :departmentCode', {
        departmentCode: options.departmentCode,
      });
    }

    queryBuilder.skip(skip).take(limit);

    const [reports, total] = await queryBuilder.getManyAndCount();

    const processedReports = reports.map(r => {
      // TypeORM'dan dönen ek alanlar için güvenli erişim
      const raw = r as Report & { isSupportedByCurrentUser?: boolean | string };
      let isSupported = false;
      if (typeof raw.isSupportedByCurrentUser === 'boolean') {
        isSupported = raw.isSupportedByCurrentUser;
      } else if (typeof raw.isSupportedByCurrentUser === 'string') {
        isSupported = String(raw.isSupportedByCurrentUser).toLowerCase() === 'true';
      }
      return {
        ...r,
        isSupportedByCurrentUser: isSupported,
      };
    });

    return {
      data: processedReports,
      total,
      page,
      limit,
    };
  }

  /**
   * Creates a new report with transactions for media handling
   */
  async create(data: CreateReportData, userId: number, manager?: EntityManager): Promise<Report> {
    // If external manager is provided, use it (no transaction handling here)
    if (manager) {
      const newReport = manager.create(Report, {
        title: data.title,
        description: data.description,
        location: data.location,
        address: data.address,
        reportType: data.reportType,
        status: data.status || ReportStatus.OPEN,
        userId,
        currentDepartmentId: data.currentDepartmentId,
        categoryId: data.categoryId,
        departmentCode: data.departmentCode,
      });

      const savedReport = await manager.save(newReport);

      // Create report media if provided
      if (data.reportMedias && data.reportMedias.length > 0) {
        const reportMediaEntities = data.reportMedias.map(media =>
          manager.create(ReportMedia, {
            reportId: savedReport.id,
            url: media.url,
            type: media.type,
          })
        );

        await manager.save(reportMediaEntities);
      }

      return savedReport;
    }

    // TODO: add tests for transaction handling
    // Start a transaction (only when no external manager)
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Create a report - TypeORM handles GeoJSON properly at runtime
      const newReport = queryRunner.manager.create(Report, {
        title: data.title,
        description: data.description,
        location: data.location, // TypeORM handles Point objects correctly
        address: data.address,
        reportType: data.reportType,
        status: data.status || ReportStatus.OPEN,
        userId,
        currentDepartmentId: data.currentDepartmentId,
        categoryId: data.categoryId,
        departmentCode: data.departmentCode,
      });

      const savedReport = await queryRunner.manager.save(newReport);

      // Create report media if provided
      if (data.reportMedias && data.reportMedias.length > 0) {
        const reportMediaEntities = data.reportMedias.map(media =>
          queryRunner.manager.create(ReportMedia, {
            reportId: savedReport.id,
            url: media.url,
            type: media.type,
          })
        );

        await queryRunner.manager.save(reportMediaEntities);
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      // Load the report with its relations
      const report = await this.findById(savedReport.id);
      if (!report) {
        throw new Error(`Failed to retrieve report after creation`);
      }
      return report;
    } catch (error) {
      // Only rollback if transaction was started
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw new Error(
        error instanceof Error ? error.message : 'Unknown error during report creation'
      );
    } finally {
      // Release query runner
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  /**
   * Updates a report with transactions for media handling
   */
  async update(id: number, updateData: Partial<Report>): Promise<Report | null> {
    // TODO: add tests for update with media handling
    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const report = await this.findById(id);
      if (!report) {
        return null;
      }

      // Tip güvenli bir şekilde reportMedias özelliğini ayırın
      const { reportMedias, ...reportUpdateData } = updateData;

      // Update the report
      await queryRunner.manager.update(Report, id, reportUpdateData);

      // Handle media updates if provided
      if (reportMedias && reportMedias.length > 0) {
        // Delete existing media
        await queryRunner.manager.delete(ReportMedia, { reportId: id });

        // Create new media entities
        const reportMediaEntities = reportMedias.map(media =>
          queryRunner.manager.create(ReportMedia, {
            reportId: id,
            url: media.url,
            type: media.type,
          })
        );

        await queryRunner.manager.save(reportMediaEntities);
      }

      // Commit the transaction
      await queryRunner.commitTransaction();

      // Return the updated report
      return this.findById(id);
    } catch (error) {
      // Only rollback if transaction was started
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      // Release the query runner
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  async remove(id: number): Promise<DeleteResult> {
    return this.reportRepository.softDelete(id);
  }

  async findByOptions(options: IReportFindOptions): Promise<Report[]> {
    // TODO: add tests for complex filtering options
    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reportMedias', 'media')
      .leftJoinAndSelect('report.currentDepartment', 'departmentEntity'); // Join eklendi

    if (options.id) {
      queryBuilder.andWhere('report.id = :id', { id: options.id });
    }

    if (options.userId) {
      queryBuilder.andWhere('report.userId = :userId', { userId: options.userId });
    }

    if (options.reportType) {
      // type -> reportType
      queryBuilder.andWhere('report.reportType = :reportType', { reportType: options.reportType });
    }

    if (options.status) {
      queryBuilder.andWhere('report.status = :status', { status: options.status });
    }

    if (options.departmentCode) {
      // Yeni eklendi (IReportFindOptions'a da eklenmeli)
      queryBuilder.andWhere('departmentEntity.code = :departmentCode', {
        departmentCode: options.departmentCode,
      });
    }

    if (options.withinRadius) {
      const { latitude, longitude, radius } = options.withinRadius;
      const point: Point = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };

      queryBuilder.andWhere(
        `ST_DWithin(
          report.location,
          ST_SetSRID(ST_GeomFromGeoJSON(:point), 4326),
          :radius
        )`,
        { point: JSON.stringify(point), radius }
      );
    }

    return queryBuilder.getMany();
  }
}
