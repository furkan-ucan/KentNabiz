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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReportsService } from '../services/reports.service';
import { DepartmentService } from '../services/department.service';
import { TeamsService } from '../../teams/services/teams.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { UpdateReportStatusDto } from '../dto/update-report-status.dto';
import { CompleteWorkDto } from '../dto/complete-work.dto';
import { ForwardReportDto } from '../dto/forward-report.dto';
import { RadiusSearchDto } from '../dto/location.dto';
import { ReportStatus, ReportType, MunicipalityDepartment, UserRole } from '@kentnabiz/shared';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequestWithUser } from '../../auth/interfaces/jwt-payload.interface';
import { Report } from '../entities/report.entity';
import { Department } from '../entities/department.entity';
import { IReport } from '../interfaces/report.interface';
import { DepartmentHistoryResponseDto } from '../dto/department-history.response.dto';
import { CheckPolicies, PoliciesGuard } from '../../../core/guards/policies.guard';
import { AppAbility, Action } from '../../../core/authorization/ability.factory';
import { ReportStatusHistory } from '../entities/report-status-history.entity';
import { PaginatedResponse } from '../../../common/dto/paginated-response.dto';
// import { ResponseDto } from '../../../common/dto/response.dto'; // Removed - using TransformInterceptor instead

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly departmentService: DepartmentService,
    private readonly teamsService: TeamsService
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all reports (role-based)',
    description: 'Returns paginated list of reports based on user role and filters.',
  })
  @Roles(UserRole.SYSTEM_ADMIN, UserRole.DEPARTMENT_SUPERVISOR, UserRole.TEAM_MEMBER)
  @ApiResponse({ status: 200, description: 'Paginated list of reports' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ReportStatus, isArray: true })
  @ApiQuery({ name: 'reportType', required: false, enum: ReportType })
  @ApiQuery({ name: 'departmentCode', required: false, enum: MunicipalityDepartment })
  @ApiQuery({ name: 'departmentId', required: false, type: Number })
  async findAll(
    @Req() req: RequestWithUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: ReportStatus | ReportStatus[],
    @Query('reportType') reportType?: ReportType,
    @Query('departmentCode') departmentCode?: MunicipalityDepartment,
    @Query('departmentId') departmentId?: number
  ): Promise<{ data: IReport[]; total: number; page: number; limit: number }> {
    const paginatedResult = await this.reportsService.findAll(req.user, {
      page,
      limit,
      status,
      reportType,
      departmentCode,
      departmentId,
    });
    return {
      data: paginatedResult.data,
      total: paginatedResult.total,
      page,
      limit,
    };
  }

  @Get('nearby')
  @ApiOperation({
    summary: 'Find reports near a location (role-based)',
  })
  @Roles(
    UserRole.SYSTEM_ADMIN,
    UserRole.DEPARTMENT_SUPERVISOR,
    UserRole.TEAM_MEMBER,
    UserRole.CITIZEN
  )
  @ApiOperation({ summary: 'Find reports within a radius' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'reportType', required: false, enum: ReportType }) // type -> reportType
  @ApiQuery({ name: 'status', required: false, enum: ReportStatus })
  @ApiQuery({ name: 'departmentCode', required: false, enum: MunicipalityDepartment }) // department -> departmentCode
  @ApiResponse({ status: 200, description: 'Paginated list of nearby reports' })
  async findNearby(
    @Req() req: RequestWithUser,
    @Query() searchDto: RadiusSearchDto, // searchDto latitude, longitude, radius ve status içerir
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('reportType') reportType?: ReportType, // type -> reportType
    @Query('departmentCode') departmentCode?: MunicipalityDepartment // department -> departmentCode
  ): Promise<{ data: PaginatedResponse<IReport> }> {
    const paginatedResult = await this.reportsService.findNearby(searchDto, {
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
      reportType,
      departmentCode,
      currentUserId: req.user.sub, // Mevcut kullanıcının ID'sini ekle
    });
    return {
      data: new PaginatedResponse(
        paginatedResult.data,
        paginatedResult.total,
        page ? +page : 1,
        limit ? +limit : 10
      ),
    };
  }

  @Get('my-reports')
  @ApiOperation({ summary: "Get current user's reports" })
  @Roles(
    UserRole.CITIZEN,
    UserRole.TEAM_MEMBER,
    UserRole.DEPARTMENT_SUPERVISOR,
    UserRole.SYSTEM_ADMIN
  )
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'reportType', required: false, enum: ReportType }) // type -> reportType
  @ApiQuery({ name: 'status', required: false, enum: ReportStatus })
  @ApiResponse({ status: 200, description: "Paginated list of user's reports" })
  async getMyReports(
    @Req() req: RequestWithUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('reportType') reportType?: ReportType, // type -> reportType
    @Query('status') status?: ReportStatus
  ): Promise<{ data: PaginatedResponse<IReport> }> {
    const paginatedResult = await this.reportsService.getReportsByUser(req.user, {
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
      reportType,
      status,
    });
    return {
      data: new PaginatedResponse(
        paginatedResult.data,
        paginatedResult.total,
        page ? +page : 1,
        limit ? +limit : 10
      ),
    };
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
  async getDepartments(): Promise<Department[]> {
    return this.departmentService.findAll();
  }

  @Get('status-counts')
  @ApiOperation({
    summary: 'Get report counts by status',
    description: "Returns counts of reports grouped by status for the current user's department",
  })
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.TEAM_MEMBER, UserRole.SYSTEM_ADMIN)
  @ApiResponse({
    status: 200,
    description: 'Report counts by status',
    schema: {
      type: 'object',
      properties: {
        OPEN: { type: 'number' },
        IN_REVIEW: { type: 'number' },
        IN_PROGRESS: { type: 'number' },
        DONE: { type: 'number' },
        REJECTED: { type: 'number' },
        CANCELLED: { type: 'number' },
        total: { type: 'number' },
      },
    },
  })
  async getStatusCounts(
    @Req() req: RequestWithUser
  ): Promise<Record<ReportStatus | 'total', number>> {
    return await this.reportsService.getStatusCounts(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a report by ID (role-based)' })
  @Roles(
    UserRole.SYSTEM_ADMIN,
    UserRole.DEPARTMENT_SUPERVISOR,
    UserRole.TEAM_MEMBER,
    UserRole.CITIZEN
  )
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({ status: 200, description: 'Returns the report' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser
  ): Promise<Report> {
    return this.reportsService.findOne(id, req.user);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new report' })
  @Roles(UserRole.CITIZEN, UserRole.SYSTEM_ADMIN)
  @ApiResponse({ status: 201, description: 'Report created successfully', type: Report })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Body() createReportDto: CreateReportDto,
    @Req() req: RequestWithUser
  ): Promise<Report> {
    return this.reportsService.create(createReportDto, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a report (basic info, role-based)' })
  @Roles(UserRole.CITIZEN, UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({ status: 200, description: 'Report updated successfully', type: Report })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReportDto: UpdateReportDto,
    @Req() req: RequestWithUser
  ): Promise<Report> {
    return this.reportsService.update(id, updateReportDto, req.user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update report status (role-based)' })
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.TEAM_MEMBER, UserRole.SYSTEM_ADMIN)
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({ status: 200, description: 'Report status updated successfully', type: Report })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateReportStatusDto,
    @Req() req: RequestWithUser
  ): Promise<Report> {
    return this.reportsService.updateStatus(id, updateStatusDto, req.user);
  }

  @Patch(':id/assign/:employeeId')
  @ApiOperation({ summary: 'Assign a report to an employee (role-based)' })
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiParam({ name: 'employeeId', description: 'Employee User ID', type: Number })
  @ApiResponse({ status: 200, description: 'Report assigned successfully', type: Report })
  async assignReportToEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Req() req: RequestWithUser
  ): Promise<Report> {
    return this.reportsService.assignReportToEmployee(id, employeeId, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a report (role-based)' })
  @Roles(UserRole.CITIZEN, UserRole.SYSTEM_ADMIN)
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({ status: 204, description: 'Report deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser): Promise<void> {
    await this.reportsService.remove(id, req.user);
  }

  @Patch(':id/forward')
  @ApiOperation({ summary: 'Forward a report to another department (role-based)' })
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Report forwarded successfully',
    schema: {
      type: 'object', // Anahtar şema bir nesne olmalı
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Report ID 1 successfully forwarded to department PARKS_AND_GARDENS.',
        },
        reportId: { type: 'number', example: 1 },
        newDepartmentCode: {
          type: 'string',
          enum: Object.values(MunicipalityDepartment), // Enum değerlerini kullan
          example: MunicipalityDepartment.PARKS_AND_GARDENS,
        },
      },
      required: ['success', 'message', 'reportId', 'newDepartmentCode'], // Gerekli alanlar
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (e.g., already in target department, reason missing)',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized (e.g., user not logged in)' })
  @ApiResponse({ status: 403, description: 'Forbidden (e.g., user does not have permission)' })
  @ApiResponse({ status: 404, description: 'Report or target department not found' })
  async forwardReport(
    @Param('id', ParseIntPipe) id: number,
    @Body() forwardReportDto: ForwardReportDto,
    @Req() req: RequestWithUser
  ): Promise<Report> {
    return this.reportsService.forwardReport(id, forwardReportDto, req.user);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get department change history for a report (role-based)' })
  @Roles(UserRole.SYSTEM_ADMIN, UserRole.DEPARTMENT_SUPERVISOR, UserRole.TEAM_MEMBER)
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Department history',
    type: [DepartmentHistoryResponseDto],
  })
  getDepartmentHistory(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser
  ): Promise<DepartmentHistoryResponseDto[]> {
    return this.reportsService.getDepartmentHistory(id, req.user);
  }

  @Get(':id/status-history')
  @ApiOperation({ summary: 'Get status change history for a report (role-based)' })
  @Roles(UserRole.SYSTEM_ADMIN, UserRole.DEPARTMENT_SUPERVISOR, UserRole.TEAM_MEMBER)
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Status history retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          reportId: { type: 'number' },
          previousStatus: { type: 'string', enum: Object.values(ReportStatus) },
          newStatus: { type: 'string', enum: Object.values(ReportStatus) },
          previousSubStatus: { type: 'string', nullable: true },
          newSubStatus: { type: 'string', nullable: true },
          changedByUserId: { type: 'number' },
          changedAt: { type: 'string', format: 'date-time' },
          notes: { type: 'string', nullable: true },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async getStatusHistory(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser
  ): Promise<ReportStatusHistory[]> {
    return await this.reportsService.getStatusHistory(id, req.user);
  }

  @Get('suggest-department/:type')
  @ApiOperation({ summary: 'Suggest a department for a report type' })
  @ApiParam({ name: 'type', description: 'Report Type', enum: ReportType })
  @ApiResponse({ status: 200, description: 'Suggested department code' })
  suggestDepartment(@Param('type') type: ReportType): Promise<MunicipalityDepartment> {
    return this.reportsService.suggestDepartmentForReportType(type);
  }

  // Yeni team assignment endpoint'leri
  @Patch(':id/assign-team/:teamId')
  @ApiOperation({ summary: 'Assign a report to a team (role-based)' })
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN, UserRole.TEAM_MEMBER) // UserRole.TEAM_MEMBER eklendi
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiParam({ name: 'teamId', description: 'Team ID', type: Number })
  @ApiResponse({ status: 200, description: 'Report assigned to team successfully', type: Report })
  @ApiResponse({ status: 400, description: 'Bad Request - Team not available or invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Report or team not found' })
  async assignReportToTeam(
    @Param('id', ParseIntPipe) id: number,
    @Param('teamId', ParseIntPipe) teamId: number,
    @Req() req: RequestWithUser
  ): Promise<Report> {
    // Team existence check first - throws 404 if team doesn't exist
    await this.teamsService.findOne(teamId, req.user);

    // Then proceed with assignment - may throw 403 if unauthorized
    return this.reportsService.assignReportToTeam(id, teamId, req.user);
  }

  @Patch(':id/assign-user/:userId')
  @ApiOperation({ summary: 'Assign report to a specific user' })
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiParam({ name: 'userId', description: 'User ID', type: Number })
  @ApiResponse({ status: 200, description: 'Report assigned to user successfully', type: Report })
  @ApiResponse({ status: 400, description: 'Bad Request - User not available or invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Report or user not found' })
  async assignReportToUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: RequestWithUser
  ): Promise<Report> {
    return this.reportsService.assignReportToUser(id, userId, req.user);
  }

  // ========== POC ENDPOINTS FOR ABAC TESTING ==========

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a report (CITIZEN - ABAC POC)' })
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility, subject) => {
    // Gerçek yetki kontrolü: sadece kendi raporunu ve açık durumda olanı iptal edebilir
    return ability.can(Action.Cancel, subject as Report);
  })
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({ status: 200, description: 'Report cancelled successfully', type: Report })
  cancelReport(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser
  ): { message: string; reportId: number } {
    // POC için geçici response - gerçek implementasyonda service method kullanılacak
    return {
      message: `Report ${id} cancellation requested by user ${req.user.sub} - ABAC POC`,
      reportId: id,
    };
  }

  @Patch(':id/complete-work')
  @ApiOperation({ summary: 'Complete work on a report with proof media (for Team Members)' })
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility, subject) => {
    return ability.can(Action.CompleteWork, subject as Report);
  })
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Work marked as complete with proof media, pending approval.',
    type: Report,
  })
  @ApiResponse({ status: 400, description: 'Bad Request. Missing proof media or invalid data.' })
  @ApiResponse({ status: 403, description: 'Forbidden. User cannot complete work on this report.' })
  @ApiResponse({ status: 404, description: 'Report not found.' })
  async completeWork(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
    @Body() completeWorkDto: CompleteWorkDto
  ): Promise<Report> {
    return this.reportsService.completeWork(id, completeWorkDto, req.user);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve completed report (DEPARTMENT_SUPERVISOR - ABAC POC)' })
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility, subject) => {
    // Gerçek yetki kontrolü: sadece departman süpervizörü onay verebilir
    return ability.can(Action.Approve, subject as Report);
  })
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({ status: 200, description: 'Report approved successfully', type: Report })
  approveReport(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser
  ): { message: string; reportId: number } {
    // POC için geçici response - gerçek implementasyonda service method kullanılacak
    return {
      message: `Report ${id} approved by supervisor ${req.user.sub} - ABAC POC`,
      reportId: id,
    };
  }

  @Post(':id/support')
  @ApiOperation({ summary: 'Support a report (CITIZEN - ABAC POC)' })
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility, subject) => {
    // Gerçek yetki kontrolü: vatandaş başkalarının raporlarını destekleyebilir
    return ability.can(Action.Support, subject as Report);
  })
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({ status: 201, description: 'Report supported successfully' })
  async supportReport(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser
  ): Promise<Report> {
    // Gerçek service metodunu çağır
    return this.reportsService.supportReport(id, req.user);
  }

  @Delete(':id/support')
  @ApiOperation({ summary: 'Destek çek (CITIZEN - ABAC POC)' })
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility, subject) => {
    return ability.can(Action.Unsupport, subject as Report);
  })
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({ status: 200, description: 'Destek başarıyla geri çekildi', type: Report })
  async unsupportReport(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser
  ): Promise<Report> {
    return this.reportsService.unsupportReport(id, req.user);
  }
}
