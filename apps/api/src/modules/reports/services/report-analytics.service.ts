import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Raw, FindManyOptions } from 'typeorm';
import { Report } from '../entities/report.entity';
import { DepartmentHistory } from '../entities/department-history.entity';
import {
  IDashboardStats,
  IStatusCount,
  IDepartmentCount,
  ITypeCount,
  IDailyCount,
  IWeeklyCount,
  IMonthlyCount,
  IResolutionTime,
  IRegionalDensity,
  IAnalyticsFilter,
  ITimeFilter,
} from '../interfaces/report.analytics.interface';
import { ReportStatus, MunicipalityDepartment, ReportType } from '../interfaces/report.interface';
import { Point } from 'geojson';

// TODO: add tests for all analytics query methods - coverage: 7.31%

// Raw query sonuçları için interface tanımları
interface RawStatusCount {
  status: string;
  count: string;
}

interface RawDepartmentCount {
  department: string;
  count: string;
}

interface RawTypeCount {
  type: string;
  count: string;
}

interface RawDailyCount {
  date: string;
  count: string;
}

interface RawWeeklyCount {
  week_start: string;
  week_end: string;
  count: string;
}

interface RawMonthlyCount {
  year: string;
  month: string;
  count: string;
}

interface RawResolutionTime {
  department: string;
  avg_time: string;
  min_time: string;
  max_time: string;
  count: string;
}

interface RawRegionalDensity {
  location: string;
  count: string;
}

interface RawDistrictCount {
  district: string;
  count: string;
}

interface RawDepartmentChange {
  from_department: string;
  to_department: string;
  count: string;
}

interface RawDepartmentChangeCount {
  department: string;
  changes_from: string;
}

interface RawDepartmentChangeToCount {
  department: string;
  changes_to: string;
}

@Injectable()
export class ReportAnalyticsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(DepartmentHistory)
    private readonly departmentHistoryRepository: Repository<DepartmentHistory>,
  ) {}

  /**
   * Zamansal filtre oluşturmak için yardımcı fonksiyon
   */
  private getTimeFilterQuery(filter: ITimeFilter): { createdAt?: any } {
    // TODO: add tests for filter generation logic
    const timeQuery: { createdAt?: any } = {};

    if (filter.startDate && filter.endDate) {
      timeQuery.createdAt = Between(filter.startDate, filter.endDate);
    } else if (filter.last7Days) {
      const today = new Date();
      const last7Days = new Date(today);
      last7Days.setDate(today.getDate() - 7);
      timeQuery.createdAt = Between(last7Days, today);
    } else if (filter.last30Days) {
      const today = new Date();
      const last30Days = new Date(today);
      last30Days.setDate(today.getDate() - 30);
      timeQuery.createdAt = Between(last30Days, today);
    } else if (filter.lastQuarter) {
      const today = new Date();
      const lastQuarter = new Date(today);
      lastQuarter.setMonth(today.getMonth() - 3);
      timeQuery.createdAt = Between(lastQuarter, today);
    } else if (filter.lastYear) {
      const today = new Date();
      const lastYear = new Date(today);
      lastYear.setFullYear(today.getFullYear() - 1);
      timeQuery.createdAt = Between(lastYear, today);
    }

    return timeQuery;
  }

  /**
   * Kompleks dashboard verileri
   */
  async getDashboardStats(filter?: IAnalyticsFilter): Promise<IDashboardStats> {
    // TODO: add tests for dashboard stats aggregation
    // Eş zamanlı olarak tüm istatistikleri çekelim
    const [
      totalReports,
      statusDistribution,
      departmentDistribution,
      typeDistribution,
      dailyReportCounts,
      weeklyReportCounts,
      monthlyReportCounts,
      resolutionTimeByDepartment,
      regionalDensity,
    ] = await Promise.all([
      this.getTotalReports(filter),
      this.getStatusDistribution(filter),
      this.getDepartmentDistribution(filter),
      this.getTypeDistribution(filter),
      this.getDailyReportCounts(filter),
      this.getWeeklyReportCounts(filter),
      this.getMonthlyReportCounts(filter),
      this.getResolutionTimeByDepartment(filter),
      this.getRegionalDensity(filter),
    ]);

    // Çözülen raporları ve ortalama çözüm süresini hesaplayalım
    const totalResolvedReports =
      statusDistribution.find((s) => s.status === ReportStatus.RESOLVED)?.count || 0;

    const totalPendingReports =
      (statusDistribution.find((s) => s.status === ReportStatus.REPORTED)?.count || 0) +
      (statusDistribution.find((s) => s.status === ReportStatus.IN_PROGRESS)?.count || 0) +
      (statusDistribution.find((s) => s.status === ReportStatus.DEPARTMENT_CHANGED)?.count || 0);

    const totalRejectedReports =
      statusDistribution.find((s) => s.status === ReportStatus.REJECTED)?.count || 0;

    // Ortalama çözüm süresi (tüm departmanlar için)
    const allResolutionTimes = resolutionTimeByDepartment.map(
      (d) => d.averageResolutionTime * d.reportsCount,
    );
    const totalResolvedCount = resolutionTimeByDepartment.reduce(
      (sum, d) => sum + d.reportsCount,
      0,
    );
    const averageResolutionTime =
      totalResolvedCount > 0
        ? allResolutionTimes.reduce((sum, time) => sum + time, 0) / totalResolvedCount
        : 0;

    return {
      totalReports,
      totalResolvedReports,
      totalPendingReports,
      totalRejectedReports,
      averageResolutionTime,
      statusDistribution,
      departmentDistribution,
      typeDistribution,
      dailyReportCounts,
      weeklyReportCounts,
      monthlyReportCounts,
      resolutionTimeByDepartment,
      regionalDensity,
    };
  }

  /**
   * Toplam rapor sayısı
   */
  async getTotalReports(filter?: IAnalyticsFilter): Promise<number> {
    // TODO: add tests for filtered counts
    const query = this.buildFilterQuery(filter);
    return this.reportRepository.count(query);
  }

  /**
   * Duruma göre rapor dağılımı
   */
  async getStatusDistribution(filter?: IAnalyticsFilter): Promise<IStatusCount[]> {
    // TODO: add tests for status distribution queries
    // TypeORM ile gruplayarak sayma işlemi
    const baseQuery = this.buildFilterQuery(filter);
    const statusCounts = await this.reportRepository
      .createQueryBuilder('report')
      .select('report.status', 'status')
      .addSelect('COUNT(report.id)', 'count')
      .where(baseQuery)
      .groupBy('report.status')
      .getRawMany<RawStatusCount>();

    // Eğer sonuç null veya undefined ise boş array döndür
    if (!statusCounts) {
      return [];
    }

    return statusCounts.map((item) => ({
      status: item.status as ReportStatus,
      count: parseInt(item.count, 10),
    }));
  }

  /**
   * Departmana göre rapor dağılımı
   */
  async getDepartmentDistribution(filter?: IAnalyticsFilter): Promise<IDepartmentCount[]> {
    // TODO: add tests for department distribution
    const baseQuery = this.buildFilterQuery(filter);
    const departmentCounts = await this.reportRepository
      .createQueryBuilder('report')
      .select('report.department', 'department')
      .addSelect('COUNT(report.id)', 'count')
      .where(baseQuery)
      .groupBy('report.department')
      .getRawMany<RawDepartmentCount>();

    return departmentCounts.map((item) => ({
      department: item.department as MunicipalityDepartment,
      count: parseInt(item.count, 10),
    }));
  }

  /**
   * Türe göre rapor dağılımı
   */
  async getTypeDistribution(filter?: IAnalyticsFilter): Promise<ITypeCount[]> {
    // TODO: add tests for type distribution
    const baseQuery = this.buildFilterQuery(filter);
    const typeCounts = await this.reportRepository
      .createQueryBuilder('report')
      .select('report.type', 'type')
      .addSelect('COUNT(report.id)', 'count')
      .where(baseQuery)
      .groupBy('report.type')
      .getRawMany<RawTypeCount>();

    return typeCounts.map((item) => ({
      type: item.type as ReportType,
      count: parseInt(item.count, 10),
    }));
  }

  /**
   * Günlük rapor sayıları
   */
  async getDailyReportCounts(filter?: IAnalyticsFilter): Promise<IDailyCount[]> {
    // TODO: add tests for daily report time series
    // SQL CAST(created_at AS DATE) kullanarak günlere göre gruplayabiliriz
    const baseQuery = this.buildFilterQuery(filter);

    const dailyCounts = await this.reportRepository
      .createQueryBuilder('report')
      .select(`DATE_TRUNC('day', report.created_at)`, 'date')
      .addSelect('COUNT(report.id)', 'count')
      .where(baseQuery)
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany<RawDailyCount>();

    return dailyCounts.map((item) => ({
      date: new Date(item.date).toISOString().split('T')[0], // ISO formatında tarih
      count: parseInt(item.count, 10),
    }));
  }

  /**
   * Haftalık rapor sayıları
   */
  async getWeeklyReportCounts(filter?: IAnalyticsFilter): Promise<IWeeklyCount[]> {
    // TODO: add tests for weekly report aggregation
    const baseQuery = this.buildFilterQuery(filter);

    const weeklyCounts = await this.reportRepository
      .createQueryBuilder('report')
      .select(`DATE_TRUNC('week', report.created_at)`, 'week_start')
      .addSelect(`DATE_TRUNC('week', report.created_at) + INTERVAL '6 days'`, 'week_end')
      .addSelect('COUNT(report.id)', 'count')
      .where(baseQuery)
      .groupBy('week_start, week_end')
      .orderBy('week_start', 'ASC')
      .getRawMany<RawWeeklyCount>();

    return weeklyCounts.map((item) => ({
      weekStart: new Date(item.week_start).toISOString().split('T')[0],
      weekEnd: new Date(item.week_end).toISOString().split('T')[0],
      count: parseInt(item.count, 10),
    }));
  }

  /**
   * Aylık rapor sayıları
   */
  async getMonthlyReportCounts(filter?: IAnalyticsFilter): Promise<IMonthlyCount[]> {
    // TODO: add tests for monthly reporting
    const baseQuery = this.buildFilterQuery(filter);

    const monthlyCounts = await this.reportRepository
      .createQueryBuilder('report')
      .select('EXTRACT(YEAR FROM report.created_at)', 'year')
      .addSelect('EXTRACT(MONTH FROM report.created_at)', 'month')
      .addSelect('COUNT(report.id)', 'count')
      .where(baseQuery)
      .groupBy('year, month')
      .orderBy('year, month')
      .getRawMany<RawMonthlyCount>();

    return monthlyCounts.map((item) => ({
      year: parseInt(item.year, 10),
      month: parseInt(item.month, 10),
      count: parseInt(item.count, 10),
    }));
  }

  /**
   * Departmana göre çözülme süreleri
   */
  async getResolutionTimeByDepartment(filter?: IAnalyticsFilter): Promise<IResolutionTime[]> {
    // TODO: add tests for resolution time metrics
    // Sadece çözülmüş raporları filtreleyerek işlem yapacağız
    const baseQuery = this.buildFilterQuery({
      ...filter,
      status: ReportStatus.RESOLVED,
    });

    // Çözülme anına kadar geçen süreyi hesaplıyoruz
    const resolutionTimes = await this.reportRepository
      .createQueryBuilder('report')
      .select('report.department', 'department')
      .addSelect(
        'AVG(EXTRACT(EPOCH FROM (report.updated_at - report.created_at)) * 1000)',
        'avg_time',
      )
      .addSelect(
        'MIN(EXTRACT(EPOCH FROM (report.updated_at - report.created_at)) * 1000)',
        'min_time',
      )
      .addSelect(
        'MAX(EXTRACT(EPOCH FROM (report.updated_at - report.created_at)) * 1000)',
        'max_time',
      )
      .addSelect('COUNT(report.id)', 'count')
      .where(baseQuery)
      .groupBy('report.department')
      .getRawMany<RawResolutionTime>();

    return resolutionTimes.map((item) => ({
      department: item.department as MunicipalityDepartment,
      averageResolutionTime: parseFloat(item.avg_time) || 0,
      minResolutionTime: parseFloat(item.min_time) || 0,
      maxResolutionTime: parseFloat(item.max_time) || 0,
      reportsCount: parseInt(item.count, 10),
    }));
  }

  /**
   * Bölgesel rapor yoğunluğu
   */
  async getRegionalDensity(filter?: IAnalyticsFilter): Promise<IRegionalDensity[]> {
    // TODO: add tests for spatial clustering
    const baseQuery = this.buildFilterQuery(filter);

    // Geolokasyon kümelerini elde etmek için ST_ClusterDBSCAN kullanabiliriz
    // Bu PostgreSQL ile PostGIS eklentisi gerektirir
    const regionalDensity = await this.reportRepository
      .createQueryBuilder('report')
      .select(`ST_AsGeoJSON(ST_Centroid(ST_Collect(report.location)))`, 'location')
      .addSelect('COUNT(report.id)', 'count')
      .where(baseQuery)
      .addGroupBy('ST_ClusterDBSCAN(report.location, 500, 3) OVER ()') // 500m ve min. 3 nokta
      .getRawMany<RawRegionalDensity>();

    return regionalDensity.map((item) => ({
      location: JSON.parse(item.location) as Point, // GeoJSON Point tipine açıkça dönüştürme
      reportsCount: parseInt(item.count, 10),
    }));
  }

  /**
   * En çok rapor edilen bölgeler - semtlere/mahallelere göre
   */
  async getMostReportedDistricts(
    filter?: IAnalyticsFilter,
    limit = 10,
  ): Promise<{ district: string; count: number }[]> {
    // TODO: add tests for district aggregation
    const baseQuery = this.buildFilterQuery(filter);

    // Adres alanını kullanarak bölge bazlı gruplama yapıyoruz
    // Adres formatı "mahalle, ilçe, il" şeklinde olduğunu varsayıyoruz
    const districtCounts = await this.reportRepository
      .createQueryBuilder('report')
      .select("SPLIT_PART(report.address, ',', 1)", 'district')
      .addSelect('COUNT(report.id)', 'count')
      .where(baseQuery)
      .andWhere('report.address IS NOT NULL')
      .groupBy('district')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany<RawDistrictCount>();

    return districtCounts.map((item) => ({
      district: item.district,
      count: parseInt(item.count, 10),
    }));
  }

  /**
   * 30 günden fazla çözülmemiş raporlar
   */
  async getLongPendingReports(filter?: IAnalyticsFilter): Promise<Report[]> {
    // TODO: add tests for long pending report filters
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const baseQuery = this.buildFilterQuery({
      ...filter,
      startDate: undefined,
      endDate: thirtyDaysAgo,
    });

    // Çözülmeyen raporları bulalım
    return this.reportRepository.find({
      where: {
        ...baseQuery,
        status: Raw(
          (status) => `${status} NOT IN ('${ReportStatus.RESOLVED}', '${ReportStatus.REJECTED}')`,
        ),
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  /**
   * Departman değişim analizleri
   */
  async getDepartmentChangeAnalytics(filter?: IAnalyticsFilter): Promise<{
    departmentChanges: { fromDepartment: string; toDepartment: string; count: number }[];
    departmentChangeCount: { department: string; changesFrom: number }[];
    departmentChangeToCount: { department: string; changesTo: number }[];
  }> {
    // TODO: add tests for department change analytics
    const timeQuery = this.getTimeFilterQuery(filter || {});

    // Departman değişim kayıtlarını analiz edelim
    const departmentChanges = await this.departmentHistoryRepository
      .createQueryBuilder('history')
      .select('history.old_department', 'from_department')
      .addSelect('history.new_department', 'to_department')
      .addSelect('COUNT(*)', 'count')
      .where(timeQuery)
      .groupBy('history.old_department, history.new_department')
      .getRawMany<RawDepartmentChange>();

    // Departman bazlı toplam değişim sayıları
    const departmentChangeCount = await this.departmentHistoryRepository
      .createQueryBuilder('history')
      .select('history.old_department', 'department')
      .addSelect('COUNT(*)', 'changes_from')
      .where(timeQuery)
      .groupBy('history.old_department')
      .getRawMany<RawDepartmentChangeCount>();

    // Departmana gelme sayıları
    const departmentChangeToCount = await this.departmentHistoryRepository
      .createQueryBuilder('history')
      .select('history.new_department', 'department')
      .addSelect('COUNT(*)', 'changes_to')
      .where(timeQuery)
      .groupBy('history.new_department')
      .getRawMany<RawDepartmentChangeToCount>();

    return {
      departmentChanges: departmentChanges.map((item) => ({
        fromDepartment: item.from_department,
        toDepartment: item.to_department,
        count: parseInt(item.count, 10),
      })),
      departmentChangeCount: departmentChangeCount.map((item) => ({
        department: item.department,
        changesFrom: parseInt(item.changes_from, 10),
      })),
      departmentChangeToCount: departmentChangeToCount.map((item) => ({
        department: item.department,
        changesTo: parseInt(item.changes_to, 10),
      })),
    };
  }

  /**
   * Filtre koşullarından sorgu nesnesi oluştur
   */
  private buildFilterQuery(filter?: IAnalyticsFilter): FindManyOptions<Report> {
    // TODO: add tests for query builder logic
    if (!filter) {
      return {};
    }

    const query: FindManyOptions<Report> = {};
    const whereClause: Record<string, unknown> = {}; // any yerine unknown kullanıyoruz

    // Zaman filtresi
    const timeQuery = this.getTimeFilterQuery(filter);
    if (timeQuery.createdAt) {
      whereClause.createdAt = timeQuery.createdAt;
    }

    // Diğer filtreler
    if (filter.department) {
      whereClause.department = filter.department;
    }

    if (filter.status) {
      whereClause.status = filter.status;
    }

    if (filter.type) {
      whereClause.type = filter.type;
    }

    if (filter.userId) {
      whereClause.userId = filter.userId;
    }

    // Bölge filtresi ayrıca işlenmeli, raw query gerektirebilir
    // if (filter.regionFilter) {
    //   // ST_DWithin gibi bir PostGIS fonksiyonu kullanılabilir
    // }

    if (Object.keys(whereClause).length > 0) {
      query.where = whereClause as FindManyOptions<Report>['where']; // Daha spesifik ve güvenli tip dönüşümü
    }

    return query;
  }
}
