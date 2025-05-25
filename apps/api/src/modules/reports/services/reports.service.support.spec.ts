import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Report } from '../entities/report.entity';
import { ReportSupport } from '../entities/report-support.entity';
import { Assignment } from '../entities/assignment.entity';
import { ReportStatusHistory } from '../entities/report-status-history.entity';
import { DepartmentHistory } from '../entities/department-history.entity';
import { Team } from '../../teams/entities/team.entity';
import { ReportRepository } from '../repositories/report.repository';
import { LocationService } from './location.service';
import { DepartmentService } from './department.service';
import { UsersService } from '../../users/services/users.service';
import { AbilityFactory, Action } from '../../../core/authorization/ability.factory';
import { ReportStatus, UserRole } from '@KentNabiz/shared';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

describe('ReportsService - supportReport', () => {
  let service: ReportsService;
  let reportRepository: jest.Mocked<ReportRepository>;
  let reportSupportRepository: jest.Mocked<Repository<ReportSupport>>;
  let dataSource: jest.Mocked<DataSource>;
  let abilityFactory: jest.Mocked<AbilityFactory>;

  const mockReport: Report = {
    id: 1,
    title: 'Test Report',
    description: 'Test Description',
    userId: 2, // Farklı kullanıcı
    status: ReportStatus.OPEN,
    supportCount: 5,
    currentDepartmentId: 1,
  } as Report;

  const mockCitizenUser: JwtPayload = {
    sub: 1,
    email: 'citizen@test.com',
    roles: [UserRole.CITIZEN],
    departmentId: null,
  };

  const mockReportOwnerUser: JwtPayload = {
    sub: 2,
    email: 'owner@test.com',
    roles: [UserRole.CITIZEN],
    departmentId: null,
  };

  beforeEach(async () => {
    const mockReportRepository = {
      findById: jest.fn(),
    };

    const mockReportSupportRepository = {
      findOne: jest.fn(),
    };

    const mockDataSource = {
      transaction: jest.fn(),
    };

    const mockAbilityFactory = {
      defineAbility: jest.fn(),
    };

    const mockAbility = {
      can: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: ReportRepository,
          useValue: mockReportRepository,
        },
        {
          provide: getRepositoryToken(ReportSupport),
          useValue: mockReportSupportRepository,
        },
        {
          provide: getRepositoryToken(Assignment),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ReportStatusHistory),
          useValue: {},
        },
        {
          provide: getRepositoryToken(DepartmentHistory),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Team),
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: LocationService,
          useValue: {},
        },
        {
          provide: DepartmentService,
          useValue: {},
        },
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: AbilityFactory,
          useValue: mockAbilityFactory,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    reportRepository = module.get(ReportRepository);
    reportSupportRepository = module.get(getRepositoryToken(ReportSupport));
    dataSource = module.get(DataSource);
    abilityFactory = module.get(AbilityFactory);

    // Setup default mocks
    reportRepository.findById.mockResolvedValue(mockReport);
    abilityFactory.defineAbility.mockReturnValue(mockAbility as any);
    mockAbility.can.mockReturnValue(true);
    reportSupportRepository.findOne.mockResolvedValue(null);

    // Mock transaction - basit yaklaşım
    dataSource.transaction.mockImplementation((callback: any) => {
      const mockManager = {
        create: jest.fn().mockReturnValue({
          reportId: mockReport.id,
          userId: mockCitizenUser.sub,
        }),
        save: jest.fn(),
        increment: jest.fn(),
      };
      return callback(mockManager) as Promise<Report>;
    });
  });

  describe('supportReport', () => {
    it('should successfully support a report', async () => {
      // Act
      const result = await service.supportReport(mockReport.id, mockCitizenUser);

      // Assert
      expect(reportRepository.findById).toHaveBeenCalledWith(mockReport.id);
      expect(abilityFactory.defineAbility).toHaveBeenCalled();
      expect(reportSupportRepository.findOne).toHaveBeenCalledWith({
        where: {
          reportId: mockReport.id,
          userId: mockCitizenUser.sub,
        },
      });
      expect(dataSource.transaction).toHaveBeenCalled();
      expect(result.supportCount).toBe(6); // 5 + 1
    });

    it('should throw NotFoundException when report does not exist', async () => {
      // Arrange
      reportRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.supportReport(999, mockCitizenUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user cannot support report (ABAC)', async () => {
      // Arrange
      const mockAbility = { can: jest.fn().mockReturnValue(false) };
      abilityFactory.defineAbility.mockReturnValue(mockAbility as any);

      // Act & Assert
      await expect(service.supportReport(mockReport.id, mockCitizenUser)).rejects.toThrow(
        ForbiddenException
      );
      expect(mockAbility.can).toHaveBeenCalledWith(Action.Support, mockReport);
    });

    it('should throw ForbiddenException when user tries to support own report', async () => {
      // Act & Assert
      await expect(service.supportReport(mockReport.id, mockReportOwnerUser)).rejects.toThrow(
        ForbiddenException
      );
      expect(reportSupportRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when user already supported the report', async () => {
      // Arrange
      const existingSupport = {
        id: 1,
        reportId: mockReport.id,
        userId: mockCitizenUser.sub,
      } as ReportSupport;
      reportSupportRepository.findOne.mockResolvedValue(existingSupport);

      // Act & Assert
      await expect(service.supportReport(mockReport.id, mockCitizenUser)).rejects.toThrow(
        ConflictException
      );
    });
  });
});
