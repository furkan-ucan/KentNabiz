// apps/api/src/modules/reports/dto/update-report.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsEnum,
  ValidateNested,
  IsArray,
  IsInt, // departmentId için eklenebilir
  // Min, // Removed unused import
} from 'class-validator';
import { Type } from 'class-transformer';
// Doğru import yolu
import { ReportType } from '@KentNabiz/shared';
import { LocationDto } from './location.dto';
import { CreateReportMediaDto } from './create-report.dto'; // Bu DTO'nun da var olduğundan emin olun
// import { PointDto } from './point.dto'; // Removed unused import

export class UpdateReportDto {
  @ApiPropertyOptional({ description: 'New title for the report' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({ description: 'New description for the report' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'New location for the report' })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @ApiPropertyOptional({ enum: ReportType, description: 'New type of the report' })
  @IsOptional()
  @IsEnum(ReportType)
  reportType?: ReportType;

  @ApiPropertyOptional({ description: 'New category ID for the report' })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Street address or description of the location',
    example: '123 Main Street, Near City Hall',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;

  // reportMedias alanı CreateReportDto'da da var, update sırasında nasıl ele alınacak?
  // Mevcut medyaları silip yenilerini eklemek mi, yoksa sadece yeni medya eklemek mi?
  // Bu, servisteki mantığa bağlı.
  @ApiPropertyOptional({
    description: 'Media files related to the report (for adding new or replacing existing)',
    type: [CreateReportMediaDto], // CreateReportMediaDto'nun içeriği önemli
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReportMediaDto)
  reportMedias?: CreateReportMediaDto[]; // Bu DTO, Media entity'sine benzer alanlar içermeli (örn: file, type)
}
