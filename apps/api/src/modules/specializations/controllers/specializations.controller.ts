// apps/api/src/modules/specializations/controllers/specializations.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { SpecializationsService } from '../services/specializations.service';
import { CreateSpecializationDto } from '../dto/create-specialization.dto';
import { UpdateSpecializationDto } from '../dto/update-specialization.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '@kentnabiz/shared';
import { RequestWithUser } from '../../auth/interfaces/jwt-payload.interface';
import { Specialization } from '../entities/specialization.entity';

@ApiTags('Specializations')
@Controller('specializations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SpecializationsController {
  constructor(private readonly specializationsService: SpecializationsService) {}

  @Post()
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Create a new specialization',
    description:
      'Creates a new specialization in the system. Only system administrators can create specializations.',
  })
  @ApiBody({ type: CreateSpecializationDto })
  @ApiResponse({
    status: 201,
    description: 'Specialization created successfully',
    type: Specialization,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data or specialization code already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only system administrators can create specializations',
  })
  create(
    @Body() createSpecializationDto: CreateSpecializationDto,
    @Req() req: RequestWithUser
  ): Promise<Specialization> {
    return this.specializationsService.create(createSpecializationDto, req.user);
  }

  @Get()
  @Roles(UserRole.TEAM_MEMBER, UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Get all specializations',
    description: 'Retrieves all specializations available in the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'Specializations retrieved successfully',
    type: [Specialization],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  findAll(@Req() req: RequestWithUser): Promise<Specialization[]> {
    return this.specializationsService.findAll(req.user);
  }

  @Get('by-code/:code')
  @Roles(UserRole.TEAM_MEMBER, UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Get specialization by code',
    description: 'Retrieves a specific specialization by its unique code.',
  })
  @ApiParam({
    name: 'code',
    description: 'Specialization code',
    type: String,
    example: 'PLUMBING',
  })
  @ApiResponse({
    status: 200,
    description: 'Specialization found',
    type: Specialization,
  })
  @ApiResponse({
    status: 404,
    description: 'Specialization not found',
  })
  findByCode(@Param('code') code: string): Promise<Specialization> {
    return this.specializationsService.findByCode(code);
  }

  @Get('by-department/:departmentId')
  @Roles(UserRole.TEAM_MEMBER, UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Get specializations by department',
    description:
      'Retrieves all specializations that are typically associated with a specific department.',
  })
  @ApiParam({
    name: 'departmentId',
    description: 'Department ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Specializations found for department',
    type: [Specialization],
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
  })
  findByDepartment(
    @Param('departmentId', ParseIntPipe) departmentId: number
  ): Promise<Specialization[]> {
    return this.specializationsService.findByDepartment(departmentId);
  }

  @Get(':id')
  @Roles(UserRole.TEAM_MEMBER, UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Get specialization by ID',
    description: 'Retrieves a specific specialization by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Specialization ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Specialization found',
    type: Specialization,
  })
  @ApiResponse({
    status: 404,
    description: 'Specialization not found',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser
  ): Promise<Specialization> {
    return this.specializationsService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Update specialization',
    description:
      'Updates an existing specialization. Only system administrators can update specializations.',
  })
  @ApiParam({
    name: 'id',
    description: 'Specialization ID',
    type: Number,
  })
  @ApiBody({ type: UpdateSpecializationDto })
  @ApiResponse({
    status: 200,
    description: 'Specialization updated successfully',
    type: Specialization,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data or specialization code already exists',
  })
  @ApiResponse({
    status: 404,
    description: 'Specialization not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only system administrators can update specializations',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSpecializationDto: UpdateSpecializationDto,
    @Req() req: RequestWithUser
  ): Promise<Specialization> {
    return this.specializationsService.update(id, updateSpecializationDto, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Delete specialization',
    description:
      'Deletes a specialization from the system. Only system administrators can delete specializations. Cannot delete if assigned to teams.',
  })
  @ApiParam({
    name: 'id',
    description: 'Specialization ID',
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'Specialization deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Specialization not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Specialization is assigned to teams and cannot be deleted',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only system administrators can delete specializations',
  })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser): Promise<void> {
    return this.specializationsService.remove(id, req.user);
  }
}
