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
import { ReportStatus, ReportType } from '../interfaces/report.interface';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequestWithUser } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all reports' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ReportType })
  @ApiQuery({ name: 'status', required: false, enum: ReportStatus })
  @ApiResponse({ status: 200, description: 'Returns a list of reports' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: ReportType,
    @Query('status') status?: ReportStatus,
  ) {
    return this.reportsService.findAll({
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
      type,
      status,
    });
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find reports near a location' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ReportType })
  @ApiQuery({ name: 'status', required: false, enum: ReportStatus })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of reports near the specified location',
  })
  async findNearby(
    @Query() searchDto: RadiusSearchDto,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: ReportType,
    @Query('status') status?: ReportStatus,
  ) {
    return this.reportsService.findNearby(searchDto, {
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
      type,
      status,
    });
  }

  @Get('my-reports')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my reports' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ReportType })
  @ApiQuery({ name: 'status', required: false, enum: ReportStatus })
  @ApiResponse({ status: 200, description: "Returns a list of user's reports" })
  async getMyReports(
    @Req() req: RequestWithUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: ReportType,
    @Query('status') status?: ReportStatus,
  ) {
    return this.reportsService.getReportsByUser(req.user.sub, {
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
      type,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a report by ID' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Returns the report' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new report' })
  @ApiResponse({ status: 201, description: 'Report created successfully' })
  async create(@Body() createReportDto: CreateReportDto, @Req() req: RequestWithUser) {
    return this.reportsService.create(createReportDto, req.user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Report updated successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiResponse({ status: 403, description: 'Unauthorized to update this report' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReportDto: UpdateReportDto,
    @Req() req: RequestWithUser,
  ) {
    return this.reportsService.update(id, updateReportDto, req.user.sub);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update report status' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiResponse({ status: 403, description: 'Unauthorized to update this report status' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: ReportStatus,
    @Req() req: RequestWithUser,
  ) {
    return this.reportsService.updateStatus(id, status, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 204, description: 'Report deleted successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiResponse({ status: 403, description: 'Unauthorized to delete this report' })
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    await this.reportsService.remove(id, req.user.sub);
  }

  @Get('admin/all-reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get all reports' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ReportType })
  @ApiQuery({ name: 'status', required: false, enum: ReportStatus })
  @ApiResponse({ status: 200, description: 'Returns a list of all reports (admin only)' })
  async adminGetAllReports(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: ReportType,
    @Query('status') status?: ReportStatus,
  ) {
    return this.reportsService.findAll({
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
      type,
      status,
    });
  }
}
