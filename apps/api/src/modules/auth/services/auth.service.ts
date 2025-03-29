import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { TokenService } from './token.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Token } from '../interfaces/token.interface';
import { UsersService } from '../../users/services/users.service';
import { UserRepository } from '../../users/repositories/user.repository';
import { User } from '../../users/entities/user.entity';
import { CreateUserDto } from '../../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private tokenService: TokenService,
    private usersService: UsersService,
    private userRepository: UserRepository,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (user && (await user.validatePassword(password))) {
        return user;
      }
      return null;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      // Errors are caught to prevent leaking info about user existence
      return null;
    }
  }

  async login(loginDto: LoginDto): Promise<Token> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login time
    await this.usersService.updateLastLogin(user.id);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.toString()),
    };

    return this.tokenService.generateTokens(payload);
  }

  async register(registerDto: RegisterDto): Promise<Token> {
    // Check if email already exists
    try {
      await this.usersService.findByEmail(registerDto.email);
      throw new ConflictException('Email already exists');
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      // Continue with registration if user not found (NotFoundException expected)
      if (!(error instanceof NotFoundException)) {
        throw error; // Re-throw unexpected errors
      }
    }

    // Create user through user service
    const createUserDto: CreateUserDto = {
      email: registerDto.email,
      password: registerDto.password,
      fullName: registerDto.fullName || '', // Ensure fullName is a string
    };

    const newUser = await this.userRepository.create(createUserDto);

    const payload: JwtPayload = {
      sub: newUser.id,
      email: newUser.email,
      roles: newUser.roles.map((role) => role.toString()),
    };

    return this.tokenService.generateTokens(payload);
  }

  async refreshToken(refreshToken: string): Promise<Token> {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);

    // Find user to confirm they still exist and have proper roles
    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    const newPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.toString()),
    };

    return this.tokenService.refreshTokens(refreshToken, newPayload);
  }

  async logout(userId: number, token: string): Promise<boolean> {
    return await this.tokenService.revokeTokensForUser(userId, token);
  }
}
