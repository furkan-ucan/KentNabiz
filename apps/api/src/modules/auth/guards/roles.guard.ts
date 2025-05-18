// apps/api/src/modules/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'; // ForbiddenException eklendi
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
// UserRole enum'unu import ediyoruz. Doğru yolu belirttiğinizden emin olun.
import { UserRole } from '@KentNabiz/shared';

// RequestWithUser arayüzü burada da tanımlanabilir veya jwt-payload.interface.ts'den import edilebilir.
// Eğer jwt-payload.interface.ts içinde RequestWithUser export ediliyorsa, onu kullanmak daha iyi.
interface RequestWithUser {
  user: JwtPayload; // JwtPayload artık UserRole[] tipinde roller içerecek
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Controller metodundan beklenen rolleri alıyoruz (UserRole enum değerleri olmalı)
    const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler());

    // Eğer endpoint için bir rol tanımlanmamışsa, erişime izin ver (public endpoint)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user; // JWT'den gelen kullanıcı bilgileri (payload)

    // Kullanıcı yoksa veya kullanıcının rolleri yoksa erişimi engelle
    if (!user || !user.roles || user.roles.length === 0) {
      // Normalde JwtAuthGuard bu durumu yakalamalı, ama ek bir güvenlik katmanı olarak burada da kontrol edilebilir.
      throw new ForbiddenException('User not authenticated or has no roles.');
    }

    // Kullanıcının sahip olduğu rollerden herhangi biri, endpoint için gerekli rollerden biriyle eşleşiyor mu?
    const hasRequiredRole = user.roles.some(userRole => requiredRoles.includes(userRole));

    if (!hasRequiredRole) {
      throw new ForbiddenException('Insufficient permissions.'); // Daha açıklayıcı bir hata
    }

    return true; // Eğer en az bir eşleşen rol varsa erişime izin ver
  }
}
