import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, EntityManager } from 'typeorm';
import { Point } from 'geojson';
import { ReportRepository } from '../repositories/report.repository';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
// HATA ÇÖZÜMÜ: Kullanılmayan 'UpdateReportDto' import'u kaldırıldı.
import { UpdateReportStatusDto } from '../dto/update-report-status.dto';
import { CompleteWorkDto } from '../dto/complete-work.dto';
import { ForwardReportDto } from '../dto/forward-report.dto';
import { RadiusSearchDto } from '../dto/location.dto';
import { Report } from '../entities/report.entity';
import { ReportMedia } from '../entities/report-media.entity';
import { ReportStatusHistory } from '../entities/report-status-history.entity';
import { Department } from '../entities/department.entity';
import { ISpatialQueryResult, IReportFindOptions } from '../interfaces/report.interface';
import { JwtPayload as AuthUser } from '../../auth/interfaces/jwt-payload.interface';
import { User } from '../../users/entities/user.entity';
import { AbilityFactory, Action } from '../../../core/authorization/ability.factory';
import { UsersService } from '../../users/services/users.service';
import { DepartmentService } from './department.service';
import { CategoryService } from './category.service';
import { LocationService } from './location.service';
import { ReportAssignmentService } from './report-assignment.service';
import { ReportStatusService } from './report-status.service';
import { ReportSupportService } from './report-support.service';
import { ReportForwardingService } from './report-forwarding.service';
import { Team } from '../../teams/entities/team.entity'; // HATA ÇÖZÜMÜ: Eksik Team import'u eklendi.
import { ReportCategory } from '../entities/report-category.entity';
import {
  UserRole,
  TeamStatus,
  ReportType,
  ReportStatus,
  MunicipalityDepartment,
} from '@kentnabiz/shared'; // HATA ÇÖZÜMÜ: Eksik enum'lar eklendi.
import { DepartmentHistoryResponseDto } from '../dto/department-history.response.dto';

@Injectable()
export class ReportsService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly dataSource: DataSource,
    @InjectRepository(Report)
    private readonly reportEntityRepository: Repository<Report>,
    @InjectRepository(ReportStatusHistory)
    private readonly statusHistoryRepository: Repository<ReportStatusHistory>,
    private readonly abilityFactory: AbilityFactory,
    private readonly departmentService: DepartmentService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly categoryService: CategoryService,
    private readonly locationService: LocationService,
    private readonly assignmentService: ReportAssignmentService,
    private readonly statusService: ReportStatusService,
    private readonly supportService: ReportSupportService,
    private readonly forwardingService: ReportForwardingService
  ) {}

  // =================================================================
  // == TEMEL OKUMA (READ) VE OLUŞTURMA (CREATE) İŞLEMLERİ
  // =================================================================

  async findAll(authUser: AuthUser, options: IReportFindOptions): Promise<ISpatialQueryResult> {
    const queryOptions = { ...options, currentUserId: authUser.sub };

    if (
      authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR) ||
      authUser.roles.includes(UserRole.TEAM_MEMBER)
    ) {
      if (!options.departmentId) {
        queryOptions.departmentId = authUser.departmentId || undefined;
      }
    }
    return this.reportRepository.findAll(queryOptions);
  }

  async findOne(reportId: number, authUser: AuthUser): Promise<Report> {
    const report = await this.reportRepository.findById(reportId, authUser.sub);
    if (!report) {
      throw new NotFoundException(`Rapor ID ${reportId} bulunamadı`);
    }

    const ability = this.abilityFactory.defineAbility(this.createPartialUser(authUser));
    if (!ability.can(Action.Read, report)) {
      throw new ForbiddenException('Bu raporu görüntüleme yetkiniz yok.');
    }
    return report;
  }

  async getReportsByUser(
    authUser: AuthUser,
    options: IReportFindOptions
  ): Promise<ISpatialQueryResult> {
    const queryOptions: IReportFindOptions = {
      ...options,
      userId: authUser.sub,
      currentUserId: authUser.sub, // Destek durumunu kontrol etmek için
    };
    return this.reportRepository.findAll(queryOptions);
  }

  async findNearby(
    searchDto: RadiusSearchDto,
    options: IReportFindOptions
  ): Promise<ISpatialQueryResult> {
    const { latitude, longitude, radius, status } = searchDto;
    return this.reportRepository.findNearby(latitude, longitude, radius, {
      ...options,
      status,
    });
  }

  async getStatusHistory(reportId: number, authUser: AuthUser): Promise<ReportStatusHistory[]> {
    // Önce raporu görme yetkisi var mı diye kontrol et
    await this.findOne(reportId, authUser);

    return this.statusHistoryRepository.find({
      where: { reportId },
      order: { changedAt: 'DESC' },
      relations: ['changedBy'],
    });
  }

  async getDepartmentHistory(
    reportId: number,
    authUser: AuthUser
  ): Promise<DepartmentHistoryResponseDto[]> {
    // Önce raporu görme yetkisi var mı diye kontrol et
    await this.findOne(reportId, authUser);

    const history = await this.departmentService.getReportDepartmentHistory(reportId);

    // DepartmentHistory'yi DepartmentHistoryResponseDto'ya dönüştür
    return history.map(h => ({
      id: h.id,
      reportId: h.reportId,
      previousDepartmentId: h.previousDepartmentId,
      newDepartmentId: h.newDepartmentId,
      reason: h.reason || 'Sebep belirtilmemiş',
      changedAt: h.changedAt,
      previousDepartment: h.previousDepartment || null,
      newDepartment: h.newDepartment,
      changedByUser: h.changedByUser || ({ id: 0, fullName: 'Bilinmeyen Kullanıcı' } as User),
    }));
  }

  async suggestDepartmentForReportType(type: ReportType): Promise<MunicipalityDepartment> {
    const department = await this.departmentService.suggestDepartmentForReport(type);
    return department.code;
  }

  async create(dto: CreateReportDto, authUser: AuthUser): Promise<Report> {
    // Transaction kullanarak report oluşturma
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      // 1. Kullanıcı var mı kontrol et
      const user = await this.usersService.findById(authUser.sub);
      if (!user) {
        throw new NotFoundException('Kullanıcı bulunamadı');
      }

      // 2. Kategori varsa kontrol et ve departman bilgisini al
      let category = null;
      let targetDepartment = null;

      if (dto.categoryId) {
        category = await this.categoryService.findById(dto.categoryId);
        if (category?.departmentId) {
          // Kategori departmanını kullan
          targetDepartment = await manager.findOne(Department, {
            where: { id: category.departmentId },
          });
        }
      }

      // 3. Eğer kategori departmanı bulunamazsa, frontend'den gelen departmentCode'u kullan
      if (!targetDepartment && dto.departmentCode) {
        targetDepartment = await this.departmentService.findByCode(dto.departmentCode);
      }

      // 4. Son çare olarak varsayılan departman
      if (!targetDepartment) {
        targetDepartment = await this.departmentService.findByCode(
          MunicipalityDepartment.GENERAL_AFFAIRS
        );
      }

      // 4. Location verilerini hazırla
      const location: Point = {
        type: 'Point',
        coordinates: [dto.location.longitude, dto.location.latitude],
      };

      // 5. Report entity'sini oluştur
      const report = manager.create(Report, {
        title: dto.title,
        description: dto.description,
        location: location,
        address: dto.address || 'Adres belirtilmemiş',
        reportType: dto.reportType,
        status: ReportStatus.OPEN,
        categoryId: category?.id || undefined,
        currentDepartmentId: targetDepartment.id,
        departmentCode: targetDepartment.code,
        userId: user.id,
        user: user,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 6. Report'u kaydet
      const savedReport = await manager.save(Report, report);

      // 7. Media dosyalarını ekle
      if (dto.reportMedias && dto.reportMedias.length > 0) {
        const mediaEntities = dto.reportMedias.map(media =>
          manager.create(ReportMedia, {
            reportId: savedReport.id,
            url: media.url,
            type: media.type,
          })
        );
        await manager.save(ReportMedia, mediaEntities);
      }

      // 8. Status history ekle - DÜZELTME: Entity field adlarına uygun şekilde
      const statusHistory = manager.create(ReportStatusHistory, {
        reportId: savedReport.id,
        previousStatus: undefined, // İlk kayıt olduğu için önceki durum yok
        newStatus: ReportStatus.OPEN, // Yeni durum OPEN
        previousSubStatus: undefined,
        newSubStatus: undefined,
        changedByUserId: user.id, // FK field doğru isimde
        changedAt: new Date(),
        notes: 'Rapor oluşturuldu', // İlk oluşturma notu
      });
      await manager.save(ReportStatusHistory, statusHistory);

      // 9. Tam report'u döndür - Mevcut relation'ları kullan
      const fullReport = await manager.findOne(Report, {
        where: { id: savedReport.id },
        relations: [
          'user',
          'category',
          'currentDepartment',
          'reportMedias',
          'assignments', // assignedTeam/assignedUser yerine assignments
          'statusHistory',
          'supports',
        ],
      });

      if (!fullReport) {
        throw new NotFoundException('Oluşturulan rapor bulunamadı');
      }

      return fullReport;
    });
  }

  // =================================================================
  // == DELEGE EDİLMİŞ AKSİYON METOTLARI
  // =================================================================

  async assignToTeam(reportId: number, teamId: number, authUser: AuthUser): Promise<Report> {
    const report = await this.findOneForAuthCheck(reportId);
    const ability = this.abilityFactory.defineAbility(this.createPartialUser(authUser));
    if (!ability.can(Action.Assign, report)) {
      throw new ForbiddenException('Bu raporu atama yetkiniz yok.');
    }
    await this.assignmentService.assignToTeam(reportId, teamId, authUser);
    return this.findOne(reportId, authUser);
  }

  async assignToUser(reportId: number, userId: number, authUser: AuthUser): Promise<Report> {
    const report = await this.findOneForAuthCheck(reportId);
    const ability = this.abilityFactory.defineAbility(this.createPartialUser(authUser));
    if (!ability.can(Action.Assign, report)) {
      throw new ForbiddenException('Bu raporu atama yetkiniz yok.');
    }
    await this.assignmentService.assignToUser(reportId, userId, authUser);
    return this.findOne(reportId, authUser);
  }

  async updateStatus(
    reportId: number,
    dto: UpdateReportStatusDto,
    authUser: AuthUser
  ): Promise<Report> {
    const report = await this.findOneForAuthCheck(reportId);
    const ability = this.abilityFactory.defineAbility(this.createPartialUser(authUser));
    if (!ability.can(Action.Update, report)) {
      throw new ForbiddenException('Bu raporun durumunu güncelleme yetkiniz yok.');
    }
    await this.statusService.updateStatus(reportId, dto, authUser);
    return this.findOne(reportId, authUser);
  }

  async completeWork(reportId: number, dto: CompleteWorkDto, authUser: AuthUser): Promise<Report> {
    const report = await this.findOneForAuthCheck(reportId);
    const ability = this.abilityFactory.defineAbility(this.createPartialUser(authUser));
    if (!ability.can(Action.CompleteWork, report)) {
      throw new ForbiddenException('Bu işi tamamlama yetkiniz yok.');
    }
    await this.statusService.completeWorkWithProof(reportId, dto, authUser);
    return this.findOne(reportId, authUser);
  }

  async forwardReport(
    reportId: number,
    dto: ForwardReportDto,
    authUser: AuthUser
  ): Promise<{ success: boolean; message: string; reportId: number }> {
    const report = await this.findOneForAuthCheck(reportId);
    const ability = this.abilityFactory.defineAbility(this.createPartialUser(authUser));
    if (!ability.can(Action.Forward, report)) {
      throw new ForbiddenException('Bu raporu yönlendirme yetkiniz yok.');
    }
    if (dto.fromDepartmentId !== authUser.departmentId) {
      throw new ForbiddenException(
        'Sadece kendi departmanınızdaki raporları yönlendirebilirsiniz.'
      );
    }
    await this.forwardingService.forward(reportId, dto, authUser.sub);

    return {
      success: true,
      message: `Rapor ID ${reportId} başarıyla yönlendirildi.`,
      reportId,
    };
  }

  async addSupport(reportId: number, authUser: AuthUser): Promise<Report> {
    const report = await this.findOneForAuthCheck(reportId);
    const ability = this.abilityFactory.defineAbility(this.createPartialUser(authUser));
    if (!ability.can(Action.Support, report)) {
      throw new ForbiddenException('Bu raporu destekleme yetkiniz yok.');
    }
    await this.supportService.addSupport(reportId, authUser);
    return this.findOne(reportId, authUser);
  }

  async removeSupport(reportId: number, authUser: AuthUser): Promise<Report> {
    const report = await this.findOneForAuthCheck(reportId);
    const ability = this.abilityFactory.defineAbility(this.createPartialUser(authUser));
    if (!ability.can(Action.Unsupport, report)) {
      throw new ForbiddenException('Bu raporun desteğini geri çekme yetkiniz yok.');
    }
    await this.supportService.removeSupport(reportId, authUser);
    return this.findOne(reportId, authUser);
  }

  async getSuggestedTeams(reportId: number): Promise<Team[]> {
    const report = await this.dataSource
      .getRepository(Report)
      .findOne({ where: { id: reportId }, relations: ['category'] });
    if (!report?.category) throw new NotFoundException('Rapor veya kategorisi bulunamadı.');

    const categoryWithSpecs = await this.dataSource.getRepository(ReportCategory).findOne({
      where: { id: report.categoryId },
      relations: ['requiredSpecializations'],
    });

    const requiredSpecIds = categoryWithSpecs?.requiredSpecializations.map(s => s.id);
    if (!requiredSpecIds || requiredSpecIds.length === 0) return [];

    return this.dataSource
      .getRepository(Team)
      .createQueryBuilder('team')
      .innerJoin('team.teamSpecializations', 'ts', 'ts.specializationId IN (:...requiredSpecIds)', {
        requiredSpecIds,
      })
      .where('team.departmentId = :departmentId', { departmentId: report.currentDepartmentId })
      .andWhere('team.status = :status', { status: TeamStatus.AVAILABLE })
      .groupBy('team.id')
      .having('COUNT(DISTINCT ts.specializationId) = :count', { count: requiredSpecIds.length })
      .getMany();
  }

  async update(
    reportId: number,
    updateReportDto: UpdateReportDto,
    authUser: AuthUser
  ): Promise<Report> {
    const report = await this.findOneForAuthCheck(reportId);
    const ability = this.abilityFactory.defineAbility(this.createPartialUser(authUser));
    if (!ability.can(Action.Update, report)) {
      throw new ForbiddenException('Bu raporu güncelleme yetkiniz yok.');
    }

    // DTO'yu entity'ye uygun formata dönüştür
    const updateData: Partial<Report> = {
      title: updateReportDto.title,
      description: updateReportDto.description,
      // location dönüşümü gerekirse burada yapılır
    };

    await this.dataSource.getRepository(Report).update(reportId, updateData);
    return this.findOne(reportId, authUser);
  }

  async remove(reportId: number, authUser: AuthUser): Promise<void> {
    const report = await this.findOneForAuthCheck(reportId);
    const ability = this.abilityFactory.defineAbility(this.createPartialUser(authUser));
    if (!ability.can(Action.Delete, report)) {
      throw new ForbiddenException('Bu raporu silme yetkiniz yok.');
    }

    await this.dataSource.getRepository(Report).delete(reportId);
  }

  async getStatusCounts(authUser: AuthUser): Promise<Record<string, number>> {
    // Bu metot departman bazlı istatistikler döndürür
    let departmentId: number | undefined;

    if (
      authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR) ||
      authUser.roles.includes(UserRole.TEAM_MEMBER)
    ) {
      departmentId = authUser.departmentId || undefined;
    }

    // Basit bir implementasyon - gerçek implementasyon repository'de olabilir
    const queryBuilder = this.dataSource.getRepository(Report).createQueryBuilder('report');

    if (departmentId) {
      queryBuilder.where('report.currentDepartmentId = :departmentId', { departmentId });
    }

    // Temel durum sayıları
    const statusResults = await queryBuilder
      .select('report.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('report.status')
      .getRawMany();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const counts: Record<string, number> = statusResults.reduce(
      (acc, curr) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        acc[curr.status] = parseInt(curr.count, 10);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return acc;
      },
      {} as Record<string, number>
    );

    // Enhanced filter sayıları
    const baseQuery = this.dataSource.getRepository(Report).createQueryBuilder('report');
    if (departmentId) {
      baseQuery.where('report.currentDepartmentId = :departmentId', { departmentId });
    }

    // Atanmamış raporlar (OPEN durumunda ve aktif assignment'ı olmayan)
    const unassignedCount = await baseQuery
      .clone()
      .leftJoin('report.assignments', 'assignment', 'assignment.deleted_at IS NULL')
      .andWhere('report.status = :status', { status: ReportStatus.OPEN })
      .andWhere('(assignment.id IS NULL OR assignment.assignment_status = :cancelledStatus)', {
        cancelledStatus: 'CANCELLED',
      })
      .getCount();

    // Onay bekleyen raporlar (subStatus PENDING_APPROVAL olan)
    const pendingApprovalCount = await baseQuery
      .clone()
      .andWhere('report.status = :status', { status: ReportStatus.IN_PROGRESS })
      .andWhere('report.subStatus = :subStatus', { subStatus: 'PENDING_APPROVAL' })
      .getCount();

    // Geciken raporlar (IN_PROGRESS durumunda ve createdAt 7 günden eski olan)
    const overdueCount = await baseQuery
      .clone()
      .andWhere('report.status = :status', { status: ReportStatus.IN_PROGRESS })
      .andWhere('report.createdAt < :sevenDaysAgo', {
        sevenDaysAgo: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      })
      .getCount();

    // Yeniden açılan raporlar (status history'den kontrol et)
    const reopenedCount = await baseQuery
      .clone()
      .innerJoin('report.statusHistory', 'history')
      .andWhere('history.newStatus = :reopenStatus', { reopenStatus: ReportStatus.OPEN })
      .andWhere('history.previousStatus = :doneStatus', { doneStatus: ReportStatus.DONE })
      .andWhere('history.changedAt > :lastMonth', {
        lastMonth: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      })
      .getCount();

    const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0);

    return {
      ...counts,
      total: totalCount,
      unassigned: unassignedCount,
      pendingApproval: pendingApprovalCount,
      overdue: overdueCount,
      reopened: reopenedCount,
    };
  }

  async findOneForAuthCheck(reportId: number): Promise<Report> {
    const report = await this.reportRepository.findById(reportId);
    if (!report) {
      throw new NotFoundException(`Rapor ID "${reportId}" bulunamadı`);
    }
    return report;
  }

  // --- YARDIMCI METOTLAR ---

  /**
   * HATA ÇÖZÜMÜ: JwtPayload'ı, AbilityFactory'nin beklediği User tipine benzeyen
   * kısmi bir nesneye dönüştüren yardımcı metot.
   */
  private createPartialUser(authUser: AuthUser): User {
    const partialUser = new User();
    partialUser.id = authUser.sub;
    partialUser.roles = authUser.roles;
    partialUser.departmentId = authUser.departmentId;
    partialUser.activeTeamId = authUser.activeTeamId;
    return partialUser;
  }

  async approveReport(
    reportId: number,
    notes: string | undefined,
    authUser: AuthUser
  ): Promise<Report> {
    const report = await this.findOneForAuthCheck(reportId);
    const ability = this.abilityFactory.defineAbility(this.createPartialUser(authUser));
    if (!ability.can(Action.Approve, report)) {
      throw new ForbiddenException('Bu raporu onaylama yetkiniz yok.');
    }
    await this.statusService.approveReport(reportId, notes, authUser);
    return this.findOne(reportId, authUser);
  }

  async rejectReport(reportId: number, reason: string, authUser: AuthUser): Promise<Report> {
    const report = await this.findOneForAuthCheck(reportId);
    const ability = this.abilityFactory.defineAbility(this.createPartialUser(authUser));
    if (!ability.can(Action.Reject, report)) {
      throw new ForbiddenException('Bu raporu reddetme yetkiniz yok.');
    }
    await this.statusService.rejectReport(reportId, reason, authUser);
    return this.findOne(reportId, authUser);
  }
}
