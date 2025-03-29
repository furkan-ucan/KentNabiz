import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEnum,
  ValidateNested,
  IsOptional,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MunicipalityDepartment, ReportType } from '../interfaces/report.interface';
import { LocationDto } from './location.dto';

export class CreateReportMediaDto {
  @ApiProperty({
    description: 'URL to the media file',
    example: 'https://storage.example.com/reports/image123.jpg',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  url: string;

  @ApiProperty({
    description: 'Type of media (image, video, etc.)',
    example: 'image/jpeg',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type: string;
}

export class CreateReportDto {
  @ApiProperty({
    description: 'Title of the report',
    example: 'Broken sidewalk on Main Street',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Detailed description of the issue',
    example: 'The sidewalk has a large crack that is a tripping hazard.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Location of the issue',
    type: LocationDto,
  })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({
    description: 'Street address or description of the location',
    example: '123 Main Street, Near City Hall',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;

  @ApiProperty({
    description: 'Type of the report (eski kategori sistemi)',
    enum: ReportType,
    example: ReportType.POTHOLE,
  })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({
    description: 'Kategori ID (yeni kategori sistemi)',
    example: 12,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiProperty({
    description: 'Municipal department responsible for the issue',
    enum: MunicipalityDepartment,
    example: MunicipalityDepartment.ROADS,
    required: false,
  })
  @IsEnum(MunicipalityDepartment)
  @IsOptional()
  department?: MunicipalityDepartment;

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
