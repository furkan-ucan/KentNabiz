import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';
import { ReportStatus } from '@KentNabiz/shared';

export class UpdateReportStatusDto {
  @ApiProperty({ enum: ReportStatus, example: ReportStatus.UNDER_REVIEW })
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
}
