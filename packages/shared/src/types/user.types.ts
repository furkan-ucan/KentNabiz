// packages/shared/src/types/user.types.ts

// Enum burada tanımlı kalmalı – merkezi referans noktası
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

export interface UserProfile {
  id: number; // Updated from string to number; ensure database and logic are updated
  email: string;
  fullName: string; // name → fullName
  roles: UserRole[]; // role → roles
  isEmailVerified: boolean; // eklendi
  phoneNumber?: string; // eklendi
  avatar?: string; // eklendi
  lastLoginAt?: Date; // eklendi
  createdAt: Date;
  updatedAt: Date;
}
