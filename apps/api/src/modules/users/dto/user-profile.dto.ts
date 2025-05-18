// apps/api/src/modules/users/dto/user-profile.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../entities/user.entity'; // User entity'si import ediliyor
// Doğru import yolu. Eğer @KentNabiz/shared çalışıyorsa bu kalabilir.
import { UserRole } from '@KentNabiz/shared';
import { Department } from '../../reports/entities/department.entity'; // Department entity'si için import eklendi

export class UserProfileDto {
  @ApiProperty({ example: 1, description: 'Unique identifier of the user' })
  id!: number;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address of the user' })
  email!: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  fullName!: string;

  @ApiPropertyOptional({ example: '+905551234567', description: 'Phone number of the user' })
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'URL of the user avatar image' })
  avatar?: string;

  @ApiProperty({
    description: "User's roles",
    enum: UserRole,
    isArray: true,
    example: [UserRole.CITIZEN], // UserRole.USER -> UserRole.CITIZEN olarak güncellendi
  })
  roles!: UserRole[];

  @ApiProperty({ example: true, description: 'Indicates if the user email has been verified' })
  isEmailVerified!: boolean;

  @ApiPropertyOptional({ description: 'Timestamp of the last login' })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'Date and time when the user account was created' })
  createdAt!: Date;

  @ApiProperty({ description: 'Date and time when the user account was last updated' })
  updatedAt!: Date;

  // Kullanıcı bir departmana bağlıysa (DEPARTMAN_CALISANI, DEPARTMAN_SORUMLUSU)
  // bu bilgiyi de profile eklemek faydalı olabilir.
  @ApiPropertyOptional({
    example: 1,
    description: 'ID of the department the user is associated with, if any',
    nullable: true,
  })
  departmentId?: number | null;

  @ApiPropertyOptional({
    example: 'Fen İşleri',
    description: 'Name of the department the user is associated with, if any',
  })
  departmentName?: string; // Bu, Department entity'sinden alınabilir

  // Constructor, User entity'sinden UserProfileDto oluşturmak için kullanılıyor.
  // departmentName'i de burada atamak gerekebilir.
  constructor(userEntity: Partial<User & { department?: Partial<Department> }>) {
    // Object.assign(this, partial); // Eski hali
    this.id = userEntity.id!;
    this.email = userEntity.email!;
    this.fullName = userEntity.fullName!;
    this.phoneNumber = userEntity.phoneNumber;
    this.avatar = userEntity.avatar;
    this.roles = userEntity.roles!;
    this.isEmailVerified = userEntity.isEmailVerified!;
    this.lastLoginAt = userEntity.lastLoginAt;
    this.createdAt = userEntity.createdAt!;
    this.updatedAt = userEntity.updatedAt!;
    this.departmentId = userEntity.departmentId ?? null;
    // Eğer User entity'si Department entity'si ile eager/lazy loaded ise departmentName'i alabiliriz.
    // Ya da UsersService bu DTO'yu oluştururken departmentName'i ayrıca ekleyebilir.
    this.departmentName = userEntity.department?.name;
  }
}
