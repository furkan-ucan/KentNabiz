import { UserRole } from './user.types';

export interface JwtPayload {
  sub: number; // user id (userId)
  email: string;
  roles: UserRole[]; // Array of UserRole
  departmentId?: number | null;
  activeTeamId?: number | null;
  jti?: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponseData {
  accessToken: string;
  user: JwtPayload;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}
