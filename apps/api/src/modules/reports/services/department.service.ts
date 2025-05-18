import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Department } from '../entities/department.entity';
import { DepartmentRepository } from '../repositories/department.repository';
import { DepartmentDto } from '../dto/department.dto';
import { Report } from '../entities/report.entity';
import { DepartmentHistory } from '../entities/department-history.entity';
import { ForwardReportDto } from '../dto/forward-report.dto';
import { MunicipalityDepartment, ReportType } from '@KentNabiz/shared';

@Injectable()
export class DepartmentService {
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
      // Eğer belirli rapor türü için özel bir birim bulunamazsa, GENERAL birimini döndür
      const generalDepartment = await this.findByCode(MunicipalityDepartment.GENERAL);
      // findByCode zaten NotFoundException fırlatacak, ayrıca kontrol gerekmiyor
      return generalDepartment;
    }

    // Sorumlu birimlerden ilkini dön
    return departments[0];
  }

  async create(departmentDto: DepartmentDto): Promise<Department> {
    // Aynı kodla kayıtlı birim var mı kontrol et
    const existingDepartment = await this.departmentRepository.findByCode(departmentDto.code);
    if (existingDepartment) {
      throw new BadRequestException(`${departmentDto.code} kodlu birim zaten kayıtlı`);
    }

    return this.departmentRepository.create(departmentDto);
  }

  async update(id: number, departmentDto: Partial<DepartmentDto>): Promise<Department> {
    await this.findById(id); // Check if department exists
    return this.departmentRepository.update(id, departmentDto);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id); // Check if department exists
    await this.departmentRepository.delete(id);
  }

  async forwardReport(
    reportId: number,
    forwardDto: ForwardReportDto,
    changedByUserId: number
  ): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
      relations: ['departmentHistory', 'currentDepartment'],
    });

    if (!report) {
      throw new NotFoundException(`Rapor ID ${reportId} bulunamadı`);
    }

    const newDepartmentEntity = await this.findByCode(forwardDto.newDepartment);
    if (!newDepartmentEntity) {
      throw new NotFoundException(`Hedef birim kodu ${forwardDto.newDepartment} bulunamadı`);
    }

    if (report.currentDepartmentId === newDepartmentEntity.id) {
      throw new BadRequestException(`Rapor zaten ${newDepartmentEntity.name} biriminde`);
    }

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const oldDepartmentId = report.currentDepartmentId;

      const departmentHistory = new DepartmentHistory();
      departmentHistory.reportId = report.id;
      if (oldDepartmentId) {
        departmentHistory.previousDepartmentId = oldDepartmentId;
      }
      departmentHistory.newDepartmentId = newDepartmentEntity.id;
      departmentHistory.reason = forwardDto.reason;
      departmentHistory.changedByUserId = changedByUserId;

      report.currentDepartmentId = newDepartmentEntity.id;
      report.currentDepartment = newDepartmentEntity;

      await queryRunner.manager.save(departmentHistory);
      await queryRunner.manager.save(report);

      await queryRunner.commitTransaction();

      return this.reportRepository.findOneOrFail({
        where: { id: reportId },
        relations: [
          'currentDepartment',
          'user',
          'reportMedias',
          'assignedEmployee',
          'departmentHistory',
        ],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getReportDepartmentHistory(reportId: number): Promise<DepartmentHistory[]> {
    const reportExists = await this.reportRepository.exists({ where: { id: reportId } });
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
