import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEnum,
  ValidateNested,
  IsOptional,
  IsArray,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MunicipalityDepartment, ReportType } from '@kentnabiz/shared';
import { LocationDto } from './location.dto';

export class CreateReportMediaDto {
  @ApiProperty({
    description: 'URL to the media file',
    example: 'https://storage.example.com/reports/image123.jpg',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  url!: string;

  @ApiProperty({
    description: 'Type of media (image, video, etc.)',
    example: 'image/jpeg',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type!: string;
}

export class CreateReportDto {
  @ApiProperty({
    description: 'Title of the report',
    example: 'Broken sidewalk on Main Street',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title!: string;

  @ApiProperty({
    description: 'Detailed description of the issue',
    example: 'The sidewalk has a large crack that is a tripping hazard.',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: 'Location of the issue',
    type: LocationDto,
  })
  @ValidateNested()
  @Type(() => LocationDto)
  location!: LocationDto;

  @ApiProperty({
    description: 'Street address or description of the location',
    example: '123 Main Street, Near City Hall',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address!: string;

  @ApiProperty({
    description: 'Ana departman/konu seçimi (ZORUNLU)',
    enum: MunicipalityDepartment,
    example: MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE,
  })
  @IsNotEmpty()
  @IsEnum(MunicipalityDepartment)
  departmentCode!: MunicipalityDepartment;

  @ApiProperty({
    description: 'Seçilen departmana ait kategori ID (ZORUNLU)',
    example: 12,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  categoryId!: number;

  @ApiPropertyOptional({
    description: 'Rapor tipi (opsiyonel - backend kategori bazında otomatik atayacak)',
    enum: ReportType,
    example: ReportType.POTHOLE,
  })
  @IsOptional()
  @IsEnum(ReportType)
  reportType?: ReportType;

  @ApiProperty({
    description: 'Media files related to the report',
    type: [CreateReportMediaDto],
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReportMediaDto)
  reportMedias?: CreateReportMediaDto[];
}
// TODO: Geriye dönen veriler için ayrı bir ReportResponseDto oluşturulması değerlendirilebilir.
