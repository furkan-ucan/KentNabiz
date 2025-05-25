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

  @Column({ type: 'enum', enum: AssigneeType })
  assigneeType!: AssigneeType;

  @Column({ name: 'assignee_id', type: 'int' })
  assigneeId!: number;

  // Eğer assigneeType USER ise:
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignee_id' })
  assigneeUser?: User;

  // Eğer assigneeType TEAM ise:
  @ManyToOne(() => Team, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignee_id' })
  assigneeTeam?: Team;

  @Column({ name: 'assigned_by_id', type: 'int' })
  assignedById!: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_by_id' })
  assignedBy!: User;

  @Column({ type: 'enum', enum: AssignmentStatus })
  status!: AssignmentStatus;

  @Column({ type: 'timestamptz' })
  assignedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  acceptedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  rejectedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt?: Date;
}
