// apps/api/src/modules/users/dto/create-user.dto.ts
import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  IsArray,
  IsEnum,
  IsBoolean,
  // ArrayNotEmpty, // Eğer rollerin boş bir array olmaması gerekiyorsa eklenebilir
  // IsIn, // Eğer rolleri daha sıkı kontrol etmek isterseniz
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// Doğru import yolu. Eğer @KentNabiz/shared çalışıyorsa bu kalabilir.
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
  @IsString() // Burada daha spesifik bir telefon numarası validasyonu da eklenebilir (örn: IsPhoneNumber)
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'URL of the user avatar image' })
  @IsOptional()
  @IsString() // Belki IsUrl() validasyonu daha uygun olabilir
  avatar?: string;

  @ApiPropertyOptional({
    description: "User's roles. If not provided, defaults to CITIZEN.",
    enum: UserRole,
    isArray: true,
    // DTO seviyesinde default değer belirtmek yerine, bu mantığı
    // genellikle servis veya repository katmanında (veya entity default'u ile) halletmek daha yaygındır.
    // Eğer burada default kalacaksa, yeni enum değerini kullanmalı:
    default: [UserRole.CITIZEN], // UserRole.USER -> UserRole.CITIZEN olarak güncellendi
  })
  @IsOptional()
  @IsArray({ message: 'Roles must be an array.' })
  // IsEnum her bir array elemanının UserRole enum değerlerinden biri olduğunu doğrular.
  @IsEnum(UserRole, { each: true, message: 'Each role must be a valid UserRole enum value.' })
  // Eğer rollerin boş olmaması gerekiyorsa:
  // @ArrayNotEmpty({ message: 'Roles array cannot be empty if provided.' })
  roles?: UserRole[];

  @ApiPropertyOptional({
    default: false,
    description: 'Indicates if the user email has been verified',
  })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  // Yeni rollerimizle (DEPARTMAN_CALISANI, DEPARTMAN_SORUMLUSU) bir kullanıcı oluşturulurken
  // departmentId'nin de DTO'da olması gerekebilir.
  // Bu, özellikle SYSTEM_ADMIN tarafından bu rollerde kullanıcı oluşturuluyorsa önemlidir.
  // Şimdilik eklemiyorum, çünkü bu DTO genel kullanıcı kaydı (vatandaş) için de kullanılabilir.
  // İhtiyaç halinde eklenebilir:
  // @ApiPropertyOptional({ example: 1, description: 'Department ID if user is a department employee or supervisor' })
  // @IsOptional()
  // @IsInt()
  // @Min(1)
  // departmentId?: number;
}
