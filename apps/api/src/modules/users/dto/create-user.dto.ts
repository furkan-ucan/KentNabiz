// apps/api/src/modules/users/dto/create-user.dto.ts
import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  IsArray,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@KentNabiz/shared';

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address of the user' })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email!: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsString()
  @MinLength(3, { message: 'Full name must be at least 3 characters long.' })
  fullName!: string;

  @ApiProperty({ example: 'password123', description: 'User password (min 8 characters)' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password!: string;

  @ApiPropertyOptional({ example: '+905551234567', description: 'Phone number of the user' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'URL of the user avatar image' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({
    description: "User's roles. If not provided, defaults to CITIZEN by entity.",
    enum: UserRole,
    isArray: true,
  })
  @IsOptional()
  @IsArray({ message: 'Roles must be an array.' })
  @IsEnum(UserRole, { each: true, message: 'Each role must be a valid UserRole enum value.' })
  roles?: UserRole[];

  @ApiPropertyOptional({
    default: false,
    description: 'Indicates if the user email has been verified',
  })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description:
      'Department ID if user is a department employee or supervisor. Required if role is one of these.',
    type: Number,
    nullable: true,
  })
  @IsOptional()
  @IsInt({ message: 'Department ID must be an integer.' })
  @Min(1, { message: 'Department ID must be a positive integer.' })
  departmentId?: number | null;
}
