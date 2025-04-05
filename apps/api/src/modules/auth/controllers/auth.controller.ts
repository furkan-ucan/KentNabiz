import { Controller, Post, Body, UseGuards, Get, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Public } from '../../../core/decorators/public.decorator';

// Custom interface for Request with JWT user
interface RequestWithUser {
  user: JwtPayload;
  headers: { authorization?: string };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 201,
    description: 'User successfully logged in',
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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({
    status: 201,
    description: 'User successfully logged out',
  })
  @ApiBearerAuth()
  async logout(@Req() req: RequestWithUser): Promise<{ success: boolean }> {
    const success = await this.authService.logout(
      req.user.sub,
      req.headers.authorization?.split(' ')[1] || ''
    );
    return { success };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'User profile information',
  })
  getProfile(): { data: { message: string } } {
    return { data: { message: 'Profile endpoint' } };
  }
}
