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
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserProfileDto } from '../dto/user-profile.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '@KentNabiz/shared';
import { RequestWithUser } from '../../auth/interfaces/jwt-payload.interface';
import { TeamMembershipHistory } from '../entities/team-membership-history.entity';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created', type: UserProfileDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserProfileDto> {
    return this.usersService.createProfile(createUserDto);
  }

  @Get()
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Find all users' })
  @ApiResponse({ status: 200, description: 'Return all users', type: [UserProfileDto] })
  findAll(): Promise<UserProfileDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find user by ID' })
  @ApiResponse({ status: 200, description: 'Return the found user', type: UserProfileDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserProfileDto> {
    return this.usersService.findOneProfile(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User successfully updated', type: UserProfileDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserProfileDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 204, description: 'User successfully deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.remove(id);
  }

  @Post(':id/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 204, description: 'Password successfully changed' })
  @ApiResponse({ status: 400, description: 'Current password is incorrect' })
  @ApiResponse({ status: 404, description: 'User not found' })
  changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string
  ): Promise<void> {
    return this.usersService.changePassword(id, oldPassword, newPassword);
  }

  @Patch(':id/roles')
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Update user roles',
    description: 'Updates user roles. Only system admins can perform this action.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: Number,
  })
  @ApiBody({
    description: 'User roles data',
    schema: {
      type: 'object',
      properties: {
        roles: {
          type: 'array',
          items: { type: 'string', enum: Object.values(UserRole) },
          description: 'Array of user roles',
        },
      },
      required: ['roles'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User roles updated successfully',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid roles' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserRoles(
    @Param('id', ParseIntPipe) userId: number,
    @Body('roles') roles: UserRole[]
  ): Promise<UserProfileDto> {
    const updatedUser = await this.usersService.updateUserRoles(userId, roles);
    return this.usersService.toUserProfile(updatedUser);
  }

  @Patch(':id/active-team')
  @Roles(UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Update user active team assignment',
    description:
      'Assigns or removes a user from a team. Only department supervisors and system admins can perform this action.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: Number,
  })
  @ApiBody({
    description: 'Team assignment data',
    schema: {
      type: 'object',
      properties: {
        teamId: {
          type: 'number',
          nullable: true,
          description: 'Team ID to assign user to, or null to remove from current team',
        },
      },
      required: ['teamId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User team assignment updated successfully',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid team assignment' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User or team not found' })
  async updateActiveTeam(
    @Param('id', ParseIntPipe) userId: number,
    @Body('teamId') teamId: number | null,
    @Req() req: RequestWithUser
  ): Promise<UserProfileDto> {
    const updatedUser = await this.usersService.updateUserActiveTeam(userId, teamId, req.user);
    return this.usersService.toUserProfile(updatedUser);
  }

  @Get(':id/team-history')
  @Roles(UserRole.TEAM_MEMBER, UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary: 'Get user team membership history',
    description: 'Retrieves the complete team membership history for a user.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Team membership history retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          teamId: { type: 'number' },
          joinedAt: { type: 'string', format: 'date-time' },
          leftAt: { type: 'string', format: 'date-time', nullable: true },
          roleInTeam: { type: 'string', nullable: true },
          team: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              departmentId: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getTeamHistory(
    @Param('id', ParseIntPipe) userId: number,
    @Req() req: RequestWithUser
  ): Promise<TeamMembershipHistory[]> {
    return await this.usersService.getUserTeamHistory(userId, req.user);
  }
}
