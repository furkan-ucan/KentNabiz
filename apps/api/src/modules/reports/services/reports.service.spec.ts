import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { LocationService } from './location.service';
import { DepartmentService } from './department.service';
import { ReportRepository } from '../repositories/report.repository';
import { DataSource } from 'typeorm';
import { NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ReportStatus, ReportType, MunicipalityDepartment } from '../interfaces/report.interface';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { LocationDto } from '../dto/location.dto';

describe('ReportsService', () => {
  let service: ReportsService;

  const mockReport = {
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
    userId: 1,
    reportMedias: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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

  const mockDepartmentHistory = {
    id: 1,
    reportId: 1,
    oldDepartment: MunicipalityDepartment.GENERAL,
    newDepartment: MunicipalityDepartment.ROADS,
    reason: 'Yetki alanı değişikliği',
    changedByUserId: 2,
    createdAt: new Date(),
  };

  const mockReportRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findNearby: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockLocationService = {
    createPoint: jest.fn(),
    createPointFromDto: jest.fn(),
    calculateDistance: jest.fn(),
    extractCoordinates: jest.fn(),
    getBoundingBox: jest.fn(),
  };

  const mockDepartmentService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByCode: jest.fn(),
    findDepartmentForReportType: jest.fn(),
    suggestDepartmentForReport: jest.fn(),
    forwardReport: jest.fn(),
    getReportDepartmentHistory: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      manager: {
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: ReportRepository,
          useValue: mockReportRepository,
        },
        {
          provide: LocationService,
          useValue: mockLocationService,
        },
        {
          provide: DepartmentService,
          useValue: mockDepartmentService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all reports with pagination', async () => {
      const mockResult = {
        data: [mockReport],
        total: 1,
        page: 1,
        limit: 10,
      };
      mockReportRepository.findAll.mockResolvedValue(mockResult);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual(mockResult);
      expect(mockReportRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });

  describe('findOne', () => {
    it('should return a report when it exists', async () => {
      mockReportRepository.findById.mockResolvedValue(mockReport);

      const result = await service.findOne(1);

      expect(result).toEqual(mockReport);
      expect(mockReportRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when report does not exist', async () => {
      mockReportRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new report', async () => {
      const createReportDto: CreateReportDto = {
        title: 'New Report',
        description: 'New Description',
        location: new LocationDto(),
        address: 'New Address',
        type: ReportType.POTHOLE,
        reportMedias: [],
      };

      createReportDto.location.latitude = 41.0082;
      createReportDto.location.longitude = 28.9784;

      const geoJSONPoint = {
        type: 'Point',
        coordinates: [28.9784, 41.0082],
      };

      // Use the location service mock to create a GeoJSON point
      mockLocationService.createPointFromDto.mockReturnValue(geoJSONPoint);

      // Burada mockDepartmentService.suggestDepartmentForReport'u ayarlamamız gerekiyor
      mockDepartmentService.suggestDepartmentForReport.mockResolvedValue(mockDepartment);

      mockReportRepository.create.mockResolvedValue(mockReport);

      const result = await service.create(createReportDto, 1);

      expect(result).toEqual(mockReport);
      expect(mockReportRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Report',
          description: 'New Description',
          location: geoJSONPoint,
          address: 'New Address',
          type: ReportType.POTHOLE,
          reportMedias: [],
          department: MunicipalityDepartment.ROADS,
          categoryId: undefined,
        }),
        1,
      );
    });
  });

  describe('create with department', () => {
    it('should create a report with suggested department when not provided', async () => {
      const createReportDto: CreateReportDto = {
        title: 'New Report',
        description: 'New Description',
        location: new LocationDto(),
        address: 'New Address',
        type: ReportType.POTHOLE,
        reportMedias: [],
      };
      createReportDto.location.latitude = 41.0082;
      createReportDto.location.longitude = 28.9784;

      const geoJSONPoint = {
        type: 'Point',
        coordinates: [28.9784, 41.0082],
      };

      mockLocationService.createPointFromDto.mockReturnValue(geoJSONPoint);
      mockDepartmentService.suggestDepartmentForReport.mockResolvedValue(mockDepartment);
      mockReportRepository.create.mockResolvedValue({
        ...mockReport,
        department: MunicipalityDepartment.ROADS,
      });

      const result = await service.create(createReportDto, 1);

      expect(result.department).toEqual(MunicipalityDepartment.ROADS);
      expect(mockDepartmentService.suggestDepartmentForReport).toHaveBeenCalledWith(
        ReportType.POTHOLE,
      );
      expect(mockReportRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          department: MunicipalityDepartment.ROADS,
        }),
        1,
      );
    });

    it('should use GENERAL department if suggestion fails', async () => {
      const createReportDto: CreateReportDto = {
        title: 'New Report',
        description: 'New Description',
        location: new LocationDto(),
        address: 'New Address',
        type: ReportType.POTHOLE,
        reportMedias: [],
      };
      createReportDto.location.latitude = 41.0082;
      createReportDto.location.longitude = 28.9784;

      const geoJSONPoint = {
        type: 'Point',
        coordinates: [28.9784, 41.0082],
      };

      mockLocationService.createPointFromDto.mockReturnValue(geoJSONPoint);
      mockDepartmentService.suggestDepartmentForReport.mockRejectedValue(
        new Error('Service unavailable'),
      );
      mockReportRepository.create.mockResolvedValue(mockReport);

      const result = await service.create(createReportDto, 1);

      expect(result.department).toEqual(MunicipalityDepartment.GENERAL);
      expect(mockReportRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          department: MunicipalityDepartment.GENERAL,
        }),
        1,
      );
    });
  });

  describe('update', () => {
    it('should update a report when user is owner', async () => {
      const updateReportDto: UpdateReportDto = {
        title: 'Updated Report',
      };

      mockReportRepository.findById.mockResolvedValue(mockReport);
      mockReportRepository.update.mockResolvedValue({
        ...mockReport,
        title: 'Updated Report',
      });

      const result = await service.update(1, updateReportDto, 1);

      expect(result.title).toEqual('Updated Report');
      expect(mockReportRepository.update).toHaveBeenCalledWith(1, updateReportDto);
    });

    it('should throw UnauthorizedException when user is not owner', async () => {
      mockReportRepository.findById.mockResolvedValue(mockReport);

      await expect(service.update(1, {}, 999)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException when report is not found', async () => {
      mockReportRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, {}, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a report when user is owner', async () => {
      mockReportRepository.findById.mockResolvedValue(mockReport);
      mockReportRepository.remove.mockResolvedValue(true);

      await expect(service.remove(1, 1)).resolves.not.toThrow();
      expect(mockReportRepository.remove).toHaveBeenCalledWith(1);
    });

    it('should throw UnauthorizedException when user is not owner', async () => {
      mockReportRepository.findById.mockResolvedValue(mockReport);

      await expect(service.remove(1, 999)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updateStatus', () => {
    it('should update status when valid transition', async () => {
      mockReportRepository.findById.mockResolvedValue(mockReport);
      mockReportRepository.updateStatus.mockResolvedValue({
        ...mockReport,
        status: ReportStatus.IN_PROGRESS,
      });

      const result = await service.updateStatus(1, ReportStatus.IN_PROGRESS, 1);

      expect(result.status).toEqual(ReportStatus.IN_PROGRESS);
      expect(mockReportRepository.updateStatus).toHaveBeenCalledWith(1, ReportStatus.IN_PROGRESS);
    });

    it('should throw BadRequestException when invalid status transition', async () => {
      mockReportRepository.findById.mockResolvedValue({
        ...mockReport,
        status: ReportStatus.RESOLVED,
      });

      await expect(service.updateStatus(1, ReportStatus.IN_PROGRESS, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findNearby', () => {
    it('should find reports near a location', async () => {
      const searchDto = {
        latitude: 41.0082,
        longitude: 28.9784,
        radius: 1000,
      };

      const mockResult = {
        data: [mockReport],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockReportRepository.findNearby.mockResolvedValue(mockResult);

      const result = await service.findNearby(searchDto, { page: 1, limit: 10 });

      expect(result).toEqual(mockResult);
      expect(mockReportRepository.findNearby).toHaveBeenCalledWith(41.0082, 28.9784, 1000, {
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getReportsByUser', () => {
    it('should get all reports for a specific user', async () => {
      const mockResult = {
        data: [mockReport],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockReportRepository.findAll.mockResolvedValue(mockResult);

      const result = await service.getReportsByUser(1, { page: 1, limit: 10 });

      expect(result).toEqual(mockResult);
      expect(mockReportRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        userId: 1,
      });
    });
  });

  describe('changeDepartment', () => {
    it('should change a report department', async () => {
      const updatedReport = {
        ...mockReport,
        department: MunicipalityDepartment.ROADS,
        previousDepartment: MunicipalityDepartment.GENERAL,
      };

      // Her test başlangıcında mockları resetle
      jest.clearAllMocks();

      // Mock sırayı ayarla - önemli: mockResolvedValueOnce kullanımı
      mockReportRepository.findById
        // İlk çağrıda GENERAL departmanı olan raporu döndür
        .mockResolvedValueOnce({
          ...mockReport,
          department: MunicipalityDepartment.GENERAL,
        })
        // İkinci çağrıda güncellenmiş raporu döndür (findOne metodu tarafından çağrılıyor)
        .mockResolvedValueOnce(updatedReport);

      mockDepartmentService.forwardReport.mockResolvedValue(updatedReport);

      const result = await service.changeDepartment(
        1,
        MunicipalityDepartment.ROADS,
        'Bu bir yol sorunu',
      );

      expect(result.department).toEqual(MunicipalityDepartment.ROADS);
      expect(result.previousDepartment).toEqual(MunicipalityDepartment.GENERAL);
      expect(mockDepartmentService.forwardReport).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          newDepartment: MunicipalityDepartment.ROADS,
          reason: 'Bu bir yol sorunu',
          changedByDepartment: MunicipalityDepartment.GENERAL,
        }),
      );
    });

    it('should throw BadRequestException if reporting to same department', async () => {
      // Mevcut departmanı ROADS olarak ayarla (burada hata olmalı zaten)
      mockReportRepository.findById.mockResolvedValue({
        ...mockReport,
        department: MunicipalityDepartment.ROADS,
      });

      // Her çağrı öncesinde mockları temizle (reset)
      jest.clearAllMocks();

      await expect(
        service.changeDepartment(1, MunicipalityDepartment.ROADS, 'Zaten bu birimde'),
      ).rejects.toThrow(BadRequestException);

      expect(mockDepartmentService.forwardReport).not.toHaveBeenCalled();
    });
  });

  describe('getDepartmentHistory', () => {
    it('should get department history for a report', async () => {
      mockReportRepository.findById.mockResolvedValue(mockReport);
      mockDepartmentService.getReportDepartmentHistory.mockResolvedValue([mockDepartmentHistory]);

      const result = await service.getDepartmentHistory(1);

      expect(result).toEqual([mockDepartmentHistory]);
      expect(mockReportRepository.findById).toHaveBeenCalledWith(1);
      expect(mockDepartmentService.getReportDepartmentHistory).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when report does not exist', async () => {
      mockReportRepository.findById.mockResolvedValue(null);

      await expect(service.getDepartmentHistory(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('suggestDepartmentForReportType', () => {
    it('should suggest department for a report type', async () => {
      mockDepartmentService.suggestDepartmentForReport.mockResolvedValue(mockDepartment);

      const result = await service.suggestDepartmentForReportType(ReportType.POTHOLE);

      expect(result).toEqual(MunicipalityDepartment.ROADS);
      expect(mockDepartmentService.suggestDepartmentForReport).toHaveBeenCalledWith(
        ReportType.POTHOLE,
      );
    });
  });
});
