import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { TeamSpecialization } from './entities/team-specialization.entity';
import { TeamsService } from './services/teams.service';
import { TeamsController } from './controllers/teams.controller';
import { User } from '../users/entities/user.entity';
import { Specialization } from '../specializations/entities/specialization.entity';
import { TeamMembershipHistory } from '../users/entities/team-membership-history.entity';
import { Report } from '../reports/entities/report.entity';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Team,
      TeamSpecialization,
      User,
      Specialization,
      TeamMembershipHistory,
      Report, // TeamsService'in ReportRepository kullanabilmesi için
    ]),
    // ReportsModule'ü import ederek TeamsService'in ReportRepository'yi kullanabilmesini sağlıyoruz
    forwardRef(() => ReportsModule),
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
