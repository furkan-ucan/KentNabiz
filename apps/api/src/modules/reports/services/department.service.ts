import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Department } from '../entities/department.entity';
import { DepartmentRepository } from '../repositories/department.repository';
import { DepartmentDto } from '../dto/department.dto';
import { Report } from '../entities/report.entity';
import { DepartmentHistory } from '../entities/department-history.entity';
import { ForwardReportDto } from '../dto/forward-report.dto';
import { MunicipalityDepartment, ReportStatus, ReportType } from '@KentNabiz/shared';

@Injectable()
export class DepartmentService {
  private readonly logger = new Logger(DepartmentService.name);

  constructor(
    private departmentRepository: DepartmentRepository,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(DepartmentHistory)
    private departmentHistoryRepository: Repository<DepartmentHistory>,
    private connection: DataSource
  ) {}

  async findAll(): Promise<Department[]> {
    return this.departmentRepository.findAll();
  }

  async findById(id: number): Promise<Department> {
    const department = await this.departmentRepository.findById(id);
    if (!department) {
      throw new NotFoundException(`Birim ID ${id} bulunamadı`);
    }
    return department;
  }

  async findByCode(code: MunicipalityDepartment): Promise<Department> {
    const department = await this.departmentRepository.findByCode(code);
    if (!department) {
      throw new NotFoundException(`Birim kodu ${code} bulunamadı`);
    }
    return department;
  }

  async findDepartmentForReportType(reportType: ReportType): Promise<Department> {
    const departments = await this.departmentRepository.findByReportType(reportType);

    if (!departments || departments.length === 0) {
      const generalDepartment = await this.findByCode(MunicipalityDepartment.GENERAL);
      return generalDepartment;
    }
    return departments[0];
  }

  async create(departmentDto: DepartmentDto): Promise<Department> {
    const existingDepartment = await this.departmentRepository.findByCode(departmentDto.code);
    if (existingDepartment) {
      throw new BadRequestException(`${departmentDto.code} kodlu birim zaten kayıtlı`);
    }
    return this.departmentRepository.create(departmentDto);
  }

  async update(id: number, departmentDto: Partial<DepartmentDto>): Promise<Department> {
    await this.findById(id);
    return this.departmentRepository.update(id, departmentDto);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.departmentRepository.delete(id);
  }

  async forwardReport(
    reportId: number,
    forwardDto: ForwardReportDto,
    changedByUserId: number
  ): Promise<Report> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const report = await queryRunner.manager.findOne(Report, {
        where: { id: reportId },
      });

      if (!report) {
        throw new NotFoundException(`Rapor ID ${reportId} bulunamadı`);
      }

      const newDepartmentEntity = await this.findByCode(forwardDto.newDepartment);

      if (report.currentDepartmentId === newDepartmentEntity.id) {
        throw new BadRequestException(`Rapor zaten ${newDepartmentEntity.name} biriminde`);
      }

      const oldDepartmentId = report.currentDepartmentId;

      const departmentHistoryEntry = queryRunner.manager.create(DepartmentHistory, {
        reportId: report.id,
        previousDepartmentId: oldDepartmentId,
        newDepartmentId: newDepartmentEntity.id,
        reason: forwardDto.reason,
        changedByUserId: changedByUserId,
      });

      report.currentDepartmentId = newDepartmentEntity.id;
      report.currentDepartment = newDepartmentEntity;
      report.status = ReportStatus.IN_REVIEW;

      await queryRunner.manager.save(DepartmentHistory, departmentHistoryEntry);
      await queryRunner.manager.save(Report, report);

      await queryRunner.commitTransaction();

      return this.reportRepository.findOneOrFail({
        where: { id: reportId },
        relations: [
          'currentDepartment',
          'user',
          'reportMedias',
          'assignedEmployee',
          'category',
          'departmentHistory',
          'departmentHistory.previousDepartment',
          'departmentHistory.newDepartment',
          'departmentHistory.changedByUser',
        ],
      });
    } catch (error: unknown) {
      // Changed Error to unknown
      await queryRunner.rollbackTransaction();
      let errorMessage = `Error during forwardReport for reportId ${reportId}`;
      let errorStack;

      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
        errorStack = error.stack;
      } else if (typeof error === 'string') {
        errorMessage += `: ${error}`;
      } else {
        errorMessage += ': Unknown error occurred';
      }

      this.logger.error(errorMessage, errorStack);
      // Re-throw the original error or a new custom error as appropriate
      // If you re-throw 'error', its type is 'unknown'.
      // If you want to throw an Error instance, you might need to wrap it.
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(errorMessage); // Or a more specific error type
    } finally {
      await queryRunner.release();
    }
  }

  async getReportDepartmentHistory(reportId: number): Promise<DepartmentHistory[]> {
    const reportExists = await this.reportRepository.exists({
      where: { id: reportId },
    });
    if (!reportExists) {
      throw new NotFoundException(`Rapor ID ${reportId} bulunamadı`);
    }

    return this.departmentHistoryRepository.find({
      where: { reportId },
      order: { changedAt: 'DESC' },
      relations: ['previousDepartment', 'newDepartment', 'changedByUser'],
    });
  }

  async suggestDepartmentForReport(type: ReportType): Promise<Department> {
    return this.findDepartmentForReportType(type);
  }
}
