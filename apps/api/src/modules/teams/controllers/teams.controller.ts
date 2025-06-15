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
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { TeamsService } from '../services/teams.service';
import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { FindNearbyTeamsDto } from '../dto/query-teams.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '@kentnabiz/shared';
import { RequestWithUser } from '../../auth/interfaces/jwt-payload.interface';
import { Team } from '../entities/team.entity';
import { PaginatedResponse } from '../../../common/dto/paginated-response.dto';

@ApiTags('Teams')
@Controller('teams')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
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
  @Roles(UserRole.SYSTEM_ADMIN, UserRole.DEPARTMENT_SUPERVISOR)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ): Promise<PaginatedResponse<Team>> {
    const { data, total } = await this.teamsService.findAllPaginated(page, limit);
    return new PaginatedResponse(data, total, page, limit);
  }

  @Get('nearby')
  @Roles(UserRole.TEAM_MEMBER, UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Find nearby available teams',
    description:
      'Finds the nearest available teams for a given location and optional specialization.',
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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  findNearbyTeams(@Query() queryDto: FindNearbyTeamsDto): Promise<Team[]> {
    return this.teamsService.findNearestAvailableTeams(
      queryDto.lat,
      queryDto.lng,
      queryDto.specializationId
    );
  }

  @Get('my-team/reports')
  @Roles(UserRole.TEAM_MEMBER, UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Get reports assigned to my team',
    description:
      "Retrieves all reports assigned to the current user's active team. Team leaders can see all team reports.",
  })
  @ApiResponse({
    status: 200,
    description: 'Team reports retrieved successfully',
    type: Array,
  })
  @ApiResponse({
    status: 404,
    description: 'User has no active team or team not found',
  })
  @ApiResponse({
    status: 403,
    description: 'User is not a team member or leader',
  })
  async getMyTeamReports(@Req() req: RequestWithUser) {
    return this.teamsService.getMyTeamReports(req.user);
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

  @Patch(':id/location')
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Update team location',
    description: 'Updates the current location of a team.',
  })
  @ApiParam({
    name: 'id',
    description: 'Team ID',
    type: Number,
  })
  @ApiBody({
    description: 'Location update data',
    schema: {
      type: 'object',
      properties: {
        currentLocation: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['Point'] },
            coordinates: {
              type: 'array',
              items: { type: 'number' },
              minItems: 2,
              maxItems: 2,
              description: '[longitude, latitude]',
            },
          },
          required: ['type', 'coordinates'],
        },
      },
      required: ['currentLocation'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Team location updated successfully',
    schema: {
      type: 'object',
      properties: {
        currentLocation: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            coordinates: { type: 'array', items: { type: 'number' } },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Team not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  updateTeamLocation(
    @Param('id', ParseIntPipe) _id: number,
    @Body('currentLocation') currentLocation: { type: string; coordinates: number[] },
    @Req() _req: RequestWithUser
  ) {
    // For now, just return the location as the service doesn't have this method yet
    return {
      currentLocation,
    };
  }

  @Post(':id/members')
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
  @ApiBody({
    description: 'Member data',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', description: 'User ID to add to team' },
        specializations: {
          type: 'array',
          items: { type: 'string' },
          description: 'Member specializations',
        },
      },
      required: ['userId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Member added to team successfully',
    schema: {
      type: 'object',
      properties: {
        teamId: { type: 'number' },
        userId: { type: 'number' },
        specializations: { type: 'array', items: { type: 'string' } },
      },
    },
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
  async addMemberToTeamWithBody(
    @Param('id', ParseIntPipe) teamId: number,
    @Body('userId', ParseIntPipe) userId: number,
    @Body('specializations') specializations: string[],
    @Req() req: RequestWithUser
  ) {
    await this.teamsService.addMemberToTeam(teamId, userId, req.user);
    return {
      teamId,
      userId,
      specializations: specializations || [],
    };
  }

  @Post(':id/members/:userId')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Add member to team (alternative endpoint)',
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
    status: 201,
    description: 'Member added to team successfully',
    type: Team,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - User already in team or invalid data',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User is already a member of this team',
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

  @Patch(':id/members/:userId')
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Update team member specializations',
    description: 'Updates specializations for a team member.',
  })
  @ApiParam({
    name: 'id',
    description: 'Team ID',
    type: Number,
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID to update',
    type: Number,
  })
  @ApiBody({
    description: 'Member update data',
    schema: {
      type: 'object',
      properties: {
        specializations: {
          type: 'array',
          items: { type: 'string' },
          description: 'Updated member specializations',
        },
      },
      required: ['specializations'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Member specializations updated successfully',
    schema: {
      type: 'object',
      properties: {
        specializations: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Team, user, or membership not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  updateMemberSpecializations(
    @Param('id', ParseIntPipe) _teamId: number,
    @Param('userId', ParseIntPipe) _userId: number,
    @Body('specializations') specializations: string[],
    @Req() _req: RequestWithUser
  ) {
    // For now, just return the specializations as the service doesn't have this method yet
    return {
      specializations: specializations || [],
    };
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
