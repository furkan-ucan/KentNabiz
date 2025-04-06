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
import { RadiusSearchDto } from '../dto/location.dto';
import { ReportStatus, ReportType, MunicipalityDepartment } from '@KentNabiz/shared';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequestWithUser } from '../../auth/interfaces/jwt-payload.interface';
import { DepartmentChangeDto, DepartmentHistoryResponseDto } from '../dto/category.dto';
import { Report } from '../entities/report.entity';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // TODO: Response tipi interface yerine DTO kullanılarak Swagger çıktısı daha zengin hale getirilebilir.
  @Get()
  @ApiOperation({
    summary: 'Get all reports',
    description: 'Returns paginated list of all reports',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number, defaults to 1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page, defaults to 10',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ReportType,
    description: 'Filter by report type',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ReportStatus,
    description: 'Filter by report status',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    enum: MunicipalityDepartment,
    description: 'Filter by department',
  })
  @ApiResponse({ status: 200, description: 'Returns a paginated list of reports' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: ReportType,
    @Query('status') status?: ReportStatus,
    @Query('department') department?: MunicipalityDepartment
  ) {
    return this.reportsService.findAll({
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
      type,
      status,
      department,
    });
  }

  @Get('nearby')
  @ApiOperation({
    summary: 'Find reports near a location',
    description: 'Returns reports within the specified radius from a point',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number, defaults to 1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page, defaults to 10',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ReportType,
    description: 'Filter by report type',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ReportStatus,
    description: 'Filter by report status',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    enum: MunicipalityDepartment,
    description: 'Filter by department',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of reports near the specified location',
  })
  async findNearby(
    @Query() searchDto: RadiusSearchDto,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: ReportType,
    @Query('status') status?: ReportStatus,
    @Query('department') department?: MunicipalityDepartment
  ) {
    return this.reportsService.findNearby(searchDto, {
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
      type,
      status,
      department,
    });
  }

  @Get('my-reports')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get current user's reports",
    description: 'Returns reports created by the authenticated user',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number, defaults to 1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page, defaults to 10',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ReportType,
    description: 'Filter by report type',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ReportStatus,
    description: 'Filter by report status',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    enum: MunicipalityDepartment,
    description: 'Filter by department',
  })
  @ApiResponse({ status: 200, description: "Returns a paginated list of user's reports" })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyReports(
    @Req() req: RequestWithUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: ReportType,
    @Query('status') status?: ReportStatus,
    @Query('department') department?: MunicipalityDepartment
  ) {
    return this.reportsService.getReportsByUser(req.user.sub, {
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
      type,
      status,
      department,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a report by ID',
    description: 'Returns a specific report by its ID',
  })
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({ status: 200, description: 'Returns the report' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.findOne(id);
  }

  // TODO: Response tipi interface yerine DTO kullanılarak Swagger çıktısı daha zengin hale getirilebilir.
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new report',
    description: 'Creates a new report in the system',
  })
  @ApiResponse({ status: 201, description: 'Report created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createReportDto: CreateReportDto, @Req() req: RequestWithUser) {
    return this.reportsService.create(createReportDto, req.user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a report', description: 'Updates an existing report' })
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({ status: 200, description: 'Report updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not owner of the report' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReportDto: UpdateReportDto,
    @Req() req: RequestWithUser
  ) {
    return this.reportsService.update(id, updateReportDto, req.user.sub);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update report status',
    description: 'Updates the status of an existing report',
  })
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({ status: 200, description: 'Report status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: ReportStatus,
    @Req() req: RequestWithUser
  ) {
    return this.reportsService.updateStatus(id, status, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a report', description: 'Deletes an existing report' })
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({ status: 204, description: 'Report deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not owner of the report' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    await this.reportsService.remove(id, req.user.sub);
  }

  @Get('department/:department')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('staff', 'admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get reports by department',
    description: 'Returns reports for the specified department',
  })
  @ApiParam({ name: 'department', enum: MunicipalityDepartment, description: 'Department name' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ReportType })
  @ApiQuery({ name: 'status', required: false, enum: ReportStatus })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of reports for the specified department',
  })
  async getReportsByDepartment(
    @Param('department') department: MunicipalityDepartment,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: ReportType,
    @Query('status') status?: ReportStatus
  ) {
    return this.reportsService.findAll({
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
      type,
      status,
      department,
    });
  }

  @Post(':id/forward')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('staff', 'admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Raporu başka bir birime yönlendir',
    description: 'Raporu belirtilen birime yönlendirir',
  })
  @ApiParam({ name: 'id', description: 'Rapor ID' })
  @ApiResponse({
    status: 200,
    description: 'Rapor başarıyla yönlendirildi',
    type: Report,
  })
  @ApiResponse({ status: 400, description: 'Geçersiz birim ya da rapor zaten hedef birimde' })
  @ApiResponse({ status: 404, description: 'Rapor bulunamadı' })
  async forwardReport(
    @Param('id', ParseIntPipe) id: number,
    @Body() departmentChangeDto: DepartmentChangeDto
  ) {
    return this.reportsService.changeDepartment(
      id,
      departmentChangeDto.newDepartment,
      departmentChangeDto.reason
    );
  }

  @Get(':id/department-history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('staff', 'admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Raporun birim değişiklik geçmişini görüntüle',
    description: 'Raporun birim değişiklik geçmişini döndürür',
  })
  @ApiParam({ name: 'id', description: 'Rapor ID' })
  @ApiResponse({
    status: 200,
    description: 'Birim geçmişi başarıyla getirildi',
    type: [DepartmentHistoryResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Rapor bulunamadı' })
  async getDepartmentHistory(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.getDepartmentHistory(id);
  }

  @Get('suggest-department/:type')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Rapor türü için önerilen birimi getir',
    description: 'Belirtilen rapor türü için önerilen birimi döndürür',
  })
  @ApiParam({ name: 'type', enum: ReportType, description: 'Rapor türü' })
  @ApiResponse({ status: 200, description: 'Önerilen birim bilgisi döndürüldü' })
  async suggestDepartment(@Param('type') type: ReportType) {
    const department = await this.reportsService.suggestDepartmentForReportType(type);
    return { department };
  }

  @Get('admin/all-reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin: Get all reports',
    description: 'Admin kullanıcıları için tüm raporları getirir',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ReportType })
  @ApiQuery({ name: 'status', required: false, enum: ReportStatus })
  @ApiQuery({ name: 'department', required: false, enum: MunicipalityDepartment })
  @ApiResponse({ status: 200, description: 'Returns a list of all reports (admin only)' })
  async adminGetAllReports(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: ReportType,
    @Query('status') status?: ReportStatus,
    @Query('department') department?: MunicipalityDepartment
  ) {
    return this.reportsService.findAll({
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
      type,
      status,
      department,
    });
  }
}
