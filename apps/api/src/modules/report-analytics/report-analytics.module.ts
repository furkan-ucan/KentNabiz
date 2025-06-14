import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportAnalyticsController } from './controllers/report-analytics.controller';
import { ReportAnalyticsService } from './services/report-analytics.service';
import { FunnelAnalyticsService } from './services/funnel-analytics.service';
import { CategoryAnalyticsService } from './services/category-analytics.service';
import { TemporalAnalyticsService } from './services/temporal-analytics.service';
import { Report } from '../reports/entities/report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report])],
  controllers: [ReportAnalyticsController],
  providers: [
    ReportAnalyticsService,
    FunnelAnalyticsService,
    CategoryAnalyticsService,
    TemporalAnalyticsService,
  ],
  exports: [
    ReportAnalyticsService,
    FunnelAnalyticsService,
    CategoryAnalyticsService,
    TemporalAnalyticsService,
  ],
})
export class ReportAnalyticsModule {}
