import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { TokenService } from './token.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Token } from '../interfaces/token.interface';
import * as bcrypt from 'bcrypt';

// Geçici kullanıcı tipi, daha sonra User entity ile değiştirilecek
interface UserRecord {
  id: string;
  email: string;
  password: string;
  roles: string[];
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokenService: TokenService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<UserRecord, 'password'> | null> {
    // TODO: Implement user validation with database
    // This is a placeholder implementation
    const user = await this.findUserByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<Token> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    return this.tokenService.generateTokens(payload);
  }

  async register(registerDto: RegisterDto): Promise<Token> {
    // TODO: Implement user registration with database
    // This is a placeholder implementation
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user: UserRecord = {
      id: '1', // This should come from database
      email: registerDto.email,
      password: hashedPassword,
      roles: ['user'],
    };

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    return this.tokenService.generateTokens(payload);
  }

  async refreshToken(token: string): Promise<Token> {
    try {
      const payload = await this.tokenService.verifyRefreshToken(token);
      return this.tokenService.generateTokens(payload);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.tokenService.invalidateToken(userId);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async findUserByEmail(_email: string): Promise<UserRecord> {
    // TODO: Implement database query
    // This is a placeholder implementation
    return {
      id: '1',
      email: 'user@example.com',
      password: await bcrypt.hash('password123', 10),
      roles: ['user'],
    };
  }
}
