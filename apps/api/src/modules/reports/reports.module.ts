import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './controllers/reports.controller';
import { CategoryController } from './controllers/category.controller';
import { ReportAnalyticsController } from './controllers/report-analytics.controller';
import { ReportsService } from './services/reports.service';
import { LocationService } from './services/location.service';
import { DepartmentService } from './services/department.service';
import { CategoryService } from './services/category.service';
import { ReportAnalyticsService } from './services/report-analytics.service';
import { ReportRepository } from './repositories/report.repository';
import { DepartmentRepository } from './repositories/department.repository';
import { CategoryRepository } from './repositories/category.repository';
import { Report } from './entities/report.entity';
import { Department } from './entities/department.entity';
import { DepartmentHistory } from './entities/department-history.entity';
import { ReportCategory } from './entities/report-category.entity';
import { ReportMedia } from './entities/report-media.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, Department, DepartmentHistory, ReportCategory, ReportMedia]),
  ],
  controllers: [ReportsController, CategoryController, ReportAnalyticsController],
  providers: [
    ReportsService,
    LocationService,
    DepartmentService,
    CategoryService,
    ReportAnalyticsService,
    ReportRepository,
    DepartmentRepository,
    CategoryRepository,
  ],
  exports: [ReportsService, DepartmentService, CategoryService],
})
export class ReportsModule {}
