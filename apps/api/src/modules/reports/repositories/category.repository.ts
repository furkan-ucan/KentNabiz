import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ReportCategory } from '../entities/report-category.entity';

// TODO: add unit tests for category repository methods - coverage: 22.72%

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(ReportCategory)
    private repository: Repository<ReportCategory>,
  ) {}

  async findAll(): Promise<ReportCategory[]> {
    return this.repository.find();
  }

  async findAllActive(): Promise<ReportCategory[]> {
    return this.repository.find({ where: { isActive: true } });
  }

  async findById(id: number): Promise<ReportCategory | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByCode(code: string): Promise<ReportCategory | null> {
    return this.repository.findOne({ where: { code } });
  }

  async findMainCategories(): Promise<ReportCategory[]> {
    // TODO: add tests for hierarchy queries
    return this.repository.find({
      where: { parentId: IsNull(), isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findSubCategories(parentId: number): Promise<ReportCategory[]> {
    // TODO: add tests for subcategory filtering
    return this.repository.find({
      where: { parentId, isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async create(data: Partial<ReportCategory>): Promise<ReportCategory> {
    const category = this.repository.create(data);
    return this.repository.save(category);
  }

  async update(id: number, data: Partial<ReportCategory>): Promise<ReportCategory | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async getHierarchicalCategories(): Promise<ReportCategory[]> {
    // TODO: add tests for hierarchical data fetching
    // Önce tüm ana kategorileri alalım
    const mainCategories = await this.findMainCategories();

    // Her ana kategori için alt kategorileri yükleyelim
    for (const category of mainCategories) {
      category.children = await this.findSubCategories(category.id);
    }

    return mainCategories;
  }
}
