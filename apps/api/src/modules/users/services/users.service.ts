// apps/api/src/modules/users/services/users.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity'; // Bu User entity'si güncellenmiş olmalı
import { UserProfileDto } from '../dto/user-profile.dto';
import { UserRole } from '@KentNabiz/shared'; // UserRole import eklendi

// TODO: cover edge cases in user service logic - coverage: 70.73%

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll(): Promise<UserProfileDto[]> {
    const users = await this.userRepository.findAllWithRelations(['department']);
    // UserProfileDto'nun User entity'sindeki UserRole[] ile uyumlu olduğundan emin olun.
    return users.map((user: User) => new UserProfileDto(user));
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

    // Eğer rol DEPARTMENT_EMPLOYEE veya DEPARTMENT_SUPERVISOR ise
    // ve departmentId gönderilmemişse, burada bir BadRequestException fırlatılabilir.
    if (
      (createUserDto.roles?.includes(UserRole.DEPARTMENT_EMPLOYEE) ||
        createUserDto.roles?.includes(UserRole.DEPARTMENT_SUPERVISOR)) &&
      (createUserDto.departmentId === undefined || createUserDto.departmentId === null)
    ) {
      throw new BadRequestException(
        'Department ID is required for DEPARTMENT_EMPLOYEE or DEPARTMENT_SUPERVISOR roles.'
      );
    }
    // İsteğe bağlı: departmentId gönderilmişse, bu ID'ye sahip bir departmanın var olup olmadığını kontrol et.
    // Bu kontrol DepartmentService veya benzeri bir servis üzerinden yapılabilir.
    // Örnek: if (createUserDto.departmentId) { await this.departmentService.findOne(createUserDto.departmentId); }

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

    // updateUserDto'da roller veya departmanId varsa, bunların atanması için
    // özel yetki kontrolü (örneğin sadece SYSTEM_ADMIN yapabilir) gerekebilir.
    // Bu mantık burada veya controller'da eklenebilir.
    // Şimdilik doğrudan update yapıyoruz.
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

    // User entity'sindeki @BeforeUpdate hook'u şifreyi hashleyecektir.
    // Bu yüzden direkt user.password = newPassword ve save yapmak yerine,
    // DTO ile sadece password'ü göndermek daha temiz olabilir.
    // Ancak user.password'ü güncelleyip user'ı save etmek de hashlemeyi tetikler.
    // Şimdilik userRepository.update çağrısı doğru.
    user.password = newPassword; // Entity @BeforeUpdate hook'u hashlemeli
    await this.userRepository.save(user); // UserRepository.save kullanılıyor
  }

  // Rol ve Departman Atama Metodları (SYSTEM_ADMIN için) - YENİ EKLENDİ
  async updateUserRoles(userId: number, roles: UserRole[]): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    user.roles = roles;
    await this.userRepository.save(user);

    // Save sonrası entity ilişkilerle birlikte gelmeyebilir, bu yüzden tekrar çekiyoruz.
    const updatedUserWithRelations = await this.userRepository.findByIdWithRelations(userId, [
      'department',
    ]);
    if (!updatedUserWithRelations) {
      // Bu durum normalde oluşmamalı, save başarılı olduysa kullanıcı bulunmalı.
      throw new NotFoundException(
        `User with ID ${userId} could not be refetched after role update.`
      );
    }
    return updatedUserWithRelations;
  }

  async assignDepartmentToUser(userId: number, departmentId: number | null): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    // User entity'sinde departmentId: number | null | undefined olabilir.
    // departmentId null ise, null olarak atanır. undefined ise tanımsız kalır.
    // TypeORM genellikle null değerleri doğru yönetir.
    user.departmentId = departmentId;
    await this.userRepository.save(user);

    // Save sonrası entity ilişkilerle birlikte gelmeyebilir, bu yüzden tekrar çekiyoruz.
    const updatedUserWithRelations = await this.userRepository.findByIdWithRelations(userId, [
      'department',
    ]);
    if (!updatedUserWithRelations) {
      // Bu durum normalde oluşmamalı.
      throw new NotFoundException(
        `User with ID ${userId} could not be refetched after department assignment.`
      );
    }
    return updatedUserWithRelations;
  }

  async findEmployeeInDepartment(employeeId: number, departmentId: number): Promise<User | null> {
    const user = await this.userRepository.findByIdWithRelations(employeeId, ['department']);
    if (!user) return null;
    if (user.departmentId === departmentId && user.roles.includes(UserRole.DEPARTMENT_EMPLOYEE)) {
      return user;
    }
    return null;
  }
}
