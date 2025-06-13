import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportAnalyticsController } from './controllers/report-analytics.controller';
import { ReportAnalyticsService } from './services/report-analytics.service';
import { FunnelAnalyticsService } from './services/funnel-analytics.service';
import { CategoryAnalyticsService } from './services/category-analytics.service';
import { Report } from '../reports/entities/report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report])],
  controllers: [ReportAnalyticsController],
  providers: [ReportAnalyticsService, FunnelAnalyticsService, CategoryAnalyticsService],
  exports: [ReportAnalyticsService, FunnelAnalyticsService, CategoryAnalyticsService],
})
export class ReportAnalyticsModule {}
