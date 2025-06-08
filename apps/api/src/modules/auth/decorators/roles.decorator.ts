import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@kentnabiz/shared';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
