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
  @Roles(UserRole.SYSTEM_ADMIN, UserRole.DEPARTMENT_SUPERVISOR, UserRole.DEPARTMENT_EMPLOYEE)
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
    UserRole.DEPARTMENT_EMPLOYEE,
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
    UserRole.DEPARTMENT_EMPLOYEE,
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
    UserRole.DEPARTMENT_EMPLOYEE,
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
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.DEPARTMENT_EMPLOYEE, UserRole.SYSTEM_ADMIN)
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({ status: 200, description: 'Report status updated successfully', type: Report })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateReportStatusDto,
    @Req() req: RequestWithUser
  ): Promise<Report> {
    return this.reportsService.updateStatus(id, updateStatusDto.newStatus, req.user, {
      rejectionReason: updateStatusDto.rejectionReason,
      resolutionNotes: updateStatusDto.resolutionNotes,
    });
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
  @ApiResponse({ status: 200, description: 'Report forwarded successfully', type: Report })
  async forwardReport(
    @Param('id', ParseIntPipe) id: number,
    @Body() forwardReportDto: ForwardReportDto,
    @Req() req: RequestWithUser
  ): Promise<Report> {
    return this.reportsService.changeDepartment(
      id,
      forwardReportDto.newDepartment,
      forwardReportDto.reason,
      req.user
    );
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get department change history for a report (role-based)' })
  @Roles(UserRole.SYSTEM_ADMIN, UserRole.DEPARTMENT_SUPERVISOR, UserRole.DEPARTMENT_EMPLOYEE)
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
}
