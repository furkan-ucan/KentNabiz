import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  IsArray,
  IsEnum,
  IsBoolean,
  IsDate,
  IsInt,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@kentnabiz/shared';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'john.doe@example.com', description: 'Email address' })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email' })
  email?: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Full name' })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Full name must be at least 3 characters long' })
  fullName?: string;

  @ApiPropertyOptional({ example: 'password123', description: 'Password' })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;

  @ApiPropertyOptional({ example: '+905551234567', description: 'Phone number' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Avatar image URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    isArray: true,
    description: 'User roles',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles?: UserRole[];

  @ApiPropertyOptional({ description: 'Email verification status' })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiPropertyOptional({ description: 'Last login timestamp' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastLoginAt?: Date;

  @ApiPropertyOptional({
    description:
      'ID of the department to assign the user to. Set to null to remove from department.',
    example: 1,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  departmentId?: number | null;
}
