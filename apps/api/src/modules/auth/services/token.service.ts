import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Token } from '../interfaces/token.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async generateTokens(payload: JwtPayload): Promise<Token> {
    // Her token için benzersiz bir JWT ID (jti) oluştur
    const jti: string = uuidv4();
    const extendedPayload: JwtPayload & { jti: string } = { ...payload, jti };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(extendedPayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(extendedPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    // Store refresh token in Redis
    await this.storeRefreshToken(payload.sub, refreshToken, jti);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      tokenType: 'Bearer',
    };
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });

    // Check if token exists in Rediss
    const storedToken = await this.redis.get(`refresh_token:${payload.sub}:${payload.jti || ''}`);
    if (!storedToken || storedToken !== token) {
      throw new Error('Invalid refresh token');
    }

    return payload;
  }

  async invalidateToken(userId: string): Promise<void> {
    await this.redis.del(`refresh_token:${userId}`);
  }

  private async storeRefreshToken(userId: string, token: string, jti: string): Promise<void> {
    // Store token with 7 days expiry (same as the token)
    await this.redis.set(`refresh_token:${userId}:${jti}`, token, 'EX', 60 * 60 * 24 * 7);
    // Kullanıcının aktif token ID'lerini sakla
    await this.redis.sadd(`user_tokens:${userId}`, jti);
  }

  async blacklistToken(userId: string, jti: string): Promise<void> {
    // Add to blacklist
    await this.redis.set(`blacklist:${jti}`, '1', 'EX', 60 * 60 * 24 * 7);
    // Remove from user's active tokens
    await this.redis.srem(`user_tokens:${userId}`, jti);
  }
}
