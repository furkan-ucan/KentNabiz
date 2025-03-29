import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Report } from './report.entity';

@Entity('report_categories')
export class ReportCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon?: string;

  @Column({ type: 'integer', nullable: true })
  parentId?: number;

  @ManyToOne(() => ReportCategory, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent?: ReportCategory;

  @OneToMany(() => ReportCategory, (category) => category.parent)
  children?: ReportCategory[];

  @OneToMany(() => Report, (report) => report.category)
  reports: Report[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
