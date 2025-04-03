import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
// Keep import for type hints
import { Report } from './report.entity';
import { MunicipalityDepartment, ReportType } from '../interfaces/report.interface';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: MunicipalityDepartment,
    unique: true,
  })
  code!: MunicipalityDepartment;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'responsible_report_types', type: 'jsonb', nullable: true })
  responsibleReportTypes!: ReportType[]; // Assuming ReportType is correctly defined elsewhere

  // --- FIX: Use string name for Report relationship ---
  @OneToMany('Report', (report: Report) => report.departmentEntity) // Use string "Report" and type hint
  reports!: Report[]; // Type hint still uses imported class

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
