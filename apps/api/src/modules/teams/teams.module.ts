import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { TeamSpecialization } from './entities/team-specialization.entity';
import { TeamsService } from './services/teams.service';
import { TeamsController } from './controllers/teams.controller';
import { User } from '../users/entities/user.entity';
import { Specialization } from '../specializations/entities/specialization.entity';
import { TeamMembershipHistory } from '../users/entities/team-membership-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Team,
      TeamSpecialization,
      User,
      Specialization,
      TeamMembershipHistory,
    ]),
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
