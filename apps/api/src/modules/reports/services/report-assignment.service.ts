// apps/api/src/modules/reports/services/report-assignment.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Report } from '../entities/report.entity';
import { Assignment } from '../entities/assignment.entity';
import { Team } from '../../teams/entities/team.entity';
import { User } from '../../users/entities/user.entity';
import { ReportStatusHistory } from '../entities/report-status-history.entity';
import {
  ReportStatus,
  AssignmentStatus,
  AssigneeType,
  TeamStatus,
  UserRole,
} from '@kentnabiz/shared';
import { SUB_STATUS } from '../constants';
import { JwtPayload as AuthUser } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class ReportAssignmentService {
  private readonly logger = new Logger(ReportAssignmentService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Team) private readonly teamRepository: Repository<Team>
  ) {}

  /**
   * Assigns a report to a specific team.
   * This method handles the entire transaction, including updating the report status,
   * cancelling previous assignments, and creating history records.
   * @param reportId - The ID of the report to assign.
   * @param teamId - The ID of the team to assign the report to.
   * @param authUser - The authenticated user performing the action.
   */
  async assignToTeam(reportId: number, teamId: number, authUser: AuthUser): Promise<void> {
    await this.dataSource.transaction(async manager => {
      const reportRepo = manager.getRepository(Report);
      const teamRepo = manager.getRepository(Team);
      const assignmentRepo = manager.getRepository(Assignment);
      const statusHistoryRepo = manager.getRepository(ReportStatusHistory);

      // 1. Raporu ve takımı bul ve kilitle
      const report = await reportRepo.findOne({
        where: { id: reportId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!report) {
        throw new NotFoundException(`Rapor ID ${reportId} bulunamadı`);
      }

      const team = await teamRepo.findOneBy({ id: teamId });
      if (!team) {
        throw new NotFoundException(`Takım ID ${teamId} bulunamadı`);
      }

      // 2. İş kurallarını ve doğrulamaları uygula
      if (team.status !== TeamStatus.AVAILABLE) {
        throw new BadRequestException(`Takım, atama için müsait değil (Durum: ${team.status})`);
      }
      if (team.departmentId !== report.currentDepartmentId) {
        throw new BadRequestException('Takım, rapor ile aynı departmanda olmalıdır.');
      }

      // 3. Mevcut aktif atamaları iptal et (Idempotency için önemli)
      await assignmentRepo.update(
        { reportId, status: AssignmentStatus.ACTIVE },
        { status: AssignmentStatus.CANCELLED, cancelledAt: new Date() }
      );

      // 4. Yeni atamayı oluştur
      const newAssignment = assignmentRepo.create({
        reportId,
        assigneeType: AssigneeType.TEAM,
        assigneeTeamId: teamId,
        assignedById: authUser.sub,
        status: AssignmentStatus.ACTIVE,
        assignedAt: new Date(),
        acceptedAt: new Date(), // Takım atamaları otomatik kabul edilir
      });
      await assignmentRepo.save(newAssignment);
      this.logger.log(`Rapor ${reportId}, Takım ${teamId}'e atandı.`);

      // 5. Raporun durumunu ve tarihçesini güncelle
      if (report.status === ReportStatus.OPEN) {
        const previousStatus = report.status;
        report.status = ReportStatus.IN_REVIEW;
        report.updatedAt = new Date();
        await reportRepo.save(report);

        const history = statusHistoryRepo.create({
          reportId,
          previousStatus,
          newStatus: report.status,
          changedByUserId: authUser.sub,
          notes: `Rapor, Takım #${teamId}'e atandı ve durumu inceleniyor olarak güncellendi.`,
        });
        await statusHistoryRepo.save(history);
      }
    });
  }

  /**
   * Assigns a report to a specific user.
   * This method ensures the user is in the correct department and handles the transaction.
   * @param reportId - The ID of the report to assign.
   * @param userId - The ID of the user to assign the report to.
   * @param authUser - The authenticated user performing the action.
   */
  async assignToUser(reportId: number, userId: number, authUser: AuthUser): Promise<void> {
    await this.dataSource.transaction(async manager => {
      const reportRepo = manager.getRepository(Report);
      const userRepo = manager.getRepository(User);
      const assignmentRepo = manager.getRepository(Assignment);
      const statusHistoryRepo = manager.getRepository(ReportStatusHistory);

      // 1. Raporu ve kullanıcıyı bul
      const report = await reportRepo.findOne({
        where: { id: reportId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!report) throw new NotFoundException(`Rapor ID ${reportId} bulunamadı`);

      const userToAssign = await userRepo.findOneBy({ id: userId });
      if (!userToAssign) throw new NotFoundException(`Kullanıcı ID ${userId} bulunamadı`);

      // 2. İş kurallarını uygula
      if (userToAssign.departmentId !== report.currentDepartmentId) {
        throw new BadRequestException('Kullanıcı, rapor ile aynı departmanda olmalıdır.');
      }
      if (!userToAssign.roles.includes(UserRole.TEAM_MEMBER)) {
        throw new BadRequestException(
          'Sadece Ekip Üyesi rolündeki kullanıcılara atama yapılabilir.'
        );
      }

      // 3. Mevcut aktif atamaları iptal et
      await assignmentRepo.update(
        { reportId, status: AssignmentStatus.ACTIVE },
        { status: AssignmentStatus.CANCELLED, cancelledAt: new Date() }
      );

      // 4. Yeni atamayı oluştur
      const newAssignment = assignmentRepo.create({
        reportId,
        assigneeType: AssigneeType.USER,
        assigneeUserId: userId,
        assignedById: authUser.sub,
        status: AssignmentStatus.ACTIVE,
        assignedAt: new Date(),
      });
      await assignmentRepo.save(newAssignment);
      this.logger.log(`Rapor ${reportId}, Kullanıcı ${userId}'e atandı.`);

      // 5. Raporun durumunu ve tarihçesini güncelle
      if (report.status === ReportStatus.OPEN || report.status === ReportStatus.IN_REVIEW) {
        const previousStatus = report.status;
        report.status = ReportStatus.IN_PROGRESS; // Kişiye atandığında doğrudan işleme alınır
        report.subStatus = SUB_STATUS.NONE;
        report.updatedAt = new Date();
        await reportRepo.save(report);

        const history = statusHistoryRepo.create({
          reportId,
          previousStatus,
          newStatus: report.status,
          changedByUserId: authUser.sub,
          notes: `Rapor, Kullanıcı #${userId}'e atandı ve durumu işlemde olarak güncellendi.`,
        });
        await statusHistoryRepo.save(history);
      }
    });
  }
}
