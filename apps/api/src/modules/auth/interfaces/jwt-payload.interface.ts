import { Request } from 'express';

export interface JwtPayload {
  sub: number; // user id
  email: string;
  roles: string[];
  jti?: string; // JWT ID (token unique identifier)
  iat?: number; // issued at
  exp?: number; // expiration time
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
