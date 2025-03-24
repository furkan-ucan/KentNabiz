import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User, UserRole } from '../entities/user.entity';

export class UserProfileDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  id: number;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  fullName: string;

  @ApiPropertyOptional({ example: '+905551234567', description: 'Phone number' })
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Avatar image URL' })
  avatar?: string;

  @ApiProperty({
    enum: UserRole,
    isArray: true,
    example: [UserRole.USER],
    description: 'User roles',
  })
  roles: UserRole[];

  @ApiProperty({ example: true, description: 'Email verification status' })
  isEmailVerified: boolean;

  @ApiPropertyOptional({ description: 'Last login timestamp' })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Account last update date' })
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
