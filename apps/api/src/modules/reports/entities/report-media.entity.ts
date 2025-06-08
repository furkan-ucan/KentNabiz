import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
// Keep import for type hints
import { Report } from './report.entity';
import { User } from '../../users/entities/user.entity';

export enum ReportMediaContext {
  INITIAL_REPORT = 'INITIAL_REPORT',
  RESOLUTION_PROOF = 'RESOLUTION_PROOF',
}

@Entity('report_medias')
export class ReportMedia {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'report_id' })
  reportId!: number;

  // --- FIX: Use string name for Report relationship ---
  @ManyToOne('Report', (report: Report) => report.reportMedias, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'report_id' })
  report!: Report;

  @Column({ type: 'varchar', length: 255 })
  url!: string;

  @Column({ type: 'varchar', length: 50 })
  type!: string;

  @Column({
    name: 'media_context',
    type: 'enum',
    enum: ReportMediaContext,
    default: ReportMediaContext.INITIAL_REPORT,
  })
  mediaContext!: ReportMediaContext;

  @Column({ name: 'uploaded_by_user_id', nullable: true })
  uploadedByUserId?: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploaded_by_user_id' })
  uploadedByUser?: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
