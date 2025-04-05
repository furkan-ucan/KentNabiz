import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany, // Needed if the relationship exists
  ManyToOne, // For parent relationship
  JoinColumn, // For parent relationship
  Index, // For parent relationship
} from 'typeorm';
// Keep import for type hints IF the relationship exists
import { Report } from './report.entity';

@Entity('report_categories')
export class ReportCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index() // Add index if you query by code often
  code!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon!: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId!: number;

  // Relationship to self for parent/child categories
  // Keep arrow function here as it's unlikely to cause a cycle with Report
  @ManyToOne(() => ReportCategory, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent!: ReportCategory;

  @OneToMany(() => ReportCategory, category => category.parent)
  children!: ReportCategory[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive!: boolean;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder!: number;

  // --- FIX: Use string name for Report relationship (IF THIS RELATIONSHIP EXISTS) ---
  @OneToMany('Report', (report: Report) => report.category) // Use string "Report" and type hint
  reports!: Report[]; // Type hint still uses imported class. Remove this line and the decorator if categories don't track reports.

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
