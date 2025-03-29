import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentService } from './department.service';
import { DepartmentRepository } from '../repositories/department.repository';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Report } from '../entities/report.entity';
import { DepartmentHistory } from '../entities/department-history.entity';
import { MunicipalityDepartment, ReportStatus, ReportType } from '../interfaces/report.interface';
import { DepartmentDto } from '../dto/department.dto';
import { ForwardReportDto } from '../dto/forward-report.dto';

// Tip tanımlarını oluştur
type MockReport = Partial<Report>;
type MockDepartmentHistory = Partial<DepartmentHistory>;

describe('DepartmentService', () => {
  let service: DepartmentService;

  const mockDepartment = {
    id: 1,
    code: MunicipalityDepartment.ROADS,
    name: 'Yollar ve Altyapı Birimi',
    description: 'Yol ve altyapı sorunlarından sorumlu birim',
    isActive: true,
    responsibleReportTypes: [ReportType.POTHOLE, ReportType.ROAD_DAMAGE],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Report nesnesini tam özelliklerle oluştur
  const mockReport: MockReport = {
    id: 1,
    title: 'Test Report',
    description: 'Test Description',
    location: {
      type: 'Point',
      coordinates: [28.9784, 41.0082],
    },
    address: 'Test Address',
    type: ReportType.POTHOLE,
    status: ReportStatus.REPORTED,
    department: MunicipalityDepartment.GENERAL,
    departmentId: undefined, // null yerine undefined kullanıyoruz
    userId: 1,
    categoryId: 1,
    departmentChangeReason: undefined, // null yerine undefined
    departmentChangedBy: undefined, // null yerine undefined
    departmentChangedAt: undefined, // null yerine undefined
    adminId: undefined, // null yerine undefined
    previousDepartment: undefined, // null yerine undefined
    createdAt: new Date(),
    updatedAt: new Date(),
    departmentHistory: [],
  };

  const mockDepartmentHistory: MockDepartmentHistory = {
    id: 1,
    reportId: 1,
    oldDepartment: MunicipalityDepartment.GENERAL,
    newDepartment: MunicipalityDepartment.ROADS,
    reason: 'Yetki alanı değişikliği',
    changedByDepartment: MunicipalityDepartment.GENERAL,
    createdAt: new Date(),
  };

  const mockDepartmentRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByCode: jest.fn(),
    findByReportType: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockReportRepository = {
    findOne: jest.fn(),
  };

  const mockDepartmentHistoryRepository = {
    find: jest.fn(),
    save: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    manager: {
      save: jest.fn(),
    },
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  };

  beforeEach(async () => {
    // Test dependency setup
    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentService,
        {
          provide: DepartmentRepository,
          useValue: mockDepartmentRepository,
        },
        {
          provide: getRepositoryToken(Report),
          useValue: mockReportRepository,
        },
        {
          provide: getRepositoryToken(DepartmentHistory),
          useValue: mockDepartmentHistoryRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<DepartmentService>(DepartmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all active departments', async () => {
      mockDepartmentRepository.findAll.mockResolvedValue([mockDepartment]);
      const result = await service.findAll();
      expect(result).toEqual([mockDepartment]);
      expect(mockDepartmentRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a department by id', async () => {
      mockDepartmentRepository.findById.mockResolvedValue(mockDepartment);
      const result = await service.findById(1);
      expect(result).toEqual(mockDepartment);
      expect(mockDepartmentRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if department not found', async () => {
      mockDepartmentRepository.findById.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCode', () => {
    it('should return a department by code', async () => {
      mockDepartmentRepository.findByCode.mockResolvedValue(mockDepartment);
      const result = await service.findByCode(MunicipalityDepartment.ROADS);
      expect(result).toEqual(mockDepartment);
      expect(mockDepartmentRepository.findByCode).toHaveBeenCalledWith(
        MunicipalityDepartment.ROADS,
      );
    });

    it('should throw NotFoundException if department not found by code', async () => {
      mockDepartmentRepository.findByCode.mockResolvedValue(null);
      await expect(service.findByCode(MunicipalityDepartment.WATER)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findDepartmentForReportType', () => {
    it('should return appropriate department for report type', async () => {
      mockDepartmentRepository.findByReportType.mockResolvedValue([mockDepartment]);
      const result = await service.findDepartmentForReportType(ReportType.POTHOLE);
      expect(result).toEqual(mockDepartment);
      expect(mockDepartmentRepository.findByReportType).toHaveBeenCalledWith(ReportType.POTHOLE);
    });

    it('should fall back to GENERAL if no department found for type', async () => {
      mockDepartmentRepository.findByReportType.mockResolvedValue([]);
      mockDepartmentRepository.findByCode.mockResolvedValue(mockDepartment);

      const result = await service.findDepartmentForReportType(ReportType.OTHER);

      expect(mockDepartmentRepository.findByCode).toHaveBeenCalledWith(
        MunicipalityDepartment.GENERAL,
      );
      expect(result).toEqual(mockDepartment);
    });
  });

  describe('create', () => {
    it('should create a new department', async () => {
      const departmentDto: DepartmentDto = {
        code: MunicipalityDepartment.PARKS,
        name: 'Park ve Bahçeler',
        description: 'Park ve bahçeler birimi',
        isActive: true,
        responsibleReportTypes: [ReportType.OTHER],
      };

      mockDepartmentRepository.findByCode.mockResolvedValue(null);
      mockDepartmentRepository.create.mockResolvedValue({ ...mockDepartment, ...departmentDto });

      const result = await service.create(departmentDto);

      expect(mockDepartmentRepository.create).toHaveBeenCalledWith(departmentDto);
      expect(result.name).toEqual('Park ve Bahçeler');
    });

    it('should throw BadRequestException if department code already exists', async () => {
      mockDepartmentRepository.findByCode.mockResolvedValue(mockDepartment);

      const departmentDto: DepartmentDto = {
        code: MunicipalityDepartment.ROADS,
        name: 'Another Roads Department',
        description: 'Duplicate',
        isActive: true,
        responsibleReportTypes: [],
      };

      await expect(service.create(departmentDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('forwardReport', () => {
    it('should forward a report to another department', async () => {
      const forwardDto: ForwardReportDto = {
        newDepartment: MunicipalityDepartment.ROADS,
        reason: 'This is a road issue',
        changedByDepartment: MunicipalityDepartment.GENERAL,
      };

      // Report için mock değer hazırla
      mockReportRepository.findOne.mockResolvedValue({
        ...mockReport,
        department: MunicipalityDepartment.GENERAL,
        departmentHistory: [],
      });

      mockDepartmentRepository.findByCode.mockResolvedValue(mockDepartment);

      // Mock save operations for transaction
      mockQueryRunner.manager.save.mockResolvedValueOnce(mockDepartmentHistory); // For DepartmentHistory
      mockQueryRunner.manager.save.mockResolvedValueOnce({
        ...mockReport,
        department: MunicipalityDepartment.ROADS,
        previousDepartment: MunicipalityDepartment.GENERAL,
      }); // For updated Report

      const result = await service.forwardReport(1, forwardDto);

      expect(result.department).toEqual(MunicipalityDepartment.ROADS);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.save).toHaveBeenCalledTimes(2);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should throw BadRequestException if forwarding to same department', async () => {
      const report = { ...mockReport, department: MunicipalityDepartment.ROADS };
      mockReportRepository.findOne.mockResolvedValueOnce(report as unknown as Report);

      const forwardDto: ForwardReportDto = {
        newDepartment: MunicipalityDepartment.ROADS,
        reason: 'Already in this department',
        changedByDepartment: MunicipalityDepartment.GENERAL,
      };

      await expect(service.forwardReport(1, forwardDto)).rejects.toThrow(BadRequestException);
    });

    it('should handle errors and rollback transaction', async () => {
      mockReportRepository.findOne.mockResolvedValue({
        ...mockReport,
        department: MunicipalityDepartment.GENERAL,
        departmentHistory: [],
      });
      mockDepartmentRepository.findByCode.mockResolvedValue(mockDepartment);
      mockQueryRunner.manager.save.mockRejectedValueOnce(new Error('Database error'));

      const forwardDto: ForwardReportDto = {
        newDepartment: MunicipalityDepartment.ROADS,
        reason: 'This is a road issue',
        changedByDepartment: MunicipalityDepartment.GENERAL,
      };

      await expect(service.forwardReport(1, forwardDto)).rejects.toThrow(Error);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('getReportDepartmentHistory', () => {
    it('should return department history for a report', async () => {
      // Report için mock değeri ayarla
      mockReportRepository.findOne.mockResolvedValueOnce(mockReport as unknown as Report);

      // Department geçmişi için mock değer ayarla - önemli kısım burası!
      mockDepartmentHistoryRepository.find.mockResolvedValueOnce([mockDepartmentHistory]);

      const result = await service.getReportDepartmentHistory(1);

      expect(result).toEqual([mockDepartmentHistory]);
      expect(mockDepartmentHistoryRepository.find).toHaveBeenCalledWith({
        where: { reportId: 1 },
        order: { createdAt: 'DESC' },
      });
    });

    it('should throw NotFoundException if report not found', async () => {
      mockReportRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.getReportDepartmentHistory(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('suggestDepartmentForReport', () => {
    it('should suggest appropriate department for report type', async () => {
      mockDepartmentRepository.findByReportType.mockResolvedValue([mockDepartment]);

      const result = await service.suggestDepartmentForReport(ReportType.POTHOLE);

      expect(result).toEqual(mockDepartment);
      expect(mockDepartmentRepository.findByReportType).toHaveBeenCalledWith(ReportType.POTHOLE);
    });
  });
});
