import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ReportStatus } from '@KentNabiz/shared'; // Corrected import path
import { Report } from './report.entity';
import { User } from '../../users/entities/user.entity';

// Force TypeScript to re-analyze this entity

@Entity('report_status_history')
export class ReportStatusHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'report_id', type: 'int' })
  reportId!: number;

  @ManyToOne(() => Report, report => report.statusHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report!: Report;

  @Column({ name: 'previous_status', type: 'enum', enum: ReportStatus, nullable: true }) // previousStatus -> previous_status
  previousStatus?: ReportStatus;

  @Column({ name: 'new_status', type: 'enum', enum: ReportStatus }) // new_status -> new_status (bu zaten doğru)
  newStatus!: ReportStatus;

  @Column({ name: 'previous_sub_status', type: 'varchar', length: 255, nullable: true })
  previousSubStatus?: string;

  @Column({ name: 'new_sub_status', type: 'varchar', length: 255, nullable: true })
  newSubStatus?: string;

  @Column({ name: 'changed_by_user_id', type: 'int', nullable: true })
  changedByUserId?: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'changed_by_user_id' })
  changedBy?: User;

  @Column({ name: 'changed_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  changedAt!: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
