import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from '../repositories/user.repository';
import { NotFoundException } from '@nestjs/common';
import { UserRole } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserProfileDto } from '../dto/user-profile.dto';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    isEmailTaken: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    fullName: 'Test User',
    roles: [UserRole.USER],
    password: 'hashedpassword',
    isEmailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    hashPassword: jest.fn(),
    validatePassword: jest.fn(),
  };

  const mockUserProfileDto = new UserProfileDto(mockUser);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      mockUserRepository.findAll.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(result).toEqual([mockUserProfileDto]);
      expect(mockUserRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user when valid id is provided', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toBeInstanceOf(UserProfileDto);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when invalid id is provided', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user when valid email is provided', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw NotFoundException when invalid email is provided', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.findByEmail('nonexistent@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        password: 'password123',
        fullName: 'New User',
      };

      mockUserRepository.isEmailTaken.mockResolvedValue(false);
      mockUserRepository.create.mockResolvedValue({ ...mockUser, ...createUserDto, id: 2 });

      const result = await service.create(createUserDto);

      expect(result).toBeInstanceOf(UserProfileDto);
      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const updateUserDto: UpdateUserDto = {
        fullName: 'Updated Name',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({ ...mockUser, ...updateUserDto });

      const result = await service.update(1, updateUserDto);

      expect(result).toBeInstanceOf(UserProfileDto);
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.remove.mockResolvedValue(undefined);

      await expect(service.remove(1)).resolves.not.toThrow();
      expect(mockUserRepository.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login time', async () => {
      mockUserRepository.update.mockResolvedValue(mockUser);

      await expect(service.updateLastLogin(1)).resolves.not.toThrow();
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
        lastLoginAt: expect.any(Date) as Date,
      });
    });
  });
});
