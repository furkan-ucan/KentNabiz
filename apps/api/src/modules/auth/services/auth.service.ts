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
import { UsersService } from '../../users/services/users.service'; // Renamed from OriginalUsersService for clarity, or keep alias if preferred
// UserRepository is no longer used
import { User } from '../../users/entities/user.entity';
import { CreateUserDto } from '../../users/dto/create-user.dto';
// UserRole import removed as per instruction, assuming entity default handles it or it's not explicitly set here.

// The UsersServiceWithExpectedMethods interface is removed as UsersService now has the correct signatures.

@Injectable()
export class AuthService {
  constructor(
    private tokenService: TokenService,
    private usersService: UsersService // Use the imported UsersService directly
    // private userRepository: UserRepository // Removed as it's no longer used
  ) {}

  // apps/api/src/modules/auth/services/auth.service.ts

  async validateUser(email: string, password: string): Promise<User | null> {
    console.log(`>>> [AuthService.validateUser] Email doğrulanıyor: ${email}`);
    try {
      const user = await this.usersService.findByEmail(email);

      if (!user) {
        console.log(`>>> [AuthService.validateUser] Kullanıcı bulunamadı: ${email}`);
        return null;
      }

      console.log(`>>> [AuthService.validateUser] Kullanıcı bulundu: ${email}, ID: ${user.id}`);
      console.log(`>>> [AuthService.validateUser] user.password hash: ${user.password}`);
      console.log(`>>> [AuthService.validateUser] Gelen password: ${password}`);

      const isPasswordValid = await user.validatePassword(password);
      console.log(`>>> [AuthService.validateUser] Şifre doğrulama sonucu: ${isPasswordValid}`);

      if (user && isPasswordValid) {
        console.log(`>>> [AuthService.validateUser] Şifre doğrulama BAŞARILI: ${email}`);
        return user;
      }

      console.log(`>>> [AuthService.validateUser] Şifre doğrulama BAŞARISIZ: ${email}`);
      return null;
    } catch (error) {
      console.error(`>>> [AuthService.validateUser] HATA oluştu: ${email}`, error);
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
      roles: user.roles, // User entity'sinden gelen UserRole[] doğrudan kullanılabilir
      departmentId: user.departmentId, // User entity'sinden departmentId ekleniyor
      activeTeamId: user.activeTeamId, // Added activeTeamId from User entity
    };

    return this.tokenService.generateTokens(payload);
  }

  async register(registerDto: RegisterDto): Promise<Token> {
    // Check if email already exists
    try {
      await this.usersService.findByEmail(registerDto.email);
      // If findByEmail succeeds, it means the user already exists.
      throw new ConflictException('Email already exists');
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; // Re-throw the ConflictException we just threw.
      }
      // If the error is NotFoundException, it means the user does not exist, so we can proceed.
      // If it's any other error from usersService.findByEmail, we should re-throw it.
      if (!(error instanceof NotFoundException)) {
        throw error; // Re-throw unexpected errors
      }
      // If error is NotFoundException, we fall through and continue with registration.
    }

    // Create user through user service
    const createUserDto: CreateUserDto = {
      email: registerDto.email,
      password: registerDto.password,
      fullName: registerDto.fullName || `User-${Date.now()}`, // Ensure fullName is a string, provide default
      // roles: [UserRole.CITIZEN], // This was commented out, UserRole import removed.
      // This is handled by UsersService.createUser or User entity default
    };

    // DÜZELTİLMİŞ ÇAĞRI: UsersService'teki yeni/güncellenmiş createUser metodunu kullan
    const newUser: User = await this.usersService.createUser(createUserDto);

    const payload: JwtPayload = {
      sub: newUser.id,
      email: newUser.email,
      roles: newUser.roles, // newUser.roles UserRole[] tipinde olmalı
      departmentId: newUser.departmentId, // Yeni kullanıcıda bu genellikle undefined/null olur
      activeTeamId: newUser.activeTeamId, // Added activeTeamId from User entity for register
    };

    return this.tokenService.generateTokens(payload);
  }

  async refreshToken(refreshToken: string): Promise<Token> {
    const verifiedOldPayload = await this.tokenService.verifyRefreshToken(refreshToken);

    // Find user to confirm they still exist and have proper roles, departmentId
    // DÜZELTİLMİŞ ÇAĞRI: UsersService'teki yeni/güncellenmiş findById metodunu kullan
    const user: User | null = await this.usersService.findById(verifiedOldPayload.sub);

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    // After this check, 'user' is confirmed to be of type User for the scope below.

    const newPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles, // Güncel roller
      departmentId: user.departmentId, // Güncel departmentId
      activeTeamId: user.activeTeamId, // Added activeTeamId from User entity for refresh token
    };

    return this.tokenService.refreshTokens(refreshToken, newPayload);
  }

  async logout(userId: number, token: string): Promise<boolean> {
    return await this.tokenService.revokeTokensForUser(userId, token);
  }
}
