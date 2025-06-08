import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportAnalyticsService } from '../services/report-analytics.service';
import { CitizenSummaryDto } from '../dto/citizen-summary.dto';

@ApiTags('Report Analytics')
@Controller('report-analytics')
export class ReportAnalyticsController {
  constructor(private readonly reportAnalyticsService: ReportAnalyticsService) {}

  @Get('citizen-summary')
  @ApiOperation({
    summary: 'Get citizen summary statistics',
    description:
      'Returns summary statistics for citizen homepage including total resolved reports, monthly resolved reports, active contributors, average resolution time, and pending reports count.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved citizen summary statistics',
    type: CitizenSummaryDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getCitizenSummary(): Promise<CitizenSummaryDto> {
    return this.reportAnalyticsService.getCitizenSummary();
  }
}
