import { UserRole } from '../entities/user.entity';

export interface IUser {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatar?: string;
  roles: UserRole[];
  password: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type IUserWithoutPassword = Omit<IUser, 'password'>;

export interface IUserFindOptions {
  id?: number;
  email?: string;
  emailVerificationToken?: string;
  passwordResetToken?: string;
}
