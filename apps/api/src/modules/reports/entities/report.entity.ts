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
// Keep imports for type hints
import { User } from '../../users/entities/user.entity';
import { ReportMedia } from './report-media.entity';
import { DepartmentHistory } from './department-history.entity';
import { Department } from './department.entity';
import { ReportCategory } from './report-category.entity'; // Keep for type hints
// Other necessary imports
import { MunicipalityDepartment, ReportStatus, ReportType } from '../interfaces/report.interface';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  @Index({ spatial: true })
  location!: Point;

  @Column({ type: 'varchar', length: 255 })
  address!: string;

  @Column({
    type: 'enum',
    enum: ReportType,
    default: ReportType.OTHER,
  })
  type!: ReportType;

  @Column({ name: 'category_id', nullable: true })
  categoryId!: number;

  // --- FIX: Use string name for ReportCategory relationship ---
  @ManyToOne('ReportCategory', (category: ReportCategory) => category.reports, {
    // <-- Use string name. Added example inverse side function. Adjust if needed.
    nullable: true, // Assuming category can be optional based on categoryId being nullable
    onDelete: 'SET NULL', // Example: Set FK to NULL if category is deleted
  })
  @JoinColumn({ name: 'category_id' })
  category!: ReportCategory; // Type hint still uses imported class

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.REPORTED,
  })
  status!: ReportStatus;

  @Column({
    type: 'enum',
    enum: MunicipalityDepartment,
    default: MunicipalityDepartment.GENERAL,
  })
  department!: MunicipalityDepartment; // Enum representing current department code

  @Column({ name: 'department_id', nullable: true })
  departmentId!: number; // Foreign key column

  // String names applied in previous fix
  @ManyToOne('Department', (department: Department) => department.reports)
  @JoinColumn({ name: 'department_id' })
  departmentEntity!: Department;

  @Column({ name: 'department_change_reason', nullable: true })
  departmentChangeReason!: string;

  @Column({ name: 'department_changed_by', nullable: true })
  departmentChangedBy!: number; // Should this relate to User?

  @Column({ name: 'department_changed_at', type: 'timestamp', nullable: true })
  departmentChangedAt!: Date;

  @Column({ name: 'user_id' })
  userId!: number;

  // Keep arrow function unless User creates a circular dependency
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'admin_id', nullable: true })
  adminId!: number;

  // Keep arrow function unless User creates a circular dependency
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'admin_id' })
  admin!: User;

  // String names applied in previous fix
  @OneToMany('ReportMedia', (media: ReportMedia) => media.report, {
    cascade: true,
  })
  reportMedias!: ReportMedia[];

  // String names applied in previous fix
  @OneToMany('DepartmentHistory', (history: DepartmentHistory) => history.report, {
    cascade: true,
  })
  departmentHistory!: DepartmentHistory[];

  @Column({ name: 'previous_department', nullable: true })
  previousDepartment!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
