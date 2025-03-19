export interface JwtPayload {
  sub: string; // user id
  email: string;
  roles: string[];
  jti?: string; // JWT ID (token unique identifier)
  iat?: number; // issued at
  exp?: number; // expiration time
}
