import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { ReportsController } from './controllers/reports.controller';
import { CategoryController } from './controllers/category.controller';
import { ReportAnalyticsController } from './controllers/report-analytics.controller';

// --- Servisler ---
// Ana Orkestratör Servis
import { ReportsService } from './services/reports.service';

// Yeni Uzman (Aksiyon) Servisleri
import { ReportAssignmentService } from './services/report-assignment.service';
import { ReportStatusService } from './services/report-status.service';
import { ReportSupportService } from './services/report-support.service';
import { ReportForwardingService } from './services/report-forwarding.service';

// Diğer Yardımcı Servisler
import { LocationService } from './services/location.service';
import { DepartmentService } from './services/department.service';
import { CategoryService } from './services/category.service';
import { ReportAnalyticsService } from './services/report-analytics.service';

// Repositories
import { ReportRepository } from './repositories/report.repository';
import { DepartmentRepository } from './repositories/department.repository';
import { CategoryRepository } from './repositories/category.repository';

// Entities
import { Report } from './entities/report.entity';
import { Assignment } from './entities/assignment.entity';
import { ReportStatusHistory } from './entities/report-status-history.entity';
import { Department } from './entities/department.entity';
import { DepartmentHistory } from './entities/department-history.entity';
import { ReportCategory } from './entities/report-category.entity';
import { ReportMedia } from './entities/report-media.entity';
import { ReportSupport } from './entities/report-support.entity';
import { User } from '../users/entities/user.entity';
import { Team } from '../teams/entities/team.entity';

// Diğer Modüllerin Importları
import { TeamsModule } from '../teams/teams.module';
import { UsersModule } from '../users/users.module';
import { AbilityModule } from '../../core/authorization/ability.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Report,
      Assignment,
      ReportStatusHistory,
      Department,
      DepartmentHistory,
      ReportCategory,
      ReportMedia,
      ReportSupport,
      User,
      Team,
    ]),
    // Bu modülün, diğer modüllerin servislerine (örn: TeamsService) ihtiyacı var.
    TeamsModule,
    forwardRef(() => UsersModule),
    AbilityModule,
  ],
  controllers: [ReportsController, CategoryController, ReportAnalyticsController],
  providers: [
    // --- Ana Servis (Orkestratör) ---
    ReportsService,

    // --- Yeni Uzman (Aksiyon) Servisleri ---
    ReportAssignmentService,
    ReportStatusService,
    ReportSupportService,
    ReportForwardingService,

    // --- Diğer Yardımcı Servisler ve Repository'ler ---
    LocationService,
    DepartmentService,
    CategoryService,
    ReportAnalyticsService,
    ReportRepository,
    DepartmentRepository,
    CategoryRepository,
  ],
  exports: [
    // --- DIŞARIYA AÇILACAK OLAN SERVİSLER ---
    // Sadece diğer modüllerin gerçekten ihtiyaç duyduğu servisleri export etmeliyiz.
    // Genellikle bu, ana servis olur.
    ReportsService,

    // DepartmentService ve CategoryService gibi servisler, başka modüller tarafından
    // kullanılacaksa (örn: Admin paneli), burada export edilmeleri doğrudur.
    DepartmentService,
    CategoryService,

    // TypeOrmModule'ü export ederek, diğer modüllerin Report repository'lerini kullanabilmesini sağlıyoruz
    TypeOrmModule,
  ],
})
export class ReportsModule {}
