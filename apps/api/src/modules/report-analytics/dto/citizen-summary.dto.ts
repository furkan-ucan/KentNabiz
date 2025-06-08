import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for citizen summary statistics response
 * Used in /api/report-analytics/citizen-summary endpoint
 */
export class CitizenSummaryDto {
  @ApiProperty({
    description: 'Total number of resolved reports across all time',
    example: 1528,
  })
  totalReportsResolvedAllTime!: number;

  @ApiProperty({
    description: 'Number of reports resolved in the current month',
    example: 74,
  })
  reportsResolvedThisMonth!: number;

  @ApiProperty({
    description: 'Number of active citizen contributors who have submitted at least one report',
    example: 612,
  })
  activeCitizenContributors!: number;

  @ApiProperty({
    description: 'Average resolution time in days',
    example: 5.2,
    required: false,
  })
  averageResolutionTimeDays?: number | null;

  @ApiProperty({
    description: 'Number of pending/open reports',
    example: 126,
    required: false,
  })
  pendingReportsCount?: number | null;
}
