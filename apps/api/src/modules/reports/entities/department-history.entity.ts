// apps/api/src/modules/reports/entities/department-history.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Report } from './report.entity';
import { Department } from './department.entity'; // Department entity'sini import ediyoruz
import { User } from '../../users/entities/user.entity';

@Entity('department_history')
export class DepartmentHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'report_id', type: 'int' })
  reportId!: number;

  @ManyToOne(() => Report, report => report.departmentHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'report_id' })
  report!: Report;

  // Raporun geldiği (önceki) departman
  @Column({ name: 'previous_department_id', type: 'int', nullable: true })
  previousDepartmentId?: number; // Rapor ilk oluşturulduğunda bu alan boş olabilir

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' }) // Departman silinirse bu alan null olur
  @JoinColumn({ name: 'previous_department_id' })
  previousDepartment?: Department; // Department entity'si ile ilişki

  // Raporun yönlendirildiği (yeni) departman
  @Column({ name: 'new_department_id', type: 'int' })
  newDepartmentId!: number;

  @ManyToOne(() => Department, { onDelete: 'RESTRICT' }) // Yeni departman silinemez (eğer geçmiş kaydı varsa) veya SET NULL
  @JoinColumn({ name: 'new_department_id' })
  newDepartment!: Department; // Department entity'si ile ilişki

  // Yönlendirme sebebi
  @Column({ type: 'text', nullable: true })
  reason?: string;

  // Yönlendirmeyi yapan kullanıcı
  @Column({ name: 'changed_by_user_id', type: 'int', nullable: true })
  changedByUserId?: number; // Kimin yönlendirdiği (genellikle DEPARTMAN_SORUMLUSU veya SISTEM_YONETICISI)

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' }) // Kullanıcı silinirse bu alan null olur
  @JoinColumn({ name: 'changed_by_user_id' })
  changedByUser?: User;

  // Yönlendirme tarihi
  @CreateDateColumn({ name: 'changed_at' }) // Bu sütun, yönlendirmenin ne zaman yapıldığını gösterir
  changedAt!: Date;
}
