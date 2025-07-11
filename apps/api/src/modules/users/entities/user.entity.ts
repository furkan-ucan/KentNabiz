﻿// apps/api/src/modules/users/entities/user.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
// CORRECTED IMPORT PATH: Ensure this path is valid for your monorepo setup.
// Using a direct relative path or a configured path alias is safer for TypeORM entities.
import { UserRole } from '@kentnabiz/shared'; // Adjust path if necessary
import { Department } from '../../reports/entities/department.entity';
import { Report } from '../../reports/entities/report.entity';
import { TeamMembershipHistory } from './team-membership-history.entity';
import { Team } from '../../teams/entities/team.entity';
import { Assignment } from '../../reports/entities/assignment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'full_name' })
  fullName!: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  avatar?: string;

  // Kept as array based on your existing structure
  @Column({
    type: 'enum',
    enum: UserRole,
    array: true, // Existing: User can have multiple roles
    default: [UserRole.CITIZEN], // Default to CITIZEN
  })
  roles!: UserRole[];

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified!: boolean;

  @Column()
  @Exclude()
  password!: string;

  @Column({ name: 'email_verification_token', nullable: true })
  emailVerificationToken?: string;

  @Column({ name: 'password_reset_token', nullable: true })
  passwordResetToken?: string;

  @Column({ name: 'password_reset_expires', nullable: true, type: 'timestamp' })
  passwordResetExpires?: Date;

  @Column({ name: 'last_login_at', nullable: true, type: 'timestamp' })
  lastLoginAt?: Date;

  // Link to department for TEAM_MEMBER and DEPARTMENT_SUPERVISOR roles
  @Column({ name: 'department_id', type: 'int', nullable: true })
  departmentId?: number | null;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  // Reports created by this user (if they are a CITIZEN)
  @OneToMany(() => Report, report => report.user)
  createdReports?: Report[];

  @OneToMany(() => TeamMembershipHistory, tmh => tmh.user)
  teamMembershipHistory!: TeamMembershipHistory[];

  @Column({ name: 'active_team_id', type: 'int', nullable: true })
  activeTeamId?: number | null;

  @ManyToOne(() => Team, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'active_team_id' })
  activeTeam?: Team;

  @OneToMany(() => Assignment, assignment => assignment.assigneeUser)
  assignmentsToUser!: Assignment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      // Check if password is already hashed (bcrypt hash format)
      const isAlreadyHashed = /^\$2[abxy]?\$\d{1,2}\$/.test(this.password);
      if (!isAlreadyHashed) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      }
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!this.password || !password) {
      return false;
    }
    return bcrypt.compare(password, this.password);
  }
}
