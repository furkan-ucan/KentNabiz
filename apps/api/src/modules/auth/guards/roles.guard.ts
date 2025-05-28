// apps/api/src/modules/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../../../../../packages/shared/src/types/user.types';
// import { RequestWithUser } from '../interfaces/request-with-user.interface'; // Geçici olarak yorumlandı

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<any>(); // Tip geçici olarak any yapıldı
    const user = request.user;
    const handler = context.getHandler().name; // Metod adı
    const controller = context.getClass().name; // Controller adı

    console.log(`[RolesGuard] Checking roles for ${controller}.${handler} on path ${request.url}`); // YENİ LOG

    // a. Sistem admin her zaman geçsin
    if (user?.roles?.includes(UserRole.SYSTEM_ADMIN)) {
      console.log(
        `[RolesGuard] SYSTEM_ADMIN access granted for ${request.url} to user ${user.sub}`
      );
      return true;
    }

    // b. Route & class seviyesindeki rollerin birleşimi
    const requiredRoles =
      this.reflector.getAllAndOverride<UserRole[]>('roles', [
        context.getHandler(),
        context.getClass(),
      ]) ?? []; // <-- boşsa [] veriyoruz
    console.log(
      `[RolesGuard] Path: ${request.url}, Required Roles: ${requiredRoles.join(', ') || '[NONE]'}, User Roles: ${user?.roles?.join(', ') || '[NONE]'}`
    ); // YENİ LOG

    // c. Metadata yoksa endpoint public say
    if (requiredRoles.length === 0) {
      console.log(`[RolesGuard] No specific roles required for ${request.url}. Access granted.`);
      return true;
    }

    // Kullanıcı yoksa veya kullanıcının rolleri yoksa erişimi engelle
    if (!user?.roles?.length) {
      console.warn(
        `[RolesGuard] User not authenticated or has no roles for ${request.url}. Denying access.`
      );
      // Oturum açmamışsa 401 fırlatmak daha uygun olabilir, ancak mevcut yapı ForbiddenException kullanıyor.
      throw new ForbiddenException('User not authenticated or has no roles.');
    }

    // d. En az bir eşleşme yeterli
    const hasRequiredRole = requiredRoles.some(role => user.roles.includes(role));

    if (!hasRequiredRole) {
      console.warn(
        `[RolesGuard] User ${user.sub} with roles [${user.roles.join(', ')}] does NOT have required roles [${requiredRoles.join(', ')}] for ${request.url}. Denying access.`
      );
      throw new ForbiddenException('Insufficient permissions.');
    }
    console.log(
      `[RolesGuard] User ${user.sub} with roles [${user.roles.join(', ')}] has required role for ${request.url}. Access granted.`
    );
    return true;
  }
}
