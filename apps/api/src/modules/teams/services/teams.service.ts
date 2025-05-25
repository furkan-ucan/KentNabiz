// apps/api/src/modules/teams/services/teams.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, FindOptionsWhere } from 'typeorm';
import { Team } from '../entities/team.entity';
import { TeamSpecialization } from '../entities/team-specialization.entity';
import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { User } from '../../users/entities/user.entity';
import { Specialization } from '../../specializations/entities/specialization.entity';
import { TeamMembershipHistory } from '../../users/entities/team-membership-history.entity';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { UserRole, TeamStatus } from '@KentNabiz/shared';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(TeamSpecialization)
    private readonly teamSpecializationRepository: Repository<TeamSpecialization>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Specialization)
    private readonly specializationRepository: Repository<Specialization>,
    @InjectRepository(TeamMembershipHistory)
    private readonly teamMembershipHistoryRepository: Repository<TeamMembershipHistory>
  ) {}

  // Authorization helper method
  private isAuthorizedForTeamOperation(
    team: Team,
    authUser: JwtPayload,
    action: 'view' | 'manage'
  ): boolean {
    // SYSTEM_ADMIN can do everything
    if (authUser.roles.includes(UserRole.SYSTEM_ADMIN)) {
      return true;
    }

    // DEPARTMENT_SUPERVISOR can manage teams in their department
    if (authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR)) {
      if (authUser.departmentId && team.departmentId === authUser.departmentId) {
        return true;
      }
    }

    // TEAM_MEMBER can view teams (for read operations)
    if (action === 'view' && authUser.roles.includes(UserRole.TEAM_MEMBER)) {
      return true;
    }

    return false;
  }

  async create(createTeamDto: CreateTeamDto, authUser: JwtPayload): Promise<Team> {
    // Authorization: Only DEPARTMENT_SUPERVISOR (for their department) or SYSTEM_ADMIN
    if (
      !authUser.roles.includes(UserRole.SYSTEM_ADMIN) &&
      !authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR)
    ) {
      throw new ForbiddenException('Only department supervisors and admins can create teams.');
    }

    // If DEPARTMENT_SUPERVISOR, ensure they're creating team in their department
    if (
      authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR) &&
      !authUser.roles.includes(UserRole.SYSTEM_ADMIN)
    ) {
      if (!authUser.departmentId || createTeamDto.departmentId !== authUser.departmentId) {
        throw new ForbiddenException(
          'Department supervisors can only create teams in their own department.'
        );
      }
    }

    // Validate team leader if provided
    if (createTeamDto.teamLeaderId) {
      const teamLeader = await this.userRepository.findOne({
        where: { id: createTeamDto.teamLeaderId },
        relations: ['department'],
      });

      if (!teamLeader) {
        throw new NotFoundException(`Team leader with ID ${createTeamDto.teamLeaderId} not found.`);
      }

      if (teamLeader.departmentId !== createTeamDto.departmentId) {
        throw new BadRequestException('Team leader must be from the same department as the team.');
      }

      if (
        !teamLeader.roles.includes(UserRole.TEAM_MEMBER) &&
        !teamLeader.roles.includes(UserRole.DEPARTMENT_SUPERVISOR)
      ) {
        throw new BadRequestException(
          'Team leader must have TEAM_MEMBER or DEPARTMENT_SUPERVISOR role.'
        );
      }
    }

    // Create team
    const team = this.teamRepository.create({
      name: createTeamDto.name,
      departmentId: createTeamDto.departmentId,
      teamLeaderId: createTeamDto.teamLeaderId,
      status: createTeamDto.status || TeamStatus.AVAILABLE,
      baseLocation: createTeamDto.baseLocation,
    });

    return await this.teamRepository.save(team);
  }

  async findAll(authUser: JwtPayload): Promise<Team[]> {
    const whereCondition: FindOptionsWhere<Team> = {};

    // Authorization and filtering
    if (authUser.roles.includes(UserRole.SYSTEM_ADMIN)) {
      // Admin can see all teams
    } else if (authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR)) {
      // Supervisor can see teams in their department
      if (!authUser.departmentId) {
        throw new ForbiddenException('Department information missing for supervisor.');
      }
      whereCondition.departmentId = authUser.departmentId;
    } else if (authUser.roles.includes(UserRole.TEAM_MEMBER)) {
      // Team members can see teams in their department
      if (!authUser.departmentId) {
        return []; // Return empty if no department info
      }
      whereCondition.departmentId = authUser.departmentId;
    } else {
      // Other roles cannot access teams
      throw new ForbiddenException('Insufficient permissions to view teams.');
    }

    return await this.teamRepository.find({
      where: whereCondition,
      relations: [
        'department',
        'teamLeader',
        'teamSpecializations',
        'teamSpecializations.specialization',
      ],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number, authUser: JwtPayload): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: [
        'department',
        'teamLeader',
        'teamSpecializations',
        'teamSpecializations.specialization',
      ],
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found.`);
    }

    // Authorization check
    if (!this.isAuthorizedForTeamOperation(team, authUser, 'view')) {
      throw new ForbiddenException('You do not have permission to view this team.');
    }

    return team;
  }

  async update(id: number, updateTeamDto: UpdateTeamDto, authUser: JwtPayload): Promise<Team> {
    const team = await this.findOne(id, authUser);

    // Authorization check for management
    if (!this.isAuthorizedForTeamOperation(team, authUser, 'manage')) {
      throw new ForbiddenException('You do not have permission to update this team.');
    }

    // Prevent department change unless admin
    if (
      updateTeamDto.departmentId &&
      updateTeamDto.departmentId !== team.departmentId &&
      !authUser.roles.includes(UserRole.SYSTEM_ADMIN)
    ) {
      throw new ForbiddenException('Only system administrators can change team department.');
    }

    // Validate new team leader if provided
    if (updateTeamDto.teamLeaderId && updateTeamDto.teamLeaderId !== team.teamLeaderId) {
      const newTeamLeader = await this.userRepository.findOne({
        where: { id: updateTeamDto.teamLeaderId },
      });

      if (!newTeamLeader) {
        throw new NotFoundException(`Team leader with ID ${updateTeamDto.teamLeaderId} not found.`);
      }

      const targetDepartmentId = updateTeamDto.departmentId || team.departmentId;
      if (newTeamLeader.departmentId !== targetDepartmentId) {
        throw new BadRequestException('Team leader must be from the same department as the team.');
      }
    }

    // Update team
    Object.assign(team, updateTeamDto);
    return await this.teamRepository.save(team);
  }

  async remove(id: number, authUser: JwtPayload): Promise<void> {
    const team = await this.findOne(id, authUser);

    // Authorization check for management
    if (!this.isAuthorizedForTeamOperation(team, authUser, 'manage')) {
      throw new ForbiddenException('You do not have permission to remove this team.');
    }

    // Soft delete: Set status to INACTIVE
    team.status = TeamStatus.INACTIVE;
    await this.teamRepository.save(team);

    // Clear activeTeamId for all users in this team
    await this.userRepository.update({ activeTeamId: id }, { activeTeamId: null });

    // Update all active team memberships
    await this.teamMembershipHistoryRepository.update(
      { teamId: id, leftAt: IsNull() },
      { leftAt: new Date() }
    );
  }

  async addMemberToTeam(teamId: number, userId: number, authUser: JwtPayload): Promise<Team> {
    const team = await this.findOne(teamId, authUser);

    // Authorization check
    if (!this.isAuthorizedForTeamOperation(team, authUser, 'manage')) {
      throw new ForbiddenException('You do not have permission to manage team members.');
    }

    // Find the user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // Check if user is from the same department
    if (user.departmentId !== team.departmentId) {
      throw new BadRequestException('User must be from the same department as the team.');
    }

    // Check if user has appropriate role
    if (
      !user.roles.includes(UserRole.TEAM_MEMBER) &&
      !user.roles.includes(UserRole.DEPARTMENT_SUPERVISOR)
    ) {
      throw new BadRequestException('User must have TEAM_MEMBER or DEPARTMENT_SUPERVISOR role.');
    }

    // Check if user is already in this team
    if (user.activeTeamId === teamId) {
      throw new BadRequestException('User is already a member of this team.');
    }

    // If user is in another team, remove from that team first
    if (user.activeTeamId) {
      await this.removeMemberFromTeam(user.activeTeamId, userId, authUser);
    }

    // Update user's active team
    user.activeTeamId = teamId;
    await this.userRepository.save(user);

    // Create team membership history record
    const membershipHistory = this.teamMembershipHistoryRepository.create({
      userId,
      teamId,
      joinedAt: new Date(),
    });
    await this.teamMembershipHistoryRepository.save(membershipHistory);

    // Return updated team
    return await this.findOne(teamId, authUser);
  }

  async removeMemberFromTeam(teamId: number, userId: number, authUser: JwtPayload): Promise<Team> {
    const team = await this.findOne(teamId, authUser);

    // Authorization check
    if (!this.isAuthorizedForTeamOperation(team, authUser, 'manage')) {
      throw new ForbiddenException('You do not have permission to manage team members.');
    }

    // Find the user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // Check if user is actually in this team
    if (user.activeTeamId !== teamId) {
      throw new BadRequestException('User is not a member of this team.');
    }

    // Update user's active team to null
    user.activeTeamId = null;
    await this.userRepository.save(user);

    // Update team membership history
    await this.teamMembershipHistoryRepository.update(
      { userId, teamId, leftAt: IsNull() },
      { leftAt: new Date() }
    );

    // Return updated team
    return await this.findOne(teamId, authUser);
  }

  async addSpecializationToTeam(
    teamId: number,
    specializationId: number,
    authUser: JwtPayload
  ): Promise<Team> {
    const team = await this.findOne(teamId, authUser);

    // Authorization check
    if (!this.isAuthorizedForTeamOperation(team, authUser, 'manage')) {
      throw new ForbiddenException('You do not have permission to manage team specializations.');
    }

    // Check if specialization exists
    const specialization = await this.specializationRepository.findOne({
      where: { id: specializationId },
    });
    if (!specialization) {
      throw new NotFoundException(`Specialization with ID ${specializationId} not found.`);
    }

    // Note: Specialization entity doesn't have departmentId, so we skip department compatibility check

    // Check if team already has this specialization
    const existingRelation = await this.teamSpecializationRepository.findOne({
      where: { teamId, specializationId },
    });
    if (existingRelation) {
      throw new BadRequestException('Team already has this specialization.');
    }

    // Create team specialization relation
    const teamSpecialization = this.teamSpecializationRepository.create({
      teamId,
      specializationId,
    });
    await this.teamSpecializationRepository.save(teamSpecialization);

    // Return updated team
    return await this.findOne(teamId, authUser);
  }

  async removeSpecializationFromTeam(
    teamId: number,
    specializationId: number,
    authUser: JwtPayload
  ): Promise<void> {
    const team = await this.findOne(teamId, authUser);

    // Authorization check
    if (!this.isAuthorizedForTeamOperation(team, authUser, 'manage')) {
      throw new ForbiddenException('You do not have permission to manage team specializations.');
    }

    // Remove team specialization relation
    const result = await this.teamSpecializationRepository.delete({
      teamId,
      specializationId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Team specialization relation not found.');
    }
  }

  async getTeamMembers(teamId: number, authUser: JwtPayload): Promise<User[]> {
    const team = await this.findOne(teamId, authUser);

    // Authorization check
    if (!this.isAuthorizedForTeamOperation(team, authUser, 'view')) {
      throw new ForbiddenException('You do not have permission to view team members.');
    }

    // Get active team members
    return await this.userRepository.find({
      where: { activeTeamId: teamId },
      relations: ['department'],
      order: { id: 'ASC' },
    });
  }

  async getTeamSpecializations(teamId: number, authUser: JwtPayload): Promise<Specialization[]> {
    const team = await this.findOne(teamId, authUser);

    // Authorization check
    if (!this.isAuthorizedForTeamOperation(team, authUser, 'view')) {
      throw new ForbiddenException('You do not have permission to view team specializations.');
    }

    // Get team specializations via team specialization relations
    const teamSpecializations = await this.teamSpecializationRepository.find({
      where: { teamId },
      relations: ['specialization'],
    });

    return teamSpecializations.map(ts => ts.specialization);
  }

  async findNearestAvailableTeams(
    latitude: number,
    longitude: number,
    specializationId?: number
  ): Promise<Team[]> {
    let query = this.teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.department', 'department')
      .leftJoinAndSelect('team.teamLeader', 'teamLeader')
      .leftJoinAndSelect('team.teamSpecializations', 'teamSpecializations')
      .leftJoinAndSelect('teamSpecializations.specialization', 'specialization')
      .where('team.status = :status', { status: TeamStatus.AVAILABLE })
      .andWhere('team.baseLocation IS NOT NULL');

    // Filter by specialization if provided
    if (specializationId) {
      query = query.andWhere('specialization.id = :specializationId', { specializationId });
    }

    // Add distance calculation and ordering
    query = query
      .addSelect(
        `ST_Distance(
          team.baseLocation,
          ST_GeomFromText('POINT(${longitude} ${latitude})', 4326)
        )`,
        'distance'
      )
      .orderBy('distance', 'ASC')
      .limit(10);

    return await query.getMany();
  }

  async findTeamsByDepartment(departmentId: number, authUser: JwtPayload): Promise<Team[]> {
    // Authorization check
    if (!authUser.roles.includes(UserRole.SYSTEM_ADMIN)) {
      if (
        !authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR) ||
        authUser.departmentId !== departmentId
      ) {
        throw new ForbiddenException('You can only view teams in your own department.');
      }
    }

    return await this.teamRepository.find({
      where: { departmentId },
      relations: [
        'department',
        'teamLeader',
        'teamSpecializations',
        'teamSpecializations.specialization',
      ],
      order: { id: 'DESC' },
    });
  }
}
