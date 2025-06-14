import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportStatus, ReportType, MunicipalityDepartment } from '@kentnabiz/shared';

export class QueryReportsDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by report type',
    enum: ReportType,
    example: ReportType.POTHOLE,
  })
  @IsOptional()
  @IsEnum(ReportType)
  reportType?: ReportType;

  @ApiPropertyOptional({
    description: 'Filter by report status',
    enum: ReportStatus,
    example: ReportStatus.OPEN,
  })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({
    description: 'Filter by department code',
    enum: MunicipalityDepartment,
    example: MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE,
  })
  @IsOptional()
  @IsEnum(MunicipalityDepartment)
  departmentCode?: MunicipalityDepartment;

  @ApiPropertyOptional({
    description: 'Spatial bounding box filter in format: minLng,minLat,maxLng,maxLat',
    example: '28.9,41.0,29.1,41.1',
    type: String,
  })
  @IsOptional()
  bbox?: string;
}
