import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Team } from '../../teams/entities/team.entity';

@Entity('team_membership_history')
export class TeamMembershipHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @Column({ name: 'team_id', type: 'int' })
  teamId!: number;

  @ManyToOne(() => User, user => user.teamMembershipHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Team, team => team.membershipsHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team!: Team;

  @Column({ type: 'timestamptz' })
  joinedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  leftAt?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  roleInTeam?: string;
}
