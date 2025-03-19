# Faz 10: Performans Optimizasyonları

## 📌 Adım 10.1: Code Splitting ve Lazy Loading

### Açıklama
Webpack ve React.lazy kullanarak bundle boyutunu küçültme ve yükleme performansını artırma.

### 🛠 Teknolojiler
- Webpack ^5.0.0
- @loadable/component ^5.15.0
- webpack-bundle-analyzer ^4.9.0
- compression-webpack-plugin ^10.0.0

### 📂 Webpack Yapılandırması
```typescript
// apps/web/webpack.config.ts
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CompressionPlugin from 'compression-webpack-plugin';
import path from 'path';

export default {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js'
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
          name(module) {
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];
            return `vendor.${packageName.replace('@', '')}`;
          }
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false
    }),
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/
    })
  ]
};

// apps/web/src/routes/index.tsx
import loadable from '@loadable/component';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const HomePage = loadable(() => import('../pages/HomePage'), {
  fallback: <LoadingSpinner />
});

const ReportPage = loadable(() => import('../pages/ReportPage'), {
  fallback: <LoadingSpinner />
});

const MapPage = loadable(() => import('../pages/MapPage'), {
  fallback: <LoadingSpinner />
});

// Preload örneği
const preloadReportPage = () => {
  const ReportPageComponent = loadable.lib(() => import('../pages/ReportPage'));
  ReportPageComponent.preload();
};
```

### ✅ Kontrol Noktaları
- [ ] Bundle analizi yapıldı
- [ ] Code splitting stratejisi belirlendi
- [ ] Lazy loading implementasyonu
- [ ] Preloading konfigürasyonu
- [ ] Compression ayarları

### 📌 Onay Gereksinimleri
- Initial bundle <200KB
- First paint <2s
- TTI <3.5s
- Code splitting başarılı

## 📌 Adım 10.2: Redis Caching Stratejisi

### Açıklama
Sık kullanılan verilerin Redis'te önbelleğe alınması ve cache invalidation yönetimi.

### 🛠 Teknolojiler
- Redis ^7.0.0
- ioredis ^5.0.0
- cache-manager ^5.2.0

### 📂 Cache Yapılandırması
```typescript
// apps/api/src/core/cache/cache.module.ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { CacheService } from './cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: () => ({
        store: redisStore,
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        ttl: 60 * 60, // 1 saat
        max: 100
      })
    })
  ],
  providers: [CacheService],
  exports: [CacheService]
})
export class RedisCacheModule {}

// apps/api/src/core/cache/cache.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async get<T>(key: string): Promise<T | null> {
    return this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  generateKey(prefix: string, params: object): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});

    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }
}

// apps/api/src/modules/reports/services/reports.service.ts
import { Injectable } from '@nestjs/common';
import { CacheService } from '@/core/cache/cache.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly cacheService: CacheService
  ) {}

  async getReports(params: ReportQueryParams) {
    const cacheKey = this.cacheService.generateKey('reports', params);
    
    // Cache'den kontrol et
    const cachedData = await this.cacheService.get<Report[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // DB'den verileri çek
    const reports = await this.reportRepository.find({
      where: params,
      relations: ['user', 'media']
    });

    // Cache'e kaydet
    await this.cacheService.set(cacheKey, reports, 60 * 5); // 5 dakika

    return reports;
  }

  async createReport(data: CreateReportDto) {
    const report = await this.reportRepository.save(data);
    
    // İlgili cache'leri temizle
    await this.cacheService.del('reports:list');
    await this.cacheService.del(`reports:${report.id}`);
    
    return report;
  }
}
```

### ✅ Kontrol Noktaları
- [ ] Redis bağlantısı
- [ ] Cache stratejisi
- [ ] TTL politikası
- [ ] Invalidation planı
- [ ] Error handling

### 📌 Onay Gereksinimleri
- Cache hit rate >80%
- Response time <100ms
- Memory usage optimal

## 📌 Adım 10.3: Image ve Bundle Optimizasyonu

### Açıklama
Resim boyutlarının optimizasyonu ve CDN entegrasyonu.

### 🛠 Teknolojiler
- sharp ^0.32.0
- imagemin ^8.0.0
- webpack-image-loader ^4.0.0
- CloudFront/CloudFlare CDN

### 📂 Image Optimization
```typescript
// apps/api/src/modules/media/services/image-processor.service.ts
import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class ImageProcessorService {
  async optimize(buffer: Buffer, options: ImageOptions = {}): Promise<Buffer> {
    const {
      width,
      height,
      quality = 80,
      format = 'webp'
    } = options;

    let image = sharp(buffer);

    // Resize if dimensions provided
    if (width || height) {
      image = image.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convert to WebP for better compression
    if (format === 'webp') {
      image = image.webp({ quality });
    } else if (format === 'jpeg') {
      image = image.jpeg({ quality });
    }

    return image.toBuffer();
  }

  async generateThumbnail(buffer: Buffer): Promise<Buffer> {
    return this.optimize(buffer, {
      width: 200,
      height: 200,
      quality: 60,
      format: 'webp'
    });
  }
}

// apps/web/next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

module.exports = withBundleAnalyzer({
  images: {
    domains: ['cdn.kentnabiz.com'],
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 // 1 gün
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(jpe?g|png|svg|gif|ico|webp|avif)$/,
      use: [
        {
          loader: 'image-webpack-loader',
          options: {
            mozjpeg: {
              progressive: true,
              quality: 80
            },
            optipng: {
              enabled: true
            },
            webp: {
              quality: 80
            }
          }
        }
      ]
    });
    return config;
  }
});
```

### ✅ Kontrol Noktaları
- [ ] Image optimization pipeline
- [ ] WebP/AVIF support
- [ ] Responsive images
- [ ] CDN integration
- [ ] Cache headers

### 📌 Onay Gereksinimleri
- Image boyutları %50+ küçüldü
- CDN hit rate >90%
- WebP formatı aktif

## 📌 Adım 10.4: Database Indexing ve Query Optimizasyonu

### Açıklama
PostgreSQL indeksleme ve sorgu optimizasyonları.

### 🛠 Teknolojiler
- PostgreSQL v14
- TypeORM ^0.3.0
- pg_stat_statements

### 📂 Database Optimizasyonu
```typescript
// apps/api/src/database/migrations/1700000000000-AddIndexes.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexes1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Composite index for reports
    await queryRunner.query(`
      CREATE INDEX idx_reports_status_created_at 
      ON reports(status, created_at)
      WHERE status != 'DELETED'
    `);

    // GiST index for PostGIS
    await queryRunner.query(`
      CREATE INDEX idx_reports_location 
      ON reports USING GIST (location)
    `);

    // Multi-column index for user search
    await queryRunner.query(`
      CREATE INDEX idx_users_email_status 
      ON users(email, status)
      INCLUDE (id, full_name)
    `);

    // Full text search index
    await queryRunner.query(`
      CREATE INDEX idx_reports_fts 
      ON reports 
      USING GIN (to_tsvector('turkish', title || ' ' || description))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX idx_reports_status_created_at`);
    await queryRunner.query(`DROP INDEX idx_reports_location`);
    await queryRunner.query(`DROP INDEX idx_users_email_status`);
    await queryRunner.query(`DROP INDEX idx_reports_fts`);
  }
}

// apps/api/src/modules/reports/repositories/report.repository.ts
import { Repository, EntityRepository } from 'typeorm';
import { Report } from '../entities/report.entity';

@EntityRepository(Report)
export class ReportRepository extends Repository<Report> {
  async findNearbyReports(lat: number, lng: number, radius: number = 1000) {
    return this.createQueryBuilder('report')
      .where(`
        ST_DWithin(
          location::geography,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
          :radius
        )
      `)
      .setParameters({ lat, lng, radius })
      .orderBy('created_at', 'DESC')
      .take(20)
      .cache(60000) // 1 dakika cache
      .getMany();
  }

  async searchReports(query: string) {
    return this.createQueryBuilder('report')
      .where(`
        to_tsvector('turkish', report.title || ' ' || report.description) @@ 
        plainto_tsquery('turkish', :query)
      `)
      .setParameter('query', query)
      .orderBy('created_at', 'DESC')
      .take(20)
      .cache(60000)
      .getMany();
  }
}
```

### ✅ Kontrol Noktaları
- [ ] Index analizi
- [ ] Query planlayıcı
- [ ] Cache stratejisi
- [ ] Full text search
- [ ] GIS optimizasyonu

### 📌 Onay Gereksinimleri
- Query time <50ms
- Index hit rate >90%
- Explain analyze başarılı

## 📌 Adım 10.5: API Response Time İyileştirmeleri

### Açıklama
API yanıt sürelerinin iyileştirilmesi ve connection pooling optimizasyonları.

### 🛠 Teknolojiler
- pg-pool ^3.6.0
- fastify ^4.0.0
- compression ^1.7.0

### 📂 API Optimizasyonu
```typescript
// apps/api/src/core/database/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as pg from 'pg';

const pgPool = new pg.Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: ['error'],
  maxQueryExecutionTime: 1000,
  extra: {
    max: 20,
    connectionTimeoutMillis: 2000,
    idleTimeoutMillis: 30000
  }
};

// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  // Compression middleware
  app.use(compression());

  // Global response interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Connection pooling ve timeout ayarları
  app.enableShutdownHooks();
  app.enableCors();

  await app.listen(3000);
}

// apps/api/src/core/interceptors/transform.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    
    return next.handle().pipe(
      map(data => ({
        data,
        timestamp: Date.now(),
        responseTime: `${Date.now() - now}ms`
      }))
    );
  }
}
```

### ✅ Kontrol Noktaları
- [ ] Connection pooling
- [ ] Response compression
- [ ] Timeout handling
- [ ] Error handling
- [ ] Monitoring setup

### 📌 Onay Gereksinimleri
- Response time <100ms
- Error rate <1%
- Connection pooling optimal

## 🔍 Faz 10 Sonuç ve Değerlendirme

### Performance Metrics
- Initial bundle size: <200KB
- API response time: <100ms
- Cache hit rate: >80%
- Query time: <50ms

### Monitoring Setup
- Resource utilization
- Error tracking
- Performance metrics
- Cache statistics

### ⚠️ Önemli Notlar
- Cache invalidation stratejisi önemli
- Query planlarını düzenli kontrol et
- Bundle size monitör et
- Connection pool ayarlarını gözle