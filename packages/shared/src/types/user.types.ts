// packages/shared/src/types/user.types.ts

// UPDATED Role Definitions (in English)
export enum UserRole {
  CITIZEN = 'CITIZEN', // VATANDAS
  DEPARTMENT_EMPLOYEE = 'DEPARTMENT_EMPLOYEE', // DEPARTMAN_CALISANI
  DEPARTMENT_SUPERVISOR = 'DEPARTMENT_SUPERVISOR', // DEPARTMAN_SORUMLUSU
  SYSTEM_ADMIN = 'SYSTEM_ADMIN', // SISTEM_YONETICISI (replaces old 'ADMIN')
}

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  roles: UserRole[]; // Will use the new UserRole enum
  departmentId?: number; // For DEPARTMENT_EMPLOYEE and DEPARTMENT_SUPERVISOR
  departmentName?: string; // For convenience
  isEmailVerified: boolean;
  phoneNumber?: string;
  avatar?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
