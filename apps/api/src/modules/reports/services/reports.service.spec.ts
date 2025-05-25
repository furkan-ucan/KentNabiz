import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportRepository } from '../repositories/report.repository';
import { LocationService } from './location.service';
import { DepartmentService } from './department.service';
import { UsersService } from '../../users/services/users.service';
import { AbilityFactory } from '../../../core/authorization/ability.factory';
import { Report } from '../entities/report.entity';
import { Assignment } from '../entities/assignment.entity';
import { ReportStatusHistory } from '../entities/report-status-history.entity';
import { DepartmentHistory } from '../entities/department-history.entity';
import { Team } from '../../teams/entities/team.entity';
import { ReportSupport } from '../entities/report-support.entity';
import { Department } from '../entities/department.entity';
import { User } from '../../users/entities/user.entity';
import {
  ReportStatus,
  ReportType,
  UserRole,
  MunicipalityDepartment,
  TeamStatus,
  AssignmentStatus,
  AssigneeType,
} from '@KentNabiz/shared';
import { JwtPayload as AuthUser } from '../../auth/interfaces/jwt-payload.interface';
import { SUB_STATUS } from '../constants/report.constants';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportStatusDto } from '../dto/update-report-status.dto';
import { ForwardReportDto } from '../dto/forward-report.dto';
import { canTransition } from '../utils/report-status.utils';

// Mock the canTransition utility function
jest.mock('../utils/report-status.utils', () => ({
  canTransition: jest.fn(),
}));

describe('ReportsService - Core Methods', () => {
  let service: ReportsService;
  let reportRepository: jest.Mocked<ReportRepository>;
  let locationService: jest.Mocked<LocationService>;
  let departmentService: jest.Mocked<DepartmentService>;
  let usersService: jest.Mocked<UsersService>;
  let abilityFactory: jest.Mocked<AbilityFactory>;
  let queryRunner: any;
  let entityManager: any;
  let mockCanTransition: jest.MockedFunction<typeof canTransition>;

  // Mock users
  const supervisorUser: AuthUser = {
    sub: 1,
    email: 'supervisor@test.com',
    roles: [UserRole.DEPARTMENT_SUPERVISOR],
    departmentId: 1,
    iat: Date.now(),
    exp: Date.now() + 3600,
  };

  const teamMemberUser: AuthUser = {
    sub: 2,
    email: 'teammember@test.com',
    roles: [UserRole.TEAM_MEMBER],
    departmentId: 1,
    iat: Date.now(),
    exp: Date.now() + 3600,
  };

  const citizenUser: AuthUser = {
    sub: 3,
    email: 'citizen@test.com',
    roles: [UserRole.CITIZEN],
    departmentId: null,
    iat: Date.now(),
    exp: Date.now() + 3600,
  };

  // Mock entities
  const mockReport: Report = {
    id: 1,
    title: 'Test Report',
    description: 'Test description',
    status: ReportStatus.OPEN,
    subStatus: SUB_STATUS.NONE,
    userId: 3,
    currentDepartmentId: 1,
    supportCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Report;

  const mockTeam: Team = {
    id: 1,
    name: 'Test Team',
    departmentId: 1,
    status: TeamStatus.AVAILABLE,
    department: { id: 1, name: 'Test Department' } as Department,
  } as Team;

  const mockUser: User = {
    id: 2,
    email: 'teammember@test.com',
    roles: [UserRole.TEAM_MEMBER],
    departmentId: 1,
    hashPassword: jest.fn(),
    validatePassword: jest.fn(),
  } as any;

  beforeEach(async () => {
    // Create mocks
    const mockReportRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
    };

    const mockLocationService = {
      createPointFromDto: jest.fn(),
    };

    const mockDepartmentService = {
      findById: jest.fn(),
      findByCode: jest.fn(),
      suggestDepartmentForReport: jest.fn(),
    };

    const mockUsersService = {
      findById: jest.fn(),
      findEmployeeInDepartment: jest.fn(),
    };

    const mockAssignmentRepository = {
      update: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    const mockReportStatusHistoryRepository = {
      save: jest.fn(),
      create: jest.fn(),
    };

    const mockDepartmentHistoryRepository = {
      save: jest.fn(),
      create: jest.fn(),
    };

    const mockTeamRepository = {
      findOne: jest.fn(),
    };

    const mockReportSupportRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    const mockEntityManager = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      increment: jest.fn(),
    };

    const mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: mockEntityManager,
    };

    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
      transaction: jest.fn().mockImplementation((callback: (manager: any) => Promise<any>) => {
        return callback(mockEntityManager);
      }),
    };

    const mockAbility = {
      can: jest.fn(),
      throwUnlessCan: jest.fn(),
    };

    const mockAbilityFactory = {
      defineAbility: jest.fn().mockReturnValue(mockAbility),
    };

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
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: getRepositoryToken(Assignment),
          useValue: mockAssignmentRepository,
        },
        {
          provide: getRepositoryToken(ReportStatusHistory),
          useValue: mockReportStatusHistoryRepository,
        },
        {
          provide: getRepositoryToken(DepartmentHistory),
          useValue: mockDepartmentHistoryRepository,
        },
        {
          provide: getRepositoryToken(Team),
          useValue: mockTeamRepository,
        },
        {
          provide: getRepositoryToken(ReportSupport),
          useValue: mockReportSupportRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: AbilityFactory,
          useValue: mockAbilityFactory,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    reportRepository = module.get(ReportRepository);
    locationService = module.get(LocationService);
    departmentService = module.get(DepartmentService);
    usersService = module.get(UsersService);
    abilityFactory = module.get(AbilityFactory);
    queryRunner = mockQueryRunner;
    entityManager = mockEntityManager;
    mockCanTransition = canTransition as jest.MockedFunction<typeof canTransition>;

    // Setup default mocks
    reportRepository.findById.mockResolvedValue(mockReport);
    abilityFactory.defineAbility.mockReturnValue({
      can: jest.fn().mockReturnValue(true),
      throwUnlessCan: jest.fn(),
    } as any);

    // Setup canTransition mock to return true by default
    mockCanTransition.mockReturnValue(true);
  });

  describe('assignReportToTeam', () => {
    beforeEach(() => {
      // Ensure team has correct status
      const availableTeam = { ...mockTeam, status: TeamStatus.AVAILABLE };
      entityManager.findOne.mockResolvedValue(availableTeam);
      entityManager.save.mockResolvedValue(mockReport);
      entityManager.create.mockReturnValue({} as any);
      entityManager.update.mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(service, 'findOne').mockResolvedValue(mockReport);
    });

    it('should successfully assign report to team', async () => {
      const result = await service.assignReportToTeam(1, 1, supervisorUser);

      expect(reportRepository.findById).toHaveBeenCalledWith(1);
      expect(abilityFactory.defineAbility).toHaveBeenCalled();
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(entityManager.findOne).toHaveBeenCalledWith(Team, {
        where: { id: 1 },
        relations: ['department'],
      });
      expect(entityManager.update).toHaveBeenCalledWith(
        Assignment,
        { reportId: 1, status: AssignmentStatus.ACTIVE },
        { status: AssignmentStatus.CANCELLED, completedAt: expect.any(Date) }
      );
      expect(entityManager.create).toHaveBeenCalledWith(Assignment, {
        reportId: 1,
        assigneeType: AssigneeType.TEAM,
        assigneeTeamId: 1,
        assignedById: supervisorUser.sub,
        status: AssignmentStatus.ACTIVE,
        assignedAt: expect.any(Date),
      });
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual(mockReport);
    });

    it('should throw NotFoundException when report not found', async () => {
      reportRepository.findById.mockResolvedValue(null);

      await expect(service.assignReportToTeam(999, 1, supervisorUser)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw ForbiddenException when user lacks permission', async () => {
      const mockAbility = { can: jest.fn().mockReturnValue(false) };
      abilityFactory.defineAbility.mockReturnValue(mockAbility as any);

      await expect(service.assignReportToTeam(1, 1, citizenUser)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should throw NotFoundException when team not found', async () => {
      entityManager.findOne.mockResolvedValue(null);

      await expect(service.assignReportToTeam(1, 999, supervisorUser)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException when team is not available', async () => {
      const unavailableTeam = { ...mockTeam, status: TeamStatus.INACTIVE };
      entityManager.findOne.mockResolvedValue(unavailableTeam);

      await expect(service.assignReportToTeam(1, 1, supervisorUser)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException when team department mismatch', async () => {
      const differentDeptTeam = { ...mockTeam, departmentId: 2 };
      entityManager.findOne.mockResolvedValue(differentDeptTeam);

      await expect(service.assignReportToTeam(1, 1, supervisorUser)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should update report status from OPEN to IN_REVIEW', async () => {
      const openReport = { ...mockReport, status: ReportStatus.OPEN };
      reportRepository.findById.mockResolvedValue(openReport);

      await service.assignReportToTeam(1, 1, supervisorUser);

      expect(entityManager.save).toHaveBeenCalledWith(Report, {
        ...openReport,
        status: ReportStatus.IN_REVIEW,
        subStatus: SUB_STATUS.NONE,
      });
    });

    it('should update report status from IN_REVIEW to IN_PROGRESS', async () => {
      const inReviewReport = { ...mockReport, status: ReportStatus.IN_REVIEW };
      reportRepository.findById.mockResolvedValue(inReviewReport);

      await service.assignReportToTeam(1, 1, supervisorUser);

      expect(entityManager.save).toHaveBeenCalledWith(Report, {
        ...inReviewReport,
        status: ReportStatus.IN_PROGRESS,
        subStatus: SUB_STATUS.NONE,
      });
    });

    it('should create status history record', async () => {
      // Use a report with OPEN status to test OPEN → IN_REVIEW transition
      const openReport = { ...mockReport, status: ReportStatus.OPEN };
      reportRepository.findById.mockResolvedValue(openReport);

      // Ensure we return the correct team with AVAILABLE status
      const availableTeam = { ...mockTeam, status: TeamStatus.AVAILABLE };
      entityManager.findOne.mockResolvedValueOnce(availableTeam);

      await service.assignReportToTeam(1, 1, supervisorUser);

      // Check that create was called for both Assignment and ReportStatusHistory
      expect(entityManager.create).toHaveBeenCalledTimes(2);

      // Check Assignment creation (first call)
      expect(entityManager.create).toHaveBeenNthCalledWith(1, Assignment, {
        reportId: 1,
        assigneeType: AssigneeType.TEAM,
        assigneeTeamId: 1,
        assignedById: supervisorUser.sub,
        status: AssignmentStatus.ACTIVE,
        assignedAt: expect.any(Date),
      });

      // Check ReportStatusHistory creation (second call) - OPEN → IN_REVIEW
      expect(entityManager.create).toHaveBeenNthCalledWith(2, ReportStatusHistory, {
        reportId: 1,
        previousStatus: ReportStatus.OPEN,
        newStatus: ReportStatus.IN_REVIEW,
        previousSubStatus: SUB_STATUS.NONE,
        newSubStatus: SUB_STATUS.NONE,
        changedByUserId: supervisorUser.sub,
        changedAt: expect.any(Date),
        notes: `Assigned to team: ${mockTeam.name}`,
      });
    });

    it('should rollback transaction on error', async () => {
      entityManager.save.mockRejectedValue(new Error('Database error'));

      await expect(service.assignReportToTeam(1, 1, supervisorUser)).rejects.toThrow(
        'Database error'
      );
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe('assignReportToUser', () => {
    beforeEach(() => {
      jest.spyOn(service as any, 'canUserPerformActionOnReport').mockReturnValue(true);
      entityManager.findOne.mockResolvedValue(mockReport);
      usersService.findById.mockResolvedValue(mockUser);
      entityManager.save.mockResolvedValue(mockReport);
      entityManager.create.mockReturnValue({} as any);
      entityManager.update.mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(service, 'findOne').mockResolvedValue(mockReport);
    });

    it('should successfully assign report to user', async () => {
      const result = await service.assignReportToUser(1, 2, supervisorUser);

      expect(entityManager.findOne).toHaveBeenCalledWith(Report, {
        where: { id: 1 },
        relations: ['currentDepartment', 'assignments'],
      });
      expect(usersService.findById).toHaveBeenCalledWith(2);
      expect(entityManager.create).toHaveBeenCalledWith(Assignment, {
        reportId: 1,
        assigneeType: AssigneeType.USER,
        assigneeUserId: 2,
        assignedById: supervisorUser.sub,
        status: AssignmentStatus.ACTIVE,
        assignedAt: expect.any(Date),
      });
      expect(result).toEqual(mockReport);
    });

    it('should throw UnauthorizedException when user lacks permission', async () => {
      jest.spyOn(service as any, 'canUserPerformActionOnReport').mockReturnValue(false);

      await expect(service.assignReportToUser(1, 2, citizenUser)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw NotFoundException when report not found', async () => {
      entityManager.findOne.mockResolvedValue(null);

      await expect(service.assignReportToUser(999, 2, supervisorUser)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.assignReportToUser(1, 999, supervisorUser)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException when user has wrong role', async () => {
      const wrongRoleUser = { ...mockUser, roles: [UserRole.CITIZEN] } as any;
      usersService.findById.mockResolvedValue(wrongRoleUser);

      await expect(service.assignReportToUser(1, 2, supervisorUser)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException when user department mismatch', async () => {
      const differentDeptUser = { ...mockUser, departmentId: 2 } as any;
      usersService.findById.mockResolvedValue(differentDeptUser);

      await expect(service.assignReportToUser(1, 2, supervisorUser)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should create status history record with user email', async () => {
      // Use a report with OPEN status to test OPEN → IN_REVIEW transition
      const openReport = { ...mockReport, status: ReportStatus.OPEN };
      reportRepository.findById.mockResolvedValue(openReport);
      entityManager.findOne.mockResolvedValue(openReport);

      await service.assignReportToUser(1, 2, supervisorUser);

      // Check that create was called for both Assignment and ReportStatusHistory
      expect(entityManager.create).toHaveBeenCalledTimes(2);

      // Check Assignment creation (first call)
      expect(entityManager.create).toHaveBeenNthCalledWith(1, Assignment, {
        reportId: 1,
        assigneeType: AssigneeType.USER,
        assigneeUserId: 2,
        assignedById: supervisorUser.sub,
        status: AssignmentStatus.ACTIVE,
        assignedAt: expect.any(Date),
      });

      // Check ReportStatusHistory creation (second call) - OPEN → IN_REVIEW
      expect(entityManager.create).toHaveBeenNthCalledWith(2, ReportStatusHistory, {
        reportId: 1,
        previousStatus: ReportStatus.OPEN,
        newStatus: ReportStatus.IN_REVIEW,
        previousSubStatus: SUB_STATUS.NONE,
        newSubStatus: SUB_STATUS.NONE,
        changedByUserId: supervisorUser.sub,
        changedAt: expect.any(Date),
        notes: `Assigned to user: ${mockUser.email}`,
      });
    });
  });

  describe('updateStatus', () => {
    const updateStatusDto: UpdateReportStatusDto = {
      newStatus: ReportStatus.IN_PROGRESS,
    };

    beforeEach(() => {
      jest.spyOn(service as any, 'canUserPerformActionOnReport').mockReturnValue(true);
      entityManager.findOne.mockResolvedValue(mockReport);
      entityManager.save.mockResolvedValue(mockReport);
      entityManager.create.mockReturnValue({} as any);
      jest.spyOn(service, 'findOne').mockResolvedValue(mockReport);

      // Reset and setup canTransition mock for each test
      mockCanTransition.mockReset();
      mockCanTransition.mockReturnValue(true);
    });

    it('should successfully update report status', async () => {
      // Use a report with OPEN status for this test
      const openReport = { ...mockReport, status: ReportStatus.OPEN };
      reportRepository.findById.mockResolvedValue(openReport);
      entityManager.findOne.mockResolvedValue(openReport);

      const result = await service.updateStatus(1, updateStatusDto, supervisorUser);

      expect(reportRepository.findById).toHaveBeenCalledWith(1);
      expect(abilityFactory.defineAbility).toHaveBeenCalled();
      expect(entityManager.findOne).toHaveBeenCalledWith(Report, {
        where: { id: 1 },
        relations: ['currentDepartment'],
        lock: { mode: 'pessimistic_write' },
      });
      expect(mockCanTransition).toHaveBeenCalledWith(
        supervisorUser.roles,
        ReportStatus.OPEN,
        ReportStatus.IN_PROGRESS
      );
      expect(result).toEqual(mockReport);
    });

    it('should throw ForbiddenException when user lacks permission for cancel', async () => {
      const mockAbility = { can: jest.fn().mockReturnValue(false) };
      abilityFactory.defineAbility.mockReturnValue(mockAbility as any);

      const cancelDto = { newStatus: ReportStatus.CANCELLED };

      await expect(service.updateStatus(1, cancelDto, citizenUser)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should handle team member completing work (sets PENDING_APPROVAL)', async () => {
      const inProgressReport = { ...mockReport, status: ReportStatus.IN_PROGRESS };
      reportRepository.findById.mockResolvedValue(inProgressReport);
      entityManager.findOne.mockResolvedValue(inProgressReport);

      const completeDto = {
        newStatus: ReportStatus.DONE,
        resolutionNotes: 'Work completed',
      };

      await service.updateStatus(1, completeDto, teamMemberUser);

      expect(entityManager.save).toHaveBeenCalledWith(Report, {
        ...inProgressReport,
        status: ReportStatus.IN_PROGRESS, // Status stays same
        subStatus: SUB_STATUS.PENDING_APPROVAL, // SubStatus changes
        resolutionNotes: 'Work completed',
      });
    });

    it('should handle supervisor approving work', async () => {
      const pendingReport = {
        ...mockReport,
        status: ReportStatus.IN_PROGRESS,
        subStatus: SUB_STATUS.PENDING_APPROVAL,
      };
      reportRepository.findById.mockResolvedValue(pendingReport);
      entityManager.findOne.mockResolvedValue(pendingReport);

      const approveDto = {
        newStatus: ReportStatus.DONE,
        resolutionNotes: 'Approved',
      };

      await service.updateStatus(1, approveDto, supervisorUser);

      expect(entityManager.save).toHaveBeenCalledWith(Report, {
        ...pendingReport,
        status: ReportStatus.DONE,
        subStatus: SUB_STATUS.NONE,
        resolvedAt: expect.any(Date),
        closedByUserId: supervisorUser.sub,
        resolutionNotes: 'Approved',
      });
    });

    it('should handle supervisor rejecting work', async () => {
      const pendingReport = {
        ...mockReport,
        status: ReportStatus.IN_PROGRESS,
        subStatus: SUB_STATUS.PENDING_APPROVAL,
      };
      reportRepository.findById.mockResolvedValue(pendingReport);
      entityManager.findOne.mockResolvedValue(pendingReport);

      const rejectDto = {
        newStatus: ReportStatus.REJECTED,
        rejectionReason: 'Not satisfactory',
      };

      await service.updateStatus(1, rejectDto, supervisorUser);

      expect(entityManager.save).toHaveBeenCalledWith(Report, {
        ...pendingReport,
        status: ReportStatus.REJECTED,
        subStatus: SUB_STATUS.NONE,
        rejectionReason: 'Not satisfactory',
        closedByUserId: supervisorUser.sub,
      });
    });

    it('should throw BadRequestException when rejecting without reason', async () => {
      const rejectDto = { newStatus: ReportStatus.REJECTED };

      await expect(service.updateStatus(1, rejectDto, supervisorUser)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should handle cancellation', async () => {
      const openReport = { ...mockReport, status: ReportStatus.OPEN };
      reportRepository.findById.mockResolvedValue(openReport);
      entityManager.findOne.mockResolvedValue(openReport);

      const cancelDto = { newStatus: ReportStatus.CANCELLED };

      await service.updateStatus(1, cancelDto, citizenUser);

      expect(entityManager.save).toHaveBeenCalledWith(Report, {
        ...openReport,
        status: ReportStatus.CANCELLED,
        subStatus: SUB_STATUS.NONE,
        closedByUserId: citizenUser.sub,
      });
    });

    it('should create status history record', async () => {
      // Use a report with OPEN status for this test
      const openReport = { ...mockReport, status: ReportStatus.OPEN };
      reportRepository.findById.mockResolvedValue(openReport);
      entityManager.findOne.mockResolvedValue(openReport);

      await service.updateStatus(1, updateStatusDto, supervisorUser);

      expect(entityManager.create).toHaveBeenCalledWith(ReportStatusHistory, {
        reportId: 1,
        previousStatus: ReportStatus.OPEN,
        newStatus: ReportStatus.IN_PROGRESS,
        previousSubStatus: SUB_STATUS.NONE,
        newSubStatus: SUB_STATUS.NONE,
        changedByUserId: supervisorUser.sub,
        changedAt: expect.any(Date),
        notes: `Status changed from ${ReportStatus.OPEN} to ${ReportStatus.IN_PROGRESS}`,
      });
    });
  });

  describe('forwardReport', () => {
    const forwardDto: ForwardReportDto = {
      newDepartment: MunicipalityDepartment.ENVIRONMENTAL,
      reason: 'Environmental issue',
    };

    beforeEach(() => {
      jest.spyOn(service as any, 'canUserPerformActionOnReport').mockReturnValue(true);
      entityManager.findOne.mockResolvedValue(mockReport);
      // Reset department service mock for each test
      departmentService.findByCode.mockReset();
      entityManager.save.mockResolvedValue(mockReport);
      entityManager.create.mockReturnValue({} as any);
      entityManager.update.mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(service, 'findOne').mockResolvedValue(mockReport);
    });

    it('should successfully forward report', async () => {
      // Ensure different department for successful forwarding
      departmentService.findByCode.mockResolvedValue({
        id: 2,
        name: 'Environment Department',
      } as Department);

      const result = await service.forwardReport(1, forwardDto, supervisorUser);

      expect(entityManager.findOne).toHaveBeenCalledWith(Report, {
        where: { id: 1 },
        relations: ['currentDepartment'],
      });
      expect(departmentService.findByCode).toHaveBeenCalledWith(
        MunicipalityDepartment.ENVIRONMENTAL
      );
      expect(entityManager.save).toHaveBeenCalledWith(Report, {
        ...mockReport,
        currentDepartmentId: 2,
        subStatus: SUB_STATUS.FORWARDED,
      });
      expect(result).toEqual(mockReport);
    });

    it('should throw NotFoundException when report not found', async () => {
      entityManager.findOne.mockResolvedValue(null);

      await expect(service.forwardReport(999, forwardDto, supervisorUser)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw UnauthorizedException when user lacks permission', async () => {
      jest.spyOn(service as any, 'canUserPerformActionOnReport').mockReturnValue(false);

      await expect(service.forwardReport(1, forwardDto, citizenUser)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw NotFoundException when department not found', async () => {
      departmentService.findByCode.mockResolvedValue(null as any);

      await expect(service.forwardReport(1, forwardDto, supervisorUser)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException when forwarding to same department', async () => {
      departmentService.findByCode.mockReset();
      departmentService.findByCode.mockResolvedValue({
        id: 1,
        name: 'Current Department',
      } as Department);

      // Her test için temiz bir mockReport
      const report = {
        ...mockReport,
        status: ReportStatus.OPEN,
        subStatus: SUB_STATUS.NONE,
        currentDepartmentId: 1,
      };
      entityManager.findOne.mockResolvedValue(report);
      reportRepository.findById.mockResolvedValue(report);

      await expect(service.forwardReport(1, forwardDto, supervisorUser)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException when reason is empty', async () => {
      // Mock department to avoid NotFoundException
      departmentService.findByCode.mockResolvedValue({
        id: 2,
        name: 'Environment Department',
      } as Department);

      const invalidDto = { ...forwardDto, reason: '' };

      await expect(service.forwardReport(1, invalidDto, supervisorUser)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should create department history record', async () => {
      departmentService.findByCode.mockReset();
      departmentService.findByCode.mockResolvedValue({
        id: 2,
        name: 'Environment Department',
      } as Department);

      // Temiz mockReport (currentDepartmentId: 1)
      const report = {
        ...mockReport,
        status: ReportStatus.OPEN,
        subStatus: SUB_STATUS.NONE,
        currentDepartmentId: 1,
      };
      entityManager.findOne.mockReset();
      reportRepository.findById.mockReset();
      entityManager.findOne.mockResolvedValue(report);
      reportRepository.findById.mockResolvedValue(report);

      await service.forwardReport(1, forwardDto, supervisorUser);

      expect(entityManager.create).toHaveBeenCalledWith(DepartmentHistory, {
        reportId: 1,
        previousDepartmentId: 1,
        newDepartmentId: 2,
        reason: 'Environmental issue',
        changedByUserId: supervisorUser.sub,
        changedAt: expect.any(Date),
      });
    });

    it('should create status history record for forwarding', async () => {
      departmentService.findByCode.mockReset();
      departmentService.findByCode.mockResolvedValue({
        id: 2,
        name: 'Environment Department',
      } as Department);

      // Temiz mockReport
      const report = {
        ...mockReport,
        status: ReportStatus.OPEN,
        subStatus: SUB_STATUS.NONE,
        currentDepartmentId: 1,
      };
      entityManager.findOne.mockResolvedValue(report);
      reportRepository.findById.mockResolvedValue(report);

      await service.forwardReport(1, forwardDto, supervisorUser);

      expect(entityManager.create).toHaveBeenCalledWith(ReportStatusHistory, {
        reportId: 1,
        previousStatus: ReportStatus.OPEN,
        newStatus: ReportStatus.OPEN, // Status doesn't change
        previousSubStatus: SUB_STATUS.NONE,
        newSubStatus: SUB_STATUS.FORWARDED,
        changedByUserId: supervisorUser.sub,
        changedAt: expect.any(Date),
        notes: 'Report forwarded to Environment Department department. Reason: Environmental issue',
      });
    });

    it('should cancel active assignments when forwarding', async () => {
      departmentService.findByCode.mockReset();
      departmentService.findByCode.mockResolvedValue({
        id: 2,
        name: 'Environment Department',
      } as Department);

      // Temiz mockReport
      const report = {
        ...mockReport,
        status: ReportStatus.OPEN,
        subStatus: SUB_STATUS.NONE,
        currentDepartmentId: 1,
      };
      entityManager.findOne.mockResolvedValue(report);
      reportRepository.findById.mockResolvedValue(report);

      await service.forwardReport(1, forwardDto, supervisorUser);

      expect(entityManager.update).toHaveBeenCalledWith(
        Assignment,
        { reportId: 1, status: AssignmentStatus.ACTIVE },
        { status: AssignmentStatus.CANCELLED, completedAt: expect.any(Date) }
      );
    });
  });

  describe('create', () => {
    const createDto: CreateReportDto = {
      title: 'New Report',
      description: 'New report description',
      location: { latitude: 40.7128, longitude: -74.006 },
      address: '123 Test St',
      reportType: ReportType.POTHOLE,
      categoryId: 1,
    };

    beforeEach(() => {
      locationService.createPointFromDto.mockReturnValue({
        type: 'Point',
        coordinates: [-74.006, 40.7128],
      } as any);
      departmentService.suggestDepartmentForReport.mockResolvedValue({ id: 1 } as Department);
      reportRepository.create.mockResolvedValue(mockReport);
      entityManager.save.mockResolvedValue(mockReport);
      entityManager.create.mockReturnValue({} as any);
    });

    it('should successfully create report', async () => {
      const result = await service.create(createDto, citizenUser);

      expect(locationService.createPointFromDto).toHaveBeenCalledWith(createDto.location);
      expect(departmentService.suggestDepartmentForReport).toHaveBeenCalledWith(ReportType.POTHOLE);
      expect(reportRepository.create).toHaveBeenCalledWith(
        {
          title: 'New Report',
          description: 'New report description',
          location: { type: 'Point', coordinates: [-74.006, 40.7128] },
          address: '123 Test St',
          reportType: ReportType.POTHOLE,
          status: ReportStatus.OPEN,
          categoryId: 1,
          currentDepartmentId: 1,
          reportMedias: undefined,
        },
        citizenUser.sub
      );
      expect(result).toEqual(mockReport);
    });

    it('should use specified department when provided', async () => {
      const dtoWithDept = { ...createDto, departmentCode: MunicipalityDepartment.ENVIRONMENTAL };
      departmentService.findByCode.mockResolvedValue({ id: 2 } as Department);

      await service.create(dtoWithDept, citizenUser);

      expect(departmentService.findByCode).toHaveBeenCalledWith(
        MunicipalityDepartment.ENVIRONMENTAL
      );
      expect(reportRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          currentDepartmentId: 2,
        }),
        citizenUser.sub
      );
    });

    it('should use general department when no type or department specified', async () => {
      const dtoWithoutType = { ...createDto } as any;
      delete dtoWithoutType.reportType;
      departmentService.findByCode.mockResolvedValue({ id: 3 } as Department);

      await service.create(dtoWithoutType, citizenUser);

      expect(departmentService.findByCode).toHaveBeenCalledWith(MunicipalityDepartment.GENERAL);
      expect(reportRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          currentDepartmentId: 3,
        }),
        citizenUser.sub
      );
    });

    it('should set initial status and subStatus', async () => {
      await service.create(createDto, citizenUser);

      expect(entityManager.save).toHaveBeenCalledWith(Report, {
        ...mockReport,
        subStatus: SUB_STATUS.NONE,
      });
    });

    it('should create initial status history record', async () => {
      await service.create(createDto, citizenUser);

      expect(entityManager.create).toHaveBeenCalledWith(ReportStatusHistory, {
        reportId: mockReport.id,
        previousStatus: null,
        newStatus: ReportStatus.OPEN,
        previousSubStatus: null,
        newSubStatus: SUB_STATUS.NONE,
        changedByUserId: citizenUser.sub,
        changedAt: expect.any(Date),
        notes: 'Report created',
      });
    });

    it('should handle report medias when provided', async () => {
      const dtoWithMedia = {
        ...createDto,
        reportMedias: [{ url: 'test.jpg', type: 'image' }],
      };

      await service.create(dtoWithMedia, citizenUser);

      expect(reportRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          reportMedias: [{ url: 'test.jpg', type: 'image' }],
        }),
        citizenUser.sub
      );
    });

    it('should rollback transaction on error', async () => {
      reportRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto, citizenUser)).rejects.toThrow('Database error');
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });
});
