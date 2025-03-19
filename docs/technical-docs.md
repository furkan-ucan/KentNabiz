# KentNabız (UrbanPulse) – Teknik Dokümantasyon

## 1. Kod Organizasyonu ve Yapısı

### 1.1. Monorepo Yapısı

```typescript
// Root yapısı
root/
├── apps/                  # Uygulama modülleri
│   ├── api/              # NestJS backend
│   │   ├── src/
│   │   ├── test/
│   │   └── package.json
│   ├── web/              # React frontend
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   └── mobile/           # React Native
│       ├── src/
│       ├── ios/
│       ├── android/
│       └── package.json
├── packages/             # Paylaşılan paketler
│   ├── shared/          # Ortak utilities
│   │   ├── src/
│   │   └── package.json
│   └── ui/              # Ortak UI kitleri
│       ├── src/
│       └── package.json
├── tools/               # Build ve development araçları
├── package.json         # Root package.json
└── pnpm-workspace.yaml  # Workspace konfigürasyonu
```

### 1.2. Backend Yapısı (NestJS)

```typescript
// apps/api/src yapısı
src/
├── main.ts                # Bootstrap application
├── app.module.ts          # Root module
├── modules/              # Feature modules
│   ├── users/           # User management
│   ├── reports/         # Report management
│   ├── media/          # Media handling
│   └── analytics/      # Analytics & stats
├── common/              # Shared resources
│   ├── decorators/     # Custom decorators
│   ├── filters/        # Exception filters
│   ├── guards/         # Auth guards
│   ├── interceptors/   # Request interceptors
│   └── pipes/          # Validation pipes
├── config/             # Configuration
└── interfaces/         # TypeScript interfaces
```

### 1.3. Frontend Yapısı (React)

```typescript
// apps/web/src yapısı
src/
├── App.tsx              # Ana uygulama bileşeni
├── pages/              # Sayfa bileşenleri
├── components/         # Yeniden kullanılabilir bileşenler
│   ├── common/        # Genel bileşenler
│   ├── maps/         # Harita bileşenleri
│   └── reports/      # Rapor bileşenleri
├── hooks/             # Custom React hooks
├── services/          # API servisleri
├── store/            # Redux store yapılandırması
└── utils/            # Yardımcı fonksiyonlar
```

### 1.4. Mobile Yapısı (React Native)

```typescript
// apps/mobile/src yapısı
src/
├── App.tsx           # Ana uygulama bileşeni
├── screens/         # Ekran bileşenleri
├── components/      # Yeniden kullanılabilir bileşenler
├── navigation/      # Navigasyon yapılandırması
├── services/        # API servisleri
└── utils/          # Yardımcı fonksiyonlar
```

## 2. Entity ve DTO Tanımları

### 2.1. Entities

```typescript
// user.entity.ts
@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    passwordHash: string;

    @Column()
    fullName: string;

    @Column()
    role: UserRole;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

// report.entity.ts
@Entity('reports')
export class Report {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text')
    description: string;

    @Column('geometry', {
        spatialFeatureType: 'Point',
        srid: 4326
    })
    location: Point;

    @Column()
    category: ReportCategory;

    @Column()
    status: ReportStatus;

    @Column()
    priority: ReportPriority;

    @ManyToOne(() => User)
    reporter: User;

    @ManyToOne(() => User)
    assignedTo: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    resolvedAt: Date;
}

// report-media.entity.ts
@Entity('report_media')
export class ReportMedia {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Report)
    report: Report;

    @Column()
    mediaType: string;

    @Column()
    url: string;

    @CreateDateColumn()
    createdAt: Date;
}
```

### 2.2. DTOs

```typescript
// create-report.dto.ts
export class CreateReportDto {
    @IsString()
    @MinLength(3)
    @MaxLength(255)
    title: string;

    @IsString()
    @MinLength(10)
    description: string;

    @ValidateNested()
    @Type(() => LocationDto)
    location: LocationDto;

    @IsEnum(ReportCategory)
    category: ReportCategory;

    @IsEnum(ReportPriority)
    priority: ReportPriority;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => MediaUploadDto)
    media?: MediaUploadDto[];
}

// location.dto.ts
export class LocationDto {
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude: number;

    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude: number;
}
```

## 3. API Endpoint'leri

### 3.1. Authentication Endpoints

```typescript
// POST /api/auth/login
interface LoginRequest {
    email: string;
    password: string;
}

interface LoginResponse {
    token: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        role: string;
    }
}

// POST /api/auth/refresh
interface RefreshRequest {
    refreshToken: string;
}

interface RefreshResponse {
    token: string;
}
```

### 3.2. Report Endpoints

```typescript
// POST /api/reports
interface CreateReportRequest {
    title: string;
    description: string;
    location: {
        latitude: number;
        longitude: number;
    };
    category: string;
    priority: string;
    media?: {
        type: string;
        base64: string;
    }[];
}

// GET /api/reports
interface GetReportsQuery {
    bounds?: {
        north: number;
        south: number;
        east: number;
        west: number;
    };
    category?: string[];
    status?: string[];
    priority?: string[];
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

// PUT /api/reports/:id
interface UpdateReportRequest {
    status?: string;
    assignedTo?: string;
    priority?: string;
    resolution?: string;
}
```

## 4. Güvenlik İmplementasyonları

### 4.1. Authentication Flow

```typescript
// JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
            ignoreExpiration: false,
        });
    }

    async validate(payload: JwtPayload) {
        return { 
            id: payload.sub, 
            email: payload.email,
            role: payload.role 
        };
    }
}
```

### 4.2. Authorization Guards

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        return requiredRoles.includes(user.role);
    }
}
```

### 4.3. Rate Limiting

```typescript
// Rate limiting configuration
export const rateLimitConfig = {
    ttl: 60,
    limit: 100,
    keyPrefix: 'api_rate_limit'
};
```

## 5. Hata Yönetimi

### 5.1. Global Exception Filter

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            message = exception.message;
        }

        response
            .status(status)
            .json({
                statusCode: status,
                message,
                timestamp: new Date().toISOString(),
                path: request.url,
            });
    }
}
```

### 5.2. Validation Pipes

```typescript
app.useGlobalPipes(
    new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    })
);
```

## 6. Performans Optimizasyonları

### 6.1. Caching Stratejisi

```typescript
// Redis cache configuration
const cacheConfig = {
    store: redisStore,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    ttl: 60 * 60 * 24, // 24 hours
};

// Cache decorator usage
@CacheKey('reports_stats')
@CacheTTL(3600)
async getReportsStats(): Promise<ReportStats> {
    // Implementation
}
```

### 6.2. Database Indexing

Yukarıdaki veritabanı şemalarında belirtilen indeksler dışında:

```sql
-- Composite indexes for common queries
CREATE INDEX idx_reports_category_status ON reports(category, status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
```

### 6.3. Query Optimizasyonları

```typescript
// Efficient spatial queries
const nearbyReports = await this.reportRepository
    .createQueryBuilder('report')
    .where(`ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326),
        :distance
    )`)
    .setParameters({
        latitude,
        longitude,
        distance: 1000  // meters
    })
    .getMany();
```

## 7. Monitoring ve Logging

### 7.1. Winston Logger Yapılandırması

```typescript
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});
```

### 7.2. Prometheus Metrics

```typescript
// Custom metrics
const httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code']
});

// Middleware usage
app.use((req, res, next) => {
    const start = process.hrtime();
    res.on('finish', () => {
        const duration = process.hrtime(start);
        httpRequestDuration
            .labels(req.method, req.route?.path || req.path, res.statusCode)
            .observe(duration[0] + duration[1] / 1e9);
    });
    next();
});
```

## 8. Deployment ve CI/CD

### 8.1. Docker Yapılandırması

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

### 8.2. Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: urbanpulse-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: urbanpulse-api
  template:
    metadata:
      labels:
        app: urbanpulse-api
    spec:
      containers:
      - name: api
        image: urbanpulse/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: urbanpulse-secrets
              key: database-url
```

### 8.3. GitHub Actions Workflow

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - name: Deploy to production
      run: |
        # Deployment steps
```

## 9. Üçüncü Parti Servis Entegrasyonları

### 9.1. Harita Servisleri (Leaflet)

```typescript
// Harita konfigürasyonu
const mapConfig = {
    center: [41.0082, 28.9784], // Istanbul
    zoom: 13,
    minZoom: 10,
    maxZoom: 18
};

// Tile layer konfigürasyonu
const tileLayerConfig = {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors'
};
```

### 9.2. Push Notification Servisi (Firebase)

```typescript
// Firebase konfigürasyonu
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    projectId: process.env.FIREBASE_PROJECT_ID,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
};

// Notification gönderme fonksiyonu
async function sendPushNotification(token: string, data: NotificationData) {
    const message = {
        notification: {
            title: data.title,
            body: data.message
        },
        token
    };

    return admin.messaging().send(message);
}
```

## 10. WebSocket Gateway İmplementasyonu

```typescript
@WebSocketGateway({
    cors: true,
    namespace: 'reports',
})
export class ReportsGateway implements OnGateConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        // Handle connection
    }

    handleDisconnect(client: Socket) {
        // Handle disconnect
    }

    @SubscribeMessage('joinReport')
    handleJoinReport(client: Socket, reportId: string) {
        client.join(`report:${reportId}`);
    }

    @SubscribeMessage('leaveReport')
    handleLeaveReport(client: Socket, reportId: string) {
        client.leave(`report:${reportId}`);
    }

    notifyReportUpdate(reportId: string, data: any) {
        this.server.to(`report:${reportId}`).emit('reportUpdated', data);
    }
}
```

Bu teknik dokümantasyon, KentNabız projesinin tüm teknik detaylarını, kod yapısını, veritabanı şemalarını, API endpoint'lerini, güvenlik önlemlerini, performans optimizasyonlarını ve kullanılan teknolojileri kapsamlı bir şekilde açıklamaktadır. Geliştirme sürecinde bu doküman referans olarak kullanılmalı ve sistem geliştikçe güncellenmelidir.