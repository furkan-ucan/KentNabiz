# Faz 8: Local Deployment ve DevOps

## 📌 Adım 8.1: Docker Compose Production Konfigürasyonu

### Açıklama
Production benzeri ortamın Docker Compose ile yapılandırılması.

### 🛠 Teknolojiler
- Docker v24+
- Docker Compose v2+
- Traefik v2.10
- PostgreSQL v14
- Redis v7
- MinIO
- Fluent Bit v2.1

### 📂 Docker Yapılandırması
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  traefik:
    image: traefik:v2.10
    command:
      - "--api.insecure=false"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./config/traefik:/etc/traefik
    networks:
      - kentnabiz

  api:
    image: kentnabiz/api:${TAG:-latest}
    build:
      context: .
      dockerfile: apps/api/Dockerfile
      target: production
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://app:${DB_PASSWORD}@postgres:5432/kentnabiz
      - REDIS_URL=redis://redis:6379
      - MINIO_ENDPOINT=minio
      - MINIO_PORT=9000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(\`api.kentnabiz.local\`)"
    networks:
      - kentnabiz
    logging:
      driver: "fluentd"
      options:
        fluentd-address: localhost:24224
        tag: kentnabiz.api

  web:
    image: kentnabiz/web:${TAG:-latest}
    build:
      context: .
      dockerfile: apps/web/Dockerfile
      target: production
    environment:
      - VITE_API_URL=https://api.kentnabiz.local
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.web.rule=Host(\`kentnabiz.local\`)"
    networks:
      - kentnabiz
    logging:
      driver: "fluentd"
      options:
        fluentd-address: localhost:24224
        tag: kentnabiz.web

  postgres:
    image: postgis/postgis:14-3.3
    environment:
      POSTGRES_DB: kentnabiz
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - kentnabiz
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d kentnabiz"]
      interval: 10s
      timeout: 5s
      retries: 5
    logging:
      driver: "fluentd"
      options:
        fluentd-address: localhost:24224
        tag: kentnabiz.postgres

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - kentnabiz
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    logging:
      driver: "fluentd"
      options:
        fluentd-address: localhost:24224
        tag: kentnabiz.redis

  minio:
    image: minio/minio
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    command: server --console-address ":9001" /data
    volumes:
      - minio_data:/data
    networks:
      - kentnabiz
    logging:
      driver: "fluentd"
      options:
        fluentd-address: localhost:24224
        tag: kentnabiz.minio

  fluent-bit:
    image: fluent/fluent-bit:2.1
    volumes:
      - ./config/fluent-bit:/fluent-bit/etc
    ports:
      - "24224:24224"
      - "24224:24224/udp"
    networks:
      - kentnabiz

networks:
  kentnabiz:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### 📂 Log Konfigürasyonu
```ini
# config/fluent-bit/fluent-bit.conf
[SERVICE]
    Flush        5
    Daemon       Off
    Log_Level    info
    Parsers_File parsers.conf

[INPUT]
    Name              forward
    Listen            0.0.0.0
    Port              24224
    Buffer_Chunk_Size 1M
    Buffer_Max_Size   6M

[FILTER]
    Name          kubernetes
    Match         *
    Merge_Log    On

[OUTPUT]
    Name                loki
    Match               *
    Host                loki
    Port                3100
    Labels              job=fluentbit
    Label_Keys          $container_name
    Remove_Keys         kubernetes,stream
    Auto_Kubernetes_Labels  On
```

### ✅ Kontrol Noktaları
- [ ] Tüm servisler ayakta
- [ ] Traefik routing çalışıyor
- [ ] Log aggregation aktif
- [ ] Healthcheck'ler başarılı

### 📌 Onay Gereksinimleri
- Services up & healthy
- Inter-service iletişim OK
- Log collection çalışıyor

## 📌 Adım 8.2: Database Migration ve Seeding

### Açıklama
TypeORM migrations ve seed işlemleri için yapılandırma.

### 🛠 Teknolojiler
- TypeORM ^0.3.0
- PostgreSQL v14
- Node.js v18+

### 📂 Migration Yapılandırması
```typescript
// apps/api/src/database/migrations/1700000000000-InitialSchema.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "fullName" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "reports" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" text,
        "status" character varying NOT NULL DEFAULT 'PENDING',
        "location" geometry(Point,4326),
        "userId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reports" PRIMARY KEY ("id")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "reports"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}

// apps/api/src/database/seeds/initial.seed.ts
import { Factory, Seeder } from 'typeorm-seeding';
import { User } from '../../entities/User';
import { Report } from '../../entities/Report';
import { hashPassword } from '../../utils/auth';

export default class InitialDatabaseSeed implements Seeder {
  public async run(factory: Factory): Promise<void> {
    // Admin user
    const admin = await factory(User)().create({
      email: 'admin@kentnabiz.com',
      password: await hashPassword('admin123'),
      fullName: 'System Admin',
      role: 'ADMIN'
    });

    // Test reports
    await factory(Report)().createMany(10, {
      userId: admin.id,
      status: 'PENDING'
    });
  }
}
```

### 📂 Migration Scripts
```json
// apps/api/package.json
{
  "scripts": {
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert",
    "seed:run": "ts-node ./node_modules/typeorm-seeding/dist/cli.js seed"
  }
}
```

### ✅ Kontrol Noktaları
- [ ] Migration scripts çalışıyor
- [ ] Seed data yükleniyor
- [ ] Foreign key constraints OK
- [ ] Rollback testleri başarılı

### 📌 Onay Gereksinimleri
- Schema güncel
- Seed data doğru
- Constraints aktif

## 📌 Adım 8.3: Log Aggregation ve Monitoring

### Açıklama
Loki, Prometheus ve Grafana ile log toplama ve sistem izleme.

### 🛠 Teknolojiler
- Grafana v10.0
- Loki v2.9
- Prometheus v2.47
- Fluent Bit v2.1

### 📂 Monitoring Stack
```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  loki:
    image: grafana/loki:2.9.0
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/local-config.yaml
    volumes:
      - ./config/loki:/etc/loki
    networks:
      - monitoring

  prometheus:
    image: prom/prometheus:v2.47.0
    ports:
      - "9090:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
    volumes:
      - ./config/prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:10.0.0
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - ./config/grafana/provisioning:/etc/grafana/provisioning
      - grafana_data:/var/lib/grafana
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge

volumes:
  prometheus_data:
  grafana_data:
```

### 📂 Prometheus Konfigürasyonu
```yaml
# config/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'api'
    static_configs:
      - targets: ['api:3000']
    metrics_path: '/metrics'

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
```

### 📂 Grafana Dashboard
```json
// config/grafana/dashboards/api.json
{
  "annotations": {
    "list": []
  },
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 0,
  "links": [],
  "liveNow": false,
  "panels": [
    {
      "datasource": {
        "type": "prometheus",
        "uid": "prometheus"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 0,
            "gradientMode": "none",
            "hideFrom": {
              "legend": false,
              "tooltip": false,
              "viz": false
            },
            "lineInterpolation": "linear",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "auto",
            "spanNulls": false,
            "stacking": {
              "group": "A",
              "mode": "none"
            },
            "thresholdsStyle": {
              "mode": "off"
            }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 0,
        "y": 0
      },
      "id": 1,
      "options": {
        "legend": {
          "calcs": [],
          "displayMode": "list",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": {
          "mode": "single",
          "sort": "none"
        }
      },
      "title": "HTTP Request Rate",
      "type": "timeseries"
    }
  ],
  "refresh": "5s",
  "schemaVersion": 38,
  "style": "dark",
  "tags": [],
  "templating": {
    "list": []
  },
  "time": {
    "from": "now-6h",
    "to": "now"
  },
  "timepicker": {},
  "timezone": "",
  "title": "API Dashboard",
  "version": 0
}
```

### ✅ Kontrol Noktaları
- [ ] Log shipping çalışıyor
- [ ] Metrics toplanıyor
- [ ] Grafana dashboards hazır
- [ ] Alerting kuralları aktif

### 📌 Onay Gereksinimleri
- Log aggregation başarılı
- Metrikler doğru
- Dashboardlar erişilebilir

## 📌 Adım 8.4: Error Tracking Sistemi

### Açıklama
Sentry entegrasyonu ile hata takibi ve raporlama.

### 🛠 Teknolojiler
- Sentry ^7.80.0
- @sentry/node ^7.80.0
- @sentry/react ^7.80.0

### 📂 Sentry Yapılandırması
```typescript
// apps/api/src/config/sentry.ts
import * as Sentry from '@sentry/node';

export const initSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express(),
      new Sentry.Integrations.Postgres()
    ]
  });
};

// apps/web/src/config/sentry.ts
import * as Sentry from '@sentry/react';

export const initSentry = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay()
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0
  });
};
```

### 📂 Error Middleware
```typescript
// apps/api/src/middleware/error.middleware.ts
import * as Sentry from '@sentry/node';
import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../errors/custom.error';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error to Sentry
  Sentry.captureException(error, {
    user: { id: req.user?.id },
    extra: {
      path: req.path,
      method: req.method
    }
  });

  if (error instanceof CustomError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.serializeErrors()
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Something went wrong'
  });
};
```

### ✅ Kontrol Noktaları
- [ ] Sentry DSN yapılandırması
- [ ] Error tracking aktif
- [ ] Source maps yüklü
- [ ] Performance monitoring çalışıyor

### 📌 Onay Gereksinimleri
- Hatalar raporlanıyor
- Stack traces tam
- Performance data toplanıyor

## 📌 Adım 8.5: CI/CD Pipeline Optimizasyonu

### Açıklama
GitHub Actions CI/CD pipeline'ının optimize edilmesi.

### 🛠 Teknolojiler
- GitHub Actions
- pnpm ^8.0.0
- Docker Buildx

### 📂 CI/CD Yapılandırması
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Type check
      run: pnpm type-check
    
    - name: Lint
      run: pnpm lint
    
    - name: Unit tests
      run: pnpm test

  build:
    needs: test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [api, web]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Login to GitHub Container Registry
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Build and push
      uses: docker/build-push-action@v5
      with:
        context: .
        file: ./apps/${{ matrix.app }}/Dockerfile
        push: true
        tags: |
          ghcr.io/${{ github.repository }}/${{ matrix.app }}:${{ github.sha }}
          ghcr.io/${{ github.repository }}/${{ matrix.app }}:latest
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to Production
      run: |
        echo "Deploying to production..."
```

### ✅ Kontrol Noktaları
- [ ] Build cache çalışıyor
- [ ] Test parallelization aktif
- [ ] Docker layer caching doğru
- [ ] Deployment automation başarılı

### 📌 Onay Gereksinimleri
- CI süresi optimize
- Tests/builds paralel
- Cache hit rate yüksek

## 🔍 Faz 8 Sonuç ve Değerlendirme

### Performance Metrics
- Build time: <5 dakika
- Test coverage: %90+
- Log retention: 30 gün
- Error tracking latency: <1s

### Security Checklist
- Secrets management
- Network segmentation
- Service authentication
- Log sanitization

### Monitoring Checklist
- System metrics
- Application logs
- Error tracking
- Performance data

### ⚠️ Önemli Notlar
- Production secrets güvenli saklanmalı
- DB backup stratejisi oluşturulmalı
- Log rotation politikası belirlenmeli
- Monitoring alert thresholds ayarlanmalı