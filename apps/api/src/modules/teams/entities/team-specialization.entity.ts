import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Team } from './team.entity';
import { Specialization } from '../../specializations/entities/specialization.entity';

@Entity('team_specializations')
export class TeamSpecialization {
  @PrimaryColumn({ name: 'team_id', type: 'int' })
  teamId!: number;

  @PrimaryColumn({ name: 'specialization_id', type: 'int' })
  specializationId!: number;

  @ManyToOne(() => Team, (team: Team) => team.teamSpecializations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team!: Team;

  @ManyToOne(
    () => Specialization,
    (specialization: Specialization) => specialization.teamSpecializations,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'specialization_id' })
  specialization!: Specialization;
}
