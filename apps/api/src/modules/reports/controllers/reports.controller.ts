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
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { UpdateReportStatusDto } from '../dto/update-report-status.dto';
import { ForwardReportDto } from '../dto/forward-report.dto';
import { RadiusSearchDto } from '../dto/location.dto';
import { ReportStatus, ReportType, MunicipalityDepartment, UserRole } from '@KentNabiz/shared';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequestWithUser } from '../../auth/interfaces/jwt-payload.interface';
import { Report } from '../entities/report.entity';
import { DepartmentHistoryResponseDto } from '../dto/department-history.response.dto';
import { CheckPolicies, PoliciesGuard } from '../../../core/guards/policies.guard';
import { AppAbility, Action } from '../../../core/authorization/ability.factory';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all reports (role-based)',
    description: 'Returns paginated list of reports based on user role and filters.',
  })
  @Roles(UserRole.SYSTEM_ADMIN, UserRole.DEPARTMENT_SUPERVISOR, UserRole.TEAM_MEMBER)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'reportType', required: false, enum: ReportType }) // type -> reportType
  @ApiQuery({ name: 'status', required: false, enum: ReportStatus })
  @ApiQuery({ name: 'departmentCode', required: false, enum: MunicipalityDepartment }) // department -> departmentCode
  @ApiResponse({ status: 200, description: 'Paginated list of reports' })
  async findAll(
    @Req() req: RequestWithUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('reportType') reportType?: ReportType, // type -> reportType
    @Query('status') status?: ReportStatus,
    @Query('departmentCode') departmentCode?: MunicipalityDepartment // department -> departmentCode
  ) {
    return this.reportsService.findAll(req.user, {
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
      reportType, // type -> reportType
      status,
      departmentCode, // department -> departmentCode
    });
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
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'reportType', required: false, enum: ReportType }) // type -> reportType
  @ApiQuery({ name: 'status', required: false, enum: ReportStatus })
  @ApiQuery({ name: 'departmentCode', required: false, enum: MunicipalityDepartment }) // department -> departmentCode
  @ApiResponse({ status: 200, description: 'Paginated list of nearby reports' })
  findNearby(
    @Req() req: RequestWithUser,
    @Query() searchDto: RadiusSearchDto, // searchDto latitude, longitude, radius içerir
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('reportType') reportType?: ReportType, // type -> reportType
    @Query('status') status?: ReportStatus,
    @Query('departmentCode') departmentCode?: MunicipalityDepartment // department -> departmentCode
  ) {
    // ReportsService.findNearby metodu ilk parametre olarak searchDto'yu, ikinci olarak diğer opsiyonları alır.
    // searchDto içinde latitude, longitude, radius zaten var.
    // Diğer opsiyonlar (page, limit, reportType, status, departmentCode) ayrıca Query ile alınıp service metoduna iletilmeli.
    return this.reportsService.findNearby(
      searchDto, // { latitude, longitude, radius } içeren DTO
      {
        // Opsiyonel filtreler
        page: page ? +page : 1,
        limit: limit ? +limit : 10,
        reportType,
        status,
        departmentCode,
      }
    );
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
  ) {
    return this.reportsService.getReportsByUser(req.user, {
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
      reportType, // type -> reportType
      status,
    });
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
          example: 'Report ID 1 successfully forwarded to department PARKS.',
        },
        reportId: { type: 'number', example: 1 },
        newDepartmentCode: {
          type: 'string',
          enum: Object.values(MunicipalityDepartment), // Enum değerlerini kullan
          example: MunicipalityDepartment.PARKS,
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
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiParam({ name: 'teamId', description: 'Team ID', type: Number })
  @ApiResponse({ status: 200, description: 'Report assigned to team successfully', type: Report })
  async assignReportToTeam(
    @Param('id', ParseIntPipe) id: number,
    @Param('teamId', ParseIntPipe) teamId: number,
    @Req() req: RequestWithUser
  ): Promise<Report> {
    return this.reportsService.assignReportToTeam(id, teamId, req.user);
  }

  @Patch(':id/assign-user/:userId')
  @ApiOperation({ summary: 'Assign report to a specific user' })
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiParam({ name: 'userId', description: 'User ID', type: Number })
  @ApiResponse({ status: 200, description: 'Report assigned to user successfully', type: Report })
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
  @CheckPolicies((ability: AppAbility, report: Report | typeof Report) => {
    // Gerçek yetki kontrolü: sadece kendi raporunu ve açık durumda olanı iptal edebilir
    return ability.can(Action.Cancel, report as Report);
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
  @ApiOperation({ summary: 'Complete work on report (TEAM_MEMBER - ABAC POC)' })
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility, report: Report | typeof Report) => {
    // Gerçek yetki kontrolü: sadece atanmış ekip üyeleri işi tamamlayabilir
    return ability.can(Action.CompleteWork, report as Report);
  })
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({ status: 200, description: 'Work completed successfully', type: Report })
  completeWork(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser
  ): { message: string; reportId: number } {
    // POC için geçici response - gerçek implementasyonda service method kullanılacak
    return {
      message: `Work completed on report ${id} by user ${req.user.sub} - ABAC POC`,
      reportId: id,
    };
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve completed report (DEPARTMENT_SUPERVISOR - ABAC POC)' })
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility, report: Report | typeof Report) => {
    // Gerçek yetki kontrolü: sadece departman süpervizörü onay verebilir
    return ability.can(Action.Approve, report as Report);
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
  @CheckPolicies((ability: AppAbility, report: Report | typeof Report) => {
    // Gerçek yetki kontrolü: vatandaş başkalarının raporlarını destekleyebilir
    return ability.can(Action.Support, report as Report);
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
}
