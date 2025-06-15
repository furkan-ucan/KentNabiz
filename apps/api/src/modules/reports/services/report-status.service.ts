// apps/api/src/modules/reports/services/report-status.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Report } from '../entities/report.entity';
// HATA 1 ÇÖZÜMÜ: Kullanılmayan 'Assignment' import'u kaldırıldı.
import { ReportStatusHistory } from '../entities/report-status-history.entity';
import { Media } from '../../media/entities/media.entity';
import { ReportMedia, ReportMediaContext } from '../entities/report-media.entity';
import { UpdateReportStatusDto } from '../dto/update-report-status.dto';
import { CompleteWorkDto } from '../dto/complete-work.dto';
import {
  ReportStatus,
  // HATA 1 ÇÖZÜMÜ: Kullanılmayan 'AssigneeType' ve 'UserRole' import'ları kaldırıldı.
} from '@kentnabiz/shared';
import { SUB_STATUS } from '../constants';
import { JwtPayload as AuthUser } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class ReportStatusService {
  private readonly logger = new Logger(ReportStatusService.name);

  constructor(
    private readonly dataSource: DataSource,
    // HATA 1 ÇÖZÜMÜ: Kullanılmayan 'assignmentRepository' inject'i kaldırıldı.
    @InjectRepository(Report) private readonly reportRepository: Repository<Report>
  ) {}

  async updateStatus(
    reportId: number,
    dto: UpdateReportStatusDto,
    authUser: AuthUser
  ): Promise<void> {
    await this.dataSource.transaction(async manager => {
      const reportRepo = manager.getRepository(Report);
      const statusHistoryRepo = manager.getRepository(ReportStatusHistory);

      const report = await reportRepo.findOne({
        where: { id: reportId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!report) {
        throw new NotFoundException(`Rapor ID ${reportId} bulunamadı`);
      }

      const previousStatus = report.status;
      const previousSubStatus = report.subStatus;

      report.status = dto.newStatus;
      report.subStatus = dto.subStatus || SUB_STATUS.NONE;
      report.updatedAt = new Date();

      if (dto.newStatus === ReportStatus.DONE) {
        report.resolvedAt = new Date();
        report.closedByUserId = authUser.sub;
        if (dto.resolutionNotes) report.resolutionNotes = dto.resolutionNotes;
      } else if (dto.newStatus === ReportStatus.REJECTED) {
        if (!dto.rejectionReason) throw new BadRequestException('Reddetme sebebi belirtilmelidir.');
        report.rejectionReason = dto.rejectionReason;
        report.closedByUserId = authUser.sub;
      } else if (
        dto.newStatus === ReportStatus.IN_PROGRESS &&
        previousSubStatus === SUB_STATUS.PENDING_APPROVAL
      ) {
        report.subStatus = SUB_STATUS.NONE;
      }

      await reportRepo.save(report);

      // HATA 2 ÇÖZÜMÜ: 'create' metoduna gönderilen nesne düzeltildi.
      const history = statusHistoryRepo.create({
        reportId,
        previousStatus,
        newStatus: report.status,
        previousSubStatus: previousSubStatus ?? undefined, // null ise undefined yap
        newSubStatus: report.subStatus ?? undefined, // null ise undefined yap
        changedByUserId: authUser.sub,
        notes: dto.notes || `Durum ${previousStatus}'dan ${report.status}'a güncellendi.`,
      });
      await statusHistoryRepo.save(history);

      this.logger.log(
        `Rapor ${reportId} durumu, kullanıcı ${authUser.sub} tarafından ${report.status} olarak güncellendi.`
      );
    });
  }

  async completeWorkWithProof(
    reportId: number,
    dto: CompleteWorkDto,
    authUser: AuthUser
  ): Promise<void> {
    await this.dataSource.transaction(async manager => {
      const reportRepo = manager.getRepository(Report);
      const mediaRepo = manager.getRepository(Media);
      const reportMediaRepo = manager.getRepository(ReportMedia);
      const statusHistoryRepo = manager.getRepository(ReportStatusHistory);

      const report = await reportRepo.findOne({
        where: { id: reportId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!report) throw new NotFoundException(`Rapor ID ${reportId} bulunamadı`);

      if (report.status !== ReportStatus.IN_PROGRESS) {
        throw new BadRequestException('Sadece "İşlemde" olan raporlar tamamlanabilir.');
      }

      // Not: Atama kontrolü, bu servisi çağıran ana ReportsService'te yapıldığı için burada tekrar edilmiyor.
      // Bu, sorumlulukların ayrıştırılmasıdır.

      if (!dto.proofMediaIds || dto.proofMediaIds.length === 0) {
        throw new BadRequestException('İş kanıtı olarak en az bir medya dosyası yüklenmelidir.');
      }

      const proofMedias = await mediaRepo.findBy({ id: In(dto.proofMediaIds) });
      if (proofMedias.length !== dto.proofMediaIds.length) {
        throw new BadRequestException('Belirtilen medya dosyalarından bazıları geçersiz.');
      }

      const newReportMediaEntries = proofMedias.map(media =>
        reportMediaRepo.create({
          reportId: report.id,
          url: media.url,
          type: media.mimetype,
          mediaContext: ReportMediaContext.RESOLUTION_PROOF,
          uploadedByUserId: authUser.sub,
        })
      );
      await reportMediaRepo.save(newReportMediaEntries);

      const previousSubStatus = report.subStatus;
      report.subStatus = SUB_STATUS.PENDING_APPROVAL;
      if (dto.resolutionNotes) report.resolutionNotes = dto.resolutionNotes;
      report.updatedAt = new Date();
      await reportRepo.save(report);

      const history = statusHistoryRepo.create({
        reportId,
        previousStatus: report.status,
        newStatus: report.status,
        previousSubStatus: previousSubStatus ?? undefined, // null ise undefined yap
        newSubStatus: SUB_STATUS.PENDING_APPROVAL,
        changedByUserId: authUser.sub,
        notes: dto.resolutionNotes || 'İş tamamlandı, onaya gönderildi.',
      });
      await statusHistoryRepo.save(history);

      this.logger.log(
        `Rapor ${reportId} işi, kullanıcı ${authUser.sub} tarafından tamamlandı ve onaya gönderildi.`
      );
    });
  }

  /**
   * Approve a report that is pending approval (PENDING_APPROVAL -> DONE)
   */
  async approveReport(
    reportId: number,
    notes: string | undefined,
    authUser: AuthUser
  ): Promise<void> {
    await this.dataSource.transaction(async manager => {
      const reportRepo = manager.getRepository(Report);
      const statusHistoryRepo = manager.getRepository(ReportStatusHistory);

      const report = await reportRepo.findOne({
        where: { id: reportId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!report) throw new NotFoundException(`Rapor ID ${reportId} bulunamadı`);

      if (
        report.status !== ReportStatus.IN_PROGRESS ||
        report.subStatus !== SUB_STATUS.PENDING_APPROVAL
      ) {
        throw new BadRequestException('Sadece onay bekleyen raporlar onaylanabilir.');
      }

      const previousStatus = report.status;
      const previousSubStatus = report.subStatus;

      report.status = ReportStatus.DONE;
      report.subStatus = SUB_STATUS.NONE;
      report.resolvedAt = new Date();
      report.closedByUserId = authUser.sub;
      report.updatedAt = new Date();

      if (notes) {
        report.resolutionNotes = notes;
      }

      await reportRepo.save(report);
      const history = statusHistoryRepo.create({
        reportId,
        previousStatus,
        newStatus: ReportStatus.DONE,
        previousSubStatus: previousSubStatus || undefined,
        newSubStatus: undefined,
        changedByUserId: authUser.sub,
        notes: notes || 'Rapor supervisor tarafından onaylandı.',
      });
      await statusHistoryRepo.save(history);

      this.logger.log(
        `Rapor ${reportId}, kullanıcı ${authUser.sub} tarafından onaylandı ve tamamlandı.`
      );
    });
  }

  /**
   * Reject a report with reason (PENDING_APPROVAL -> IN_PROGRESS or OPEN -> REJECTED)
   */
  async rejectReport(reportId: number, reason: string, authUser: AuthUser): Promise<void> {
    await this.dataSource.transaction(async manager => {
      const reportRepo = manager.getRepository(Report);
      const statusHistoryRepo = manager.getRepository(ReportStatusHistory);

      const report = await reportRepo.findOne({
        where: { id: reportId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!report) throw new NotFoundException(`Rapor ID ${reportId} bulunamadı`);

      const previousStatus = report.status;
      const previousSubStatus = report.subStatus;

      // If it's pending approval, send back to IN_PROGRESS
      if (
        report.status === ReportStatus.IN_PROGRESS &&
        report.subStatus === SUB_STATUS.PENDING_APPROVAL
      ) {
        report.subStatus = SUB_STATUS.NONE; // Back to normal in progress
        report.rejectionReason = reason;
        report.updatedAt = new Date();

        await reportRepo.save(report);
        const history = statusHistoryRepo.create({
          reportId,
          previousStatus,
          newStatus: ReportStatus.IN_PROGRESS,
          previousSubStatus: previousSubStatus || undefined,
          newSubStatus: undefined,
          changedByUserId: authUser.sub,
          notes: `İş reddedildi ve takıma geri gönderildi. Sebep: ${reason}`,
        });
        await statusHistoryRepo.save(history);

        this.logger.log(
          `Rapor ${reportId} işi reddedildi ve takıma geri gönderildi. Sebep: ${reason}`
        );
      }
      // If it's an open report, reject it completely
      else if (report.status === ReportStatus.OPEN) {
        report.status = ReportStatus.REJECTED;
        report.subStatus = SUB_STATUS.NONE;
        report.rejectionReason = reason;
        report.closedByUserId = authUser.sub;
        report.updatedAt = new Date();

        await reportRepo.save(report);
        const history = statusHistoryRepo.create({
          reportId,
          previousStatus,
          newStatus: ReportStatus.REJECTED,
          previousSubStatus: previousSubStatus || undefined,
          newSubStatus: undefined,
          changedByUserId: authUser.sub,
          notes: `Rapor reddedildi. Sebep: ${reason}`,
        });
        await statusHistoryRepo.save(history);

        this.logger.log(`Rapor ${reportId} tamamen reddedildi. Sebep: ${reason}`);
      } else {
        throw new BadRequestException('Bu rapor reddetme için uygun durumda değil.');
      }
    });
  }
}
