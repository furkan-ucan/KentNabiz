import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { CategoryRepository } from '../repositories/category.repository';
import { ReportCategory } from '../entities/report-category.entity';
import { CategoryDto, UpdateCategoryDto } from '../dto/category.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CategoryService', () => {
  let service: CategoryService;

  const mockCategory: ReportCategory = {
    id: 1,
    name: 'Ulaşım İhbar',
    code: 'TRANSPORT',
    description: 'Toplu taşıma ve ulaşım ile ilgili ihbarlar',
    icon: 'fa-bus',
    parentId: undefined, // null yerine undefined kullanıldı
    isActive: true,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    children: [],
    reports: [], // Eksik property eklendi
  };

  const mockChildCategory: ReportCategory = {
    id: 2,
    name: 'Otobüs',
    code: 'TRANSPORT_BUS',
    description: 'Otobüs ile ilgili ihbarlar',
    icon: 'fa-bus',
    parentId: 1,
    isActive: true,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    children: [],
    reports: [], // Eksik property eklendi
  };

  const mockCategoryRepository = {
    findAll: jest.fn(),
    findAllActive: jest.fn(),
    findById: jest.fn(),
    findByCode: jest.fn(),
    findMainCategories: jest.fn(),
    findSubCategories: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getHierarchicalCategories: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: CategoryRepository,
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      mockCategoryRepository.findAll.mockResolvedValue([mockCategory, mockChildCategory]);

      const result = await service.findAll(true);

      expect(result).toEqual([mockCategory, mockChildCategory]);
      expect(mockCategoryRepository.findAll).toHaveBeenCalled();
    });

    it('should return only active categories when includeInactive is false', async () => {
      mockCategoryRepository.findAllActive.mockResolvedValue([mockCategory]);

      const result = await service.findAll(false);

      expect(result).toEqual([mockCategory]);
      expect(mockCategoryRepository.findAllActive).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a category when it exists', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);

      const result = await service.findById(1);

      expect(result).toEqual(mockCategory);
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when category does not exist', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('findByCode', () => {
    it('should return a category when code exists', async () => {
      mockCategoryRepository.findByCode.mockResolvedValue(mockCategory);

      const result = await service.findByCode('TRANSPORT');

      expect(result).toEqual(mockCategory);
      expect(mockCategoryRepository.findByCode).toHaveBeenCalledWith('TRANSPORT');
    });

    it('should throw NotFoundException when code does not exist', async () => {
      mockCategoryRepository.findByCode.mockResolvedValue(null);

      await expect(service.findByCode('NONEXISTENT')).rejects.toThrow(NotFoundException);
      expect(mockCategoryRepository.findByCode).toHaveBeenCalledWith('NONEXISTENT');
    });
  });

  describe('findByParentId', () => {
    it('should return main categories when parentId is null', async () => {
      mockCategoryRepository.findMainCategories.mockResolvedValue([mockCategory]);

      const result = await service.findByParentId(null);

      expect(result).toEqual([mockCategory]);
      expect(mockCategoryRepository.findMainCategories).toHaveBeenCalled();
    });

    it('should return subcategories when parentId is provided', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockCategoryRepository.findSubCategories.mockResolvedValue([mockChildCategory]);

      const result = await service.findByParentId(1);

      expect(result).toEqual([mockChildCategory]);
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCategoryRepository.findSubCategories).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when parent does not exist', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(service.findByParentId(999)).rejects.toThrow(NotFoundException);
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const categoryDto: CategoryDto = {
        name: 'Yeni Kategori',
        code: 'NEW_CATEGORY',
        description: 'Yeni kategori açıklaması',
        isActive: true,
      };

      mockCategoryRepository.findByCode.mockResolvedValue(null);
      mockCategoryRepository.create.mockResolvedValue({
        id: 3,
        ...categoryDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
      });

      const result = await service.create(categoryDto);

      expect(result.name).toEqual('Yeni Kategori');
      expect(mockCategoryRepository.findByCode).toHaveBeenCalledWith('NEW_CATEGORY');
      expect(mockCategoryRepository.create).toHaveBeenCalledWith(categoryDto);
    });

    it('should throw BadRequestException when code already exists', async () => {
      const categoryDto: CategoryDto = {
        name: 'Tekrar Eden Kategori',
        code: 'TRANSPORT',
        description: 'Zaten mevcut olan kod',
        isActive: true,
      };

      mockCategoryRepository.findByCode.mockResolvedValue(mockCategory);

      await expect(service.create(categoryDto)).rejects.toThrow(BadRequestException);
      expect(mockCategoryRepository.findByCode).toHaveBeenCalledWith('TRANSPORT');
    });

    it('should check if parent exists when parentId is provided', async () => {
      const categoryDto: CategoryDto = {
        name: 'Alt Kategori',
        code: 'SUB_CATEGORY',
        description: 'Alt kategori',
        parentId: 999,
        isActive: true,
      };

      mockCategoryRepository.findByCode.mockResolvedValue(null);
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(service.create(categoryDto)).rejects.toThrow(BadRequestException);
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('update', () => {
    it('should update a category when it exists', async () => {
      const updateDto: UpdateCategoryDto = {
        name: 'Güncellenmiş Kategori',
        description: 'Güncellenmiş açıklama',
      };

      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockCategoryRepository.update.mockResolvedValue({
        ...mockCategory,
        name: 'Güncellenmiş Kategori',
        description: 'Güncellenmiş açıklama',
      });

      const result = await service.update(1, updateDto);

      expect(result.name).toEqual('Güncellenmiş Kategori');
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCategoryRepository.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should throw NotFoundException when category does not exist', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Güncellenmiş' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(999);
    });

    it('should validate parent category when parentId is updated', async () => {
      const updateDto: UpdateCategoryDto = {
        parentId: 999,
      };

      mockCategoryRepository.findById
        .mockResolvedValueOnce(mockCategory) // İlk çağrı (kategori kontrolü)
        .mockResolvedValueOnce(null); // İkinci çağrı (üst kategori kontrolü)

      await expect(service.update(1, updateDto)).rejects.toThrow(BadRequestException);
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(999);
    });

    it('should throw BadRequestException when setting itself as parent', async () => {
      const updateDto: UpdateCategoryDto = {
        parentId: 1,
      };

      mockCategoryRepository.findById.mockResolvedValue(mockCategory);

      await expect(service.update(1, updateDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when update does not return category', async () => {
      const updateDto: UpdateCategoryDto = {
        name: 'Güncellenmiş Kategori',
      };

      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockCategoryRepository.update.mockResolvedValue(null);

      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a category with no children', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockCategoryRepository.findSubCategories.mockResolvedValue([]);
      mockCategoryRepository.remove.mockResolvedValue(true);

      await expect(service.delete(1)).resolves.not.toThrow();
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCategoryRepository.findSubCategories).toHaveBeenCalledWith(1);
      expect(mockCategoryRepository.remove).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException when category has children', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockCategoryRepository.findSubCategories.mockResolvedValue([{ id: 2, name: 'Sub Category' }]);

      // İşlemden önce tüm mock'ları temizle
      jest.clearAllMocks();

      await expect(service.delete(1)).rejects.toThrow(BadRequestException);
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCategoryRepository.findSubCategories).toHaveBeenCalledWith(1);
      expect(mockCategoryRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when delete operation fails', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockCategoryRepository.findSubCategories.mockResolvedValue([]);
      mockCategoryRepository.remove.mockResolvedValue(false);

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
      expect(mockCategoryRepository.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('getCategoryTree', () => {
    it('should return hierarchical category tree', async () => {
      const mockMainCategoriesWithChildren = [
        {
          ...mockCategory,
          children: [mockChildCategory],
        },
      ];

      mockCategoryRepository.getHierarchicalCategories.mockResolvedValue(
        mockMainCategoriesWithChildren,
      );

      const result = await service.getCategoryTree();

      expect(result.length).toEqual(1);
      expect(result[0].children.length).toEqual(1);
      expect(result[0].children[0].name).toEqual('Otobüs');
      expect(mockCategoryRepository.getHierarchicalCategories).toHaveBeenCalled();
    });
  });
});
