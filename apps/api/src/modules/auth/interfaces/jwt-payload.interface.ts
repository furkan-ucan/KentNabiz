export interface JwtPayload {
  sub: string; // user id
  email: string;
  roles: string[];
  iat?: number; // issued at
  exp?: number; // expiration time
}
