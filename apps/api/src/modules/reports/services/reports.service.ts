import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ReportRepository } from '../repositories/report.repository';
import { LocationService } from './location.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { RadiusSearchDto } from '../dto/location.dto';
import { Report } from '../entities/report.entity';
import { ISpatialQueryResult, ReportStatus, ReportType } from '../interfaces/report.interface';
import { DataSource } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly locationService: LocationService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(options?: {
    limit?: number;
    page?: number;
    userId?: number;
    type?: ReportType;
    status?: ReportStatus;
  }): Promise<ISpatialQueryResult> {
    return this.reportRepository.findAll(options);
  }

  async findOne(id: number): Promise<Report> {
    const report = await this.reportRepository.findById(id);

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return report;
  }

  async create(createReportDto: CreateReportDto, userId: number): Promise<Report> {
    // Using LocationService for better type safety
    const { location, ...reportData } = createReportDto;
    const point = this.locationService.createPointFromDto(location);

    // Type-safe approach with complete object
    const reportToCreate = {
      ...reportData,
      location: point,
    };

    return this.reportRepository.create(reportToCreate, userId);
  }

  async update(id: number, updateReportDto: UpdateReportDto, userId: number): Promise<Report> {
    const report = await this.findOne(id);

    // Check if user is the owner of the report
    if (report.userId !== userId) {
      throw new UnauthorizedException('You can only update your own reports');
    }

    // Create updated report data
    const { location, ...updateData } = updateReportDto;

    // Convert location to Point if provided
    if (location) {
      const point = this.locationService.createPointFromDto(location);
      const updateWithLocation = {
        ...updateData,
        location: point,
      };

      const updatedReport = await this.reportRepository.update(id, updateWithLocation);

      if (!updatedReport) {
        throw new NotFoundException(`Report with ID ${id} not found after update`);
      }

      return updatedReport;
    }

    // Update without location change
    const updatedReport = await this.reportRepository.update(id, updateData);
    if (!updatedReport) {
      throw new NotFoundException(`Report with ID ${id} not found after update`);
    }

    return updatedReport;
  }

  async remove(id: number, userId: number): Promise<void> {
    const report = await this.findOne(id);

    // Check if user is the owner of the report
    if (report.userId !== userId) {
      throw new UnauthorizedException('You can only delete your own reports');
    }

    const deleted = await this.reportRepository.remove(id);

    if (!deleted) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
  }

  async findNearby(
    searchDto: RadiusSearchDto,
    options?: {
      limit?: number;
      page?: number;
      type?: ReportType;
      status?: ReportStatus;
    },
  ): Promise<ISpatialQueryResult> {
    const { latitude, longitude, radius } = searchDto;

    return this.reportRepository.findNearby(latitude, longitude, radius, options);
  }

  async updateStatus(id: number, status: ReportStatus, userId: number): Promise<Report> {
    const report = await this.findOne(id);

    // Only allow status updates by the owner of the report
    if (report.userId !== userId) {
      throw new UnauthorizedException('You can only update status of your own reports');
    }

    // Handle validation of status transitions
    this.validateStatusTransition(report.status, status);

    return this.reportRepository.updateStatus(id, status);
  }

  private validateStatusTransition(currentStatus: ReportStatus, newStatus: ReportStatus): void {
    // Implement business rules for status transitions
    if (currentStatus === ReportStatus.RESOLVED) {
      throw new BadRequestException('Cannot change status of a resolved report');
    }

    if (currentStatus === ReportStatus.REJECTED && newStatus !== ReportStatus.REPORTED) {
      throw new BadRequestException('Rejected reports can only be reopened as reported');
    }

    // Add more business rules as needed
  }

  async getReportsByUser(
    userId: number,
    options?: {
      limit?: number;
      page?: number;
      type?: ReportType;
      status?: ReportStatus;
    },
  ): Promise<ISpatialQueryResult> {
    return this.reportRepository.findAll({
      ...options,
      userId,
    });
  }
}
