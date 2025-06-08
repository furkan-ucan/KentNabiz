import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TeamStatus } from '@kentnabiz/shared';

export class QueryTeamsDto {
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
    description: 'Filter by team status',
    enum: TeamStatus,
    example: TeamStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(TeamStatus)
  status?: TeamStatus;

  @ApiPropertyOptional({
    description: 'Filter by department ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  departmentId?: number;
}

export class FindNearbyTeamsDto {
  @ApiPropertyOptional({
    description: 'Latitude coordinate',
    example: 41.0082,
    minimum: -90,
    maximum: 90,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @ApiPropertyOptional({
    description: 'Longitude coordinate',
    example: 28.9784,
    minimum: -180,
    maximum: 180,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;

  @ApiPropertyOptional({
    description: 'Filter by specialization ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  specializationId?: number;
}
