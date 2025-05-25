import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { Team } from '../../teams/entities/team.entity';
import { TeamMembershipHistory } from '../entities/team-membership-history.entity';
import { UserRepository } from '../repositories/user.repository';
import { DepartmentService } from '../../reports/services/department.service';
import { UserRole } from '@KentNabiz/shared';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: UserRepository;
  let teamRepository: Repository<Team>;
  let dataSource: DataSource;

  // Mock AuthUser fixtures
  const mockSystemAdmin: JwtPayload = {
    sub: 1,
    email: 'admin@test.com',
    roles: [UserRole.SYSTEM_ADMIN],
  };

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

  // Mock entities
  const mockUser: User = {
    id: 3,
    email: 'member@test.com',
    roles: [UserRole.TEAM_MEMBER],
    departmentId: 1,
    activeTeamId: null,
    hashPassword: jest.fn(),
    validatePassword: jest.fn(),
  } as any;

  const mockTeamForUser: Team = {
    id: 1,
    name: 'Test Team',
    departmentId: 1,
    teamLeaderId: 2,
    status: 'AVAILABLE',
    baseLocation: { type: 'Point', coordinates: [29.0, 41.0] },
    currentLocation: { type: 'Point', coordinates: [29.0, 41.0] },
    lastLocationUpdate: new Date(),
  } as any;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      update: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findAll: jest.fn(),
            findByEmail: jest.fn(),
            findByIdWithRelations: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Team),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TeamMembershipHistory),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: DepartmentService,
          useValue: {
            findById: jest.fn(),
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

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<UserRepository>(UserRepository);
    teamRepository = module.get<Repository<Team>>(getRepositoryToken(Team));
    dataSource = module.get<DataSource>(DataSource);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateUserActiveTeam', () => {
    beforeEach(() => {
      jest.spyOn(dataSource, 'createQueryRunner').mockReturnValue(mockQueryRunner as any);
      jest.clearAllMocks();
    });

    it('should successfully assign user to a team', async () => {
      const userId = 3;
      const teamId = 1;
      const mockUserForAssignment = {
        ...mockUser,
        id: userId,
        activeTeamId: null,
        departmentId: 1,
      } as any;
      const mockTeam = { ...mockTeamForUser, departmentId: 1 };
      const updatedUser = { ...mockUserForAssignment, activeTeamId: teamId };

      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUserForAssignment);
      jest.spyOn(teamRepository, 'findOne').mockResolvedValue(mockTeam);
      mockQueryRunner.manager.create.mockReturnValue({} as any);
      mockQueryRunner.manager.save
        .mockResolvedValueOnce({}) // TeamMembershipHistory save
        .mockResolvedValueOnce(updatedUser); // User save

      const result = await service.updateUserActiveTeam(userId, teamId, mockDepartmentSupervisor);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(teamRepository.findOne).toHaveBeenCalledWith({
        where: { id: teamId },
        relations: ['department'],
      });
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.create).toHaveBeenCalledWith(TeamMembershipHistory, {
        userId,
        teamId,
        joinedAt: expect.any(Date),
      });
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
    });

    it('should successfully remove user from team (assign null)', async () => {
      const userId = 3;
      const teamId = null;
      const mockUserWithTeam = { ...mockUser, id: userId, activeTeamId: 1, departmentId: 1 } as any;
      const updatedUser = { ...mockUserWithTeam, activeTeamId: null };

      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUserWithTeam);
      mockQueryRunner.manager.save.mockResolvedValue(updatedUser);

      const result = await service.updateUserActiveTeam(userId, teamId, mockDepartmentSupervisor);

      expect(mockQueryRunner.manager.update).toHaveBeenCalledWith(
        TeamMembershipHistory,
        {
          userId,
          teamId: 1,
          leftAt: null,
        },
        { leftAt: expect.any(Date) }
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
    });

    it('should handle team change (from one team to another)', async () => {
      const userId = 3;
      const newTeamId = 2;
      const mockUserWithOldTeam = {
        ...mockUser,
        id: userId,
        activeTeamId: 1,
        departmentId: 1,
      } as any;
      const mockNewTeam = { ...mockTeamForUser, id: newTeamId, departmentId: 1 };
      const updatedUser = { ...mockUserWithOldTeam, activeTeamId: newTeamId };

      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUserWithOldTeam);
      jest.spyOn(teamRepository, 'findOne').mockResolvedValue(mockNewTeam);
      mockQueryRunner.manager.create.mockReturnValue({} as any);
      mockQueryRunner.manager.save
        .mockResolvedValueOnce({}) // TeamMembershipHistory save
        .mockResolvedValueOnce(updatedUser); // User save

      const result = await service.updateUserActiveTeam(userId, newTeamId, mockSystemAdmin);

      // Should end previous membership
      expect(mockQueryRunner.manager.update).toHaveBeenCalledWith(
        TeamMembershipHistory,
        {
          userId,
          teamId: 1,
          leftAt: null,
        },
        { leftAt: expect.any(Date) }
      );

      // Should create new membership
      expect(mockQueryRunner.manager.create).toHaveBeenCalledWith(TeamMembershipHistory, {
        userId,
        teamId: newTeamId,
        joinedAt: expect.any(Date),
      });

      expect(result).toEqual(updatedUser);
    });

    it('should throw ForbiddenException when user is not authorized', async () => {
      const userId = 3;
      const teamId = 1;

      await expect(service.updateUserActiveTeam(userId, teamId, mockTeamMember)).rejects.toThrow(
        new ForbiddenException(
          'Only system administrators and department supervisors can update team assignments.'
        )
      );

      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = 999;
      const teamId = 1;

      jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

      await expect(
        service.updateUserActiveTeam(userId, teamId, mockDepartmentSupervisor)
      ).rejects.toThrow(new NotFoundException(`User with ID ${userId} not found`));

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException when team not found', async () => {
      const userId = 3;
      const teamId = 999;
      const mockUserForTest = { ...mockUser, id: userId, departmentId: 1 } as any;

      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUserForTest);
      jest.spyOn(teamRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateUserActiveTeam(userId, teamId, mockDepartmentSupervisor)
      ).rejects.toThrow(new NotFoundException(`Team with ID ${teamId} not found`));

      expect(teamRepository.findOne).toHaveBeenCalledWith({
        where: { id: teamId },
        relations: ['department'],
      });
    });

    it('should throw ForbiddenException when department supervisor tries to assign user to different department team', async () => {
      const userId = 3;
      const teamId = 1;
      const mockUserForTest = { ...mockUser, id: userId, departmentId: 1 } as any;
      const mockTeamDifferentDept = { ...mockTeamForUser, departmentId: 2 };

      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUserForTest);
      jest.spyOn(teamRepository, 'findOne').mockResolvedValue(mockTeamDifferentDept);

      await expect(
        service.updateUserActiveTeam(userId, teamId, mockDepartmentSupervisor)
      ).rejects.toThrow(
        new ForbiddenException(
          'Department supervisors can only assign users to teams in their own department.'
        )
      );
    });

    it('should throw BadRequestException when user department does not match team department', async () => {
      const userId = 3;
      const teamId = 1;
      const mockUserDifferentDept = { ...mockUser, id: userId, departmentId: 2 } as any;
      const mockTeam = { ...mockTeamForUser, departmentId: 1 };

      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUserDifferentDept);
      jest.spyOn(teamRepository, 'findOne').mockResolvedValue(mockTeam);

      await expect(service.updateUserActiveTeam(userId, teamId, mockSystemAdmin)).rejects.toThrow(
        new BadRequestException('User must be from the same department as the team.')
      );
    });

    it('should throw BadRequestException when user does not have appropriate role for team membership', async () => {
      const userId = 4;
      const teamId = 1;
      const mockCitizenUser = {
        ...mockUser,
        id: userId,
        departmentId: 1,
        roles: [UserRole.CITIZEN],
      } as any;
      const mockTeam = { ...mockTeamForUser, departmentId: 1 };

      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockCitizenUser);
      jest.spyOn(teamRepository, 'findOne').mockResolvedValue(mockTeam);

      await expect(service.updateUserActiveTeam(userId, teamId, mockSystemAdmin)).rejects.toThrow(
        new BadRequestException(
          'User must have TEAM_MEMBER or DEPARTMENT_SUPERVISOR role to be assigned to a team.'
        )
      );
    });

    it('should rollback transaction on error', async () => {
      const userId = 3;
      const teamId = 1;
      const mockUserForTest = { ...mockUser, id: userId, departmentId: 1 } as any;
      const mockTeam = { ...mockTeamForUser, departmentId: 1 };

      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUserForTest);
      jest.spyOn(teamRepository, 'findOne').mockResolvedValue(mockTeam);
      mockQueryRunner.manager.save.mockRejectedValue(new Error('Database error'));

      await expect(
        service.updateUserActiveTeam(userId, teamId, mockDepartmentSupervisor)
      ).rejects.toThrow('Database error');

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should allow SYSTEM_ADMIN to assign users across departments', async () => {
      const userId = 3;
      const teamId = 1;
      const mockUserForTest = { ...mockUser, id: userId, departmentId: 1 } as any;
      const mockTeam = { ...mockTeamForUser, departmentId: 1 };
      const updatedUser = { ...mockUserForTest, activeTeamId: teamId };

      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUserForTest);
      jest.spyOn(teamRepository, 'findOne').mockResolvedValue(mockTeam);
      mockQueryRunner.manager.create.mockReturnValue({} as any);
      mockQueryRunner.manager.save.mockResolvedValue(updatedUser);

      const result = await service.updateUserActiveTeam(userId, teamId, mockSystemAdmin);

      expect(result).toEqual(updatedUser);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });
});
