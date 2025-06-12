import { JwtPayload, UserRole } from '@kentnabiz/shared';

/**
 * JWT token'ı decode eder (base64)
 * Güvenlik için sadece payload'ı parse eder, doğrulama yapmaz
 */
export const parseJwtPayload = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch (error) {
    console.error('JWT parse error:', error);
    return null;
  }
};

/**
 * Token'ın süresinin dolup dolmadığını kontrol eder
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
};

/**
 * Kullanıcının authenticate olup olmadığını kontrol eder
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('accessToken');
  if (!token) return false;

  return !isTokenExpired(token);
};

/**
 * Mevcut kullanıcının JWT payload'ını döner
 */
export const getCurrentUser = (): JwtPayload | null => {
  const token = localStorage.getItem('accessToken');
  if (!token || isTokenExpired(token)) return null;

  return parseJwtPayload(token);
};

/**
 * Kullanıcının belirli bir rolü olup olmadığını kontrol eder
 */
export const hasRole = (role: UserRole): boolean => {
  const user = getCurrentUser();
  return user?.roles?.includes(role) ?? false;
};

/**
 * Kullanıcının rollerinden herhangi birini içerip içermediğini kontrol eder
 */
export const hasAnyRole = (roles: UserRole[]): boolean => {
  const user = getCurrentUser();
  if (!user?.roles) return false;

  return roles.some(role => user.roles.includes(role));
};

/**
 * Kullanıcının departman sorumlusu olup olmadığını kontrol eder
 */
export const isDepartmentSupervisor = (): boolean => {
  return hasRole(UserRole.DEPARTMENT_SUPERVISOR);
};

/**
 * Kullanıcının sistem yöneticisi olup olmadığını kontrol eder
 */
export const isSystemAdmin = (): boolean => {
  return hasRole(UserRole.SYSTEM_ADMIN);
};

/**
 * Auth verileri temizler (logout)
 */
export const clearAuth = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('rememberMe');

  // Custom event dispatch et ki diğer componentler anlasın
  window.dispatchEvent(new CustomEvent('authCleared'));
};

/**
 * Auth verilerini kaydeder (login)
 */
export const setAuthTokens = (
  accessToken: string,
  refreshToken?: string
): void => {
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }

  // Custom event dispatch et ki diğer componentler anlasın
  window.dispatchEvent(new CustomEvent('authSet'));
};
