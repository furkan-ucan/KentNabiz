import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Inject,
  forwardRef,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ReportRepository } from '../repositories/report.repository';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { UpdateReportStatusDto } from '../dto/update-report-status.dto';
import { ForwardReportDto } from '../dto/forward-report.dto';
import { Report } from '../entities/report.entity';
import { Assignment } from '../entities/assignment.entity';
import { ReportStatusHistory } from '../entities/report-status-history.entity';
import { DepartmentHistory } from '../entities/department-history.entity';
import { Team } from '../../teams/entities/team.entity';
import { LocationService } from './location.service';
import { DepartmentService } from './department.service';
import { CategoryService } from './category.service';
import {
  ReportStatus,
  ReportType,
  UserRole,
  MunicipalityDepartment,
  AssignmentStatus,
  AssigneeType,
  TeamStatus,
} from '@kentnabiz/shared';
import { ISpatialQueryResult } from '../interfaces/report.interface';
import { JwtPayload as AuthUser } from '../../auth/interfaces/jwt-payload.interface';
import { UsersService } from '../../users/services/users.service';
import { DepartmentHistoryResponseDto } from '../dto/department-history.response.dto';
import { ReportMedia } from '../entities/report-media.entity';
import { ReportSupport } from '../entities/report-support.entity';
import { CreateReportData } from '../repositories/report.repository';
import { canTransition } from '../utils/report-status.utils';
import { SUB_STATUS } from '../constants';
import { AbilityFactory, Action } from '../../../core/authorization/ability.factory';
import { User } from '../../users/entities/user.entity';

interface IReportFindAllOptions {
  limit?: number;
  page?: number;
  userId?: number;
  reportType?: ReportType; // type -> reportType olarak güncellendi
  status?: ReportStatus;
  departmentCode?: MunicipalityDepartment; // department -> departmentCode olarak güncellendi
  currentUserId?: number; // isSupportedByCurrentUser için gerekli
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly locationService: LocationService,
    private readonly departmentService: DepartmentService,
    private readonly categoryService: CategoryService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(ReportStatusHistory)
    private readonly reportStatusHistoryRepository: Repository<ReportStatusHistory>,
    @InjectRepository(DepartmentHistory)
    private readonly departmentHistoryRepository: Repository<DepartmentHistory>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(ReportSupport)
    private readonly reportSupportRepository: Repository<ReportSupport>,
    private readonly dataSource: DataSource,
    private readonly abilityFactory: AbilityFactory
  ) {}

  private canUserPerformActionOnReport(
    report: Report,
    authUser: AuthUser,
    action: 'view' | 'update_basic' | 'delete' | 'change_status' | 'assign' | 'forward'
  ): boolean {
    console.log('[canUserPerformActionOnReport] AuthUser:', JSON.stringify(authUser));
    console.log('[canUserPerformActionOnReport] Report:', JSON.stringify(report));
    console.log('[canUserPerformActionOnReport] Action:', action);

    if (authUser.roles.includes(UserRole.SYSTEM_ADMIN)) {
      console.log('[canUserPerformActionOnReport] SYSTEM_ADMIN check: true');
      return true;
    }

    if (authUser.roles.includes(UserRole.CITIZEN)) {
      if (report.userId !== authUser.sub) return false;
      if (action === 'view') return true;
      if (
        action === 'update_basic' &&
        (report.status === ReportStatus.OPEN || report.status === ReportStatus.IN_REVIEW)
      )
        return true;
      if (action === 'delete' && report.status === ReportStatus.OPEN) return true;
      return false;
    }

    // AuthUser'ın departmentId'si var mı? (Bu kontrolü ekleyelim)
    if (
      action !== 'view' &&
      (authUser.departmentId === undefined || authUser.departmentId === null)
    ) {
      // Sadece 'view' dışındaki aksiyonlar için departman ID'si kesinlikle gerekli.
      // Admin zaten yukarıda geçti. Diğer roller (Supervisor, Employee) için departman ID'si olmalı.
      // Vatandaşın departman ID'si olmayabilir, o kendi raporlarını userId ile kontrol ediyor.
      if (
        authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR) ||
        authUser.roles.includes(UserRole.TEAM_MEMBER)
      ) {
        console.log(
          '[canUserPerformActionOnReport] Department role without departmentId, action:',
          action
        );
        return false;
      }
    }

    if (authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR)) {
      console.log('[canUserPerformActionOnReport] DEPARTMENT_SUPERVISOR check');
      console.log(
        `[canUserPerformActionOnReport] Report Dept ID: ${report.currentDepartmentId}, User Dept ID: ${authUser.departmentId}`
      );
      if (report.currentDepartmentId !== authUser.departmentId) {
        console.log('[canUserPerformActionOnReport] Supervisor Dept Mismatch: true');
        return false;
      }
      console.log('[canUserPerformActionOnReport] Supervisor Dept Mismatch: false');
      if (
        action === 'view' ||
        action === 'update_basic' ||
        action === 'change_status' ||
        action === 'assign' ||
        action === 'forward'
      ) {
        console.log(`[canUserPerformActionOnReport] Supervisor Action Allowed: ${action}`);
        return true;
      }
      console.log(`[canUserPerformActionOnReport] Supervisor Action NOT Allowed: ${action}`);
      return false;
    }

    if (authUser.roles.includes(UserRole.TEAM_MEMBER)) {
      const teamAssignment = report.assignments?.find(
        a =>
          a.assigneeTeamId === authUser.activeTeamId &&
          a.status === AssignmentStatus.ACTIVE &&
          a.assigneeType === AssigneeType.TEAM
      );
      if (teamAssignment) {
        // If there's an active team assignment, allow the action.
        // Specific allowed transitions (e.g., IN_PROGRESS, PENDING_APPROVAL)
        // should be handled by the status transition logic itself or further ABAC checks.
        return true;
      }
      // If no team assignment, fall through to deny or check other conditions.
    }
    console.log('[canUserPerformActionOnReport] No matching role or condition, returning false');
    return false;
  }

  async findAll(authUser: AuthUser, options?: IReportFindAllOptions): Promise<ISpatialQueryResult> {
    const queryOptions: IReportFindAllOptions = {
      ...options,
      currentUserId: authUser.sub, // Her zaman mevcut kullanıcının ID'sini ekle
    };

    if (authUser.roles.includes(UserRole.CITIZEN)) {
      queryOptions.userId = authUser.sub;
    } else if (
      authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR) ||
      authUser.roles.includes(UserRole.TEAM_MEMBER)
    ) {
      if (authUser.departmentId) {
        // Eğer kullanıcı kendi departmanına ait raporları istiyorsa ve özellikle bir departman filtresi belirtmemişse
        if (!options?.departmentCode && authUser.departmentId) {
          try {
            const userDepartment = await this.departmentService.findById(authUser.departmentId);
            queryOptions.departmentCode = userDepartment.code; // department -> departmentCode
          } catch (error) {
            console.error(
              `Department not found for user ${authUser.sub} with departmentId ${authUser.departmentId}: ${(error as Error).message}`
            );
            return {
              data: [],
              total: 0,
              page: options?.page || 1,
              limit: options?.limit || 10,
            };
          }
        }
        // Eğer kullanıcı bir departman filtresi belirtmişse ve bu kendi departmanı değilse (ve admin değilse) hata verilebilir.
        // Ancak şu anki mantıkta, eğer departmentCode belirtilmişse o kullanılır, belirtilmemişse kullanıcının departmanı kullanılır.
        // Bu davranış şimdilik korunuyor.
      } else {
        // Kullanıcının departman ID'si yoksa ve admin değilse ve departman filtresi de yoksa hata fırlat.
        if (!options?.departmentCode && !authUser.roles.includes(UserRole.SYSTEM_ADMIN)) {
          throw new UnauthorizedException(
            'User department information is missing and no department filter provided.'
          );
        }
      }
    }
    // reportRepository.findAll çağrısında options doğrudan geçiliyor, bu options IReportFindAllOptions tipinde olmalı
    // ve reportRepository.findAll da bu güncellenmiş alan adlarını (reportType, departmentCode) beklemeli.
    // Bir önceki adımda ReportRepository güncellenmişti.
    return this.reportRepository.findAll(queryOptions);
  }

  async findOne(id: number, authUser: AuthUser): Promise<Report> {
    console.log('[findOne] AuthUser:', JSON.stringify(authUser));
    const report = await this.reportRepository.findById(id, authUser.sub);
    console.log('[findOne] Report fetched:', JSON.stringify(report));
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    if (!this.canUserPerformActionOnReport(report, authUser, 'view')) {
      console.error('[findOne] Permission denied by canUserPerformActionOnReport for view action');
      throw new UnauthorizedException('You do not have permission to view this report.');
    }
    return report;
  }

  async create(createReportDto: CreateReportDto, authUser: AuthUser): Promise<Report> {
    return this.dataSource.transaction(async manager => {
      const { location, reportType, categoryId, departmentCode, reportMedias, ...reportData } =
        createReportDto;
      const point = this.locationService.createPointFromDto(location);
      const userId = authUser.sub;

      // 1. Departman kodunun varlığını kontrol et
      const departmentEntity = await this.departmentService.findByCode(departmentCode);

      // 2. Kategori ID'sinin varlığını ve departmana ait olduğunu kontrol et
      const categoryEntity = await this.categoryService.findById(categoryId);
      if (categoryEntity.departmentId !== departmentEntity.id) {
        throw new BadRequestException(
          `Kategori ID ${categoryId} seçilen departman ${departmentCode} için geçerli değil`
        );
      }

      // 3. reportType'ı kategoriden türet (eğer verilmemişse)
      const finalReportType: ReportType = reportType || categoryEntity.defaultReportType;

      const dataForRepoCreate: CreateReportData = {
        title: reportData.title,
        description: reportData.description,
        location: point,
        address: reportData.address,
        reportType: finalReportType,
        status: ReportStatus.OPEN,
        categoryId: categoryId,
        currentDepartmentId: departmentEntity.id,
        departmentCode: departmentCode,
        reportMedias: reportMedias
          ? reportMedias.map(m => ({ url: m.url, type: m.type }))
          : undefined,
      };

      // manager argümanı kaldırıldı. ReportRepository.create'in refaktör edilmesi gerekebilir
      // ve orijinal imzasının (data, userId) olduğu varsayılıyor.
      const createdReport = await this.reportRepository.create(dataForRepoCreate, userId);

      // departmentCode'u da set et
      createdReport.departmentCode = departmentCode;

      // Set initial subStatus after creation
      createdReport.subStatus = SUB_STATUS.NONE;
      // Raporun (özellikle subStatus) işlem yöneticisiyle kaydedildiğinden emin olun
      await manager.save(Report, createdReport);

      // Create initial ReportStatusHistory record
      const historyData: Partial<ReportStatusHistory> = {
        reportId: createdReport.id,
        newStatus: ReportStatus.OPEN,
        changedByUserId: authUser.sub,
        changedAt: new Date(),
        notes: 'Report created',
      };
      // SUB_STATUS.NONE null ise ekleme
      if (typeof SUB_STATUS.NONE === 'string') {
        historyData.newSubStatus = SUB_STATUS.NONE;
      }
      const statusHistory = manager.create(ReportStatusHistory, historyData);
      await manager.save(statusHistory);

      return createdReport;
    });
  }

  async update(id: number, updateReportDto: UpdateReportDto, authUser: AuthUser): Promise<Report> {
    const report = await this.findOne(id, authUser);

    if (!this.canUserPerformActionOnReport(report, authUser, 'update_basic')) {
      throw new UnauthorizedException('You do not have permission to update this report.');
    }

    if (
      authUser.roles.includes(UserRole.CITIZEN) &&
      report.status !== ReportStatus.OPEN &&
      report.status !== ReportStatus.IN_REVIEW
    ) {
      throw new BadRequestException(
        `Report in status ${report.status} cannot be updated by citizen.`
      );
    }

    const { location, reportType, reportMedias, ...updateData } = updateReportDto;
    const finalUpdateData: Partial<Report> = { ...updateData };

    if (location) {
      finalUpdateData.location = this.locationService.createPointFromDto(location);
    }
    if (reportType) {
      finalUpdateData.reportType = reportType;
    }

    if (reportMedias) {
      (finalUpdateData as Partial<Report> & { reportMedias?: ReportMedia[] }).reportMedias =
        reportMedias.map(m => ({ ...m, reportId: id }) as ReportMedia);
    }

    const updatedReport = await this.reportRepository.update(id, finalUpdateData);
    if (!updatedReport) {
      throw new NotFoundException(`Report with ID ${id} could not be updated or not found.`);
    }
    return this.findOne(id, authUser);
  }

  async remove(id: number, authUser: AuthUser): Promise<void> {
    const report = await this.findOne(id, authUser);

    if (!this.canUserPerformActionOnReport(report, authUser, 'delete')) {
      throw new UnauthorizedException('You do not have permission to delete this report.');
    }
    const result = await this.reportRepository.remove(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Report with ID ${id} not found for deletion.`);
    }
  }

  async updateStatus(
    reportId: number,
    dto: UpdateReportStatusDto,
    authUser: AuthUser
  ): Promise<Report> {
    console.log(
      `[ReportsService.updateStatus] Entry - Report ID: ${reportId}, User ID: ${authUser.sub}, User Email: ${authUser.email}, User Active Team ID: ${authUser.activeTeamId}, New Status: ${dto.newStatus}, New SubStatus: ${dto.subStatus}`
    );

    // First, get report for authorization check (without lock and transaction)
    const reportForInitialCheck = await this.reportRepository.findById(reportId);
    if (!reportForInitialCheck) {
      throw new NotFoundException(`Report with ID ${reportId} not found`);
    }

    // TeamMember için aktif assignment kontrolü (transaction dışında, hızlı kontrol)
    if (authUser.roles.includes(UserRole.TEAM_MEMBER)) {
      console.log(
        `[ReportsService.updateStatus] TEAM_MEMBER (ID: ${authUser.sub}, ActiveTeamID: ${authUser.activeTeamId}) attempting to update status for report ${reportId}.`
      );
      const assignmentsForCheck = await this.assignmentRepository.find({ where: { reportId } });
      console.log(
        `[ReportsService.updateStatus] Report assignments for report ${reportId} (for active check):`,
        JSON.stringify(assignmentsForCheck)
      );

      const hasActiveAssignment =
        Array.isArray(assignmentsForCheck) &&
        assignmentsForCheck.some((a: Assignment) => {
          const isUserMatch =
            a.assigneeType === AssigneeType.USER && a.assigneeUserId === authUser.sub;
          const isTeamMatch =
            a.assigneeType === AssigneeType.TEAM && a.assigneeTeamId === authUser.activeTeamId;
          const isActive = a.status === AssignmentStatus.ACTIVE;
          const isAccepted = a.acceptedAt !== null && typeof a.acceptedAt !== 'undefined';

          console.log(
            `[ReportsService.updateStatus] Checking assignment ID ${a.id}: assigneeType=${a.assigneeType}, assigneeUserId=${a.assigneeUserId}, assigneeTeamId=${a.assigneeTeamId}, status=${a.status}, acceptedAt=${a.acceptedAt?.toISOString() ?? 'N/A'}, isUserMatch=${isUserMatch}, isTeamMatch=${isTeamMatch}, isActive=${isActive}, isAccepted=${isAccepted}`
          );
          return (isUserMatch || isTeamMatch) && isActive && isAccepted;
        });

      if (!hasActiveAssignment) {
        console.log(
          `[ReportsService.updateStatus] TEAM_MEMBER hasActiveAssignment: false for report ${reportId}. User: ${authUser.sub}, ActiveTeam: ${authUser.activeTeamId}`
        );
        throw new ForbiddenException(
          'Bu raporu güncellemek için kabul edilmiş ve aktif bir atamanız bulunmamaktadır.'
        );
      }
      console.log(
        `[ReportsService.updateStatus] TEAM_MEMBER hasActiveAssignment: true for report ${reportId}. User: ${authUser.sub}, ActiveTeam: ${authUser.activeTeamId}`
      );
    }

    // İlk olarak raporu çek ve ABAC yetki kontrolü yap (transaction dışında)
    const reportForAuthCheck = await this.findOneForAuthCheck(reportId);

    // AuthUser'dan User objesine dönüştür (sadece yetki kontrolü için gerekli alanlar)
    const userForAbility: Partial<User> = {
      id: authUser.sub,
      roles: authUser.roles,
      departmentId: authUser.departmentId,
      activeTeamId: authUser.activeTeamId,
    };

    const ability = this.abilityFactory.defineAbility(userForAbility as User);
    const nextStatus = dto.newStatus;

    console.log(
      `[ReportsService.updateStatus] ABAC Check - User: ${authUser.sub}, Report: ${reportId}, NextStatus: ${nextStatus}`
    );
    console.log(
      `[ReportsService.updateStatus] UserForAbility:`,
      JSON.stringify(userForAbility, null, 2)
    );
    console.log(
      `[ReportsService.updateStatus] ReportForAuthCheck:`,
      JSON.stringify(
        {
          id: reportForAuthCheck.id,
          status: reportForAuthCheck.status,
          subStatus: reportForAuthCheck.subStatus,
          currentDepartmentId: reportForAuthCheck.currentDepartmentId,
          userId: reportForAuthCheck.userId,
        },
        null,
        2
      )
    );

    // Status'a göre farklı action'lar kontrol et (transaction dışında)
    if (nextStatus === ReportStatus.CANCELLED) {
      console.log(`[ReportsService.updateStatus] Checking Action.Cancel permission`);
      if (!ability.can(Action.Cancel, reportForAuthCheck)) {
        throw new ForbiddenException('You do not have permission to cancel this report.');
      }
    } else if (
      nextStatus === ReportStatus.DONE &&
      authUser.roles.includes(UserRole.TEAM_MEMBER) &&
      !authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR)
    ) {
      console.log(
        `[ReportsService.updateStatus] Checking Action.CompleteWork permission for TEAM_MEMBER`
      );
      if (!ability.can(Action.CompleteWork, reportForAuthCheck)) {
        throw new ForbiddenException('You do not have permission to complete work on this report.');
      }
    } else if (
      nextStatus === ReportStatus.DONE &&
      authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR) &&
      reportForAuthCheck.subStatus === SUB_STATUS.PENDING_APPROVAL
    ) {
      console.log(
        `[ReportsService.updateStatus] Checking Action.Approve permission for DEPARTMENT_SUPERVISOR`
      );
      if (!ability.can(Action.Approve, reportForAuthCheck)) {
        throw new ForbiddenException('You do not have permission to approve this report.');
      }
    } else if (nextStatus === ReportStatus.REJECTED) {
      console.log(`[ReportsService.updateStatus] Checking Action.Reject permission`);
      if (!ability.can(Action.Reject, reportForAuthCheck)) {
        throw new ForbiddenException('You do not have permission to reject this report.');
      }
    } else {
      // Genel durum güncelleme yetkisi kontrolü
      console.log(`[ReportsService.updateStatus] Checking Action.Update permission`);
      if (!ability.can(Action.Update, reportForAuthCheck)) {
        throw new ForbiddenException('You do not have permission to update this report.');
      }
    }

    // Use transaction for data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    let transactionStarted = false;

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      transactionStarted = true;
      console.log(`[ReportsService.updateStatus] Transaction started for report ${reportId}.`);

      // Find report with lock using createQueryBuilder to avoid outer join issues
      const lockedReport = await queryRunner.manager
        .createQueryBuilder(Report, 'report')
        .leftJoinAndSelect('report.currentDepartment', 'currentDepartment')
        .leftJoinAndSelect('report.assignments', 'assignments')
        .where('report.id = :id', { id: reportId })
        .setLock('pessimistic_write', undefined, ['report'])
        .getOne();

      if (!lockedReport) {
        throw new NotFoundException(`Report with ID ${reportId} not found`);
      }

      console.log(
        `[ReportsService.updateStatus] Locked report ${reportId} and its relations loaded within transaction.`
      );

      // Authorization check (eski yöntem - artık ABAC kullanıyoruz ama fallback olarak kalsın)
      if (!this.canUserPerformActionOnReport(lockedReport, authUser, 'change_status')) {
        throw new UnauthorizedException('You do not have permission to update this report status.');
      }

      // Check if transition is allowed using central canTransition function
      if (!canTransition(authUser.roles, lockedReport.status, nextStatus)) {
        throw new ForbiddenException(
          `Status transition from ${lockedReport.status} to ${nextStatus} is not allowed for your role.`
        );
      }

      const previousStatus = lockedReport.status;
      const previousSubStatus = lockedReport.subStatus;

      // Handle special status transition logic with subStatus management
      if (
        authUser.roles.includes(UserRole.TEAM_MEMBER) &&
        !authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR) &&
        lockedReport.status === ReportStatus.IN_REVIEW &&
        nextStatus === ReportStatus.IN_PROGRESS
      ) {
        lockedReport.status = ReportStatus.IN_PROGRESS;
        lockedReport.subStatus = SUB_STATUS.NONE;
        const activeAssignment = lockedReport.assignments?.find(
          (a: Assignment) =>
            a.status === AssignmentStatus.ACTIVE &&
            ((a.assigneeType === AssigneeType.USER && a.assigneeUserId === authUser.sub) ||
              (a.assigneeType === AssigneeType.TEAM && a.assigneeTeamId === authUser.activeTeamId))
        );
        if (activeAssignment && typeof activeAssignment.acceptedAt === 'undefined') {
          activeAssignment.acceptedAt = new Date();
          activeAssignment.status = AssignmentStatus.ACTIVE; // Ensure it's active
          await queryRunner.manager.save(Assignment, activeAssignment);
        }
      } else if (
        authUser.roles.includes(UserRole.TEAM_MEMBER) &&
        !authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR) &&
        lockedReport.status === ReportStatus.IN_PROGRESS &&
        nextStatus === ReportStatus.DONE
      ) {
        lockedReport.status = ReportStatus.IN_PROGRESS;
        lockedReport.subStatus = SUB_STATUS.PENDING_APPROVAL;
        if (dto.resolutionNotes) {
          lockedReport.resolutionNotes = dto.resolutionNotes;
        }
      } else if (
        authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR) &&
        lockedReport.status === ReportStatus.IN_PROGRESS &&
        lockedReport.subStatus === SUB_STATUS.PENDING_APPROVAL &&
        (nextStatus === ReportStatus.DONE || nextStatus === ReportStatus.REJECTED)
      ) {
        lockedReport.status = nextStatus;
        lockedReport.subStatus = SUB_STATUS.NONE;
        if (nextStatus === ReportStatus.DONE) {
          lockedReport.resolvedAt = new Date();
          lockedReport.closedByUserId = authUser.sub;
          if (dto.resolutionNotes) {
            lockedReport.resolutionNotes = dto.resolutionNotes;
          }
        } else if (nextStatus === ReportStatus.REJECTED) {
          if (!dto.rejectionReason) {
            throw new BadRequestException('Rejection reason is required when rejecting a report.');
          }
          lockedReport.rejectionReason = dto.rejectionReason;
          lockedReport.closedByUserId = authUser.sub;
        }
      } else if (
        (authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR) ||
          authUser.roles.includes(UserRole.SYSTEM_ADMIN)) &&
        lockedReport.status === ReportStatus.OPEN &&
        nextStatus === ReportStatus.CANCELLED
      ) {
        lockedReport.status = ReportStatus.CANCELLED;
        lockedReport.subStatus = SUB_STATUS.NONE;
        lockedReport.closedByUserId = authUser.sub;
      } else if (dto.subStatus) {
        lockedReport.status = nextStatus;
        lockedReport.subStatus = dto.subStatus;
        if (nextStatus === ReportStatus.DONE) {
          lockedReport.resolvedAt = new Date();
          lockedReport.closedByUserId = authUser.sub;
          if (dto.resolutionNotes) {
            lockedReport.resolutionNotes = dto.resolutionNotes;
          }
        } else if (nextStatus === ReportStatus.REJECTED) {
          if (!dto.rejectionReason) {
            throw new BadRequestException('Rejection reason is required when rejecting a report.');
          }
          lockedReport.rejectionReason = dto.rejectionReason;
          lockedReport.closedByUserId = authUser.sub;
        }
      } else {
        lockedReport.status = nextStatus;
        lockedReport.subStatus = SUB_STATUS.NONE;
        if (nextStatus === ReportStatus.DONE) {
          lockedReport.resolvedAt = new Date();
          lockedReport.closedByUserId = authUser.sub;
          if (dto.resolutionNotes) {
            lockedReport.resolutionNotes = dto.resolutionNotes;
          }
        } else if (nextStatus === ReportStatus.REJECTED) {
          if (!dto.rejectionReason) {
            throw new BadRequestException('Rejection reason is required when rejecting a report.');
          }
          lockedReport.rejectionReason = dto.rejectionReason;
          lockedReport.closedByUserId = authUser.sub;
        }
      }

      await queryRunner.manager.save(Report, lockedReport);

      const statusHistory = queryRunner.manager.create(ReportStatusHistory, {
        reportId: lockedReport.id,
        ...(previousStatus !== undefined ? { previousStatus } : {}),
        newStatus: lockedReport.status,
        ...(typeof previousSubStatus === 'string' ? { previousSubStatus } : {}),
        ...(typeof lockedReport.subStatus === 'string'
          ? { newSubStatus: lockedReport.subStatus }
          : {}),
        changedByUserId: authUser.sub,
        changedAt: new Date(),
        notes: `Status changed from ${previousStatus} to ${lockedReport.status}`,
      });
      await queryRunner.manager.save(statusHistory);

      await queryRunner.commitTransaction();
      console.log(`[ReportsService.updateStatus] Transaction committed for report ${reportId}.`);

      const finalReport = await queryRunner.manager.findOneOrFail(Report, {
        where: { id: reportId },
        relations: ['assignments', 'statusHistory', 'departmentHistory', 'currentDepartment'],
      });
      return finalReport;
    } catch (err) {
      if (transactionStarted && queryRunner.isTransactionActive) {
        console.error(
          `[ReportsService.updateStatus] Error in transaction for report ${reportId}, rolling back. Error: ${(err as Error).message}`
        );
        await queryRunner.rollbackTransaction();
      } else {
        console.error(
          `[ReportsService.updateStatus] Error for report ${reportId} (no active transaction to rollback). Error: ${(err as Error).message}`
        );
      }
      throw err;
    } finally {
      if (!queryRunner.isReleased) {
        console.log(`[ReportsService.updateStatus] Releasing query runner for report ${reportId}.`);
        await queryRunner.release();
      }
    }
  }

  async assignReportToEmployee(
    reportId: number,
    employeeId: number,
    authUser: AuthUser
  ): Promise<Report> {
    const report = await this.findOne(reportId, authUser);

    if (!this.canUserPerformActionOnReport(report, authUser, 'assign')) {
      throw new UnauthorizedException('You do not have permission to assign this report.');
    }
    const reportDeptId = report.currentDepartmentId;
    if (!reportDeptId) {
      throw new BadRequestException('Report department information is missing for assignment.');
    }

    const employee = await this.usersService.findEmployeeInDepartment(employeeId, reportDeptId);
    if (!employee || !employee.roles.includes(UserRole.TEAM_MEMBER)) {
      throw new NotFoundException(
        'Target employee not found, not an employee, or not in the correct department.'
      );
    }

    const assignableStatuses: ReportStatus[] = [
      ReportStatus.OPEN,
      ReportStatus.IN_REVIEW,
      ReportStatus.IN_PROGRESS,
      ReportStatus.DONE,
      ReportStatus.REJECTED,
    ];
    if (!assignableStatuses.includes(report.status)) {
      throw new BadRequestException(`Report in status ${report.status} cannot be assigned.`);
    }

    await this.reportRepository.update(reportId, {
      status: ReportStatus.IN_PROGRESS,
    });

    return this.findOne(reportId, authUser);
  }

  async changeDepartment(
    id: number,
    newDepartmentCode: MunicipalityDepartment,
    reason: string | undefined,
    authUser: AuthUser
  ): Promise<{
    success: boolean;
    message: string;
    reportId: number;
    newDepartmentCode: MunicipalityDepartment;
  }> {
    const report = await this.reportRepository.findById(id);
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found.`);
    }
    if (!this.canUserPerformActionOnReport(report, authUser, 'forward')) {
      throw new UnauthorizedException('You do not have permission to forward this report.');
    }
    if (report.currentDepartment?.code === newDepartmentCode) {
      throw new BadRequestException(`Report is already in the ${newDepartmentCode} department.`);
    }
    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
      throw new BadRequestException('A valid reason is required for forwarding the report.');
    }
    // Departman değiştir, subStatus FORWARDED yap, status değişmez
    report.currentDepartmentId = (await this.departmentService.findByCode(newDepartmentCode)).id;
    report.subStatus = SUB_STATUS.FORWARDED;
    // TODO: DepartmentHistory kaydı ekle
    await this.reportRepository.update(id, report);
    return {
      success: true,
      message: `Report ID ${id} successfully forwarded to department ${newDepartmentCode}.`,
      reportId: id,
      newDepartmentCode,
    };
  }

  async getReportsByUser(
    authUser: AuthUser,
    options?: IReportFindAllOptions // IReportFindAllOptions kullanılacak şekilde güncellendi
  ): Promise<ISpatialQueryResult> {
    // options'dan type ve status gelebilir, bunları reportType ve status olarak doğru şekilde iletmeliyiz.
    const queryOptions: IReportFindAllOptions = {
      ...options,
      userId: authUser.sub,
      currentUserId: authUser.sub, // Kullanıcının kendi raporları için currentUserId'yi de ekle
      // options.type varsa queryOptions.reportType'a ata, yoksa undefined kalsın.
      reportType: options?.reportType, // Eğer options.type geliyorsa, bunu reportType olarak ata.
      // departmentCode burada yönetilmiyor, çünkü bu sadece kullanıcının kendi raporları.
    };
    return this.reportRepository.findAll(queryOptions);
  }

  async findNearby(
    searchDto: {
      latitude: number;
      longitude: number;
      radius: number;
      status?: ReportStatus | ReportStatus[];
    },
    options?: {
      limit?: number;
      page?: number;
      reportType?: ReportType; // type -> reportType
      status?: ReportStatus | ReportStatus[];
      departmentCode?: MunicipalityDepartment; // department -> departmentCode
      currentUserId?: number; // isSupportedByCurrentUser için gerekli
    }
  ): Promise<ISpatialQueryResult> {
    const { latitude, longitude, radius, status } = searchDto;
    // status parametresi dizi veya tekil olabilir, doğrudan repository'ye ilet
    return this.reportRepository.findNearby(latitude, longitude, radius, {
      ...options,
      status,
    });
  }

  async getDepartmentHistory(
    reportId: number,
    authUser: AuthUser
  ): Promise<DepartmentHistoryResponseDto[]> {
    await this.findOne(reportId, authUser);
    const history = await this.departmentService.getReportDepartmentHistory(reportId);
    return history.map(h => {
      if (!h.changedByUser) {
        throw new NotFoundException(`User who changed department history (ID: ${h.id}) not found.`);
      }
      return {
        id: h.id,
        reportId: h.reportId,
        previousDepartment: h.previousDepartment ?? null,
        newDepartment: h.newDepartment,
        reason: h.reason ?? '',
        changedByUser: h.changedByUser,
        changedAt: h.changedAt,
        previousDepartmentId: h.previousDepartmentId,
        newDepartmentId: h.newDepartmentId,
      };
    });
  }

  async getStatusHistory(reportId: number, authUser: AuthUser): Promise<ReportStatusHistory[]> {
    // Verify user has access to the report
    await this.findOne(reportId, authUser);

    // Get status history for the report
    return this.reportStatusHistoryRepository.find({
      where: { reportId },
      order: { changedAt: 'DESC' },
      relations: ['changedBy'],
    });
  }

  async suggestDepartmentForReportType(type: ReportType): Promise<MunicipalityDepartment> {
    const department = await this.departmentService.suggestDepartmentForReport(type);
    return department.code;
  }

  // Yeni team assignment metodları
  async assignReportToTeam(reportId: number, teamId: number, authUser: AuthUser): Promise<Report> {
    const report = await this.reportRepository.findById(reportId);
    if (!report) {
      throw new NotFoundException(`Report with ID ${reportId} not found`);
    }

    // ABAC yetki kontrolü
    const reportForAuthCheck = await this.findOneForAuthCheck(reportId);
    const userForAbility: Partial<User> = {
      id: authUser.sub,
      roles: authUser.roles,
      departmentId: authUser.departmentId,
    };
    const ability = this.abilityFactory.defineAbility(userForAbility as User);
    if (!ability.can(Action.Assign, reportForAuthCheck)) {
      throw new ForbiddenException('You do not have permission to assign this report.');
    }

    // Use transaction for data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if team exists and is available
      const team = await queryRunner.manager.findOne(Team, {
        where: { id: teamId },
        relations: ['department'],
      });

      if (!team) {
        throw new NotFoundException(`Team with ID ${teamId} not found`);
      }

      if (team.status !== TeamStatus.AVAILABLE) {
        throw new BadRequestException(
          `Team is not available for assignment (status: ${team.status})`
        );
      }

      // Check if team is in the same department as the report
      if (team.departmentId !== report.currentDepartmentId) {
        throw new BadRequestException('Team must be from the same department as the report');
      }

      // Check if report is already assigned to this team (idempotent operation)
      const existingActiveAssignment = await queryRunner.manager.findOne(Assignment, {
        where: {
          reportId,
          assigneeType: AssigneeType.TEAM,
          assigneeTeamId: teamId,
          status: AssignmentStatus.ACTIVE,
        },
      });

      if (existingActiveAssignment) {
        // Report is already assigned to this team, return success (idempotent)
        await queryRunner.commitTransaction();
        return this.findOne(reportId, authUser);
      }

      // Store previous values for status history
      const previousStatus = report.status;
      const previousSubStatus = report.subStatus;

      // Only update status if report is OPEN - set to IN_REVIEW for team assignment
      let newStatus = report.status;
      let shouldUpdateStatus = false;

      if (report.status === ReportStatus.OPEN) {
        newStatus = ReportStatus.IN_REVIEW;
        shouldUpdateStatus = true;
      }
      // For other statuses (IN_REVIEW, IN_PROGRESS), don't change the main status
      // Team assignment doesn't automatically advance the status beyond IN_REVIEW

      // Cancel any existing active assignments
      await queryRunner.manager.update(
        Assignment,
        { reportId, status: AssignmentStatus.ACTIVE },
        { status: AssignmentStatus.CANCELLED, completedAt: new Date() }
      );

      // Create new assignment
      const assignment = queryRunner.manager.create(Assignment, {
        reportId,
        assigneeType: AssigneeType.TEAM,
        assigneeTeamId: teamId,
        assignedById: authUser.sub,
        status: AssignmentStatus.ACTIVE,
        assignedAt: new Date(),
        acceptedAt: new Date(),
      });
      await queryRunner.manager.save(Assignment, assignment);
      console.log(
        `[ReportsService.assignReportToTeam] New assignment created: ID ${assignment.id}, Report ID ${reportId}, Team ID ${teamId}, AcceptedAt: ${assignment.acceptedAt?.toISOString() ?? 'N/A'}`
      );

      // Update report status only if needed (OPEN -> IN_REVIEW)
      if (shouldUpdateStatus) {
        await queryRunner.manager.update(
          Report,
          { id: reportId },
          {
            status: newStatus,
            subStatus: SUB_STATUS.NONE,
          }
        );
        console.log(
          `[ReportsService.assignReportToTeam] Report ${reportId} status updated from ${previousStatus} to ${newStatus}, subStatus to NONE.`
        );

        // Create ReportStatusHistory record for status change
        const statusHistoryData: Partial<ReportStatusHistory> = {
          reportId: reportId,
          newStatus: newStatus,
          changedByUserId: authUser.sub,
          changedAt: new Date(),
        };

        if (previousStatus !== undefined) {
          statusHistoryData.previousStatus = previousStatus;
        }
        if (typeof previousSubStatus === 'string') {
          statusHistoryData.previousSubStatus = previousSubStatus;
        }
        if (typeof SUB_STATUS.NONE === 'string') {
          statusHistoryData.newSubStatus = SUB_STATUS.NONE;
        }
        statusHistoryData.notes = `Report assigned to team. Status changed from ${previousStatus ?? 'N/A'} (${previousSubStatus ?? 'N/A'}) to ${newStatus} (${SUB_STATUS.NONE ?? 'N/A'}).`;

        const statusHistory = queryRunner.manager.create(ReportStatusHistory, statusHistoryData);
        await queryRunner.manager.save(statusHistory);
      } else {
        console.log(
          `[ReportsService.assignReportToTeam] Report ${reportId} status unchanged (${report.status}), only assignment created.`
        );
      }

      await queryRunner.commitTransaction();

      // Return updated report
      return this.findOne(reportId, authUser);
    } catch (err) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async assignReportToUser(reportId: number, userId: number, authUser: AuthUser): Promise<Report> {
    const report = await this.reportRepository.findById(reportId);
    if (!report) {
      throw new NotFoundException(`Report with ID ${reportId} not found`);
    }
    // Yetki kontrolü
    if (!this.canUserPerformActionOnReport(report, authUser, 'assign')) {
      throw new UnauthorizedException('You do not have permission to assign this report.');
    }
    // Önce mevcut ACTIVE assignment'ları CANCELLED yap
    await this.assignmentRepository.update(
      { reportId, status: AssignmentStatus.ACTIVE },
      { status: AssignmentStatus.CANCELLED, cancelledAt: new Date() }
    );
    // Sonra yeni assignment oluştur
    const assignment = this.assignmentRepository.create({
      reportId,
      assigneeType: AssigneeType.USER,
      assigneeUserId: userId,
      assignedById: authUser.sub,
      status: AssignmentStatus.ACTIVE,
      assignedAt: new Date(),
    });
    await this.assignmentRepository.save(assignment);
    return this.findOne(reportId, authUser);
  }

  // Add new forwardReport method
  async forwardReport(
    reportId: number,
    dto: ForwardReportDto,
    authUser: AuthUser
  ): Promise<Report> {
    // Initial authorization checks (outside transaction)
    const report = await this.reportRepository.findById(reportId);
    if (!report) {
      throw new NotFoundException(`Report with ID ${reportId} not found`);
    }

    // Authorization check
    if (!this.canUserPerformActionOnReport(report, authUser, 'forward')) {
      throw new UnauthorizedException('You do not have permission to forward this report.');
    }

    // Validate new department
    const departmentCode = dto.newDepartment ?? dto.departmentCode;
    if (!departmentCode) {
      throw new BadRequestException('New department code is required for forwarding the report.');
    }
    const newDepartment = await this.departmentService.findByCode(departmentCode);
    if (!newDepartment) {
      throw new NotFoundException(`Department with code ${departmentCode} not found`);
    }

    // Check if report is already in the target department
    if (report.currentDepartmentId === newDepartment.id) {
      throw new BadRequestException(`Report is already in the ${newDepartment.name} department.`);
    }

    // Validate reason
    if (!dto.reason || dto.reason.trim() === '') {
      throw new BadRequestException('A valid reason is required for forwarding the report.');
    }

    // Use transaction for data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    let transactionStarted = false;

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      transactionStarted = true;
      console.log(`[ReportsService.forwardReport] Transaction started for report ${reportId}.`);

      // Find report with lock using createQueryBuilder to avoid outer join issues
      const lockedReport = await queryRunner.manager
        .createQueryBuilder(Report, 'report')
        .leftJoinAndSelect('report.currentDepartment', 'currentDepartment')
        .where('report.id = :id', { id: reportId })
        .setLock('pessimistic_write', undefined, ['report'])
        .getOne();

      if (!lockedReport) {
        throw new NotFoundException(`Report with ID ${reportId} not found`);
      }

      // Store previous values
      const previousDepartmentId = lockedReport.currentDepartmentId;
      const previousStatus = lockedReport.status;
      const previousSubStatus = lockedReport.subStatus;

      // Update report department and subStatus
      lockedReport.currentDepartmentId = newDepartment.id;
      lockedReport.subStatus = SUB_STATUS.FORWARDED;
      // Note: main status doesn't change during forwarding

      // Save updated report
      await queryRunner.manager.save(Report, lockedReport);

      // Create DepartmentHistory record
      const departmentHistory = queryRunner.manager.create(DepartmentHistory, {
        reportId,
        previousDepartmentId,
        newDepartmentId: newDepartment.id,
        reason: dto.reason,
        changedByUserId: authUser.sub,
        changedAt: new Date(),
      });
      await queryRunner.manager.save(departmentHistory);

      // Create ReportStatusHistory record for subStatus change
      const statusHistory = queryRunner.manager.create(ReportStatusHistory, {
        reportId: lockedReport.id,
        ...(previousStatus !== undefined ? { previousStatus } : {}),
        newStatus: lockedReport.status,
        ...(typeof previousSubStatus === 'string' ? { previousSubStatus } : {}),
        ...(typeof lockedReport.subStatus === 'string'
          ? { newSubStatus: lockedReport.subStatus }
          : {}),
        changedByUserId: authUser.sub,
        changedAt: new Date(),
        notes: `Sub-status changed from ${previousSubStatus} to ${lockedReport.subStatus}`,
      });
      await queryRunner.manager.save(ReportStatusHistory, statusHistory);

      // Cancel any active assignments (they belong to the previous department)
      await queryRunner.manager.update(
        Assignment,
        {
          reportId,
          status: AssignmentStatus.ACTIVE,
        },
        {
          status: AssignmentStatus.CANCELLED,
          completedAt: new Date(),
        }
      );

      // Commit transaction
      await queryRunner.commitTransaction();
      console.log(`[ReportsService.forwardReport] Transaction committed for report ${reportId}.`);

      // Return updated report
      const finalReport = await queryRunner.manager.findOneOrFail(Report, {
        where: { id: reportId },
        relations: ['assignments', 'statusHistory', 'departmentHistory', 'currentDepartment'],
      });
      return finalReport;
    } catch (err) {
      // Rollback transaction on error
      if (transactionStarted && queryRunner.isTransactionActive) {
        console.error(
          `[ReportsService.forwardReport] Error in transaction for report ${reportId}, rolling back. Error: ${(err as Error).message}`
        );
        await queryRunner.rollbackTransaction();
      } else {
        console.error(
          `[ReportsService.forwardReport] Error for report ${reportId} (no active transaction to rollback). Error: ${(err as Error).message}`
        );
      }
      console.error('[forwardReport] error:', (err as Error).message);
      throw err;
    } finally {
      // Release query runner
      if (!queryRunner.isReleased) {
        console.log(
          `[ReportsService.forwardReport] Releasing query runner for report ${reportId}.`
        );
        await queryRunner.release();
      }
    }
  }

  /**
   * Yetki kontrolü için rapor getirme metodu - Guard ve servis katmanında kullanılır
   */
  async findOneForAuthCheck(reportId: number): Promise<Report> {
    const report = await this.reportRepository.findById(reportId);

    if (!report) {
      throw new NotFoundException(`Report with ID "${reportId}" not found`);
    }

    return report;
  }

  /**
   * Rapor destekleme metodu - Vatandaşların başkalarının raporlarını desteklemesi için
   * Eğer kullanıcı zaten desteklemişse, idempotent davranır: hata fırlatmaz, mevcut durumu döner.
   */
  async supportReport(reportId: number, authUser: AuthUser): Promise<Report> {
    // İlk olarak raporu çek ve ABAC yetki kontrolü yap
    const report = await this.findOneForAuthCheck(reportId);

    // AuthUser'dan User objesine dönüştür (sadece yetki kontrolü için gerekli alanlar)
    const userForAbility: Partial<User> = {
      id: authUser.sub,
      roles: authUser.roles,
      departmentId: authUser.departmentId,
    };
    const ability = this.abilityFactory.defineAbility(userForAbility as User);
    if (!ability.can(Action.Support, report)) {
      throw new ForbiddenException('Bu raporu destekleme yetkiniz yok.');
    }
    // Kendi raporunu destekleyemez
    if (report.userId === authUser.sub) {
      throw new ForbiddenException('Kendi raporunuzu destekleyemezsiniz.');
    }
    // Daha önce desteklemiş mi kontrolü
    const existingSupport = await this.reportSupportRepository.findOne({
      where: {
        reportId: report.id,
        userId: authUser.sub,
      },
    });
    if (existingSupport) {
      // Idempotent davran: hata fırlatma, mevcut durumu döndür
      report.isSupportedByCurrentUser = true;
      // supportCount güncel olmayabilir, tekrar saydırmak gerekirse burada güncellenebilir
      return report;
    }
    // Transaction içinde hem support kaydı oluştur hem de supportCount'ı artır
    return this.dataSource.transaction(async transactionalEntityManager => {
      const newSupport = transactionalEntityManager.create(ReportSupport, {
        reportId: report.id,
        userId: authUser.sub,
      });
      await transactionalEntityManager.save(ReportSupport, newSupport);
      await transactionalEntityManager.increment(Report, { id: report.id }, 'supportCount', 1);
      report.supportCount = (report.supportCount || 0) + 1;
      report.isSupportedByCurrentUser = true;
      return report;
    });
  }

  async unsupportReport(reportId: number, authUser: AuthUser): Promise<Report> {
    const report = await this.findOneForAuthCheck(reportId);
    const userForAbility: Partial<User> = {
      id: authUser.sub,
      roles: authUser.roles,
      departmentId: authUser.departmentId,
    };
    const ability = this.abilityFactory.defineAbility(userForAbility as User);
    if (!ability.can(Action.Unsupport, report)) {
      throw new ForbiddenException('Bu raporun desteğini geri çekme yetkiniz yok.');
    }
    // Kendi raporunu destekten çekemez (isteğe bağlı, istenirse kaldırılabilir)
    if (report.userId === authUser.sub) {
      throw new ForbiddenException('Kendi oluşturduğunuz raporun desteğini geri çekemezsiniz.');
    }
    const existingSupport = await this.reportSupportRepository.findOne({
      where: { reportId: report.id, userId: authUser.sub },
    });
    if (!existingSupport) {
      throw new NotFoundException('Bu raporu zaten desteklemiyorsunuz.');
    }
    return this.dataSource.transaction(async transactionalEntityManager => {
      await transactionalEntityManager.delete(ReportSupport, {
        reportId: report.id,
        userId: authUser.sub,
      });
      // supportCount'ı azalt (0'ın altına düşmesin)
      await transactionalEntityManager
        .createQueryBuilder()
        .update(Report)
        .set({ supportCount: () => 'GREATEST(support_count - 1, 0)' })
        .where('id = :id', { id: report.id })
        .execute();

      // Güncellenmiş veriyi al
      const updatedReport = await transactionalEntityManager.findOne(Report, {
        where: { id: report.id },
      });

      report.supportCount = updatedReport?.supportCount || 0;
      report.isSupportedByCurrentUser = false;
      return report;
    });
  }
}
