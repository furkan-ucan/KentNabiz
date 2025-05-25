import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AssignmentStatus, AssigneeType } from '@KentNabiz/shared';
import { Report } from './report.entity';
import { User } from '../../users/entities/user.entity';
import { Team } from '../../teams/entities/team.entity';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'report_id', type: 'int' })
  reportId!: number;

  @ManyToOne(() => Report, report => report.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report!: Report;

  @Column({ name: 'assignee_type', type: 'enum', enum: AssigneeType })
  assigneeType!: AssigneeType;

  @Column({ name: 'assignee_user_id', type: 'int', nullable: true })
  assigneeUserId?: number;

  @Column({ name: 'assignee_team_id', type: 'int', nullable: true })
  assigneeTeamId?: number;

  // Eğer assigneeType USER ise:
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignee_user_id' })
  assigneeUser?: User;

  // Eğer assigneeType TEAM ise:
  @ManyToOne(() => Team, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignee_team_id' })
  assigneeTeam?: Team;

  @Column({ name: 'assigned_by_user_id', type: 'int' })
  assignedById!: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_by_user_id' })
  assignedBy!: User;

  @Column({ name: 'assignment_status', type: 'enum', enum: AssignmentStatus })
  status!: AssignmentStatus;

  @Column({ name: 'assigned_at', type: 'timestamptz' })
  assignedAt!: Date;

  @Column({ name: 'accepted_at', type: 'timestamptz', nullable: true })
  acceptedAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date;

  @Column({ name: 'rejected_at', type: 'timestamptz', nullable: true })
  rejectedAt?: Date;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt?: Date;
}
