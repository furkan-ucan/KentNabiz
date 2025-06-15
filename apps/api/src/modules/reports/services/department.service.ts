import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Department } from '../entities/department.entity';
import { DepartmentRepository } from '../repositories/department.repository';
import { DepartmentDto } from '../dto/department.dto';
import { Report } from '../entities/report.entity';
import { DepartmentHistory } from '../entities/department-history.entity';
import { MunicipalityDepartment, ReportType } from '@kentnabiz/shared';

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

  async findOneByCode(code: MunicipalityDepartment): Promise<Department | null> {
    try {
      return await this.findByCode(code);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return null;
      }
      throw error;
    }
  }

  async findById(id: number): Promise<Department> {
    const department = await this.departmentRepository.findById(id);
    if (!department) {
      throw new NotFoundException(`Birim ID ${id} bulunamadı`);
    }
    return department;
  }

  async findByCode(code: MunicipalityDepartment, manager?: EntityManager): Promise<Department> {
    let department: Department | null;

    if (manager) {
      // Büyük/küçük harf duyarsız arama
      department = await manager
        .createQueryBuilder(Department, 'd')
        .where('UPPER(d.code) = UPPER(:code)', { code })
        .getOne();
    } else {
      // Use repository (case-insensitive)
      department = await this.departmentRepository.findByCode(code);
      // Eğer repository case-sensitive ise, burada da kontrol edelim
      if (!department) {
        // Fallback: tüm departmanları çekip kodu case-insensitive karşılaştır
        const all = await this.departmentRepository.findAll();
        department = all.find(d => d.code.toUpperCase() === String(code).toUpperCase()) || null;
      }
    }

    if (!department) {
      throw new NotFoundException(`Birim kodu ${code} bulunamadı`);
    }
    return department;
  }

  async findDepartmentForReportType(
    reportType: ReportType,
    manager?: EntityManager
  ): Promise<Department> {
    let departments: Department[];

    if (manager) {
      // Use transaction manager with query builder
      departments = await manager
        .createQueryBuilder(Department, 'department')
        .where('department.responsible_report_types @> :reportTypeToSearch::jsonb', {
          reportTypeToSearch: JSON.stringify([reportType]),
        })
        .andWhere('department.isActive = :isActive', { isActive: true })
        .getMany();
    } else {
      // Use repository
      departments = await this.departmentRepository.findByReportType(reportType);
    }

    if (!departments || departments.length === 0) {
      const generalDepartment = await this.findByCode(
        MunicipalityDepartment.GENERAL_AFFAIRS,
        manager
      );
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
      select: [
        'id',
        'reportId',
        'previousDepartmentId',
        'newDepartmentId',
        'reason',
        'changedByUser',
        'changedAt',
        'previousDepartment',
        'newDepartment',
      ],
    });
  }

  async suggestDepartmentForReport(type: ReportType, manager?: EntityManager): Promise<Department> {
    return this.findDepartmentForReportType(type, manager);
  }
}
