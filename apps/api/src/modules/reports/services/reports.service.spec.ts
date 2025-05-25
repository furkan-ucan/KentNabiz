import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Report } from '../entities/report.entity';
import { Assignment } from '../entities/assignment.entity';
import { ReportStatusHistory } from '../entities/report-status-history.entity';
import { DepartmentHistory } from '../entities/department-history.entity';
import { Team } from '../../teams/entities/team.entity';
import { User } from '../../users/entities/user.entity';
import { ReportRepository } from '../repositories/report.repository';
import { LocationService } from './location.service';
import { DepartmentService } from './department.service';
import { UsersService } from '../../users/services/users.service';
import {
  ReportStatus,
  ReportType,
  UserRole,
  MunicipalityDepartment,
  TeamStatus,
  AssignmentStatus,
  AssigneeType,
} from '@KentNabiz/shared';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportStatusDto } from '../dto/update-report-status.dto';
import { ForwardReportDto } from '../dto/forward-report.dto';

// Mock canTransition utility
import { canTransition as mockCanTransition } from '../utils/report-status.utils';
jest.mock('../utils/report-status.utils', () => ({
  canTransition: jest.fn(),
}));

describe('ReportsService', () => {
  let service: ReportsService;
  let reportRepository: ReportRepository;
  let assignmentRepository: Repository<Assignment>;
  let teamRepository: Repository<Team>;
  let locationService: LocationService;
  let departmentService: DepartmentService;
  let usersService: UsersService;
  // Remove unused: reportStatusHistoryRepository, departmentHistoryRepository, dataSource

  // Mock AuthUser fixtures
  // Remove unused: mockSystemAdmin
  const mockDepartmentSupervisor: JwtPayload = {
    sub: 2,
    email: 'supervisor@test.com',
    roles: [UserRole.DEPARTMENT_SUPERVISOR],
    departmentId: 1,
  };

  const mockTeamMember: JwtPayload = {
    sub: 3,
    email: 'member@test.com',
    roles: [UserRole.TEAM_MEMBER],
    departmentId: 1,
  };

  const mockCitizen: JwtPayload = {
    sub: 4,
    email: 'citizen@test.com',
    roles: [UserRole.CITIZEN],
  };

  // Mock entities
  const mockReport: Report = {
    id: 1,
    title: 'Test Report',
    description: 'Test description',
    status: ReportStatus.OPEN,
    subStatus: null,
    reportType: ReportType.POTHOLE,
    location: { type: 'Point', coordinates: [29.0, 41.0] },
    address: 'Test Address',
    currentDepartmentId: 1,
    userId: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
    assignments: [],
    statusHistory: [],
    departmentHistory: [],
    reportMedias: [],
    user: {} as User,
    currentDepartment: {} as any,
  };

  const mockTeam: Team = {
    id: 1,
    name: 'Test Team',
    departmentId: 1,
    teamLeaderId: 2,
    status: TeamStatus.AVAILABLE,
    baseLocation: { type: 'Point', coordinates: [29.0, 41.0] },
    currentLocation: { type: 'Point', coordinates: [29.0, 41.0] },
    lastLocationUpdate: new Date(),
    department: {} as any,
    teamLeader: {} as any,
    teamSpecializations: [],
    membershipsHistory: [],
  };

  const mockUser: User = {
    id: 5,
    email: 'user@test.com',
    roles: [UserRole.TEAM_MEMBER],
    departmentId: 1,
    activeTeamId: 1,
    hashPassword: jest.fn(),
    validatePassword: jest.fn(),
  } as any;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: ReportRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Assignment),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ReportStatusHistory),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DepartmentHistory),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Team),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: LocationService,
          useValue: {
            getLocationInfo: jest.fn(),
          },
        },
        {
          provide: DepartmentService,
          useValue: {
            suggestDepartmentForLocation: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
            updateUserActiveTeam: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(() => mockQueryRunner),
          },
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    reportRepository = module.get<ReportRepository>(ReportRepository);
    assignmentRepository = module.get<Repository<Assignment>>(getRepositoryToken(Assignment));
    // Remove unused: reportStatusHistoryRepository, departmentHistoryRepository
    teamRepository = module.get<Repository<Team>>(getRepositoryToken(Team));
    locationService = module.get<LocationService>(LocationService);
    departmentService = module.get<DepartmentService>(DepartmentService);
    usersService = module.get<UsersService>(UsersService);
    // Remove unused: dataSource

    // Use imported mockCanTransition directly
    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignReportToTeam', () => {
    it('should assign report to team successfully', async () => {
      const reportWithAssignment = {
        ...mockReport,
        assignments: [
          {
            id: 1,
            assigneeType: AssigneeType.TEAM,
            assigneeId: 1,
            status: AssignmentStatus.ACTIVE,
            assignedAt: new Date(),
          },
        ],
      };

      jest.spyOn(reportRepository, 'findById').mockResolvedValue(mockReport);
      jest.spyOn(teamRepository, 'findOne').mockResolvedValue(mockTeam);
      jest.spyOn(assignmentRepository, 'find').mockResolvedValue([]);
      jest.spyOn(assignmentRepository, 'update').mockResolvedValue({} as any);
      jest.spyOn(assignmentRepository, 'create').mockReturnValue({} as Assignment);
      jest.spyOn(assignmentRepository, 'save').mockResolvedValue({} as Assignment);

      const result = await service.assignReportToTeam(1, 1, mockDepartmentSupervisor);

      expect(reportRepository.findById).toHaveBeenCalledWith(1);
      expect(teamRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['department'],
      });
      expect(assignmentRepository.update).toHaveBeenCalledWith(
        { reportId: 1, status: AssignmentStatus.ACTIVE },
        { status: AssignmentStatus.CANCELLED }
      );
      expect(assignmentRepository.create).toHaveBeenCalledWith({
        reportId: 1,
        assigneeType: AssigneeType.TEAM,
        assigneeId: 1,
        status: AssignmentStatus.ACTIVE,
        assignedAt: expect.any(Date),
        assignedBy: 2,
      });
      expect(result).toEqual(reportWithAssignment);
    });

    it('should throw NotFoundException when report not found', async () => {
      jest.spyOn(reportRepository, 'findById').mockResolvedValue(null);

      await expect(service.assignReportToTeam(999, 1, mockDepartmentSupervisor)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw NotFoundException when team not found', async () => {
      jest.spyOn(reportRepository, 'findById').mockResolvedValue(mockReport);
      jest.spyOn(teamRepository, 'findOne').mockResolvedValue(null);

      await expect(service.assignReportToTeam(1, 999, mockDepartmentSupervisor)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw ForbiddenException when user unauthorized', async () => {
      jest.spyOn(reportRepository, 'findById').mockResolvedValue(mockReport);

      await expect(service.assignReportToTeam(1, 1, mockCitizen)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should throw BadRequestException when team is from different department', async () => {
      const differentDeptTeam = { ...mockTeam, departmentId: 2 };
      jest.spyOn(reportRepository, 'findById').mockResolvedValue(mockReport);
      jest.spyOn(teamRepository, 'findOne').mockResolvedValue(differentDeptTeam);

      await expect(service.assignReportToTeam(1, 1, mockDepartmentSupervisor)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('assignReportToUser', () => {
    it('should assign report to user successfully', async () => {
      const reportWithAssignment = {
        ...mockReport,
        assignments: [
          {
            id: 1,
            assigneeType: AssigneeType.USER,
            assigneeId: 5,
            status: AssignmentStatus.ACTIVE,
            assignedAt: new Date(),
          },
        ],
      };

      jest.spyOn(reportRepository, 'findById').mockResolvedValue(mockReport);
      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(assignmentRepository, 'find').mockResolvedValue([]);
      jest.spyOn(assignmentRepository, 'update').mockResolvedValue({} as any);
      jest.spyOn(assignmentRepository, 'create').mockReturnValue({} as Assignment);
      jest.spyOn(assignmentRepository, 'save').mockResolvedValue({} as Assignment);
      jest.spyOn(reportRepository, 'save').mockResolvedValue(reportWithAssignment as Report);

      const result = await service.assignReportToUser(1, 5, mockDepartmentSupervisor);

      expect(usersService.findById).toHaveBeenCalledWith(5);
      expect(assignmentRepository.create).toHaveBeenCalledWith({
        reportId: 1,
        assigneeType: AssigneeType.USER,
        assigneeId: 5,
        status: AssignmentStatus.ACTIVE,
        assignedAt: expect.any(Date),
        assignedBy: 2,
      });
      expect(result).toEqual(reportWithAssignment);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(reportRepository, 'findById').mockResolvedValue(mockReport);
      jest.spyOn(usersService, 'findById').mockResolvedValue(null);

      await expect(service.assignReportToUser(1, 999, mockDepartmentSupervisor)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException when user is from different department', async () => {
      const differentDeptUser = { ...mockUser, departmentId: 2 };
      jest.spyOn(reportRepository, 'findById').mockResolvedValue(mockReport);
      jest.spyOn(usersService, 'findById').mockResolvedValue(differentDeptUser);

      await expect(service.assignReportToUser(1, 5, mockDepartmentSupervisor)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('updateStatus', () => {
    const updateStatusDto = {
      status: ReportStatus.IN_PROGRESS,
      note: 'Work started',
    } as UpdateReportStatusDto;

    it('should update status successfully when transition is valid', async () => {
      const updatedReport = { ...mockReport, status: ReportStatus.IN_PROGRESS };

      (mockCanTransition as jest.Mock).mockReturnValue(true);
      jest.spyOn(reportRepository, 'findById').mockResolvedValue(mockReport);
      mockQueryRunner.manager.create.mockReturnValue({} as ReportStatusHistory);
      mockQueryRunner.manager.save
        .mockResolvedValueOnce({} as ReportStatusHistory) // First save for status history
        .mockResolvedValueOnce(updatedReport); // Second save for report

      const result = await service.updateStatus(1, updateStatusDto, mockDepartmentSupervisor);

      expect(mockCanTransition).toHaveBeenCalledWith(ReportStatus.OPEN, ReportStatus.IN_PROGRESS, [
        UserRole.DEPARTMENT_SUPERVISOR,
      ]);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.create).toHaveBeenCalledWith(ReportStatusHistory, {
        reportId: 1,
        oldStatus: ReportStatus.OPEN,
        newStatus: ReportStatus.IN_PROGRESS,
        changedBy: 2,
        changedAt: expect.any(Date),
        note: 'Work started',
      });
      expect(result).toEqual(updatedReport);
    });

    it('should throw BadRequestException when transition is invalid', async () => {
      (mockCanTransition as jest.Mock).mockReturnValue(false);
      jest.spyOn(reportRepository, 'findById').mockResolvedValue(mockReport);

      await expect(service.updateStatus(1, updateStatusDto, mockTeamMember)).rejects.toThrow(
        BadRequestException
      );

      expect(mockCanTransition).toHaveBeenCalledWith(ReportStatus.OPEN, ReportStatus.IN_PROGRESS, [
        UserRole.TEAM_MEMBER,
      ]);
    });

    it('should handle subStatus transitions correctly', async () => {
      const reportInProgress = { ...mockReport, status: ReportStatus.IN_PROGRESS };
      const doneWithSubStatusDto = {
        status: ReportStatus.DONE,
        subStatus: 'PENDING_APPROVAL',
      } as UpdateReportStatusDto;

      (mockCanTransition as jest.Mock).mockReturnValue(true);
      jest.spyOn(reportRepository, 'findById').mockResolvedValue(reportInProgress);
      mockQueryRunner.manager.create.mockReturnValue({} as ReportStatusHistory);
      mockQueryRunner.manager.save.mockResolvedValue({} as any);

      await service.updateStatus(1, doneWithSubStatusDto, mockTeamMember);

      expect(mockQueryRunner.manager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ReportStatus.DONE,
          subStatus: 'PENDING_APPROVAL',
        })
      );
    });

    it('should rollback transaction on error', async () => {
      (mockCanTransition as jest.Mock).mockReturnValue(true);
      jest.spyOn(reportRepository, 'findById').mockResolvedValue(mockReport);
      mockQueryRunner.manager.save.mockRejectedValue(new Error('Database error'));

      await expect(
        service.updateStatus(1, updateStatusDto, mockDepartmentSupervisor)
      ).rejects.toThrow();

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('forwardReport', () => {
    const forwardDto = {
      targetDepartmentCode: MunicipalityDepartment.HEALTH,
      reason: 'Outside our jurisdiction',
    } as ForwardReportDto;

    it('should forward report successfully', async () => {
      // Remove unused: forwardedReport
      const targetDepartment = { id: 2, code: MunicipalityDepartment.HEALTH };

      jest.spyOn(reportRepository, 'findById').mockResolvedValue(mockReport);
      jest.spyOn(departmentService, 'findById').mockResolvedValue(targetDepartment as any);
      mockQueryRunner.manager.create
        .mockReturnValueOnce({} as DepartmentHistory)
        .mockReturnValueOnce({} as ReportStatusHistory);
      mockQueryRunner.manager.save.mockResolvedValue({} as any);

      const result = await service.forwardReport(1, forwardDto, mockDepartmentSupervisor);

      expect(mockQueryRunner.manager.create).toHaveBeenCalledWith(DepartmentHistory, {
        reportId: 1,
        oldDepartmentId: 1,
        newDepartmentId: 2,
        changedBy: 2,
        changedAt: expect.any(Date),
        reason: 'Outside our jurisdiction',
      });
      expect(mockQueryRunner.manager.create).toHaveBeenCalledWith(ReportStatusHistory, {
        reportId: 1,
        oldStatus: ReportStatus.OPEN,
        newStatus: ReportStatus.IN_REVIEW,
        changedBy: 2,
        changedAt: expect.any(Date),
        note: 'Report forwarded to HEALTH department: Outside our jurisdiction',
      });
      expect(result.currentDepartmentId).toBe(2);
    });

    it('should throw BadRequestException when forwarding to same department', async () => {
      const forwardToSameDept = {
        targetDepartmentCode: MunicipalityDepartment.ROADS, // Same as current
        reason: 'Test',
      } as ForwardReportDto;

      jest.spyOn(reportRepository, 'findById').mockResolvedValue(mockReport);
      jest.spyOn(departmentService, 'findById').mockResolvedValue({ id: 1 } as any);

      await expect(
        service.forwardReport(1, forwardToSameDept, mockDepartmentSupervisor)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when user unauthorized', async () => {
      jest.spyOn(reportRepository, 'findById').mockResolvedValue(mockReport);

      await expect(service.forwardReport(1, forwardDto, mockCitizen)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('create', () => {
    const createReportDto: CreateReportDto = {
      title: 'New Report',
      description: 'New description',
      reportType: ReportType.POTHOLE,
      location: { type: 'Point', coordinates: [29.0, 41.0] } as any, // Cast to any to avoid type error
      address: 'New Address',
    };

    it('should create report successfully for citizen', async () => {
      const locationInfo = { address: 'Formatted Address', neighborhood: 'Test Neighborhood' };
      const suggestedDepartment = { id: 1, code: MunicipalityDepartment.ROADS };
      const createdReport = { ...mockReport, ...createReportDto };

      jest.spyOn(locationService, 'getLocationInfo').mockResolvedValue(locationInfo);
      jest
        .spyOn(departmentService, 'suggestDepartmentForLocation')
        .mockResolvedValue(suggestedDepartment as any);
      jest.spyOn(reportRepository, 'create').mockResolvedValue(createdReport);

      const result = await service.create(createReportDto, mockCitizen);

      expect(locationService.getLocationInfo).toHaveBeenCalledWith(29.0, 41.0);
      expect(departmentService.suggestDepartmentForLocation).toHaveBeenCalledWith(
        ReportType.POTHOLE,
        29.0,
        41.0
      );
      expect(reportRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Report',
          description: 'New description',
          reportType: ReportType.POTHOLE,
          userId: 4,
          currentDepartmentId: 1,
          status: ReportStatus.OPEN,
          address: 'Formatted Address',
          neighborhood: 'Test Neighborhood',
        })
      );
      expect(result).toEqual(createdReport);
    });

    it('should handle location service errors gracefully', async () => {
      jest
        .spyOn(locationService, 'getLocationInfo')
        .mockRejectedValue(new Error('Location service error'));
      jest
        .spyOn(departmentService, 'suggestDepartmentForLocation')
        .mockResolvedValue({ id: 1 } as any);
      jest
        .spyOn(reportRepository, 'create')
        .mockResolvedValue({ ...mockReport, ...createReportDto });

      const result = await service.create(createReportDto, mockCitizen);

      expect(reportRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          address: 'New Address', // Uses provided address when location service fails
        })
      );
      expect(result).toBeDefined();
    });
  });
});
