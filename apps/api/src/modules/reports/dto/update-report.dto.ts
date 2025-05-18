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
  Min, // departmentId için eklenebilir
} from 'class-validator';
import { Type } from 'class-transformer';
// Doğru import yolu
import { ReportType, ReportStatus } from '@KentNabiz/shared';
import { LocationDto } from './location.dto';
import { CreateReportMediaDto } from './create-report.dto'; // Bu DTO'nun da var olduğundan emin olun

export class UpdateReportDto {
  @ApiPropertyOptional({
    description: 'Title of the report',
    example: 'Updated: Broken sidewalk on Main Street',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the issue',
    example: 'Updated description with more details.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Location of the issue',
    type: LocationDto, // LocationDto'nun doğru tanımlandığından emin olun
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @ApiPropertyOptional({
    description: 'Street address or description of the location',
    example: '123 Main Street, Near City Hall',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({
    description: 'Type of the report',
    enum: ReportType,
    example: ReportType.POTHOLE, // Bu enum değeri @KentNabiz/shared'deki ile aynı olmalı
  })
  @IsEnum(ReportType)
  @IsOptional()
  reportType?: ReportType; // 'type' -> 'reportType' olarak değiştirmek iyi bir pratik olabilir (keyword çakışması için)

  @ApiPropertyOptional({
    description: 'Status of the report',
    enum: ReportStatus,
    example: ReportStatus.UNDER_REVIEW, // ReportStatus.IN_PROGRESS -> ReportStatus.UNDER_REVIEW (veya uygun yeni bir durum)
  })
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;

  // Rapor güncellenirken departman da değiştirilebilmeli.
  // Bu 'department' alanı yerine 'currentDepartmentId' kullanmak daha tutarlı olur (Report entity'si gibi).
  @ApiPropertyOptional({
    description: 'ID of the municipality department responsible for the issue',
    example: 1, // Örneğin Roads departmanının ID'si
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  currentDepartmentId?: number; // 'department' enum'u yerine ID

  // Bu alan DepartmentHistory'ye taşındığı için DTO'dan çıkarılabilir.
  // Departman değişikliği ayrı bir endpoint/servis metodu ile yönetilebilir.
  /*
  @ApiPropertyOptional({
    description: 'Reason for changing the department (if applicable)',
    example: 'This is a water supply issue, not a road maintenance problem',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  departmentChangeReason?: string;
  */

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
