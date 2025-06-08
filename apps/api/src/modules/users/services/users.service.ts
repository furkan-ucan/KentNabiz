// apps/api/src/modules/users/services/users.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity'; // Bu User entity'si güncellenmiş olmalı
import { UserProfileDto } from '../dto/user-profile.dto';
import { UserRole } from '@kentnabiz/shared'; // UserRole import eklendi
import { DepartmentService } from '../../reports/services/department.service'; // DepartmentService importu
import { forwardRef, Inject } from '@nestjs/common'; // forwardRef ve Inject eklendi
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface'; // JwtPayload import eklendi
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Team } from '../../teams/entities/team.entity';
import { TeamMembershipHistory } from '../entities/team-membership-history.entity';

// TODO: cover edge cases in user service logic - coverage: 70.73%

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    // DepartmentService'i inject etmek için UsersModule'de ReportsModule'ü import etmeniz
    // ve ReportsModule'ün DepartmentService'i export etmesi gerekir.
    // Döngüsel bağımlılık varsa forwardRef kullanılabilir.
    @Inject(forwardRef(() => DepartmentService))
    private readonly departmentService: DepartmentService,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(TeamMembershipHistory)
    private readonly teamMembershipHistoryRepository: Repository<TeamMembershipHistory>,
    private readonly dataSource: DataSource
  ) {}

  async findAll(): Promise<UserProfileDto[]> {
    const users = await this.userRepository.findAllWithRelations(['department']);
    // UserProfileDto'nun User entity'sindeki UserRole[] ile uyumlu olduğundan emin olun.
    return users.map((user: User) => new UserProfileDto(user));
  }

  async findAllPaginated(
    page: number,
    limit: number
  ): Promise<{ data: UserProfileDto[]; total: number }> {
    // Geçici implementation - ideal olarak UserRepository'de pagination metodları olmalı
    const allUsers = await this.userRepository.findAllWithRelations(['department']);
    const total = allUsers.length;
    const start = (page - 1) * limit;
    const paginatedUsers = allUsers.slice(start, start + limit);

    return {
      data: paginatedUsers.map((user: User) => new UserProfileDto(user)),
      total,
    };
  }

  // Bu metod AuthService.findById tarafından kullanılacak.
  async findById(id: number, relations: string[] = []): Promise<User | null> {
    // Dönüş tipi User | null olmalı (AuthService'in beklediği)
    // userRepository.findByIdWithRelations zaten User | null dönüyor.
    return this.userRepository.findByIdWithRelations(id, relations);
  }

  // Bu metod UserProfileDto dönüyor, findById ise User | null.
  // Eğer bir endpoint için UserProfileDto, servisler arası kullanım için User gerekiyorsa iki ayrı metod olabilir.
  // Şimdilik findOne'ı UserProfileDto döndürecek şekilde bırakıyorum, findById'yi User | null döndürecek şekilde ekledim/güncelledim.
  async findOneProfile(id: number): Promise<UserProfileDto> {
    // findOne -> findOneProfile (isim değişikliği)
    const user = await this.userRepository.findByIdWithRelations(id, ['department']);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return new UserProfileDto(user);
  }

  async findByEmail(email: string): Promise<User> {
    // Bu metod User dönüyor, bu iyi.
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  // Bu metod AuthService.createUser tarafından kullanılacak.
  // AuthService User bekliyor, bu ise UserProfileDto dönüyor.
  // AuthService'in beklentisine göre User döndürecek bir createUser metodu daha iyi olur.
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUserByEmail = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUserByEmail) {
      throw new ConflictException('Email is already in use');
    }

    const isDepartmentRole = createUserDto.roles?.some(
      role => role === UserRole.TEAM_MEMBER || role === UserRole.DEPARTMENT_SUPERVISOR
    );

    if (isDepartmentRole) {
      if (createUserDto.departmentId === undefined || createUserDto.departmentId === null) {
        throw new BadRequestException(
          'Department ID is required for TEAM_MEMBER or DEPARTMENT_SUPERVISOR roles.'
        );
      }
      // DepartmentService üzerinden departmanın varlığını kontrol et
      try {
        await this.departmentService.findById(createUserDto.departmentId);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException(
            `Department with ID ${createUserDto.departmentId} not found.`
          );
        }
        throw error; // Diğer hataları tekrar fırlat
      }
    } else {
      // Eğer rol departman rolü değilse ve departmentId gönderilmişse, bunu yok say veya hata ver.
      // Şimdilik, DTO'daki @IsOptional nedeniyle departmentId tanımsız olabilir, bu durumda sorun yok.
      // Eğer gönderilmişse ve rol uygun değilse, belki null'a set etmek veya hata vermek daha doğru olabilir.
      // Ancak whitelist:true ve forbidNonWhitelisted:true ile DTO zaten bunu yönetiyor olmalı.
      // Eğer rol departmanla ilgili değilse departmentId'nin createUserDto'da olmaması beklenir.
      // Eğer varsa ve rol uygun değilse, bunu temizleyebiliriz:
      if (createUserDto.departmentId !== undefined && createUserDto.departmentId !== null) {
        // Ya da burada bir BadRequestException fırlatılabilir:
        // throw new BadRequestException("Department ID should only be provided for department-specific roles.");
        // Şimdilik null yapalım, User entity'si bunu handle edebilir.
        // createUserDto.departmentId = null; // Veya undefined
        // Ya da userRepository.create çağrısına departmentId'yi koşullu ekleyebiliriz.
        // En temizi, DTO'nun bu durumu zaten forbidNonWhitelisted ile yakalaması.
        // Eğer DTO'da departmentId opsiyonel ise ve rol uygun değilse, bu alanın gönderilmemesi en doğrusu.
        // Eğer gönderilmişse ve rol uygun değilse, bir uyarı/hata loglanabilir veya hata fırlatılabilir.
        // Şimdilik, userRepository.create'in bunu doğru işlemesini bekliyoruz.
      }
    }

    // CreateUserDto'da roles alanı yoksa, User entity'sindeki default ([UserRole.CITIZEN]) kullanılacak.
    // departmentId null ise, User entity'sinde department ilişkisi kurulmayacak.
    return this.userRepository.create(createUserDto);
  }

  // Mevcut 'create' metodu UserProfileDto döndürmeye devam edebilir (eğer bir controller bunu kullanıyorsa).
  async createProfile(createUserDto: CreateUserDto): Promise<UserProfileDto> {
    // create -> createProfile (isim değişikliği)
    const newUser = await this.createUser(createUserDto); // İçeride createUser'ı çağır
    return new UserProfileDto(newUser);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserProfileDto> {
    // TODO: add tests for user update edge cases
    const userExists = await this.userRepository.findById(id); // findById User | null döner
    if (!userExists) {
      throw new NotFoundException(`User with ID ${id} not found for update.`);
    }

    if (updateUserDto.email && updateUserDto.email !== userExists.email) {
      const isEmailTaken = await this.userRepository.isEmailTaken(updateUserDto.email, id);
      if (isEmailTaken) {
        throw new ConflictException('Email is already in use by another account.');
      }
    }

    // Departman ID'si güncelleniyorsa, departmanın varlığını kontrol et
    if (updateUserDto.departmentId !== undefined) {
      // null da geçerli bir değer olabilir (departmandan çıkarma)
      if (updateUserDto.departmentId !== null) {
        try {
          await this.departmentService.findById(updateUserDto.departmentId);
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw new BadRequestException(
              `Department with ID ${updateUserDto.departmentId} not found.`
            );
          }
          throw error;
        }
      }
      // Eğer departmentId null ise, kullanıcıyı departmandan çıkarıyoruz demektir, bu geçerli.
    }

    const updatedUserEntity = await this.userRepository.update(id, updateUserDto);
    return new UserProfileDto(updatedUserEntity);
  }

  async remove(id: number): Promise<void> {
    // TODO: add tests for user deletion
    // userRepository.remove zaten NotFoundException fırlatacak (yaptığımız değişiklikle).
    await this.userRepository.remove(id);
  }

  async updateLastLogin(id: number): Promise<void> {
    // Bu metod User entity'sindeki lastLoginAt alanını güncellemeli.
    // userRepository.update bunu yapabilir.
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException(`User with ID ${id} not found.`);
    user.lastLoginAt = new Date();
    await this.userRepository.save(user); // UserRepository.save kullanılıyor
  }

  // Bu metodda değişiklik yok, iyi görünüyor.
  async changePassword(id: number, oldPassword: string, newPassword: string): Promise<void> {
    // TODO: add tests for password change validation
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const isPasswordValid = await user.validatePassword(oldPassword);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }
    user.password = newPassword; // Entity @BeforeUpdate hook'u hashlemeli
    await this.userRepository.save(user); // UserRepository.save kullanılıyor
  }

  // Rol ve Departman Atama Metodları (SYSTEM_ADMIN için) - YENİ EKLENDİ
  async updateUserRoles(userId: number, roles: UserRole[]): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    // TODO: Rollerin geçerliliğini ve iş mantığını kontrol et (örneğin bir kullanıcı hem CITIZEN hem de ADMIN olamaz gibi)
    user.roles = roles;
    // Eğer rollerden biri departmanla ilgiliyse ve departmentId yoksa ne yapılmalı?
    // Ya da rollerden hiçbiri departmanla ilgili değilse departmentId null yapılmalı mı?
    // Bu mantık updateUserDto içinde ve update metodunda ele alınmalı.
    return this.userRepository.save(user);
  }

  async assignDepartmentToUser(userId: number, departmentId: number | null): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    if (departmentId !== null) {
      // Departmanın varlığını kontrol et
      try {
        await this.departmentService.findById(departmentId);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException(`Department with ID ${departmentId} not found.`);
        }
        throw error;
      }
      user.departmentId = departmentId;
    } else {
      user.departmentId = null; // Departmandan çıkar
    }
    return this.userRepository.save(user);
  }

  async findEmployeeInDepartment(employeeId: number, departmentId: number): Promise<User | null> {
    const user = await this.userRepository.findByIdWithRelations(employeeId, ['department']);
    if (!user) return null;
    if (user.departmentId === departmentId && user.roles.includes(UserRole.TEAM_MEMBER)) {
      return user;
    }
    return null;
  }

  // Yeni team management metodları
  async updateUserActiveTeam(
    userId: number,
    teamId: number | null,
    currentUser: JwtPayload
  ): Promise<User> {
    // Authorization: SYSTEM_ADMIN, DEPARTMENT_SUPERVISOR, or user updating their own team
    const isSelfUpdate = currentUser.sub === userId;
    if (
      !currentUser.roles.includes(UserRole.SYSTEM_ADMIN) &&
      !currentUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR) &&
      !isSelfUpdate
    ) {
      throw new ForbiddenException(
        'Only system administrators, department supervisors, or the user themselves can update team assignments.'
      );
    }

    // Find the user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Store old team ID for history management
    const oldTeamId = user.activeTeamId;

    // If assigning to a new team
    if (teamId !== null) {
      // Verify team exists
      const team = await this.teamRepository.findOne({
        where: { id: teamId },
        relations: ['department'],
      });

      if (!team) {
        throw new NotFoundException(`Team with ID ${teamId} not found`);
      }

      // Department supervisor can only assign users to teams in their department
      if (
        currentUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR) &&
        !currentUser.roles.includes(UserRole.SYSTEM_ADMIN)
      ) {
        if (!currentUser.departmentId || team.departmentId !== currentUser.departmentId) {
          throw new ForbiddenException(
            'Department supervisors can only assign users to teams in their own department.'
          );
        }
      }

      // Check if user's department matches team's department
      if (user.departmentId !== team.departmentId) {
        throw new BadRequestException('User must be from the same department as the team.');
      }

      // Check if user has appropriate role for team membership
      if (
        !user.roles.includes(UserRole.TEAM_MEMBER) &&
        !user.roles.includes(UserRole.DEPARTMENT_SUPERVISOR)
      ) {
        throw new BadRequestException(
          'User must have TEAM_MEMBER or DEPARTMENT_SUPERVISOR role to be assigned to a team.'
        );
      }
    }

    // Use queryRunner for transaction to ensure data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // End previous team membership if exists and different
      if (oldTeamId && oldTeamId !== teamId) {
        await queryRunner.manager.update(
          TeamMembershipHistory,
          {
            userId,
            teamId: oldTeamId,
            leftAt: null,
          },
          { leftAt: new Date() }
        );
      }

      // Create new team membership history if joining a team
      if (teamId !== null && teamId !== oldTeamId) {
        const membershipHistory = queryRunner.manager.create(TeamMembershipHistory, {
          userId,
          teamId,
          joinedAt: new Date(),
        });
        await queryRunner.manager.save(membershipHistory);
      }

      // Update user's active team
      user.activeTeamId = teamId;
      const updatedUser = await queryRunner.manager.save(User, user);

      // Commit transaction
      await queryRunner.commitTransaction();

      return updatedUser;
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error as Error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async getUserTeamHistory(
    userId: number,
    currentUser: JwtPayload
  ): Promise<TeamMembershipHistory[]> {
    // Authorization: Users can view their own history, supervisors can view their department users, admins can view all
    const targetUser = await this.userRepository.findById(userId);
    if (!targetUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check authorization
    const canView =
      currentUser.sub === userId || // Own history
      currentUser.roles.includes(UserRole.SYSTEM_ADMIN) || // System admin
      (currentUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR) &&
        currentUser.departmentId === targetUser.departmentId); // Same department supervisor

    if (!canView) {
      throw new ForbiddenException("You do not have permission to view this user's team history.");
    }

    // Get team membership history with team details
    return await this.teamMembershipHistoryRepository.find({
      where: { userId },
      relations: ['team', 'team.department'],
      order: { joinedAt: 'DESC' },
    });
  }

  toUserProfile(user: User): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
      departmentId: user.departmentId,
      isEmailVerified: user.isEmailVerified || false,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      lastLoginAt: user.lastLoginAt,
      activeTeamId: user.activeTeamId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
