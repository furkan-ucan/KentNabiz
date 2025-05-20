// apps/api/src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface'; // Bu JwtPayload UserRole[] ve departmentId? içerecek
import { UserRole } from '@KentNabiz/shared'; // UserRole enum import edildi

// Gelen payload'ın temel yapısını tanımlayan bir arayüz
interface RawJwtPayload {
  sub: number;
  email: string;
  roles: UserRole[] | string[]; // JWT'den string dizisi olarak da gelebilir
  departmentId?: number;
  jti?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'fallback-secret-do-not-use-in-production', // config'den JWT_SECRET alınmalı
    });
  }

  // validate metodu, JWT doğrulandıktan sonra payload'ı alır ve req.user'a eklenecek objeyi döner.
  validate(payload: RawJwtPayload): JwtPayload {
    // async kaldırıldı, payload tipi RawJwtPayload oldu
    // Temel payload alanlarının varlığını kontrol et
    if (
      !payload ||
      typeof payload.sub !== 'number' ||
      !payload.email ||
      !Array.isArray(payload.roles)
    ) {
      throw new UnauthorizedException('Invalid token: core payload fields missing or malformed.');
    }

    // Roller string[] ise UserRole[]'e çevirme
    const rolesAsEnum: UserRole[] = payload.roles
      .map((role: string | UserRole) => {
        // Check if role is a valid UserRole enum value (either directly or as a string corresponding to an enum value)
        if (Object.values(UserRole).includes(role as UserRole)) {
          return role as UserRole;
        }
        // If role is a string that is a key in UserRole enum (for enums like enum UserRole { ADMIN = "AdminRole" })
        // This check might be more robust depending on UserRole definition.
        // For now, relying on Object.values().includes() for string enums.
        // If not a recognized role, return undefined to be filtered out.
        // This makes the filter step meaningful.
        return undefined;
      })
      .filter((role): role is UserRole => role !== undefined);

    // departmentId varsa ve null değilse number mı diye kontrol et
    if (
      payload.departmentId !== undefined &&
      payload.departmentId !== null &&
      typeof payload.departmentId !== 'number'
    ) {
      throw new UnauthorizedException('Invalid token: departmentId is malformed.');
    }

    // req.user'a eklenecek olan ve JwtPayload arayüzüne uyan nesneyi döndür
    return {
      sub: payload.sub,
      email: payload.email,
      roles: rolesAsEnum, // Dönüştürülmüş ve doğrulanmış rolleri kullan
      departmentId: payload.departmentId, // Opsiyonel olarak
      jti: payload.jti, // jti de payload'ın bir parçası
    };
  }
}
