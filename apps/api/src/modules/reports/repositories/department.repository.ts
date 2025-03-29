import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { MunicipalityDepartment, ReportType } from '../interfaces/report.interface';

@Injectable()
export class DepartmentRepository {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async findAll(): Promise<Department[]> {
    return this.departmentRepository.find({ where: { isActive: true } });
  }

  async findById(id: number): Promise<Department | null> {
    return this.departmentRepository.findOne({ where: { id } });
  }

  async findByCode(code: MunicipalityDepartment): Promise<Department | null> {
    return this.departmentRepository.findOne({ where: { code } });
  }

  async findByReportType(reportType: ReportType): Promise<Department[]> {
    return this.departmentRepository
      .createQueryBuilder('department')
      .where(':reportType = ANY(department.responsibleReportTypes)', { reportType })
      .andWhere('department.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async create(departmentData: Partial<Department>): Promise<Department> {
    const department = this.departmentRepository.create(departmentData);
    return this.departmentRepository.save(department);
  }

  async update(id: number, departmentData: Partial<Department>): Promise<Department> {
    await this.departmentRepository.update(id, departmentData);
    const updatedDepartment = await this.findById(id);
    if (!updatedDepartment) {
      throw new Error(`ID ${id} olan birim güncellemeden sonra bulunamadı`);
    }
    return updatedDepartment;
  }

  async delete(id: number): Promise<void> {
    await this.departmentRepository.delete(id);
  }
}
