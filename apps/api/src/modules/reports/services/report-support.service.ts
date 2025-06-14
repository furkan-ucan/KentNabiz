// apps/api/src/modules/reports/services/report-support.service.ts
import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Report } from '../entities/report.entity';
import { ReportSupport } from '../entities/report-support.entity';
import { JwtPayload as AuthUser } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class ReportSupportService {
  private readonly logger = new Logger(ReportSupportService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Report) private readonly reportRepository: Repository<Report>,
    @InjectRepository(ReportSupport)
    private readonly reportSupportRepository: Repository<ReportSupport>
  ) {}

  /**
   * Adds a user's support to a report.
   * This operation is idempotent; if the user already supports the report,
   * it does nothing and succeeds silently.
   * A user cannot support their own report.
   * @param reportId - The ID of the report to support.
   * @param authUser - The user giving the support.
   */
  async addSupport(reportId: number, authUser: AuthUser): Promise<void> {
    // Note: Authorization checks (e.g., ability.can(Action.Support, report))
    // should be handled in the orchestrating ReportsService before calling this method.

    const report = await this.reportRepository.findOneBy({ id: reportId });
    if (!report) {
      throw new NotFoundException(`Rapor ID ${reportId} bulunamadı`);
    }

    if (report.userId === authUser.sub) {
      throw new ForbiddenException('Kullanıcılar kendi raporlarını destekleyemez.');
    }

    // Check if the user already supports this report to ensure idempotency.
    const existingSupport = await this.reportSupportRepository.findOneBy({
      reportId,
      userId: authUser.sub,
    });

    if (existingSupport) {
      this.logger.log(
        `Kullanıcı ${authUser.sub}, rapor ${reportId}'i zaten destekliyor. İşlem atlanıyor.`
      );
      return; // Already supported, do nothing.
    }

    // Use a transaction to ensure both operations (creating support and incrementing count) succeed or fail together.
    await this.dataSource.transaction(async manager => {
      const supportRepo = manager.getRepository(ReportSupport);
      const reportRepo = manager.getRepository(Report);

      const newSupport = supportRepo.create({
        reportId,
        userId: authUser.sub,
      });
      await supportRepo.save(newSupport);

      // Increment the support count on the report entity.
      await reportRepo.increment({ id: reportId }, 'supportCount', 1);

      this.logger.log(`Kullanıcı ${authUser.sub}, rapor ${reportId}'i başarıyla destekledi.`);
    });
  }

  /**
   * Removes a user's support from a report.
   * This operation is idempotent; if the user is not supporting the report,
   * it does nothing and succeeds silently.
   * @param reportId - The ID of the report to unsupport.
   * @param authUser - The user removing the support.
   */
  async removeSupport(reportId: number, authUser: AuthUser): Promise<void> {
    // Note: Authorization checks should be handled in the orchestrating ReportsService.

    // Find the support record to be deleted.
    const supportToRemove = await this.reportSupportRepository.findOneBy({
      reportId,
      userId: authUser.sub,
    });

    if (!supportToRemove) {
      this.logger.log(
        `Kullanıcı ${authUser.sub}, rapor ${reportId}'i zaten desteklemiyor. İşlem atlanıyor.`
      );
      return; // Not supporting, do nothing.
    }

    // Use a transaction to ensure both operations succeed or fail together.
    await this.dataSource.transaction(async manager => {
      const supportRepo = manager.getRepository(ReportSupport);
      const reportRepo = manager.getRepository(Report);

      // Delete the support record.
      await supportRepo.delete(supportToRemove.id);

      // Decrement the support count, ensuring it does not go below zero.
      // Using query builder for database-level `GREATEST` function is robust.
      await reportRepo
        .createQueryBuilder()
        .update(Report)
        .set({ supportCount: () => 'GREATEST(support_count - 1, 0)' })
        .where('id = :id', { id: reportId })
        .execute();

      this.logger.log(`Kullanıcı ${authUser.sub}, rapor ${reportId} için desteğini geri çekti.`);
    });
  }
}
