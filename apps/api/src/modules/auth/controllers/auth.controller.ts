// apps/api/src/modules/auth/controllers/auth.controller.ts
import { Controller, Post, Body, UseGuards, Get, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { JwtAuthGuard } from '../guards/jwt.guard';
// RolesGuard ve Roles importları artık bu spesifik endpoint için gerekmeyebilir,
// ama controller'ın başka yerlerinde kullanılıyorsa kalabilir.
// import { RolesGuard } from '../guards/roles.guard';
// import { Roles } from '../decorators/roles.decorator';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Public } from '../../../core/decorators/public.decorator';
import { UserProfileDto } from '../../users/dto/user-profile.dto'; // UserProfileDto'yu import et
import { UsersService } from '../../users/services/users.service'; // UsersService'i import et

// Custom interface for Request with JWT user
interface RequestWithUser {
  user: JwtPayload; // Bu JwtPayload, sub, email, roles, departmentId, jti içerir
  headers: { authorization?: string };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService // UsersService'i inject et
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 201, // Genellikle login sonrası 200 OK veya 201 Created kullanılır.
    description: 'User successfully logged in',
    // Swagger şeması Token arayüzünüze veya TokenResponseDto'nuza göre olmalı.
    // Şimdilik basit bir örnek bırakıyorum, kendi TokenResponseDto'nuzla güncelleyebilirsiniz.
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'number' },
        tokenType: { type: 'string' },
      },
    },
  })
  async login(@Body() loginDto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  }> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'number' },
        tokenType: { type: 'string' },
      },
    },
  })
  async register(@Body() registerDto: RegisterDto): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  }> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 201,
    description: 'Token successfully refreshed',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'number' },
        tokenType: { type: 'string' },
      },
    },
  })
  async refresh(@Body('refreshToken') refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard) // Sadece login olmuş kullanıcılar logout yapabilir
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({
    status: 200, // Logout için genellikle 200 OK veya 204 No Content
    description: 'User successfully logged out',
    type: () => ({ success: Boolean }), // Swagger için dönüş tipi
  })
  @ApiBearerAuth()
  async logout(@Req() req: RequestWithUser): Promise<{ success: boolean }> {
    const tokenToInvalidate = req.headers.authorization?.split(' ')[1];
    if (!tokenToInvalidate) {
      // Bu durum normalde JwtAuthGuard tarafından yakalanır ama ek kontrol
      throw new UnauthorizedException('No token provided for logout');
    }
    const success = await this.authService.logout(
      req.user.sub, // Kullanıcı ID'si
      tokenToInvalidate // Geçerli access token
    );
    return { success };
  }

  // --- GÜNCELLENMİŞ GET PROFILE METODU ---
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'User profile information retrieved successfully',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  async getProfile(@Req() req: RequestWithUser): Promise<UserProfileDto> {
    return this.usersService.findOneProfile(req.user.sub);
  }

  // --- YENİ ME ENDPOINT'İ - Frontend için ---
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user information for frontend' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Current user information retrieved successfully',
    schema: {
      properties: {
        user: {
          type: 'object',
          properties: {
            sub: { type: 'number' },
            email: { type: 'string' },
            roles: { type: 'array', items: { type: 'string' } },
            departmentId: { type: 'number' },
            jti: { type: 'string' },
            iat: { type: 'number' },
            exp: { type: 'number' },
          },
        },
        accessToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMe(@Req() req: RequestWithUser): Promise<{
    user: JwtPayload;
    accessToken: string;
  }> {
    // Frontend AuthResponseData formatını bekliyor
    // user: JwtPayload ve accessToken: string
    return Promise.resolve({
      user: req.user, // JWT payload'ı direkt döndür
      accessToken: req.headers.authorization?.split(' ')[1] || '', // Mevcut token'ı döndür
    });
  }
}
