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
import { Department } from './department.entity';
import { DepartmentHistory } from './department-history.entity';
import { ReportCategory } from './report-category.entity';
import { MunicipalityDepartment, ReportStatus, ReportType } from '../interfaces/report.interface';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  @Index({ spatial: true })
  location: Point;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({
    type: 'enum',
    enum: ReportType,
    default: ReportType.OTHER,
  })
  type: ReportType;

  // Yeni kategori ilişkisi
  @Column({ name: 'category_id', nullable: true })
  categoryId: number;

  @ManyToOne(() => ReportCategory)
  @JoinColumn({ name: 'category_id' })
  category: ReportCategory;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.REPORTED,
  })
  status: ReportStatus;

  @Column({
    type: 'enum',
    enum: MunicipalityDepartment,
    default: MunicipalityDepartment.GENERAL,
  })
  department: MunicipalityDepartment;

  @ManyToOne(() => Department, (department) => department.reports)
  @JoinColumn({ name: 'department_id' })
  departmentEntity: Department;

  @Column({ name: 'department_id', nullable: true })
  departmentId: number;

  @Column({ nullable: true })
  departmentChangeReason: string;

  @Column({ nullable: true })
  departmentChangedBy: number;

  @Column({ type: 'timestamp', nullable: true })
  departmentChangedAt: Date;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  adminId: number;

  @ManyToOne(() => User, { nullable: true })
  admin: User;

  @OneToMany(() => ReportMedia, (media) => media.report, {
    cascade: true,
  })
  reportMedias: ReportMedia[];

  @OneToMany(() => DepartmentHistory, (history) => history.report, {
    cascade: true,
  })
  departmentHistory: DepartmentHistory[];

  @Column({ nullable: true })
  previousDepartment: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
