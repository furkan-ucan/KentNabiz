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

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
