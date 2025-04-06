import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
// Keep import for type hints
import { Report } from './report.entity';
import { MunicipalityDepartment } from '@KentNabiz/shared';

@Entity('department_history')
export class DepartmentHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'report_id' })
  reportId!: number;

  // --- FIX: Use string name for Report relationship ---
  @ManyToOne('Report', (report: Report) => report.departmentHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'report_id' })
  report!: Report;

  @Column({
    type: 'enum',
    enum: MunicipalityDepartment,
  })
  oldDepartment!: MunicipalityDepartment;

  @Column({
    type: 'enum',
    enum: MunicipalityDepartment,
  })
  newDepartment!: MunicipalityDepartment;

  @Column({ type: 'text', nullable: true })
  reason!: string;

  @Column({
    type: 'enum',
    enum: MunicipalityDepartment,
    name: 'changed_by_department',
  })
  changedByDepartment!: MunicipalityDepartment;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
