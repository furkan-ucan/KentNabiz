import { Controller, Get, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import {
  ReportAnalyticsService,
  DashboardStatsResult,
  CountsResponse,
  SummaryStatsResponse,
} from '../services/report-analytics.service';
import { CitizenSummaryDto } from '../dto/citizen-summary.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RequestWithUser } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('Report Analytics')
@Controller('report-analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
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

  @Get('dashboard-stats')
  @ApiOperation({
    summary: 'Get dashboard statistics for citizen',
    description:
      'Returns KPI statistics for citizen dashboard including total reports, pending, resolved, user reports, and average resolution time.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved dashboard statistics',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getDashboardStats(@Req() req: RequestWithUser): Promise<DashboardStatsResult> {
    return this.reportAnalyticsService.getDashboardStats(req.user);
  }

  @Get('counts')
  @ApiOperation({
    summary: 'Get counts for various report conditions',
    description:
      'Returns counts and report IDs for different report states (pending approval, unassigned, overdue, etc.) to support drill-down functionality in analytics dashboard.',
  })
  @ApiQuery({
    name: 'types',
    description: 'Comma-separated list of count types to fetch',
    type: String,
    example: 'PENDING_APPROVAL,UNASSIGNED,OVERDUE',
    required: true,
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date for filtering (ISO 8601 format)',
    type: String,
    example: '2024-01-01',
    required: true,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date for filtering (ISO 8601 format)',
    type: String,
    example: '2024-12-31',
    required: true,
  })
  @ApiQuery({
    name: 'departmentId',
    description: 'Department ID for filtering (admin only)',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'categoryId',
    description: 'Category ID for filtering',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'status',
    description: 'Report status for filtering',
    type: String,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved dashboard counts',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getCounts(
    @Query('types') types: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('departmentId') departmentId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Req() req?: RequestWithUser
  ): Promise<CountsResponse> {
    if (!types || !startDate || !endDate) {
      throw new BadRequestException('types, startDate, and endDate are required');
    }

    const typeArray = types.split(',').map(t => t.trim());
    const filters = {
      startDate,
      endDate,
      departmentId: departmentId ? parseInt(departmentId, 10) : undefined,
      categoryId,
      status,
    };

    return this.reportAnalyticsService.getDashboardCounts(filters, typeArray, req!.user);
  }

  @Get('summary-stats')
  @ApiOperation({
    summary: 'Get summary statistics like averages and rates',
    description:
      'Returns aggregated statistics including average resolution time, intervention time, first response time, resolution rate, and total report count.',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date for filtering (ISO 8601 format)',
    type: String,
    example: '2024-01-01',
    required: true,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date for filtering (ISO 8601 format)',
    type: String,
    example: '2024-12-31',
    required: true,
  })
  @ApiQuery({
    name: 'departmentId',
    description: 'Department ID for filtering (admin only)',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'categoryId',
    description: 'Category ID for filtering',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'status',
    description: 'Report status for filtering',
    type: String,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved summary statistics',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getSummaryStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('departmentId') departmentId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Req() req?: RequestWithUser
  ): Promise<SummaryStatsResponse> {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }

    const filters = {
      startDate,
      endDate,
      departmentId: departmentId ? parseInt(departmentId, 10) : undefined,
      categoryId,
      status,
    };

    return this.reportAnalyticsService.getSummaryStats(filters, req!.user);
  }
}
