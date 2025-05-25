import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, DeleteResult } from 'typeorm';
import { Point } from 'geojson';
import { Report } from '../entities/report.entity';
import { ReportMedia } from '../entities/report-media.entity';
import { IReportFindOptions, ISpatialQueryResult } from '../interfaces/report.interface';
import { ReportStatus, ReportType, MunicipalityDepartment } from '@KentNabiz/shared';
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
    reportType?: ReportType; // type -> reportType olarak güncellendi
    status?: ReportStatus;
    departmentCode?: MunicipalityDepartment; // department -> departmentCode olarak güncellendi (enum kodu)
  }): Promise<ISpatialQueryResult> {
    const limit = options?.limit || 10;
    const page = options?.page || 1;
    const skip = (page - 1) * limit;

    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reportMedias', 'media')
      .leftJoinAndSelect('report.currentDepartment', 'departmentEntity') // Departman bilgisini join et
      .leftJoinAndSelect('report.user', 'userEntity') // Kullanıcı bilgisini join et
      .leftJoinAndSelect('report.assignments', 'assignments') // Atama bilgilerini join et
      .leftJoinAndSelect('assignments.assigneeUser', 'assigneeUser') // Atanan kullanıcıyı join et
      .leftJoinAndSelect('assignments.assigneeTeam', 'assigneeTeam') // Atanan takımı join et
      .leftJoinAndSelect('report.category', 'categoryEntity') // Kategoriyi join et
      .skip(skip)
      .take(limit)
      .orderBy('report.createdAt', 'DESC');

    if (options?.userId) {
      queryBuilder.andWhere('report.userId = :userId', { userId: options.userId });
    }

    if (options?.reportType) {
      // type -> reportType
      // Entity'deki property adı 'reportType', veritabanı sütunu 'report_type'
      queryBuilder.andWhere('report.reportType = :reportType', { reportType: options.reportType });
    }

    if (options?.status) {
      queryBuilder.andWhere('report.status = :status', { status: options.status });
    }

    // YENİ EKLENEN DEPARTMAN FİLTRESİ
    if (options?.departmentCode) {
      // 'departmentEntity' join ettiğimiz Department entity'sinin alias'ı
      // Department entity'sindeki 'code' alanı üzerinden filtreleme yapıyoruz.
      queryBuilder.andWhere('departmentEntity.code = :departmentCode', {
        departmentCode: options.departmentCode,
      });
    }

    const [reports, total] = await queryBuilder.getManyAndCount();

    return {
      data: reports,
      total,
      page,
      limit,
    };
  }

  // findById metodunu da ilişkileri çekecek şekilde güncelleyelim (findOne gibi)
  async findById(id: number): Promise<Report | null> {
    return this.reportRepository.findOne({
      where: { id },
      relations: [
        'reportMedias',
        'currentDepartment',
        'user',
        'assignments',
        'assignments.assigneeUser',
        'assignments.assigneeTeam',
        'category',
        // 'departmentHistory' gerekirse eklenebilir ama genellikle ayrı bir endpoint ile alınır.
      ],
    });
  }

  async findNearby(
    latitude: number,
    longitude: number,
    radiusInMeters: number,
    options?: {
      limit?: number;
      page?: number;
      reportType?: ReportType; // type -> reportType
      status?: ReportStatus;
      departmentCode?: MunicipalityDepartment; // department -> departmentCode
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
          report.location,
          ST_SetSRID(ST_GeomFromGeoJSON(:point), 4326)
        )`,
        'distance'
      )
      .where(
        `ST_DWithin(
          report.location,
          ST_SetSRID(ST_GeomFromGeoJSON(:point), 4326),
          :radius
        )`,
        { point: JSON.stringify(point), radius: radiusInMeters }
      )
      .orderBy('distance', 'ASC')
      .skip(skip)
      .take(limit);

    if (options?.reportType) {
      queryBuilder.andWhere('report.reportType = :reportType', { reportType: options.reportType });
    }
    if (options?.status) {
      queryBuilder.andWhere('report.status = :status', { status: options.status });
    }
    if (options?.departmentCode) {
      queryBuilder.andWhere('departmentEntity.code = :departmentCode', {
        departmentCode: options.departmentCode,
      });
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
        reportType: data.reportType,
        status: data.status || ReportStatus.OPEN,
        userId,
        currentDepartmentId: data.currentDepartmentId,
        categoryId: data.categoryId,
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
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw new Error(
        error instanceof Error ? error.message : 'Unknown error during report creation'
      );
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Updates a report with transactions for media handling
   */
  async update(id: number, updateData: Partial<Report>): Promise<Report | null> {
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
      // Rollback the transaction
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<DeleteResult> {
    return this.reportRepository.delete(id);
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
