// apps/api/src/modules/teams/services/teams.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, FindOptionsWhere, Not, DataSource } from 'typeorm';
import { Team } from '../entities/team.entity';
import { TeamSpecialization } from '../entities/team-specialization.entity';
import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { User } from '../../users/entities/user.entity';
import { Specialization } from '../../specializations/entities/specialization.entity';
import { TeamMembershipHistory } from '../../users/entities/team-membership-history.entity';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { UserRole, TeamStatus } from '@kentnabiz/shared';

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
    private readonly teamMembershipHistoryRepository: Repository<TeamMembershipHistory>,
    private readonly dataSource: DataSource
  ) {}

  // Authorization helper method
  private isAuthorizedForTeamOperation(
    team: Team,
    authUser: JwtPayload,
    action: 'view' | 'manage'
  ): boolean {
    console.log(
      `[isAuthorizedForTeamOperation] Checking auth for user ${authUser.sub} (Roles: ${authUser.roles.join(',')}, Dept: ${authUser.departmentId}) on team ${team.id} (Dept: ${team.departmentId}) for action: ${action}`
    );

    if (authUser.roles.includes(UserRole.SYSTEM_ADMIN)) {
      console.log(`[isAuthorizedForTeamOperation] SYSTEM_ADMIN detected. Access granted.`);
      return true;
    }

    if (authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR)) {
      if (authUser.departmentId && team.departmentId === authUser.departmentId) {
        console.log(
          `[isAuthorizedForTeamOperation] DEPARTMENT_SUPERVISOR in same department. Access granted for action '${action}'.`
        );
        return true; // Supervisor can view and manage teams in their department
      } else {
        console.log(
          `[isAuthorizedForTeamOperation] DEPARTMENT_SUPERVISOR department mismatch or missing deptId. User Dept: ${authUser.departmentId}, Team Dept: ${team.departmentId}`
        );
      }
    }

    if (action === 'view' && authUser.roles.includes(UserRole.TEAM_MEMBER)) {
      // Team members can view teams in their own department or their own active team.
      // (findOne içinde kendi aktif takımı için ek kontrol yapılıyor)
      if (authUser.departmentId && team.departmentId === authUser.departmentId) {
        console.log(
          `[isAuthorizedForTeamOperation] TEAM_MEMBER in same department. 'view' access granted.`
        );
        return true;
      }
      // Kendi aktif takımıysa (bu kontrol findOne içinde daha spesifik yapılabilir)
      if (authUser.activeTeamId === team.id) {
        console.log(
          `[isAuthorizedForTeamOperation] TEAM_MEMBER viewing their own active team. 'view' access granted.`
        );
        return true;
      }
      console.log(`[isAuthorizedForTeamOperation] TEAM_MEMBER condition for 'view' not met.`);
    }
    console.log(
      `[isAuthorizedForTeamOperation] No explicit grant. Access denied for action '${action}'.`
    );
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
    const whereCondition: FindOptionsWhere<Team> = {
      status: Not(TeamStatus.INACTIVE), // Exclude soft-deleted teams
    };

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
    console.log(
      `[TeamsService.findOne] Called for team ID: ${id} by authUser: ${authUser.sub} (${authUser.email})`
    );
    const team = await this.teamRepository.findOne({
      where: {
        id,
        status: Not(TeamStatus.INACTIVE),
      },
      relations: [
        'department',
        'teamLeader',
        'teamSpecializations',
        'teamSpecializations.specialization',
      ],
    });

    if (!team) {
      console.warn(`[TeamsService.findOne] Team with ID ${id} not found in repository.`);
      throw new NotFoundException(`Team with ID ${id} not found.`);
    }
    console.log(
      `[TeamsService.findOne] Team ${id} found: ${team.name}. Department: ${team.departmentId}`
    );

    // Temel görüntüleme yetkisi kontrolü
    const canView = this.isAuthorizedForTeamOperation(team, authUser, 'view');
    console.log(
      `[TeamsService.findOne] Authorization check for 'view' on team ${id} by authUser ${authUser.sub}: ${canView}`
    );

    if (!canView) {
      // TEAM_MEMBER için ek kontrol: Kendi takımını görebilmeli
      let canViewAsTeamMember = false;
      if (authUser.roles.includes(UserRole.TEAM_MEMBER) && authUser.activeTeamId === team.id) {
        canViewAsTeamMember = true;
        console.log(
          `[TeamsService.findOne] AuthUser ${authUser.sub} is a member of team ${id}, allowing 'view'.`
        );
      }
      if (!canViewAsTeamMember) {
        console.warn(
          `[TeamsService.findOne] AuthUser ${authUser.sub} does not have 'view' permission for team ${id}.`
        );
        throw new ForbiddenException('You do not have permission to view this team.');
      }
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
    console.log(
      `[TeamsService.addMemberToTeam] Attempting to add user ${userId} to team ${teamId} by authUser ${authUser.sub} (${authUser.roles.join(', ')})`
    );

    // 1. Takımı çek ve temel 'view' yetkisini kontrol et (findOne içinde yapılıyor varsayımı).
    //    Bu aynı zamanda takımın var olup olmadığını da kontrol eder.
    const team = await this.findOne(teamId, authUser);

    // 2. 'manage' (üye yönetimi) yetkisini ayrıca kontrol et.
    if (!this.isAuthorizedForTeamOperation(team, authUser, 'manage')) {
      throw new ForbiddenException('You do not have permission to manage team members.');
    }

    // 3. Veritabanı işlemleri için transaction başlat.
    await this.dataSource.transaction(async manager => {
      // 3a. Kullanıcıyı 'pessimistic_write' kilidi ile çek.
      //     Bu, aynı kullanıcı üzerinde eş zamanlı işlem yapılmasını engeller.
      const user = await manager.getRepository(User).findOne({
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      // 3b. Kullanıcı varlık kontrolü.
      if (!user) {
        console.error(`[TeamsService.addMemberToTeam] User with ID ${userId} not found.`);
        throw new NotFoundException(`User with ID ${userId} not found.`);
      }

      // 3c. Departman uyumluluk kontrolü.
      if (user.departmentId !== team.departmentId) {
        console.warn(
          `[TeamsService.addMemberToTeam] User ${userId} (dept: ${user.departmentId}) cannot be added to team ${teamId} (dept: ${team.departmentId}) due to department mismatch.`
        );
        throw new BadRequestException('User must be from the same department as the team.');
      }

      // 3d. Rol uyumluluk kontrolü (kullanıcının takıma eklenebilir bir role sahip olması).
      if (
        !user.roles.includes(UserRole.TEAM_MEMBER) &&
        !user.roles.includes(UserRole.DEPARTMENT_SUPERVISOR)
      ) {
        console.warn(
          `[TeamsService.addMemberToTeam] User ${userId} does not have required role (TEAM_MEMBER or DEPARTMENT_SUPERVISOR). Roles: ${user.roles.join(', ')}`
        );
        throw new BadRequestException(
          'User must have TEAM_MEMBER or DEPARTMENT_SUPERVISOR role to be added to a team.'
        );
      }

      // 3e. Idempotency kontrolü: Kullanıcı zaten bu takımın aktif üyesiyse,
      //     veritabanında herhangi bir değişiklik yapma.
      if (user.activeTeamId === teamId) {
        console.log(
          `[TeamsService.addMemberToTeam] User ${userId} is already an active member of team ${teamId}. No database changes needed within the transaction.`
        );
        // Bu durumda transaction içinde başka bir işlem yapmaya gerek yok.
        // Metodun sonundaki \`this.findOne\` güncel bilgiyi döndürecektir.
        return; // Transaction'dan güvenle çıkılır.
      }

      // 3f. Kullanıcı başka bir takımın aktif üyesiyse, o takımdan çıkar.
      if (user.activeTeamId) {
        console.log(
          `[TeamsService.addMemberToTeam] User ${userId} is currently an active member of team ${user.activeTeamId}. Removing from old team before adding to team ${teamId}.`
        );
        // Kullanıcının mevcut aktif takımını null yap.
        await manager.getRepository(User).update({ id: userId }, { activeTeamId: null });
        // Eski üyelik geçmişini sonlandır.
        await manager
          .getRepository(TeamMembershipHistory)
          .update({ userId, teamId: user.activeTeamId, leftAt: IsNull() }, { leftAt: new Date() });
        console.log(
          `[TeamsService.addMemberToTeam] User ${userId} removed from old team ${user.activeTeamId}.`
        );
      }

      // 3g. Kullanıcıyı yeni takıma ata ve yeni üyelik geçmişi kaydı oluştur.
      console.log(
        `[TeamsService.addMemberToTeam] Adding user ${userId} as an active member to new team ${teamId}.`
      );
      await manager.getRepository(User).update({ id: userId }, { activeTeamId: teamId });
      const newMembershipHistory = manager
        .getRepository(TeamMembershipHistory)
        .create({ userId, teamId, joinedAt: new Date() });
      await manager.getRepository(TeamMembershipHistory).save(newMembershipHistory);
      console.log(
        `[TeamsService.addMemberToTeam] User ${userId} successfully added to team ${teamId} and membership history created.`
      );
    }); // Transaction burada commit edilir veya bir hata olursa rollback yapılır.

    // 4. Her durumda (yeni eklendi, zaten üyeydi veya başka takımdan ayrılıp eklendi),
    //    güncel takım bilgisini döndür. Bu, Promise<Team> kontratını sağlar ve
    //    controller\'ın 201 (Created) veya 200 (OK) ile bu bilgiyi dönmesine olanak tanır.
    console.log(
      `[TeamsService.addMemberToTeam] Transaction completed. Fetching and returning updated team info for team ${teamId}.`
    );
    return this.findOne(teamId, authUser);
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

  async findAllPaginated(page: number, limit: number): Promise<{ data: Team[]; total: number }> {
    const allTeams = await this.teamRepository.find({
      relations: [
        'department',
        'teamLeader',
        'teamSpecializations',
        'teamSpecializations.specialization',
      ],
      order: { id: 'DESC' },
    });
    const total = allTeams.length;
    const start = (page - 1) * limit;
    const paginated = allTeams.slice(start, start + limit);
    return { data: paginated, total };
  }
}
