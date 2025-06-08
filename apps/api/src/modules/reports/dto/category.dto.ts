import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  Max,
  Length,
  Matches,
  ValidateNested,
  IsArray,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { MunicipalityDepartment } from '@kentnabiz/shared';

export class CategoryDto {
  @ApiProperty({ description: 'Kategori adı', example: 'Ulaşım İhbar' })
  @IsString()
  @Length(2, 100)
  name!: string;

  @ApiProperty({ description: 'Kategori kodu (benzersiz)', example: 'TRANSPORT' })
  @IsString()
  @Length(2, 50)
  @Matches(/^[A-Z0-9_]+$/, { message: 'Kod sadece büyük harf, rakam ve alt çizgi içerebilir' })
  code!: string;

  @ApiPropertyOptional({
    description: 'Kategori açıklaması',
    example: 'Toplu taşıma ve ulaşım ile ilgili ihbarlar',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Kategori ikonu (Font Awesome)', example: 'fa-bus' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'Üst kategori ID (ana kategori için null)', example: 1 })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiPropertyOptional({ description: 'Kategori aktif mi?', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Sıralama', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  sortOrder?: number;
}

export class UpdateCategoryDto extends PartialType(OmitType(CategoryDto, ['code'] as const)) {}

export class CategoryResponseDto extends CategoryDto {
  @ApiProperty({ description: 'Kategori ID', example: 1 })
  id!: number;
}

export class CategoryChildDto {
  @ApiProperty({ description: 'Kategori ID', example: 5 })
  id!: number;

  @ApiProperty({ description: 'Kategori adı', example: 'Otobüs' })
  name!: string;

  @ApiProperty({ description: 'Kategori kodu', example: 'TRANSPORT_BUS' })
  code!: string;

  @ApiPropertyOptional({ description: 'Kategori açıklaması' })
  description?: string;

  @ApiPropertyOptional({ description: 'Kategori ikonu' })
  icon?: string;

  @ApiPropertyOptional({ description: 'Kategori aktif mi?' })
  isActive?: boolean;
}

export class CategoryTreeDto {
  @ApiProperty({ description: 'Kategori ID', example: 1 })
  id!: number;

  @ApiProperty({ description: 'Kategori adı', example: 'Ulaşım İhbar' })
  name!: string;

  @ApiProperty({ description: 'Kategori kodu', example: 'TRANSPORT' })
  code!: string;

  @ApiPropertyOptional({ description: 'Kategori açıklaması' })
  description?: string;

  @ApiPropertyOptional({ description: 'Kategori ikonu' })
  icon?: string;

  @ApiProperty({ description: 'Alt kategoriler', type: [CategoryChildDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryChildDto)
  children!: CategoryChildDto[];
}

// Birim değişikliği takibi için yeni DTO
export class DepartmentChangeDto {
  @ApiProperty({
    description: 'Yeni atanan birim',
    enum: MunicipalityDepartment,
    example: MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE,
  })
  @IsEnum(MunicipalityDepartment)
  @IsNotEmpty()
  newDepartment!: MunicipalityDepartment;

  @ApiProperty({
    description: 'Birim değişiklik nedeni',
    example: 'Bu sorun altyapı değil, yol problemidir.',
  })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

// Departman değişiklik geçmişi yanıt DTO
export class DepartmentHistoryResponseDto {
  @ApiProperty({ description: 'Geçmiş kaydı ID', example: 1 })
  id!: number;

  @ApiProperty({ description: 'Rapor ID', example: 123 })
  reportId!: number;

  @ApiProperty({
    description: 'Eski birim',
    enum: MunicipalityDepartment,
    example: MunicipalityDepartment.PLANNING_URBANIZATION,
  })
  oldDepartment!: MunicipalityDepartment;

  @ApiProperty({
    description: 'Yeni birim',
    enum: MunicipalityDepartment,
    example: MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE,
  })
  newDepartment!: MunicipalityDepartment;

  @ApiProperty({
    description: 'Değişiklik nedeni',
    example: 'Bu sorun altyapı değil, yol problemidir.',
  })
  reason!: string;

  @ApiProperty({ description: 'Değişikliği yapan kullanıcı ID', example: 42 })
  changedByUserId!: number;

  @ApiProperty({ description: 'Değişiklik tarihi', example: '2025-03-29T12:00:00Z' })
  createdAt!: Date;
}
