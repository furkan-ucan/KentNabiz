import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    @InjectRedis() private readonly redis: Redis
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

  async refreshTokens(oldRefreshToken: string, payload: JwtPayload): Promise<Token> {
    // Verify and extract payload from old token to get jti
    const oldPayload = await this.verifyRefreshToken(oldRefreshToken);

    // Blacklist the old token
    if (oldPayload.jti) {
      await this.blacklistToken(oldPayload.sub, oldPayload.jti);
    }

    // Generate new tokens with the updated payload
    return this.generateTokens(payload);
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
    const storedToken = await this.redis.get(`refresh_token:${payload.sub}:${payload.jti || ''}`);
    if (!storedToken || storedToken !== token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return payload;
  }

  async invalidateToken(userId: number): Promise<void> {
    // Get all token IDs for the user
    const tokenIds = await this.redis.smembers(`user_tokens:${userId}`);

    // Add all tokens to blacklist
    const blacklistPromises = tokenIds.map(jti => this.blacklistToken(userId, jti));
    await Promise.all(blacklistPromises);

    // Clear user tokens set
    await this.redis.del(`user_tokens:${userId}`);
  }

  async revokeTokensForUser(userId: number, token?: string): Promise<boolean> {
    try {
      if (token) {
        // Get payload from token
        const payload = await this.verifyAccessToken(token);
        if (payload.jti) {
          // Blacklist the specific token
          await this.blacklistToken(userId, payload.jti);
        }
      } else {
        // Invalidate all tokens for the user
        await this.invalidateToken(userId);
      }
      return true;
    } catch (/* eslint-disable @typescript-eslint/no-unused-vars */ error /* eslint-enable @typescript-eslint/no-unused-vars */) {
      // Error handling: just return false on any token error
      return false;
    }
  }

  private async storeRefreshToken(userId: number, token: string, jti: string): Promise<void> {
    // Store token with 7 days expiry (same as the token)
    await this.redis.set(`refresh_token:${userId}:${jti}`, token, 'EX', 60 * 60 * 24 * 7);
    // Kullanıcının aktif token ID'lerini sakla
    await this.redis.sadd(`user_tokens:${userId}`, jti);
  }

  async blacklistToken(userId: number, jti: string): Promise<void> {
    // Add to blacklist
    await this.redis.set(`blacklist:${jti}`, '1', 'EX', 60 * 60 * 24 * 7);
    // Remove from user's active tokens
    await this.redis.srem(`user_tokens:${userId}`, jti);
    // Remove the actual token
    await this.redis.del(`refresh_token:${userId}:${jti}`);
  }
}
