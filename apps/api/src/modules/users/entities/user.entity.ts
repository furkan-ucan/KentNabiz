import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcryptjs';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

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

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER, array: true })
  roles!: UserRole[];

  @Column()
  @Exclude()
  password!: string;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified!: boolean;

  @Column({ name: 'email_verification_token', nullable: true })
  emailVerificationToken?: string;

  @Column({ name: 'password_reset_token', nullable: true })
  passwordResetToken?: string;

  @Column({ name: 'password_reset_expires', nullable: true, type: 'timestamp' })
  passwordResetExpires?: Date;

  @Column({ name: 'last_login_at', nullable: true, type: 'timestamp' })
  lastLoginAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password && !(await bcrypt.compare('', this.password))) {
      const isAlreadyHashed = /^\$2[abxy]?\$\d{1,2}\$/.test(this.password);
      if (!isAlreadyHashed) {
        console.log(`>>> [UserEntity] Hashing password for ${this.email || 'new user'}...`);
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      }
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    // Terminalde mutlaka gözüksün diye console.log kullandık
    console.log(
      `>>> [UserEntity] Validating Password: Input='${password}', StoredHash='${this.password}'`
    );

    if (!this.password || !password) {
      console.log(
        `>>> [UserEntity] Validation failed: Stored hash or input password is missing for user ${this.id}`
      );
      return false;
    }

    const isMatch = await bcrypt.compare(password, this.password);

    console.log(`>>> [UserEntity] Password Match Result for user ${this.id}: ${isMatch}`);
    return isMatch;
  }
}
