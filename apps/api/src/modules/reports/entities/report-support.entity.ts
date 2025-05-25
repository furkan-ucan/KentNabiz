import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Report } from './report.entity';
import { User } from '../../users/entities/user.entity';

@Entity('report_supports')
@Unique(['reportId', 'userId']) // Bir kullanıcı bir raporu sadece bir kez destekleyebilir
export class ReportSupport {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'report_id', type: 'int' })
  reportId!: number;

  @ManyToOne(() => Report, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report!: Report;

  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
