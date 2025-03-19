import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Token } from '../interfaces/token.interface';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async generateTokens(payload: JwtPayload): Promise<Token> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    // Store refresh token in Redis
    await this.storeRefreshToken(payload.sub, refreshToken);

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

    // Check if token exists in Redis
    const storedToken = await this.redis.get(`refresh_token:${payload.sub}`);
    if (!storedToken || storedToken !== token) {
      throw new Error('Invalid refresh token');
    }

    return payload;
  }

  async invalidateToken(userId: string): Promise<void> {
    await this.redis.del(`refresh_token:${userId}`);
  }

  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    // Store token with 7 days expiry (same as the token)
    await this.redis.set(`refresh_token:${userId}`, token, 'EX', 60 * 60 * 24 * 7);
  }
}
