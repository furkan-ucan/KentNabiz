// apps/api/src/modules/reports/repositories/department.repository.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { MunicipalityDepartment, ReportType } from '@KentNabiz/shared';

// TODO: add unit tests for department repository methods - coverage: 27.77%

@Injectable()
export class DepartmentRepository {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>
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
    // JSONB dizisi içinde bir elemanın varlığını kontrol etmek için '@>' operatörünü kullanıyoruz.
    // TypeORM Query Builder'da bu genellikle .where("column @> :value") şeklinde olur.
    // Parametreyi JSONB array formatına uygun hale getirmemiz gerekiyor: '["VALUE_TO_SEARCH"]'
    return this.departmentRepository
      .createQueryBuilder('department')
      .where('department.responsible_report_types @> :reportTypeToSearch::jsonb', {
        reportTypeToSearch: JSON.stringify([reportType]), // Tek elemanlı bir diziye çevirip JSON string'i yap
      })
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
      // Bu hata mesajı daha önce farklıydı, tutarlılık için düzeltilebilir veya böyle kalabilir.
      // throw new Error(`ID ${id} olan birim güncellemeden sonra bulunamadı`);
      throw new NotFoundException(`Department with ID ${id} not found after update`);
    }
    return updatedDepartment;
  }

  async delete(id: number): Promise<void> {
    const result = await this.departmentRepository.delete(id); // delete DeleteResult döner
    if (result.affected === 0) {
      throw new NotFoundException(`Department with ID ${id} not found for deletion.`);
    }
  }
}
