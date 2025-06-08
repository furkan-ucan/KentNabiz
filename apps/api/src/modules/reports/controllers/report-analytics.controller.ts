import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ReportAnalyticsService } from '../services/report-analytics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ReportStatus, ReportType, MunicipalityDepartment, UserRole } from '@kentnabiz/shared';
import {
  IAnalyticsFilter,
  IDashboardStats,
  IStatusCount,
  IDepartmentCount,
  ITypeCount,
  IDailyCount,
  IWeeklyCount,
  IMonthlyCount,
  IResolutionTime,
  IRegionalDensity,
} from '../interfaces/report.analytics.interface';

@ApiTags('report-analytics')
@Controller('report-analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportAnalyticsController {
  constructor(private readonly reportAnalyticsService: ReportAnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Yönetsel panel için dashboard istatistiklerini getir',
    description: 'Kapsamlı rapor istatistiklerini tek bir istek ile getiren dashboard verisi',
  })
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'department', required: false, enum: MunicipalityDepartment })
  @ApiQuery({ name: 'status', required: false, enum: ReportStatus })
  @ApiQuery({ name: 'type', required: false, enum: ReportType })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'last7Days', required: false, type: Boolean })
  @ApiQuery({ name: 'last30Days', required: false, type: Boolean })
  @ApiQuery({ name: 'lastQuarter', required: false, type: Boolean })
  @ApiQuery({ name: 'lastYear', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Tüm dashboard verileri başarıyla getirildi',
  })
  async getDashboardStats(@Query() filter?: IAnalyticsFilter): Promise<IDashboardStats> {
    return this.reportAnalyticsService.getDashboardStats(filter);
  }

  @Get('total')
  @ApiOperation({
    summary: 'Toplam rapor sayısını getir',
    description: 'Belirtilen filtrelere göre toplam rapor sayısını getirir',
  })
  @ApiResponse({ status: 200, description: 'Toplam rapor sayısı başarıyla getirildi' })
  async getTotalReports(@Query() filter?: IAnalyticsFilter): Promise<{ total: number }> {
    const total = await this.reportAnalyticsService.getTotalReports(filter);
    return { total };
  }

  @Get('status-distribution')
  @ApiOperation({
    summary: 'Duruma göre rapor dağılımını getir',
    description: 'Rapor durumlarına göre dağılım istatistiklerini getirir',
  })
  @ApiResponse({ status: 200, description: 'Durum dağılımı başarıyla getirildi' })
  async getStatusDistribution(@Query() filter?: IAnalyticsFilter): Promise<IStatusCount[]> {
    return this.reportAnalyticsService.getStatusDistribution(filter);
  }

  @Get('department-distribution')
  @ApiOperation({
    summary: 'Departmana göre rapor dağılımını getir',
    description: 'Departmanlara göre rapor dağılım istatistiklerini getirir',
  })
  @ApiResponse({ status: 200, description: 'Departman dağılımı başarıyla getirildi' })
  async getDepartmentDistribution(@Query() filter?: IAnalyticsFilter): Promise<IDepartmentCount[]> {
    return this.reportAnalyticsService.getDepartmentDistribution(filter);
  }

  @Get('type-distribution')
  @ApiOperation({
    summary: 'Türe göre rapor dağılımını getir',
    description: 'Rapor türlerine göre dağılım istatistiklerini getirir',
  })
  @ApiResponse({ status: 200, description: 'Tür dağılımı başarıyla getirildi' })
  async getTypeDistribution(@Query() filter?: IAnalyticsFilter): Promise<ITypeCount[]> {
    return this.reportAnalyticsService.getTypeDistribution(filter);
  }

  @Get('daily-counts')
  @ApiOperation({
    summary: 'Günlük rapor sayılarını getir',
    description: 'Günlere göre rapor sayılarını getirir',
  })
  @ApiResponse({ status: 200, description: 'Günlük rapor sayıları başarıyla getirildi' })
  async getDailyReportCounts(@Query() filter?: IAnalyticsFilter): Promise<IDailyCount[]> {
    return this.reportAnalyticsService.getDailyReportCounts(filter);
  }

  @Get('weekly-counts')
  @ApiOperation({
    summary: 'Haftalık rapor sayılarını getir',
    description: 'Haftalara göre rapor sayılarını getirir',
  })
  @ApiResponse({ status: 200, description: 'Haftalık rapor sayıları başarıyla getirildi' })
  async getWeeklyReportCounts(@Query() filter?: IAnalyticsFilter): Promise<IWeeklyCount[]> {
    return this.reportAnalyticsService.getWeeklyReportCounts(filter);
  }

  @Get('monthly-counts')
  @ApiOperation({
    summary: 'Aylık rapor sayılarını getir',
    description: 'Aylara göre rapor sayılarını getirir',
  })
  @ApiResponse({ status: 200, description: 'Aylık rapor sayıları başarıyla getirildi' })
  async getMonthlyReportCounts(@Query() filter?: IAnalyticsFilter): Promise<IMonthlyCount[]> {
    return this.reportAnalyticsService.getMonthlyReportCounts(filter);
  }

  @Get('resolution-time')
  @ApiOperation({
    summary: 'Departmana göre çözülme sürelerini getir',
    description: 'Departmanlara göre ortalama, minimum ve maksimum çözülme sürelerini getirir',
  })
  @ApiResponse({ status: 200, description: 'Çözülme süreleri başarıyla getirildi' })
  async getResolutionTimeByDepartment(
    @Query() filter?: IAnalyticsFilter
  ): Promise<IResolutionTime[]> {
    return this.reportAnalyticsService.getResolutionTimeByDepartment(filter);
  }

  @Get('regional-density')
  @ApiOperation({
    summary: 'Bölgesel rapor yoğunluğunu getir',
    description: 'Coğrafi konumlara göre rapor yoğunluğunu kümelenmiş şekilde getirir',
  })
  @ApiResponse({ status: 200, description: 'Bölgesel yoğunluk başarıyla getirildi' })
  async getRegionalDensity(@Query() filter?: IAnalyticsFilter): Promise<IRegionalDensity[]> {
    return this.reportAnalyticsService.getRegionalDensity(filter);
  }

  @Get('most-reported-districts')
  @ApiOperation({
    summary: 'En çok rapor edilen bölgeleri getir',
    description: 'Semtlere/mahallelere göre en çok rapor edilen bölgeleri getirir',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Sonuç sayısı (varsayılan: 10)',
  })
  @ApiResponse({ status: 200, description: 'En çok rapor edilen bölgeler başarıyla getirildi' })
  async getMostReportedDistricts(
    @Query() filter?: IAnalyticsFilter & { limit?: number }
  ): Promise<{ district: string; count: number }[]> {
    const limit = filter?.limit ? parseInt(filter.limit.toString(), 10) : 10;
    delete filter?.limit;
    return this.reportAnalyticsService.getMostReportedDistricts(filter, limit);
  }

  @Get('long-pending')
  @ApiOperation({
    summary: '30 günden fazla çözülmemiş raporları getir',
    description: '30 günden uzun süredir çözülmemiş açık raporları getirir',
  })
  @ApiResponse({ status: 200, description: 'Uzun süredir bekleyen raporlar başarıyla getirildi' })
  async getLongPendingReports(@Query() filter?: IAnalyticsFilter) {
    return this.reportAnalyticsService.getLongPendingReports(filter);
  }

  @Get('department-changes')
  @ApiOperation({
    summary: 'Departman değişim analizlerini getir',
    description: 'Raporların departmanlar arası transfer istatistiklerini ve detaylarını getirir',
  })
  @ApiResponse({ status: 200, description: 'Departman değişim analizi başarıyla getirildi' })
  async getDepartmentChangeAnalytics(@Query() filter?: IAnalyticsFilter) {
    return this.reportAnalyticsService.getDepartmentChangeAnalytics(filter);
  }

  @Get('department-performance')
  @ApiOperation({
    summary: 'Departman performans analizini getir',
    description: 'Departmanların çözüm hızı, performans skoru ve iş yükü dağılımını analiz eder',
  })
  @ApiResponse({ status: 200, description: 'Departman performans analizi başarıyla getirildi' })
  async getDepartmentPerformance(@Query() filter?: IAnalyticsFilter) {
    // Gereken analizleri çekelim
    const [departmentDistribution, resolutionTimeByDepartment, longPendingReports] =
      await Promise.all([
        this.reportAnalyticsService.getDepartmentDistribution(filter),
        this.reportAnalyticsService.getResolutionTimeByDepartment(filter),
        this.reportAnalyticsService.getLongPendingReports(filter),
      ]);

    // Departman bazlı uzun süre bekleyen raporları sayalım
    const pendingByDepartment = longPendingReports.reduce(
      (acc, report) => {
        const dept = report.currentDepartment?.code || 'N/A';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Her departman için performans skoru hesaplayalım
    // (düşük çözüm süresi, yüksek çözüm oranı = yüksek performans)
    return departmentDistribution.map(dept => {
      const resolutionData = resolutionTimeByDepartment.find(
        r => r.department === dept.department
      ) || { averageResolutionTime: 0, reportsCount: 0 };

      const totalReports = dept.count;
      const resolvedReports = resolutionData.reportsCount;
      const pendingReports = pendingByDepartment[dept.department] || 0;

      // Çözüm oranı (0-1 arası)
      const resolutionRate = totalReports > 0 ? resolvedReports / totalReports : 0;

      // Performans skoru (0-100 arası)
      // Düşük çözüm süresi ve yüksek çözüm oranı = yüksek skor
      const avgTimeScore =
        resolutionData.averageResolutionTime > 0
          ? 100 / (1 + resolutionData.averageResolutionTime / (7 * 24 * 60 * 60 * 1000)) // 1 hafta baz alınarak normalize edildi
          : 50; // Veri yoksa orta değer

      const performanceScore = Math.round(avgTimeScore * 0.6 + resolutionRate * 100 * 0.4);

      return {
        department: dept.department,
        totalReports,
        resolvedReports,
        pendingReports,
        averageResolutionTime: resolutionData.averageResolutionTime || 0,
        performanceScore,
      };
    });
  }

  @Get('time-to-resolution')
  @ApiOperation({
    summary: 'Ortalama çözüm süresini analiz et',
    description: 'Kategori, departman ve zaman bazlı ortalama çözüm süresi analizi sağlar',
  })
  @ApiResponse({ status: 200, description: 'Çözüm süresi analizi başarıyla getirildi' })
  async getTimeToResolutionAnalysis(@Query() filter?: IAnalyticsFilter) {
    // Departman bazlı çözüm sürelerini analiz edelim
    const resolutionTimeByDepartment =
      await this.reportAnalyticsService.getResolutionTimeByDepartment(filter);

    // Toplam ortalama çözüm süresi
    const totalResolved = resolutionTimeByDepartment.reduce(
      (sum, dept) => sum + dept.reportsCount,
      0
    );
    const weightedSum = resolutionTimeByDepartment.reduce(
      (sum, dept) => sum + dept.averageResolutionTime * dept.reportsCount,
      0
    );

    const overallAverageTime = totalResolved > 0 ? weightedSum / totalResolved : 0;

    // Zamansal trend (varsayımsal olarak son 6 ay için çözüm süreleri trendi)
    const trendsData = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      // Month end date removed as it was unused
      // Varsayımsal veri (gerçek implementasyonda hizmet çağrısı olacak)
      trendsData.push({
        month: `${monthStart.getFullYear()}-${(monthStart.getMonth() + 1).toString().padStart(2, '0')}`,
        avgResolutionTime: Math.random() * 5 * 24 * 60 * 60 * 1000, // Rastgele 0-5 gün
      });
    }

    return {
      overallAverageTime,
      byDepartment: resolutionTimeByDepartment,
      monthlyTrend: trendsData,
      fastestDepartment:
        resolutionTimeByDepartment
          .filter(dept => dept.reportsCount > 0)
          .sort((a, b) => a.averageResolutionTime - b.averageResolutionTime)[0] || null,
      slowestDepartment:
        resolutionTimeByDepartment
          .filter(dept => dept.reportsCount > 0)
          .sort((a, b) => b.averageResolutionTime - a.averageResolutionTime)[0] || null,
    };
  }

  @Get('regional-analysis')
  @ApiOperation({
    summary: 'Bölgesel analiz verilerini getir',
    description: 'Bölge bazlı rapor yoğunluğu ve dağılım analizini sağlar',
  })
  @ApiResponse({ status: 200, description: 'Bölgesel analiz başarıyla getirildi' })
  async getRegionalAnalysis(@Query() filter?: IAnalyticsFilter) {
    const [regionalDensity, mostReportedDistricts] = await Promise.all([
      this.reportAnalyticsService.getRegionalDensity(filter),
      this.reportAnalyticsService.getMostReportedDistricts(filter, 10),
    ]);

    // Harita görselleştirmesi için renk kodları ekleyelim
    const districts = mostReportedDistricts.map((district, index) => ({
      ...district,
      colorCode: `hsl(${Math.floor((240 * index) / mostReportedDistricts.length)}, 70%, 50%)`,
    }));

    return {
      regionalDensity,
      mostReportedDistricts: districts,
      // Not: Gerçek implementasyonda, bölgeler için geometrik sınırlar (GeoJSON) verileri dahil edilebilir
    };
  }
}
