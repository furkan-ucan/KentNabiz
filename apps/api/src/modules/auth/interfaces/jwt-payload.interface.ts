// apps/api/src/modules/auth/interfaces/jwt-payload.interface.ts
// CORRECTED IMPORT PATH: Ensure this path is valid for your monorepo setup.
import { UserRole } from '@KentNabiz/shared'; // Adjust path if necessary
import { Request } from 'express';

export interface JwtPayload {
  sub: number; // user id (userId)
  email: string;
  roles: UserRole[]; // Kept as array of UserRole
  departmentId?: number | null; // MODIFIED: Added | null
  jti?: string;
  iat?: number;
  exp?: number;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
