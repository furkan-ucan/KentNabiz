import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ReportRepository } from '../repositories/report.repository';
import { LocationService } from './location.service';
import { DepartmentService } from './department.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { RadiusSearchDto } from '../dto/location.dto';
import { Report } from '../entities/report.entity';
import { DepartmentHistory } from '../entities/department-history.entity';
import { ISpatialQueryResult } from '../interfaces/report.interface';
import { ReportType, ReportStatus, MunicipalityDepartment } from '@KentNabiz/shared';
@Injectable()
export class ReportsService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly locationService: LocationService,
    private readonly departmentService: DepartmentService
  ) {}

  async findAll(options?: {
    limit?: number;
    page?: number;
    userId?: number;
    type?: ReportType;
    status?: ReportStatus;
    department?: MunicipalityDepartment;
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
    const { location, type, categoryId, ...reportData } = createReportDto;
    const point = this.locationService.createPointFromDto(location);

    // Determine the appropriate department for the report type if not provided
    let department = createReportDto.department;
    if (!department) {
      try {
        const suggestedDepartment = await this.departmentService.suggestDepartmentForReport(type);
        department = suggestedDepartment.code;
      } catch {
        // If department suggestion fails, use GENERAL as fallback
        department = MunicipalityDepartment.GENERAL;
      }
    }

    // Type-safe approach with complete object
    const reportToCreate = {
      ...reportData,
      type,
      categoryId, // Yeni kategori ID'si eklendi
      department,
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
      department?: MunicipalityDepartment;
    }
  ): Promise<ISpatialQueryResult> {
    const { latitude, longitude, radius } = searchDto;

    return this.reportRepository.findNearby(latitude, longitude, radius, options);
  }

  async updateStatus(id: number, status: ReportStatus, userId: number): Promise<Report> {
    const report = await this.findOne(id);

    // Yetkilendirme kontrolü
    // Staff ve admin kullanıcıların tüm raporları güncellemesine izin ver, normal kullanıcılar sadece kendi raporlarını güncelleyebilir
    if (report.userId !== userId) {
      throw new UnauthorizedException('Bu raporun durumunu güncelleme yetkiniz yok');
    }

    // Durum geçiş validasyonu
    this.validateStatusTransition(report.status, status);

    // Durum güncellemesi
    const updatedReport = await this.reportRepository.updateStatus(id, status);

    // Eğer RESOLVED durumuna geçiyorsa, tarih ekle
    if (status === ReportStatus.RESOLVED && report.status !== ReportStatus.RESOLVED) {
      // Bu kısmı repository üzerinden güncelliyoruz
      await this.reportRepository.update(id, {
        resolvedAt: new Date(),
      });
    }

    return updatedReport;
  }

  private validateStatusTransition(currentStatus: ReportStatus, newStatus: ReportStatus): void {
    const allowedTransitions: Record<ReportStatus, ReportStatus[]> = {
      [ReportStatus.SUBMITTED]: [
        ReportStatus.UNDER_REVIEW,
        ReportStatus.REJECTED,
        ReportStatus.AWAITING_INFORMATION,
      ],
      [ReportStatus.UNDER_REVIEW]: [
        ReportStatus.FORWARDED,
        ReportStatus.ASSIGNED_TO_EMPLOYEE,
        ReportStatus.PENDING_APPROVAL,
        ReportStatus.REJECTED,
        ReportStatus.AWAITING_INFORMATION,
      ],
      [ReportStatus.FORWARDED]: [
        ReportStatus.ASSIGNED_TO_EMPLOYEE,
        ReportStatus.UNDER_REVIEW,
        ReportStatus.REJECTED,
      ],
      [ReportStatus.ASSIGNED_TO_EMPLOYEE]: [
        ReportStatus.FIELD_WORK_IN_PROGRESS,
        ReportStatus.PENDING_APPROVAL,
        ReportStatus.AWAITING_INFORMATION,
        ReportStatus.UNDER_REVIEW,
      ],
      [ReportStatus.FIELD_WORK_IN_PROGRESS]: [
        ReportStatus.PENDING_APPROVAL,
        ReportStatus.RESOLVED,
        ReportStatus.AWAITING_INFORMATION,
      ],
      [ReportStatus.PENDING_APPROVAL]: [
        ReportStatus.RESOLVED,
        ReportStatus.REJECTED,
        ReportStatus.FIELD_WORK_IN_PROGRESS,
        ReportStatus.UNDER_REVIEW,
      ],
      [ReportStatus.AWAITING_INFORMATION]: [ReportStatus.SUBMITTED, ReportStatus.UNDER_REVIEW],
      [ReportStatus.REJECTED]: [],
      [ReportStatus.RESOLVED]: [],
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `${currentStatus} durumundan ${newStatus} durumuna geçiş yapılamaz.`
      );
    }
  }

  async getReportsByUser(
    userId: number,
    options?: {
      limit?: number;
      page?: number;
      type?: ReportType;
      status?: ReportStatus;
      department?: MunicipalityDepartment;
    }
  ): Promise<ISpatialQueryResult> {
    return this.reportRepository.findAll({
      ...options,
      userId,
    });
  }

  async changeDepartment(
    id: number,
    department: MunicipalityDepartment,
    reason: string,
    userId: number
  ): Promise<Report> {
    const report = await this.findOne(id);

    // Prevent changing to the same department
    if (report.currentDepartment?.code === department) {
      throw new BadRequestException(`Rapor zaten ${department} biriminde`);
    }

    // const currentDepartmentEnum = report.currentDepartment?.code; // This variable was unused

    const updatedReport = await this.departmentService.forwardReport(
      id,
      { newDepartment: department, reason: reason },
      userId
    );

    if (
      updatedReport.status === ReportStatus.SUBMITTED ||
      updatedReport.status === ReportStatus.UNDER_REVIEW
    ) {
      await this.reportRepository.updateStatus(id, ReportStatus.FORWARDED);
    }

    return this.findOne(id);
  }

  async getDepartmentHistory(reportId: number): Promise<DepartmentHistory[]> {
    // Önce raporun varlığını kontrol ediyoruz
    await this.findOne(reportId);
    // Rapor varsa departman geçmişini getiriyoruz
    return this.departmentService.getReportDepartmentHistory(reportId);
  }

  async suggestDepartmentForReportType(type: ReportType): Promise<MunicipalityDepartment> {
    const department = await this.departmentService.suggestDepartmentForReport(type);
    return department.code;
  }
}
