/**
 * @file department-history.entity.ts
 * @description This entity represents the history of department changes for reports.
 * It includes the old and new department, the reason for the change, and the department that made the change.
 * This is used to track the history of department assignments for reports in the system.
 * @author Furkan Uçan
 * @date 2025-03-31
 * @version 1.0
 * @module reports
 * @see {@link Report} for the report entity
 * @see {@link MunicipalityDepartment} for the department enum
 * @see {@link DepartmentHistory} for the department history entity
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Report } from './report.entity';
import { MunicipalityDepartment } from '../interfaces/report.interface';

@Entity('department_history')
export class DepartmentHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'report_id' })
  reportId!: number;

  @ManyToOne(() => Report, (report) => report.departmentHistory, { onDelete: 'CASCADE' })
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
