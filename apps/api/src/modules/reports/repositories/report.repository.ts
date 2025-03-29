import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, DeleteResult } from 'typeorm';
import { Point } from 'geojson';
import { Report } from '../entities/report.entity';
import { ReportMedia } from '../entities/report-media.entity';
import {
  IReportFindOptions,
  ISpatialQueryResult,
  ReportStatus,
  ReportType,
  UpdateReportData,
} from '../interfaces/report.interface';

// TODO: add unit tests for custom repository methods - coverage: 9.67%

// Type-safe interfaces for report data operations
interface CreateReportData {
  title: string;
  description: string;
  location: Point;
  address: string;
  type: ReportType;
  status?: ReportStatus;
  reportMedias?: Array<{
    url: string;
    type: string;
  }>;
}

@Injectable()
export class ReportRepository {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    private dataSource: DataSource,
  ) {}

  async findAll(options?: {
    limit?: number;
    page?: number;
    userId?: number;
    type?: ReportType;
    status?: ReportStatus;
  }): Promise<ISpatialQueryResult> {
    // TODO: add tests for pagination and filtering logic
    const limit = options?.limit || 10;
    const page = options?.page || 1;
    const skip = (page - 1) * limit;

    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reportMedias', 'media')
      .skip(skip)
      .take(limit)
      .orderBy('report.createdAt', 'DESC');

    if (options?.userId) {
      queryBuilder.andWhere('report.userId = :userId', { userId: options.userId });
    }

    if (options?.type) {
      queryBuilder.andWhere('report.type = :type', { type: options.type });
    }

    if (options?.status) {
      queryBuilder.andWhere('report.status = :status', { status: options.status });
    }

    const [reports, total] = await queryBuilder.getManyAndCount();

    return {
      data: reports,
      total,
      page,
      limit,
    };
  }

  async findById(id: number): Promise<Report | null> {
    return this.reportRepository.findOne({
      where: { id },
      relations: ['reportMedias'],
    });
  }

  async findNearby(
    latitude: number,
    longitude: number,
    radiusInMeters: number,
    options?: {
      limit?: number;
      page?: number;
      type?: ReportType;
      status?: ReportStatus;
    },
  ): Promise<ISpatialQueryResult> {
    // TODO: add tests for spatial queries
    const limit = options?.limit || 10;
    const page = options?.page || 1;
    const skip = (page - 1) * limit;

    // Create a point using the provided coordinates
    const point: Point = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };

    // Build query using ST_DWithin for better performance with spatial index
    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reportMedias', 'media')
      .where(
        `ST_DWithin(
          report.location,
          ST_SetSRID(ST_GeomFromGeoJSON(:point), 4326),
          :radius
        )`,
        { point: JSON.stringify(point), radius: radiusInMeters },
      )
      .orderBy(
        `ST_Distance(
          report.location,
          ST_SetSRID(ST_GeomFromGeoJSON(:point), 4326)
        )`,
        'ASC',
      )
      .skip(skip)
      .take(limit);

    if (options?.type) {
      queryBuilder.andWhere('report.type = :type', { type: options.type });
    }

    if (options?.status) {
      queryBuilder.andWhere('report.status = :status', { status: options.status });
    }

    const [reports, total] = await queryBuilder.getManyAndCount();

    return {
      data: reports,
      total,
      page,
      limit,
    };
  }

  /**
   * Creates a new report with transactions for media handling
   */
  async create(data: CreateReportData, userId: number): Promise<Report> {
    // TODO: add tests for transaction handling
    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create a report - TypeORM handles GeoJSON properly at runtime
      const newReport = queryRunner.manager.create(Report, {
        title: data.title,
        description: data.description,
        location: data.location, // TypeORM handles Point objects correctly
        address: data.address,
        type: data.type,
        status: data.status || ReportStatus.REPORTED,
        userId,
      });

      const savedReport = await queryRunner.manager.save(newReport);

      // Create report media if provided
      if (data.reportMedias && data.reportMedias.length > 0) {
        const reportMediaEntities = data.reportMedias.map((media) =>
          queryRunner.manager.create(ReportMedia, {
            reportId: savedReport.id,
            url: media.url,
            type: media.type,
          }),
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
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw new Error(
        error instanceof Error ? error.message : 'Unknown error during report creation',
      );
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Updates a report with transactions for media handling
   */
  async update(id: number, updateData: UpdateReportData): Promise<Report | null> {
    // TODO: add tests for update with media handling
    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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
        const reportMediaEntities = reportMedias.map((media) =>
          queryRunner.manager.create(ReportMedia, {
            reportId: id,
            url: media.url,
            type: media.type,
          }),
        );

        await queryRunner.manager.save(reportMediaEntities);
      }

      // Commit the transaction
      await queryRunner.commitTransaction();

      // Return the updated report
      return this.findById(id);
    } catch (error) {
      // Rollback the transaction
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<boolean> {
    const result: DeleteResult = await this.reportRepository.delete(id);
    return !!result.affected && result.affected > 0;
  }

  async findByOptions(options: IReportFindOptions): Promise<Report[]> {
    // TODO: add tests for complex filtering options
    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reportMedias', 'media');

    if (options.id) {
      queryBuilder.andWhere('report.id = :id', { id: options.id });
    }

    if (options.userId) {
      queryBuilder.andWhere('report.userId = :userId', { userId: options.userId });
    }

    if (options.type) {
      queryBuilder.andWhere('report.type = :type', { type: options.type });
    }

    if (options.status) {
      queryBuilder.andWhere('report.status = :status', { status: options.status });
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
        { point: JSON.stringify(point), radius },
      );
    }

    return queryBuilder.getMany();
  }

  async updateStatus(id: number, status: ReportStatus): Promise<Report> {
    await this.reportRepository.update(id, { status });
    const report = await this.findById(id);
    if (!report) {
      throw new Error(`Report with ID ${id} not found after status update`);
    }
    return report;
  }
}
