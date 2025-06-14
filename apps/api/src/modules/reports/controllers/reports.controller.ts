import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Req,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
// HATA ÇÖZÜMÜ: Kullanılmayan ApiParam ve ApiQuery kaldırıldı.
import { ReportsService } from '../services/reports.service';
import { DepartmentService } from '../services/department.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportStatusDto } from '../dto/update-report-status.dto';
import { CompleteWorkDto } from '../dto/complete-work.dto';
import { ForwardReportDto } from '../dto/forward-report.dto';
import { ApproveReportDto } from '../dto/approve-report.dto';
import { RejectReportDto } from '../dto/reject-report.dto';
import { ReportStatus, UserRole } from '@kentnabiz/shared';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequestWithUser } from '../../auth/interfaces/jwt-payload.interface';
import { Report } from '../entities/report.entity';
import { Team } from '../../teams/entities/team.entity';
import { Department } from '../entities/department.entity';
// HATA ÇÖZÜMÜ: Arayüz adı IReportFindOptions olarak düzeltildi.
import { IReport, IReportFindOptions, ISpatialQueryResult } from '../interfaces/report.interface';
import { CheckPolicies, PoliciesGuard } from '../../../core/guards/policies.guard';
import { AppAbility, Action } from '../../../core/authorization/ability.factory';
import { PaginatedResponse } from '../../../common/dto/paginated-response.dto';
import { RadiusSearchDto } from '../dto/location.dto';
// HATA ÇÖZÜMÜ: Kullanılmayan importlar kaldırıldı.

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly departmentService: DepartmentService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all reports (role-based)' })
  @Roles(UserRole.SYSTEM_ADMIN, UserRole.DEPARTMENT_SUPERVISOR, UserRole.TEAM_MEMBER)
  findAll(
    @Req() req: RequestWithUser,
    @Query() options: Omit<IReportFindOptions, 'page' | 'limit' | 'userId'>,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ): Promise<PaginatedResponse<IReport>> {
    return this.reportsService.findAll(req.user, {
      ...options,
      page,
      limit,
    });
  }

  @Get('my-reports')
  @ApiOperation({ summary: "Get current user's reports" })
  @Roles(UserRole.CITIZEN, UserRole.TEAM_MEMBER)
  async getMyReports(
    @Req() req: RequestWithUser,
    @Query() options: Omit<IReportFindOptions, 'page' | 'limit' | 'userId'>,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') statusParam?: string
  ): Promise<PaginatedResponse<IReport>> {
    // Status parametresini parse et
    let parsedStatus: ReportStatus | ReportStatus[] | undefined;
    if (statusParam) {
      if (statusParam.includes(',')) {
        // Virgülle ayrılmış değerleri dizi olarak parse et
        parsedStatus = statusParam.split(',') as ReportStatus[];
      } else {
        // Tek değer olarak parse et
        parsedStatus = statusParam as ReportStatus;
      }
    }

    const result = await this.reportsService.getReportsByUser(req.user, {
      ...options,
      status: parsedStatus,
      page,
      limit,
    });

    // ISpatialQueryResult'ı PaginatedResponse'a dönüştür
    return new PaginatedResponse(result.data, result.total, result.page, result.limit);
  }

  @Get('status-counts')
  @ApiOperation({ summary: "Get report counts by status for the current user's scope" })
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  getStatusCounts(@Req() req: RequestWithUser): Promise<Record<ReportStatus | 'total', number>> {
    // HATA ÇÖZÜMÜ: Bu metot ReportsService'te hala mevcut.
    return this.reportsService.getStatusCounts(req.user);
  }

  @Get('departments')
  @ApiOperation({
    summary: 'Get all active departments',
    description: 'Returns list of all active departments for report creation',
  })
  @Roles(
    UserRole.CITIZEN,
    UserRole.TEAM_MEMBER,
    UserRole.DEPARTMENT_SUPERVISOR,
    UserRole.SYSTEM_ADMIN
  )
  @ApiResponse({ status: 200, description: 'List of active departments', type: [Department] })
  getDepartments(): Promise<Department[]> {
    return this.departmentService.findAll();
  }

  @Get('nearby')
  @ApiOperation({
    summary: 'Find nearby reports within a radius',
    description: 'Returns reports within a specified radius from a given location',
  })
  @Roles(
    UserRole.CITIZEN,
    UserRole.TEAM_MEMBER,
    UserRole.DEPARTMENT_SUPERVISOR,
    UserRole.SYSTEM_ADMIN
  )
  @ApiResponse({ status: 200, description: 'List of nearby reports with pagination info' })
  async findNearby(
    @Query() searchDto: RadiusSearchDto,
    @Req() req: RequestWithUser
  ): Promise<ISpatialQueryResult> {
    const userId = (req.user as { id?: number }).id;
    const options: IReportFindOptions = {
      page: searchDto.page || 1,
      limit: searchDto.limit || 10,
      currentUserId: userId,
    };
    return this.reportsService.findNearby(searchDto, options);
  }

  @Get(':id/suggested-teams')
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get suggested teams for a report' })
  getSuggestedTeams(@Param('id', ParseIntPipe) id: number): Promise<Team[]> {
    return this.reportsService.getSuggestedTeams(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a report by ID' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser): Promise<Report> {
    return this.reportsService.findOne(id, req.user);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new report' })
  @Roles(UserRole.CITIZEN)
  create(@Body() createReportDto: CreateReportDto, @Req() req: RequestWithUser): Promise<Report> {
    return this.reportsService.create(createReportDto, req.user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update report status' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateReportStatusDto,
    @Req() req: RequestWithUser
  ): Promise<Report> {
    return this.reportsService.updateStatus(id, updateStatusDto, req.user);
  }

  @Patch(':id/assign-team/:teamId')
  @ApiOperation({ summary: 'Assign a report to a team' })
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  assignToTeam(
    @Param('id', ParseIntPipe) id: number,
    @Param('teamId', ParseIntPipe) teamId: number,
    @Req() req: RequestWithUser
  ): Promise<Report> {
    return this.reportsService.assignToTeam(id, teamId, req.user);
  }

  @Patch(':id/assign-user/:userId')
  @ApiOperation({ summary: 'Assign report to a specific user' })
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  assignToUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: RequestWithUser
  ): Promise<Report> {
    return this.reportsService.assignToUser(id, userId, req.user);
  }

  @Patch(':id/forward')
  @ApiOperation({ summary: 'Forward a report to another department' })
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  forwardReport(
    @Param('id', ParseIntPipe) id: number,
    @Body() forwardReportDto: ForwardReportDto,
    @Req() req: RequestWithUser
  ): Promise<{ success: boolean; message: string; reportId: number }> {
    return this.reportsService.forwardReport(id, forwardReportDto, req.user);
  }

  @Patch(':id/complete-work')
  @ApiOperation({ summary: 'Complete work on a report with proof' })
  @UseGuards(PoliciesGuard)
  // HATA ÇÖZÜMÜ: (subject as Report) ile doğru tip dönüşümü yapıldı.
  @CheckPolicies((ability: AppAbility, subject) =>
    ability.can(Action.CompleteWork, subject as Report)
  )
  completeWork(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
    @Body() completeWorkDto: CompleteWorkDto
  ): Promise<Report> {
    return this.reportsService.completeWork(id, completeWorkDto, req.user);
  }

  @Post(':id/support')
  @ApiOperation({ summary: 'Support a report' })
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility, subject) => ability.can(Action.Support, subject as Report))
  supportReport(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser
  ): Promise<Report> {
    return this.reportsService.addSupport(id, req.user);
  }

  @Delete(':id/support')
  @ApiOperation({ summary: 'Remove support from a report' })
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility, subject) => ability.can(Action.Unsupport, subject as Report))
  unsupportReport(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser
  ): Promise<Report> {
    return this.reportsService.removeSupport(id, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a report' })
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility, subject) => ability.can(Action.Delete, subject as Report))
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser): Promise<void> {
    // HATA ÇÖZÜMÜ: `remove` metodu ReportsService'te hala mevcut.
    return this.reportsService.remove(id, req.user);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a completed report (DEPARTMENT_SUPERVISOR)' })
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({ status: 200, description: 'Report approved successfully', type: Report })
  @ApiResponse({ status: 400, description: 'Bad Request - Report not in pending approval state' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async approveReport(
    @Param('id', ParseIntPipe) id: number,
    @Body() approveDto: ApproveReportDto,
    @Req() req: RequestWithUser
  ): Promise<Report> {
    return this.reportsService.approveReport(id, approveDto.notes, req.user);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a report with reason (DEPARTMENT_SUPERVISOR)' })
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({ status: 200, description: 'Report rejected successfully', type: Report })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid report state or missing reason' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async rejectReport(
    @Param('id', ParseIntPipe) id: number,
    @Body() rejectDto: RejectReportDto,
    @Req() req: RequestWithUser
  ): Promise<Report> {
    return this.reportsService.rejectReport(id, rejectDto.reason, req.user);
  }
}
