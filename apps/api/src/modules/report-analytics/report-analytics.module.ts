import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportAnalyticsController } from './controllers/report-analytics.controller';
import { ReportAnalyticsService } from './services/report-analytics.service';
import { FunnelAnalyticsService } from './services/funnel-analytics.service';
import { CategoryAnalyticsService } from './services/category-analytics.service';
import { TemporalAnalyticsService } from './services/temporal-analytics.service';

// Import new modular analytics services
import { CoreAnalyticsService } from './services/analytics/core-analytics.service';
import { DashboardAnalyticsService } from './services/analytics/dashboard-analytics.service';
import { SummaryAnalyticsService } from './services/analytics/summary-analytics.service';
import { SpatialAnalyticsService } from './services/analytics/spatial-analytics.service';
import { ETLAnalyticsService } from './services/analytics/etl-analytics.service';

import { Report } from '../reports/entities/report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report])],
  controllers: [ReportAnalyticsController],
  providers: [
    // Core analytics services
    CoreAnalyticsService,
    DashboardAnalyticsService,
    SummaryAnalyticsService,
    SpatialAnalyticsService,
    ETLAnalyticsService,

    // Main analytics service (now modular)
    ReportAnalyticsService,

    // Existing specialized services
    FunnelAnalyticsService,
    CategoryAnalyticsService,
    TemporalAnalyticsService,
  ],
  exports: [
    ReportAnalyticsService,
    CoreAnalyticsService,
    DashboardAnalyticsService,
    SummaryAnalyticsService,
    SpatialAnalyticsService,
    ETLAnalyticsService,
    FunnelAnalyticsService,
    CategoryAnalyticsService,
    TemporalAnalyticsService,
  ],
})
export class ReportAnalyticsModule {}
