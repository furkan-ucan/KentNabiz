import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';
import { LocationService } from './services/location.service';
import { ReportRepository } from './repositories/report.repository';
import { Report } from './entities/report.entity';
import { ReportMedia } from './entities/report-media.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, ReportMedia])],
  controllers: [ReportsController],
  providers: [ReportsService, LocationService, ReportRepository],
  exports: [ReportsService, ReportRepository],
})
export class ReportsModule {}
