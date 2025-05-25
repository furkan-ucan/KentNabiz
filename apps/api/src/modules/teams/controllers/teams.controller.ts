// apps/api/src/modules/teams/controllers/teams.controller.ts
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
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { TeamsService } from '../services/teams.service';
import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '@KentNabiz/shared';
import { RequestWithUser } from '../../auth/interfaces/jwt-payload.interface';
import { Team } from '../entities/team.entity';

@ApiTags('Teams')
@Controller('teams')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Create a new team',
    description:
      'Creates a new team in the system. Only department supervisors and system admins can create teams.',
  })
  @ApiBody({ type: CreateTeamDto })
  @ApiResponse({
    status: 201,
    description: 'Team created successfully',
    type: Team,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  create(@Body() createTeamDto: CreateTeamDto, @Req() req: RequestWithUser): Promise<Team> {
    return this.teamsService.create(createTeamDto, req.user);
  }

  @Get()
  @Roles(UserRole.TEAM_MEMBER, UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Get all teams',
    description:
      "Retrieves all teams based on user role and permissions. Results are filtered by user's department if applicable.",
  })
  @ApiResponse({
    status: 200,
    description: 'Teams retrieved successfully',
    type: [Team],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  findAll(@Req() req: RequestWithUser): Promise<Team[]> {
    return this.teamsService.findAll(req.user);
  }

  @Get('nearby')
  @Roles(UserRole.TEAM_MEMBER, UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Find nearby available teams',
    description:
      'Finds the nearest available teams for a given location and optional specialization.',
  })
  @ApiQuery({
    name: 'lat',
    description: 'Latitude coordinate',
    type: Number,
    example: 41.0082,
  })
  @ApiQuery({
    name: 'lng',
    description: 'Longitude coordinate',
    type: Number,
    example: 28.9784,
  })
  @ApiQuery({
    name: 'specializationId',
    description: 'Filter by specialization ID',
    type: Number,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Nearby teams found',
    type: [Team],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid coordinates',
  })
  findNearbyTeams(
    @Query('lat') latitude: number,
    @Query('lng') longitude: number,
    @Query('specializationId') specializationId?: number
  ): Promise<Team[]> {
    return this.teamsService.findNearestAvailableTeams(latitude, longitude, specializationId);
  }

  @Get('department/:departmentId')
  @Roles(UserRole.TEAM_MEMBER, UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Get teams by department',
    description: 'Retrieves all teams belonging to a specific department.',
  })
  @ApiParam({
    name: 'departmentId',
    description: 'Department ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Department teams retrieved successfully',
    type: [Team],
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
  })
  findTeamsByDepartment(
    @Param('departmentId', ParseIntPipe) departmentId: number,
    @Req() req: RequestWithUser
  ): Promise<Team[]> {
    return this.teamsService.findTeamsByDepartment(departmentId, req.user);
  }

  @Get(':id')
  @Roles(UserRole.TEAM_MEMBER, UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Get team by ID',
    description: 'Retrieves a specific team by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Team ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Team found',
    type: Team,
  })
  @ApiResponse({
    status: 404,
    description: 'Team not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser): Promise<Team> {
    return this.teamsService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Update team',
    description:
      'Updates an existing team. Only department supervisors and system admins can update teams.',
  })
  @ApiParam({
    name: 'id',
    description: 'Team ID',
    type: Number,
  })
  @ApiBody({ type: UpdateTeamDto })
  @ApiResponse({
    status: 200,
    description: 'Team updated successfully',
    type: Team,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Team not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeamDto: UpdateTeamDto,
    @Req() req: RequestWithUser
  ): Promise<Team> {
    return this.teamsService.update(id, updateTeamDto, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Delete team',
    description:
      'Deletes a team from the system. Only department supervisors and system admins can delete teams.',
  })
  @ApiParam({
    name: 'id',
    description: 'Team ID',
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'Team deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Team not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser): Promise<void> {
    return this.teamsService.remove(id, req.user);
  }

  @Post(':id/members/:userId')
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Add member to team',
    description: 'Adds a user as a member to the specified team.',
  })
  @ApiParam({
    name: 'id',
    description: 'Team ID',
    type: Number,
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID to add to team',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Member added to team successfully',
    type: Team,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - User already in team or invalid data',
  })
  @ApiResponse({
    status: 404,
    description: 'Team or user not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  addMemberToTeam(
    @Param('id', ParseIntPipe) teamId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: RequestWithUser
  ): Promise<Team> {
    return this.teamsService.addMemberToTeam(teamId, userId, req.user);
  }

  @Delete(':id/members/:userId')
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Remove member from team',
    description: 'Removes a user from the specified team.',
  })
  @ApiParam({
    name: 'id',
    description: 'Team ID',
    type: Number,
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID to remove from team',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Member removed from team successfully',
    type: Team,
  })
  @ApiResponse({
    status: 404,
    description: 'Team, user, or membership not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  removeMemberFromTeam(
    @Param('id', ParseIntPipe) teamId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: RequestWithUser
  ): Promise<Team> {
    return this.teamsService.removeMemberFromTeam(teamId, userId, req.user);
  }

  @Post(':id/specializations/:specializationId')
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Add specialization to team',
    description: 'Assigns a specialization to the specified team.',
  })
  @ApiParam({
    name: 'id',
    description: 'Team ID',
    type: Number,
  })
  @ApiParam({
    name: 'specializationId',
    description: 'Specialization ID to add to team',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Specialization added to team successfully',
    type: Team,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Specialization already assigned or invalid data',
  })
  @ApiResponse({
    status: 404,
    description: 'Team or specialization not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  addSpecializationToTeam(
    @Param('id', ParseIntPipe) teamId: number,
    @Param('specializationId', ParseIntPipe) specializationId: number,
    @Req() req: RequestWithUser
  ): Promise<Team> {
    return this.teamsService.addSpecializationToTeam(teamId, specializationId, req.user);
  }

  @Delete(':id/specializations/:specializationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Remove specialization from team',
    description: 'Removes a specialization from the specified team.',
  })
  @ApiParam({
    name: 'id',
    description: 'Team ID',
    type: Number,
  })
  @ApiParam({
    name: 'specializationId',
    description: 'Specialization ID to remove from team',
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'Specialization removed from team successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Team, specialization, or assignment not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  removeSpecializationFromTeam(
    @Param('id', ParseIntPipe) teamId: number,
    @Param('specializationId', ParseIntPipe) specializationId: number,
    @Req() req: RequestWithUser
  ): Promise<void> {
    return this.teamsService.removeSpecializationFromTeam(teamId, specializationId, req.user);
  }

  @Get(':id/members')
  @Roles(UserRole.TEAM_MEMBER, UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Get team members',
    description: 'Retrieves all members of a specific team.',
  })
  @ApiParam({
    name: 'id',
    description: 'Team ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Team members retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          email: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          roles: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Team not found',
  })
  getTeamMembers(@Param('id', ParseIntPipe) teamId: number, @Req() req: RequestWithUser) {
    return this.teamsService.getTeamMembers(teamId, req.user);
  }

  @Get(':id/specializations')
  @Roles(UserRole.TEAM_MEMBER, UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Get team specializations',
    description: 'Retrieves all specializations assigned to a specific team.',
  })
  @ApiParam({
    name: 'id',
    description: 'Team ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Team specializations retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          code: { type: 'string' },
          description: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Team not found',
  })
  getTeamSpecializations(@Param('id', ParseIntPipe) teamId: number, @Req() req: RequestWithUser) {
    return this.teamsService.getTeamSpecializations(teamId, req.user);
  }
}
