import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Report } from '../../reports/entities/report.entity';
import { CitizenSummaryDto } from '../dto/citizen-summary.dto';
import { ReportStatus } from '@kentnabiz/shared';

// TypeORM getRawOne() sonuçları için tip tanımları
interface CountResult {
  count: string;
}

interface AvgDaysResult {
  avgDays: string;
}

@Injectable()
export class ReportAnalyticsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>
  ) {}

  /**
   * Vatandaş ana sayfası için gereken beş metrik:
   * 1) totalReportsResolvedAllTime  = status = 'DONE'
   * 2) reportsResolvedThisMonth     = aynı kriter, bu ay içinde
   * 3) activeCitizenContributors    = DISTINCT(userId) sayısı (en az bir rapor göndermiş)
   * 4) averageResolutionTimeDays    = Ortalama çözüm süresi (gün olarak)
   * 5) pendingReportsCount          = OPEN, IN_REVIEW, IN_PROGRESS durumundaki raporlar
   */
  async getCitizenSummary(): Promise<CitizenSummaryDto> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based; Ocak = 0, Şubat = 1, …

    // Bu ayın başlangıç ve bitiş tarihleri
    const startOfMonth = new Date(year, month, 1, 0, 0, 0);
    const startOfNextMonth = new Date(year, month + 1, 1, 0, 0, 0);

    // 1) Toplam Çözülen Raporlar (All-Time)
    const totalResolvedAllTime = await this.reportRepository.count({
      where: {
        status: ReportStatus.DONE,
      },
    });

    // 2) Bu Ay Çözülen Raporlar
    // resolvedAt tarihinin bu ay içinde olması gerekiyor
    const reportsResolvedThisMonth = await this.reportRepository.count({
      where: {
        status: ReportStatus.DONE,
        resolvedAt: Between(startOfMonth, startOfNextMonth),
      },
    }); // 3) Aktif Katkıda Bulunan Vatandaşlar (Distinct userId)
    // "reports" tablosundaki benzersiz userId sayısı
    const contributorResult = (await this.reportRepository
      .createQueryBuilder('report')
      .select('COUNT(DISTINCT(report.userId))', 'count')
      .getRawOne()) as CountResult | null;

    const activeCitizenContributors = contributorResult?.count
      ? parseInt(contributorResult.count, 10)
      : 0;

    // 4) Ortalama Çözüm Süresi (gün olarak)
    // DONE durumundaki raporlar için createdAt ile resolvedAt arasındaki fark
    const avgResolutionResult = (await this.reportRepository
      .createQueryBuilder('report')
      .select('AVG(EXTRACT(EPOCH FROM (report.resolvedAt - report.createdAt)) / 86400)', 'avgDays')
      .where('report.status = :status', { status: ReportStatus.DONE })
      .andWhere('report.resolvedAt IS NOT NULL')
      .getRawOne()) as AvgDaysResult | null;

    const averageResolutionTimeDays = avgResolutionResult?.avgDays
      ? parseFloat(avgResolutionResult.avgDays)
      : null;

    // 5) Bekleyen Rapor Sayısı (OPEN, IN_REVIEW, IN_PROGRESS)
    const pendingReportsCount = await this.reportRepository.count({
      where: [
        { status: ReportStatus.OPEN },
        { status: ReportStatus.IN_REVIEW },
        { status: ReportStatus.IN_PROGRESS },
      ],
    });

    return {
      totalReportsResolvedAllTime: totalResolvedAllTime,
      reportsResolvedThisMonth,
      activeCitizenContributors,
      averageResolutionTimeDays,
      pendingReportsCount,
    };
  }
}
