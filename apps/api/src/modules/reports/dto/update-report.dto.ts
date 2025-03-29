import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsEnum, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { MunicipalityDepartment, ReportType, ReportStatus } from '../interfaces/report.interface';
import { LocationDto } from './location.dto';
import { CreateReportMediaDto } from './create-report.dto';

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
    type: LocationDto,
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
    example: ReportType.POTHOLE,
  })
  @IsEnum(ReportType)
  @IsOptional()
  type?: ReportType;

  @ApiPropertyOptional({
    description: 'Status of the report',
    enum: ReportStatus,
    example: ReportStatus.IN_PROGRESS,
  })
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;

  @ApiPropertyOptional({
    description: 'Municipality department responsible for the issue',
    enum: MunicipalityDepartment,
    example: MunicipalityDepartment.ROADS,
  })
  @IsEnum(MunicipalityDepartment)
  @IsOptional()
  department?: MunicipalityDepartment;

  @ApiPropertyOptional({
    description: 'Reason for changing the department (if applicable)',
    example: 'This is a water supply issue, not a road maintenance problem',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  departmentChangeReason?: string;

  @ApiPropertyOptional({
    description: 'Media files related to the report',
    type: [CreateReportMediaDto],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReportMediaDto)
  reportMedias?: CreateReportMediaDto[];
}
