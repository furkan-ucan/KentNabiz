import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, MaxLength, IsNotEmpty, IsIn } from 'class-validator';
import { SUB_STATUS, SubStatus } from '../constants/report.constants';
import { ReportStatus } from '@kentnabiz/shared';

export class UpdateReportStatusDto {
  @ApiProperty({ enum: ReportStatus, example: ReportStatus.IN_REVIEW })
  @IsEnum(ReportStatus)
  @IsNotEmpty()
  newStatus!: ReportStatus;

  @ApiPropertyOptional({ description: 'Reason for rejection (required if newStatus is REJECTED)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;

  @ApiPropertyOptional({ description: 'Notes for resolution (optional if newStatus is RESOLVED)' })
  @IsOptional()
  @IsString()
  resolutionNotes?: string;

  @ApiPropertyOptional({ description: 'General notes for status change' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsIn(Object.values(SUB_STATUS).filter(x => typeof x === 'string'))
  subStatus?: SubStatus;
}
