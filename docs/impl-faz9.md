# Faz 9: Security Implementasyonu

## 📌 Adım 9.1: JWT Auth Sistemi

### Açıklama

Access ve Refresh token tabanlı kimlik doğrulama sistemi.

### 🛠 Teknolojiler

- @nestjs/jwt ^10.0.0
- @nestjs/passport ^10.0.0
- passport-jwt ^4.0.0
- bcrypt ^5.0.0
- redis ^4.0.0

### 📂 JWT Yapılandırması

```typescript
// src/core/config/jwt.config.ts
import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig: JwtModuleOptions = {
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: '15m', // Access token: 15 dakika
    issuer: 'kentnabiz',
  },
};

// src/modules/auth/services/token.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Redis } from 'ioredis';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redis: Redis
  ) {}

  async generateTokens(userId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId),
      this.generateRefreshToken(userId),
    ]);

    // Refresh token'ı Redis'e kaydet
    await this.redis.set(
      `refresh_token:${userId}`,
      refreshToken,
      'EX',
      7 * 24 * 60 * 60 // 7 gün
    );

    return { accessToken, refreshToken };
  }

  private async generateAccessToken(userId: string) {
    const payload = { sub: userId };
    return this.jwtService.signAsync(payload);
  }

  private async generateRefreshToken(userId: string) {
    const payload = { sub: userId, type: 'refresh' };
    return this.jwtService.signAsync(payload, {
      expiresIn: '7d', // Refresh token: 7 gün
    });
  }

  async validateRefreshToken(userId: string, token: string) {
    const storedToken = await this.redis.get(`refresh_token:${userId}`);
    if (!storedToken || storedToken !== token) {
      throw new Error('Invalid refresh token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      return payload;
    } catch {
      throw new Error('Invalid refresh token');
    }
  }

  async revokeTokens(userId: string) {
    await this.redis.del(`refresh_token:${userId}`);
  }
}

// src/modules/auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

### ✅ Kontrol Noktaları

- [ ] Access token flow
- [ ] Refresh token flow
- [ ] Token revocation
- [ ] Public routes
- [ ] RBAC integration

### 📌 Onay Gereksinimleri

- Token rotation çalışıyor
- Redis entegrasyonu başarılı
- Auth bypass yok

## 📌 Adım 9.2: Rate Limiting ve Throttling

### Açıklama

İstek sayısı sınırlaması ve DDoS koruması.

### 🛠 Teknolojiler

- @nestjs/throttler ^5.0.0
- Redis ^4.0.0
- rate-limiter-flexible ^3.0.0

### 📂 Rate Limit Yapılandırması

```typescript
// src/core/rate-limit/rate-limit.module.ts
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { RedisService } from '../redis/redis.service';
import { RateLimiterService } from './rate-limiter.service';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        ttl: 60, // 1 dakika
        limit: 100, // 100 istek
      }),
    }),
  ],
  providers: [RateLimiterService],
  exports: [RateLimiterService],
})
export class RateLimitModule {}

// src/core/rate-limit/rate-limiter.service.ts
import { Injectable } from '@nestjs/common';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RateLimiterService {
  private limiter: RateLimiterRedis;

  constructor(private readonly redisService: RedisService) {
    this.limiter = new RateLimiterRedis({
      storeClient: this.redisService.getClient(),
      keyPrefix: 'ratelimit',
      points: 100, // İstek sayısı
      duration: 60, // Süre (saniye)
      blockDuration: 60 * 10, // Block süresi (10 dakika)
    });
  }

  async checkRateLimit(key: string): Promise<boolean> {
    try {
      await this.limiter.consume(key);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// src/core/rate-limit/rate-limit.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RateLimiterService } from './rate-limiter.service';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(private readonly rateLimiter: RateLimiterService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const key = req.ip;

    const allowed = await this.rateLimiter.checkRateLimit(key);

    if (!allowed) {
      res.status(429).json({
        statusCode: 429,
        message: 'Too Many Requests',
      });
      return;
    }

    next();
  }
}
```

### ✅ Kontrol Noktaları

- [ ] Global rate limiting
- [ ] Route-specific limits
- [ ] Redis storage
- [ ] Block duration
- [ ] Whitelist/Blacklist

### 📌 Onay Gereksinimleri

- Rate limit çalışıyor
- Redis persistent
- 429 response doğru

## 📌 Adım 9.3: XSS ve CSRF Koruması

### Açıklama

Cross-site scripting ve cross-site request forgery önlemleri.

### 🛠 Teknolojiler

- helmet ^7.0.0
- csurf ^1.11.0
- xss-clean ^0.1.4

### 📂 Security Middleware

```typescript
// src/core/security/security.module.ts
import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SecurityInterceptor } from './security.interceptor';

@Module({
  providers: [
    SecurityService,
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurityInterceptor,
    },
  ],
  exports: [SecurityService],
})
export class SecurityModule {}

// src/core/security/security.service.ts
import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class SecurityService {
  generateCsrfToken(): string {
    return createHash('sha256').update(Math.random().toString()).digest('hex');
  }

  validateCsrfToken(token: string, storedToken: string): boolean {
    return token === storedToken;
  }
}

// src/core/security/security.middleware.ts
import helmet from 'helmet';
import * as csurf from 'csurf';
import { Request, Response, NextFunction } from 'express';

export const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: 'same-origin' },
  }),
  csurf({
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    },
  }),
];

// src/core/security/security.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as xss from 'xss';

@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map(data => this.sanitizeData(data)));
  }

  private sanitizeData(data: any): any {
    if (typeof data === 'string') {
      return xss(data);
    }
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }
    if (typeof data === 'object' && data !== null) {
      return Object.keys(data).reduce((acc, key) => {
        acc[key] = this.sanitizeData(data[key]);
        return acc;
      }, {});
    }
    return data;
  }
}
```

### ✅ Kontrol Noktaları

- [ ] CSP headers
- [ ] CSRF token validation
- [ ] XSS sanitization
- [ ] Security headers
- [ ] Cookie security

### 📌 Onay Gereksinimleri

- Tüm XSS vektörleri engellendi
- CSRF token rotation çalışıyor
- Security headers aktif

## 📌 Adım 9.4: Input Validation ve Sanitization

### Açıklama

Form ve API girdilerinin doğrulanması ve temizlenmesi.

### 🛠 Teknolojiler

- class-validator ^0.14.0
- class-transformer ^0.5.0
- validator ^13.0.0

### 📂 Validation Yapılandırması

```typescript
// src/core/validation/validation.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: this.formatErrors(errors),
      });
    }
    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: any[]) {
    return errors.map(err => ({
      property: err.property,
      constraints: err.constraints,
      value: err.value,
    }));
  }
}

// src/core/validation/dto/report.dto.ts
import { IsNotEmpty, IsString, Length, IsNumber, IsLatitude, IsLongitude } from 'class-validator';
import { Transform } from 'class-transformer';
import * as sanitizeHtml from 'sanitize-html';

export class CreateReportDto {
  @IsNotEmpty()
  @IsString()
  @Length(5, 100)
  @Transform(({ value }) => sanitizeHtml(value))
  title: string;

  @IsNotEmpty()
  @IsString()
  @Length(20, 1000)
  @Transform(({ value }) => sanitizeHtml(value))
  description: string;

  @IsNotEmpty()
  @IsLatitude()
  latitude: number;

  @IsNotEmpty()
  @IsLongitude()
  longitude: number;
}

// src/core/validation/validators/custom.validator.ts
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsValidPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidPhoneNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && /^[0-9]{10}$/.test(value);
        },
      },
    });
  };
}
```

### ✅ Kontrol Noktaları

- [ ] DTO validation
- [ ] Custom validators
- [ ] Sanitization rules
- [ ] Error handling
- [ ] Type conversion

### 📌 Onay Gereksinimleri

- Validation pipe aktif
- Sanitization başarılı
- Custom validators çalışıyor

## 📌 Adım 9.5: File Upload Security

### Açıklama

Güvenli dosya yükleme sistemi ve antivirüs entegrasyonu.

### 🛠 Teknolojiler

- multer ^1.4.5
- node-clamscan ^2.0.0
- mime-types ^2.1.0

### 📂 Upload Security

```typescript
// src/modules/media/services/file-scanner.service.ts
import { Injectable } from '@nestjs/common';
import { NodeClam } from 'clamscan';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileScannerService {
  private scanner: NodeClam;

  constructor(private configService: ConfigService) {
    this.scanner = new NodeClam().init({
      removeInfected: true,
      quarantineInfected: true,
      scanLog: '/var/log/clamav/scan.log',
      debugMode: false,
    });
  }

  async scanFile(filepath: string): Promise<boolean> {
    try {
      const { isInfected, viruses } = await this.scanner.scanFile(filepath);
      if (isInfected) {
        throw new Error(`Infected file detected: ${viruses.join(', ')}`);
      }
      return true;
    } catch (error) {
      throw new Error(`Virus scan failed: ${error.message}`);
    }
  }
}

// src/modules/media/middleware/file-upload.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import * as multer from 'multer';
import * as mime from 'mime-types';
import { v4 as uuid } from 'uuid';

@Injectable()
export class FileUploadMiddleware implements NestMiddleware {
  private upload: any;

  constructor() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, '/tmp/uploads');
      },
      filename: (req, file, cb) => {
        const ext = mime.extension(file.mimetype);
        cb(null, `${uuid()}.${ext}`);
      },
    });

    this.upload = multer({
      storage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 5,
      },
      fileFilter: (req, file, cb) => {
        this.validateFile(file, cb);
      },
    });
  }

  private validateFile(file: Express.Multer.File, cb: Function) {
    const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];

    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'), false);
    }

    cb(null, true);
  }

  use(req: any, res: any, next: () => void) {
    this.upload.array('files')(req, res, (err: any) => {
      if (err) {
        return res.status(400).json({
          message: 'File upload failed',
          error: err.message,
        });
      }
      next();
    });
  }
}

// src/modules/media/controllers/upload.controller.ts
import { Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/core/auth/guards/jwt-auth.guard';
import { FileScannerService } from '../services/file-scanner.service';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly fileScannerService: FileScannerService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    // Virus taraması
    await this.fileScannerService.scanFile(file.path);

    // MinIO'ya yükle
    const result = await this.uploadToStorage(file);

    // Temp dosyayı sil
    await fs.unlink(file.path);

    return result;
  }
}
```

### ✅ Kontrol Noktaları

- [ ] File type validation
- [ ] Size limits
- [ ] Virus scanning
- [ ] Storage security
- [ ] Cleanup routines

### 📌 Onay Gereksinimleri

- Güvenli dosya upload
- Antivirüs entegrasyonu
- Temp file cleanup

## 🔍 Faz 9 Sonuç ve Değerlendirme

### Security Metrics

- Auth bypass: 0
- XSS vectors: 0
- CSRF bypass: 0
- Upload vulnerabilities: 0

### Test Coverage

- Unit tests: %95+
- Integration tests: %90+
- Security tests: %100

### Performance Impact

- Auth overhead: <50ms
- Rate limit check: <10ms
- Upload scanning: <2s

### ⚠️ Önemli Notlar

- JWT secret rotation planla
- Rate limit fine-tuning yap
- File scan timeout ayarla
- Security headers monitör et
