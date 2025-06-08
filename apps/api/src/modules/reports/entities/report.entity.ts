// apps/api/src/modules/reports/entities/report.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Point } from 'geojson';
import { User } from '../../users/entities/user.entity';
import { ReportMedia } from './report-media.entity';
import { DepartmentHistory } from './department-history.entity';
import { Department } from './department.entity';
import { ReportCategory } from './report-category.entity';
// CORRECTED IMPORT PATH: Ensure this path is valid for your monorepo setup.
import { ReportStatus, ReportType, MunicipalityDepartment } from '@kentnabiz/shared'; // Adjust path if necessary
import { SubStatus } from '../constants/report.constants';
import { Assignment } from './assignment.entity';
import { ReportStatusHistory } from './report-status-history.entity';
import { ReportSupport } from './report-support.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  @Index({ spatial: true })
  location!: Point;

  @Column({ type: 'varchar', length: 255 })
  address!: string;

  @Column({
    type: 'enum',
    enum: ReportType, // ReportType enum from packages/shared
    nullable: true,
    name: 'report_type',
  })
  reportType?: ReportType; // Changed 'type' to 'reportType' to avoid conflict with 'type' keyword

  // Department code for easy filtering and identification
  @Column({
    type: 'enum',
    enum: MunicipalityDepartment,
    name: 'department_code',
  })
  departmentCode!: MunicipalityDepartment;

  @Column({ name: 'category_id', type: 'int' })
  categoryId!: number;

  @ManyToOne(() => ReportCategory, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category!: ReportCategory;

  @Column({
    type: 'enum',
    enum: ReportStatus, // Updated ReportStatus enum from packages/shared
    default: ReportStatus.OPEN,
  })
  status!: ReportStatus;

  @Column({ name: 'current_department_id', type: 'int' })
  currentDepartmentId!: number;

  @ManyToOne(() => Department, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'current_department_id' })
  currentDepartment!: Department;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes?: string;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string; // If status is REJECTED

  // User who submitted the report (CITIZEN)
  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @ManyToOne(() => User, user => user.createdReports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // User who closed/resolved the report (DEPARTMENT_SUPERVISOR or SYSTEM_ADMIN)
  @Column({ name: 'closed_by_user_id', type: 'int', nullable: true })
  closedByUserId?: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'closed_by_user_id' })
  closedByUser?: User;

  @OneToMany(() => ReportMedia, media => media.report, { cascade: true })
  reportMedias!: ReportMedia[];

  @OneToMany(() => DepartmentHistory, history => history.report, { cascade: true })
  departmentHistory!: DepartmentHistory[];

  // Fields like departmentChangeReason, departmentChangedBy, etc.,
  // should ideally be part of the DepartmentHistory entity.
  // Keeping Report entity cleaner.

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  @Column({ name: 'sub_status', type: 'varchar', length: 40, nullable: true, default: null })
  subStatus!: SubStatus | null;

  @Column({ type: 'int', default: 0, name: 'support_count' })
  supportCount!: number;

  @OneToMany(() => Assignment, assignment => assignment.report)
  assignments!: Assignment[];

  @OneToMany(() => ReportStatusHistory, statusHistory => statusHistory.report)
  statusHistory!: ReportStatusHistory[];

  @OneToMany(() => ReportSupport, support => support.report)
  supports!: ReportSupport[];

  // Virtual field - not stored in database, computed at query time
  isSupportedByCurrentUser?: boolean;
}
