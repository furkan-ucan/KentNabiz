import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { Team } from '../entities/team.entity';
import { TeamSpecialization } from '../entities/team-specialization.entity';
import { User } from '../../users/entities/user.entity';
import { Specialization } from '../../specializations/entities/specialization.entity';
import { TeamMembershipHistory } from '../../users/entities/team-membership-history.entity';
import { UserRole, TeamStatus } from '@KentNabiz/shared';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { CreateTeamDto } from '../dto/create-team.dto';
import { IsNull } from 'typeorm';

describe('TeamsService', () => {
  let service: TeamsService;
  let teamRepository: Repository<Team>;
  let teamSpecializationRepository: Repository<TeamSpecialization>;
  let userRepository: Repository<User>;
  let specializationRepository: Repository<Specialization>;
  let teamMembershipHistoryRepository: Repository<TeamMembershipHistory>;

  // Mock AuthUser fixtures
  const mockSystemAdmin: JwtPayload = {
    sub: 1,
    email: 'admin@test.com',
    roles: [UserRole.SYSTEM_ADMIN],
    departmentId: 1,
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

  const mockCitizen: JwtPayload = {
    sub: 4,
    email: 'citizen@test.com',
    roles: [UserRole.CITIZEN],
  };

  // Mock Team fixture
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

  // Mock User fixture with all required methods
  const mockUser: User = {
    id: 5,
    email: 'user@test.com',
    roles: [UserRole.TEAM_MEMBER],
    departmentId: 1,
    activeTeamId: null,
    hashPassword: jest.fn(),
    validatePassword: jest.fn(),
  } as any;

  // Mock Team Leader fixture
  const mockTeamLeader: User = {
    id: 2,
    email: 'leader@test.com',
    roles: [UserRole.TEAM_MEMBER],
    departmentId: 1,
    activeTeamId: null,
    hashPassword: jest.fn(),
    validatePassword: jest.fn(),
  } as any;

  // Mock Specialization fixture
  const mockSpecialization: Specialization = {
    id: 1,
    code: 'PLUMBING',
    name: 'Plumbing Services',
    description: 'Water pipe installation and maintenance',
    teamSpecializations: [],
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        {
          provide: getRepositoryToken(Team),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TeamSpecialization),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Specialization),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TeamMembershipHistory),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
    teamRepository = module.get<Repository<Team>>(getRepositoryToken(Team));
    teamSpecializationRepository = module.get<Repository<TeamSpecialization>>(
      getRepositoryToken(TeamSpecialization)
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    specializationRepository = module.get<Repository<Specialization>>(
      getRepositoryToken(Specialization)
    );
    teamMembershipHistoryRepository = module.get<Repository<TeamMembershipHistory>>(
      getRepositoryToken(TeamMembershipHistory)
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createTeamDto: CreateTeamDto = {
      name: 'New Team',
      departmentId: 1,
      teamLeaderId: 2,
      status: TeamStatus.AVAILABLE,
    };

    it('should create a team when user is system admin', async () => {
      const createdTeam = { ...mockTeam, ...createTeamDto };
      // Mock team leader validation
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockTeamLeader);
      jest.spyOn(teamRepository, 'create').mockReturnValue(createdTeam as Team);
      jest.spyOn(teamRepository, 'save').mockResolvedValue(createdTeam as Team);

      const result = await service.create(createTeamDto, mockSystemAdmin);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 2 },
        relations: ['department'],
      });
      expect(teamRepository.create).toHaveBeenCalledWith({
        name: createTeamDto.name,
        departmentId: createTeamDto.departmentId,
        teamLeaderId: createTeamDto.teamLeaderId,
        status: createTeamDto.status,
        baseLocation: createTeamDto.baseLocation,
      });
      expect(teamRepository.save).toHaveBeenCalledWith(createdTeam);
      expect(result).toEqual(createdTeam);
    });

    it('should create a team when user is department supervisor', async () => {
      const createdTeam = { ...mockTeam, ...createTeamDto };
      // Mock team leader validation
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockTeamLeader);
      jest.spyOn(teamRepository, 'create').mockReturnValue(createdTeam as Team);
      jest.spyOn(teamRepository, 'save').mockResolvedValue(createdTeam as Team);

      const result = await service.create(createTeamDto, mockDepartmentSupervisor);

      expect(result).toEqual(createdTeam);
    });

    it('should throw ForbiddenException when user is team member', async () => {
      await expect(service.create(createTeamDto, mockTeamMember)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should throw ForbiddenException when user is citizen', async () => {
      await expect(service.create(createTeamDto, mockCitizen)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should return all teams for system admin', async () => {
      const teams = [mockTeam];
      jest.spyOn(teamRepository, 'find').mockResolvedValue(teams);

      const result = await service.findAll(mockSystemAdmin);

      expect(teamRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: [
          'department',
          'teamLeader',
          'teamSpecializations',
          'teamSpecializations.specialization',
        ],
        order: { id: 'DESC' },
      });
      expect(result).toEqual(teams);
    });

    it('should return department teams for department supervisor', async () => {
      const teams = [mockTeam];
      jest.spyOn(teamRepository, 'find').mockResolvedValue(teams);

      const result = await service.findAll(mockDepartmentSupervisor);

      expect(teamRepository.find).toHaveBeenCalledWith({
        where: { departmentId: 1 },
        relations: [
          'department',
          'teamLeader',
          'teamSpecializations',
          'teamSpecializations.specialization',
        ],
        order: { id: 'DESC' },
      });
      expect(result).toEqual(teams);
    });

    it('should throw ForbiddenException for supervisor without department', async () => {
      const supervisorWithoutDept = { ...mockDepartmentSupervisor, departmentId: undefined };

      await expect(service.findAll(supervisorWithoutDept)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for citizen', async () => {
      await expect(service.findAll(mockCitizen)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findOne', () => {
    it('should return team when authorized', async () => {
      jest.spyOn(teamRepository, 'findOne').mockResolvedValue(mockTeam);

      const result = await service.findOne(1, mockSystemAdmin);

      expect(teamRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: [
          'department',
          'teamLeader',
          'teamSpecializations',
          'teamSpecializations.specialization',
        ],
      });
      expect(result).toEqual(mockTeam);
    });

    it('should throw NotFoundException when team not found', async () => {
      jest.spyOn(teamRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(999, mockSystemAdmin)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addMemberToTeam', () => {
    it('should add member to team successfully', async () => {
      const teamWithMember = { ...mockTeam };
      const userToAdd = {
        ...mockUser,
        hashPassword: jest.fn(),
        validatePassword: jest.fn(),
      } as User;
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTeam);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userToAdd);
      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue({ ...userToAdd, activeTeamId: 1 } as User);
      jest
        .spyOn(teamMembershipHistoryRepository, 'create')
        .mockReturnValue({} as TeamMembershipHistory);
      jest
        .spyOn(teamMembershipHistoryRepository, 'save')
        .mockResolvedValue({} as TeamMembershipHistory);
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockTeam)
        .mockResolvedValueOnce(teamWithMember);

      const result = await service.addMemberToTeam(1, 5, mockDepartmentSupervisor);

      expect(userRepository.save).toHaveBeenCalledWith({ ...userToAdd, activeTeamId: 1 });
      expect(teamMembershipHistoryRepository.create).toHaveBeenCalledWith({
        userId: 5,
        teamId: 1,
        joinedAt: expect.any(Date),
      });
      expect(result).toEqual(teamWithMember);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTeam);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.addMemberToTeam(1, 999, mockDepartmentSupervisor)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException when user is from different department', async () => {
      const userFromDifferentDept = {
        ...mockUser,
        departmentId: 2,
        hashPassword: jest.fn(),
        validatePassword: jest.fn(),
      } as User;
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTeam);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userFromDifferentDept);

      await expect(service.addMemberToTeam(1, 5, mockDepartmentSupervisor)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException when user has inappropriate role', async () => {
      const userWithWrongRole = {
        ...mockUser,
        roles: [UserRole.CITIZEN],
        hashPassword: jest.fn(),
        validatePassword: jest.fn(),
      } as User;
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTeam);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userWithWrongRole);

      await expect(service.addMemberToTeam(1, 5, mockDepartmentSupervisor)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException when user is already in team', async () => {
      const userAlreadyInTeam = {
        ...mockUser,
        activeTeamId: 1,
        hashPassword: jest.fn(),
        validatePassword: jest.fn(),
      } as User;
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTeam);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userAlreadyInTeam);

      await expect(service.addMemberToTeam(1, 5, mockDepartmentSupervisor)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('removeMemberFromTeam', () => {
    it('should remove member from team successfully', async () => {
      const userInTeam = {
        ...mockUser,
        activeTeamId: 1,
        hashPassword: jest.fn(),
        validatePassword: jest.fn(),
      } as User;
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTeam);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userInTeam);
      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue({ ...userInTeam, activeTeamId: null } as User);
      jest.spyOn(teamMembershipHistoryRepository, 'update').mockResolvedValue({} as any);

      const result = await service.removeMemberFromTeam(1, 5, mockDepartmentSupervisor);

      expect(userRepository.save).toHaveBeenCalledWith({ ...userInTeam, activeTeamId: null });
      expect(teamMembershipHistoryRepository.update).toHaveBeenCalledWith(
        { userId: 5, teamId: 1, leftAt: IsNull() },
        { leftAt: expect.any(Date) }
      );
      expect(result).toEqual(mockTeam);
    });

    it('should throw BadRequestException when user is not in team', async () => {
      const userNotInTeam = {
        ...mockUser,
        activeTeamId: 2,
        hashPassword: jest.fn(),
        validatePassword: jest.fn(),
      } as User;
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTeam);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userNotInTeam);

      await expect(service.removeMemberFromTeam(1, 5, mockDepartmentSupervisor)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('addSpecializationToTeam', () => {
    it('should add specialization to team successfully', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTeam);
      jest.spyOn(specializationRepository, 'findOne').mockResolvedValue(mockSpecialization);
      jest.spyOn(teamSpecializationRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(teamSpecializationRepository, 'create').mockReturnValue({} as TeamSpecialization);
      jest.spyOn(teamSpecializationRepository, 'save').mockResolvedValue({} as TeamSpecialization);

      const result = await service.addSpecializationToTeam(1, 1, mockDepartmentSupervisor);

      expect(teamSpecializationRepository.create).toHaveBeenCalledWith({
        teamId: 1,
        specializationId: 1,
      });
      expect(result).toEqual(mockTeam);
    });

    it('should throw NotFoundException when specialization not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTeam);
      jest.spyOn(specializationRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.addSpecializationToTeam(1, 999, mockDepartmentSupervisor)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when team already has specialization', async () => {
      const existingRelation = { teamId: 1, specializationId: 1 } as TeamSpecialization;
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTeam);
      jest.spyOn(specializationRepository, 'findOne').mockResolvedValue(mockSpecialization);
      jest.spyOn(teamSpecializationRepository, 'findOne').mockResolvedValue(existingRelation);

      await expect(service.addSpecializationToTeam(1, 1, mockDepartmentSupervisor)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('removeSpecializationFromTeam', () => {
    it('should remove specialization from team successfully', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTeam);
      jest.spyOn(teamSpecializationRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

      await service.removeSpecializationFromTeam(1, 1, mockDepartmentSupervisor);

      expect(teamSpecializationRepository.delete).toHaveBeenCalledWith({
        teamId: 1,
        specializationId: 1,
      });
    });

    it('should throw NotFoundException when relation not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTeam);
      jest.spyOn(teamSpecializationRepository, 'delete').mockResolvedValue({ affected: 0 } as any);

      await expect(
        service.removeSpecializationFromTeam(1, 1, mockDepartmentSupervisor)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete team successfully', async () => {
      const teamToDelete = { ...mockTeam };
      jest.spyOn(service, 'findOne').mockResolvedValue(teamToDelete);
      jest
        .spyOn(teamRepository, 'save')
        .mockResolvedValue({ ...teamToDelete, status: TeamStatus.INACTIVE } as Team);
      jest.spyOn(userRepository, 'update').mockResolvedValue({} as any);
      jest.spyOn(teamMembershipHistoryRepository, 'update').mockResolvedValue({} as any);

      await service.remove(1, mockDepartmentSupervisor);

      expect(teamRepository.save).toHaveBeenCalledWith({
        ...teamToDelete,
        status: TeamStatus.INACTIVE,
      });
      expect(userRepository.update).toHaveBeenCalledWith(
        { activeTeamId: 1 },
        { activeTeamId: null }
      );
      expect(teamMembershipHistoryRepository.update).toHaveBeenCalledWith(
        { teamId: 1, leftAt: IsNull() },
        { leftAt: expect.any(Date) }
      );
    });

    it('should throw ForbiddenException when unauthorized', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTeam);

      await expect(service.remove(1, mockTeamMember)).rejects.toThrow(ForbiddenException);
    });
  });
});
