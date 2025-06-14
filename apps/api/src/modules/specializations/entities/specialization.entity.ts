import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm';
import { TeamSpecialization } from '../../teams/entities/team-specialization.entity';
import { ReportCategory } from '../../reports/entities/report-category.entity';
// import { TeamSpecialization } from '../../../teams/entities/team-specialization.entity';

@Entity('specializations')
export class Specialization {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'typical_department_code' })
  typicalDepartmentCode?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'example_source' })
  exampleSource?: string;

  @OneToMany(() => TeamSpecialization, (ts: TeamSpecialization) => ts.specialization)
  teamSpecializations!: TeamSpecialization[];

  // Many-to-many relationship with ReportCategories (inverse side)
  @ManyToMany(() => ReportCategory)
  categories!: ReportCategory[];

  // TeamSpecialization ile ilişki (daha sonra eklenecek)
}
