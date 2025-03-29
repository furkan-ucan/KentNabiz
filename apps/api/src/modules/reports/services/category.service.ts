import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { CategoryDto, UpdateCategoryDto } from '../dto/category.dto';
import { ReportCategory } from '../entities/report-category.entity';
import { ICategoryTree } from '../interfaces/report.interface';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  /**
   * Tüm kategorileri düz liste olarak getirir
   */
  async findAll(includeInactive = false): Promise<ReportCategory[]> {
    if (includeInactive) {
      return await this.categoryRepository.findAll();
    } else {
      return await this.categoryRepository.findAllActive();
    }
  }

  /**
   * ID'ye göre kategori getirir
   */
  async findById(id: number): Promise<ReportCategory> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Kategori ID ${id} bulunamadı`);
    }
    return category;
  }

  /**
   * Koda göre kategori getirir
   */
  async findByCode(code: string): Promise<ReportCategory> {
    const category = await this.categoryRepository.findByCode(code);
    if (!category) {
      throw new NotFoundException(`Kategori kodu '${code}' bulunamadı`);
    }
    return category;
  }

  /**
   * Belirli bir üst kategorinin alt kategorilerini getirir.
   * Eğer parentId null ise, ana kategorileri döndürür.
   */
  async findByParentId(parentId: number | null): Promise<ReportCategory[]> {
    if (parentId === null) {
      return await this.categoryRepository.findMainCategories();
    } else {
      const parentExists = await this.categoryRepository.findById(parentId);
      if (!parentExists) {
        throw new NotFoundException(`Üst kategori ID ${parentId} bulunamadı`);
      }
      // findSubCategories Repository metodunu kullanıyoruz
      return await this.categoryRepository.findSubCategories(parentId);
    }
  }

  /**
   * Yeni kategori oluşturur
   */
  async create(categoryDto: CategoryDto): Promise<ReportCategory> {
    const existingCategory = await this.categoryRepository.findByCode(categoryDto.code);
    if (existingCategory) {
      throw new BadRequestException(`'${categoryDto.code}' kodlu kategori zaten mevcut`);
    }
    if (categoryDto.parentId) {
      const parentExists = await this.categoryRepository.findById(categoryDto.parentId);
      if (!parentExists) {
        throw new BadRequestException(`Üst kategori ID ${categoryDto.parentId} bulunamadı`);
      }
    }
    return await this.categoryRepository.create(categoryDto);
  }

  /**
   * Kategori günceller
   */
  async update(id: number, updateDto: UpdateCategoryDto): Promise<ReportCategory> {
    // Kategori varlığını kontrol et
    await this.findById(id);

    // Eğer parentId güncelleniyorsa, kontrol et
    if (updateDto.parentId !== undefined && updateDto.parentId !== null) {
      const parentExists = await this.categoryRepository.findById(updateDto.parentId);
      if (!parentExists) {
        throw new BadRequestException(`Üst kategori ID ${updateDto.parentId} bulunamadı`);
      }
      if (updateDto.parentId === id) {
        throw new BadRequestException('Bir kategori kendisini üst kategori olarak belirleyemez');
      }
    }

    const updatedCategory = await this.categoryRepository.update(id, updateDto);
    if (!updatedCategory) {
      throw new NotFoundException(`Kategori ID ${id} güncelleme sonrasında bulunamadı`);
    }
    return updatedCategory;
  }

  /**
   * Kategori siler
   */
  async delete(id: number): Promise<void> {
    await this.findById(id);
    // Alt kategorileri kontrol etmek için findSubCategories metodunu kullanıyoruz
    const children = await this.categoryRepository.findSubCategories(id);
    if (children.length > 0) {
      throw new BadRequestException(
        `Bu kategori silinemiyor çünkü ${children.length} alt kategorisi bulunuyor. Önce alt kategorileri silin veya başka bir kategoriye taşıyın.`,
      );
    }
    // Repository'de 'delete' yerine 'remove' metodu tanımlıysa onu kullanıyoruz
    const success = await this.categoryRepository.remove(id);
    if (!success) {
      throw new NotFoundException(`Kategori ID ${id} silinemedi`);
    }
  }

  /**
   * Hiyerarşik kategori ağacını getirir
   */
  async getCategoryTree(): Promise<ICategoryTree[]> {
    const tree = await this.categoryRepository.getHierarchicalCategories();

    // ReportCategory'i ICategoryTree'ye dönüştüren recursive fonksiyon
    const convertToICategoryTree = (cat: ReportCategory): ICategoryTree => {
      return {
        ...cat,
        children: cat.children ? cat.children.map((child) => convertToICategoryTree(child)) : [],
      };
    };

    // Her bir kategoriyi dönüştürüp döndürüyoruz
    return tree.map((category) => convertToICategoryTree(category));
  }
}
