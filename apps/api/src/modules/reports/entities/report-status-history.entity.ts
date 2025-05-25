import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ReportStatus } from '@KentNabiz/shared';
import { Report } from './report.entity';
import { User } from '../../users/entities/user.entity';

@Entity('report_status_history')
export class ReportStatusHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'report_id', type: 'int' })
  reportId!: number;

  @ManyToOne(() => Report, report => report.statusHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report!: Report;

  @Column({ name: 'old_status', type: 'enum', enum: ReportStatus })
  oldStatus!: ReportStatus;

  @Column({ name: 'new_status', type: 'enum', enum: ReportStatus })
  newStatus!: ReportStatus;

  @Column({ name: 'sub_status', type: 'varchar', length: 100, nullable: true })
  subStatus?: string;

  @Column({ name: 'changed_by_id', type: 'int' })
  changedById!: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'changed_by_id' })
  changedBy!: User;

  @Column({ name: 'changed_at', type: 'timestamptz' })
  changedAt!: Date;
}
