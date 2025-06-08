import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { SpecializationsService } from './specializations.service';
import { Specialization } from '../entities/specialization.entity';
import { UserRole } from '@kentnabiz/shared';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { CreateSpecializationDto } from '../dto/create-specialization.dto';
import { UpdateSpecializationDto } from '../dto/update-specialization.dto';

describe('SpecializationsService', () => {
  let service: SpecializationsService;
  let specializationRepository: Repository<Specialization>;

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

  // Mock Specialization fixture
  const mockSpecialization: Specialization = {
    id: 1,
    code: 'PLUMBING',
    name: 'Plumbing Services',
    description: 'Water pipe installation and maintenance',
    typicalDepartmentCode: 'PUBLIC_WORKS',
    exampleSource: 'Example source',
    teamSpecializations: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpecializationsService,
        {
          provide: getRepositoryToken(Specialization),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              orWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([mockSpecialization]),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<SpecializationsService>(SpecializationsService);
    specializationRepository = module.get<Repository<Specialization>>(
      getRepositoryToken(Specialization)
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createSpecializationDto: CreateSpecializationDto = {
      code: 'ELECTRICAL',
      name: 'Electrical Services',
      description: 'Electrical installation and maintenance',
      departmentId: 1,
    };

    it('should create a specialization when user is system admin', async () => {
      const createdSpecialization = { ...mockSpecialization, ...createSpecializationDto };
      jest.spyOn(specializationRepository, 'findOne').mockResolvedValue(null); // No existing code
      jest
        .spyOn(specializationRepository, 'create')
        .mockReturnValue(createdSpecialization as Specialization);
      jest.spyOn(specializationRepository, 'save').mockResolvedValue(createdSpecialization);

      const result = await service.create(createSpecializationDto, mockSystemAdmin);

      expect(specializationRepository.findOne).toHaveBeenCalledWith({
        where: { code: 'ELECTRICAL' },
      });
      expect(specializationRepository.create).toHaveBeenCalledWith(createSpecializationDto);
      expect(specializationRepository.save).toHaveBeenCalledWith(createdSpecialization);
      expect(result).toEqual(createdSpecialization);
    });

    it('should throw ForbiddenException when user is not system admin', async () => {
      await expect(
        service.create(createSpecializationDto, mockDepartmentSupervisor)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException when specialization code already exists', async () => {
      jest.spyOn(specializationRepository, 'findOne').mockResolvedValue(mockSpecialization);

      await expect(service.create(createSpecializationDto, mockSystemAdmin)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('findAll', () => {
    it('should return all specializations for any authenticated user', async () => {
      const specializations = [mockSpecialization];
      jest.spyOn(specializationRepository, 'find').mockResolvedValue(specializations);

      const result = await service.findAll(mockTeamMember);

      expect(specializationRepository.find).toHaveBeenCalledWith({
        relations: ['teamSpecializations'],
        order: { name: 'ASC' },
      });
      expect(result).toEqual(specializations);
    });
  });

  describe('findOne', () => {
    it('should return specialization when found', async () => {
      jest.spyOn(specializationRepository, 'findOne').mockResolvedValue(mockSpecialization);

      const result = await service.findOne(1, mockTeamMember);

      expect(specializationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['teamSpecializations', 'teamSpecializations.team'],
      });
      expect(result).toEqual(mockSpecialization);
    });

    it('should throw NotFoundException when specialization not found', async () => {
      jest.spyOn(specializationRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(999, mockTeamMember)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateSpecializationDto: UpdateSpecializationDto = {
      name: 'Updated Electrical Services',
      description: 'Updated description',
    };

    it('should update specialization when user is system admin', async () => {
      const updatedSpecialization = { ...mockSpecialization, ...updateSpecializationDto };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockSpecialization);
      jest.spyOn(specializationRepository, 'findOne').mockResolvedValue(null); // No code conflict
      jest.spyOn(specializationRepository, 'save').mockResolvedValue(updatedSpecialization);

      const result = await service.update(1, updateSpecializationDto, mockSystemAdmin);

      expect(specializationRepository.save).toHaveBeenCalledWith({
        ...mockSpecialization,
        ...updateSpecializationDto,
      });
      expect(result).toEqual(updatedSpecialization);
    });

    it('should throw ForbiddenException when user is not system admin', async () => {
      await expect(
        service.update(1, updateSpecializationDto, mockDepartmentSupervisor)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException when updated code already exists', async () => {
      const updateWithCode = { ...updateSpecializationDto, code: 'EXISTING_CODE' };
      const existingSpecialization = { ...mockSpecialization, id: 2, code: 'EXISTING_CODE' };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockSpecialization);
      jest.spyOn(specializationRepository, 'findOne').mockResolvedValue(existingSpecialization);

      await expect(service.update(1, updateWithCode, mockSystemAdmin)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('remove', () => {
    it('should delete specialization when not assigned to teams', async () => {
      const specializationWithoutTeams = { ...mockSpecialization, teamSpecializations: [] };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockSpecialization);
      jest.spyOn(specializationRepository, 'findOne').mockResolvedValue(specializationWithoutTeams);
      jest.spyOn(specializationRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

      await service.remove(1, mockSystemAdmin);

      expect(specializationRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw ForbiddenException when user is not system admin', async () => {
      await expect(service.remove(1, mockDepartmentSupervisor)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException when specialization is assigned to teams', async () => {
      const specializationWithTeams = {
        ...mockSpecialization,
        teamSpecializations: [{ teamId: 1, specializationId: 1 } as any],
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockSpecialization);
      jest.spyOn(specializationRepository, 'findOne').mockResolvedValue(specializationWithTeams);

      await expect(service.remove(1, mockSystemAdmin)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByCode', () => {
    it('should return specialization when found by code', async () => {
      jest.spyOn(specializationRepository, 'findOne').mockResolvedValue(mockSpecialization);

      const result = await service.findByCode('PLUMBING');

      expect(specializationRepository.findOne).toHaveBeenCalledWith({
        where: { code: 'PLUMBING' },
        relations: ['teamSpecializations'],
      });
      expect(result).toEqual(mockSpecialization);
    });

    it('should throw NotFoundException when specialization not found by code', async () => {
      jest.spyOn(specializationRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findByCode('NONEXISTENT')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByDepartment', () => {
    it('should return specializations for a department', async () => {
      const specializations = [mockSpecialization];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(specializations),
      };
      jest
        .spyOn(specializationRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findByDepartment(1);

      expect(specializationRepository.createQueryBuilder).toHaveBeenCalledWith('specialization');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'specialization.teamSpecializations',
        'teamSpecializations'
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'teamSpecializations.team',
        'team'
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('team.departmentId = :departmentId', {
        departmentId: 1,
      });
      expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith(
        'specialization.typicalDepartmentCode IS NOT NULL'
      );
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(specializations);
    });
  });

  describe('findByTypicalDepartmentCode', () => {
    it('should return specializations by typical department code', async () => {
      const specializations = [mockSpecialization];
      jest.spyOn(specializationRepository, 'find').mockResolvedValue(specializations);

      const result = await service.findByTypicalDepartmentCode('PUBLIC_WORKS');

      expect(specializationRepository.find).toHaveBeenCalledWith({
        where: { typicalDepartmentCode: 'PUBLIC_WORKS' },
        order: { name: 'ASC' },
      });
      expect(result).toEqual(specializations);
    });
  });

  describe('searchByName', () => {
    it('should return specializations matching search term', async () => {
      const specializations = [mockSpecialization];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(specializations),
      };
      jest
        .spyOn(specializationRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.searchByName('plumb');

      expect(specializationRepository.createQueryBuilder).toHaveBeenCalledWith('specialization');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('specialization.name ILIKE :name', {
        name: '%plumb%',
      });
      expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith(
        'specialization.description ILIKE :name',
        { name: '%plumb%' }
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('specialization.name', 'ASC');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(specializations);
    });
  });
});
