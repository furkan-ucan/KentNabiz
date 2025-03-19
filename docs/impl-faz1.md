# Faz 1: Monorepo ve Temel Altyapı Kurulumu

## 📌 Adım 1.1: pnpm Workspace Konfigürasyonu

### Açıklama
pnpm workspace kullanarak NestJS (backend), React (web) ve React Native (mobile) projelerini tek bir monorepo içinde yönetecek yapıyı kuruyoruz.

### 🛠 Teknolojiler
- pnpm v8.0+
- TypeScript v5.0+
- Node.js v18+
- VSCode

### 📂 Klasör Yapısı ve Konfigürasyon

#### Root yapılandırması
```yaml
# filepath: pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```json
// filepath: package.json
{
  "name": "kentnabiz",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "prepare": "husky install"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "turbo": "^1.10.0",
    "typescript": "^5.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^15.0.0",
    "dotenv": "^16.0.0"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### ✅ Kontrol Noktaları
- [ ] pnpm workspace.yaml dosyası oluşturuldu
- [ ] Root package.json yapılandırıldı
- [ ] Turbo pipeline konfigürasyonu yapıldı
- [ ] Development dependencies yüklendi

### 📌 Onay Gereksinimleri
- pnpm install komutu başarıyla çalışıyor
- Turbo komutları (dev, build, test, lint) çalışıyor

## 📌 Adım 1.2: TurboRepo Pipeline Konfigürasyonu

### Açıklama
Monorepo build ve task yönetimi için TurboRepo pipeline yapılandırması.

### 🛠 Teknolojiler
- Turborepo ^1.10.0
- Node.js v18+

### 📂 Pipeline Yapılandırması
```json
// filepath: turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts", "test/**/*.tsx"]
    },
    "lint": {
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

### ✅ Kontrol Noktaları
- [ ] Pipeline yapılandırması tamamlandı
- [ ] Build cache çalışıyor
- [ ] Workspace'ler arası dependency çözümü doğru

### 📌 Onay Gereksinimleri
- `turbo run build` başarıyla çalışıyor
- `turbo run test` tüm workspace'lerde testleri çalıştırıyor

## 📌 Adım 1.3: Shared Paketlerin Yapılandırması

### Açıklama
Backend, frontend ve mobile projeleri arasında paylaşılacak ortak kod ve tiplerin yapılandırması.

### 🛠 Teknolojiler
- TypeScript v5.0+
- tsup ^7.0.0 (bundle için)

### 📂 Shared Paket Yapısı
```typescript
packages/
├── shared/
│   ├── src/
│   │   ├── types/
│   │   │   ├── report.types.ts
│   │   │   ├── user.types.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── validation.ts
│   │   │   ├── formatting.ts
│   │   │   └── index.ts
│   │   └── constants/
│   │       ├── api.ts
│   │       └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── ui/
    ├── src/
    │   ├── components/
    │   │   ├── Button/
    │   │   ├── Input/
    │   │   └── Card/
    │   └── hooks/
    │       ├── useForm/
    │       └── useAuth/
    ├── package.json
    └── tsconfig.json
```

### ✅ Kontrol Noktaları
- [ ] Shared paketler oluşturuldu
- [ ] TypeScript konfigürasyonu yapıldı
- [ ] Build ve publish scripts hazır

### 📌 Onay Gereksinimleri
- Paketler diğer workspace'lerden import edilebiliyor
- Type desteği çalışıyor

## 📌 Adım 1.4: TypeScript ve ESLint Yapılandırması

### Açıklama
Tüm projelerde ortak kullanılacak TypeScript ve ESLint konfigürasyonlarını hazırlıyoruz.

### 🛠 Teknolojiler
- TypeScript v5.0+
- ESLint v8.0+
- Prettier v3.0+

### 📂 Konfigürasyon Dosyaları

```json
// filepath: tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

```javascript
// filepath: .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': 'error'
  }
};
```

### ✅ Kontrol Noktaları
- [ ] TypeScript base config oluşturuldu
- [ ] ESLint kuralları belirlendi
- [ ] Prettier konfigürasyonu yapıldı
- [ ] Git hooks (husky) kurulumu yapıldı

### 📌 Onay Gereksinimleri
- TypeScript derleme hatasız çalışıyor
- ESLint kontrolleri başarılı
- Pre-commit hook'ları aktif

## 📌 Adım 1.5: Docker Development Environment

### Açıklama
Development ortamı için gerekli servisleri (PostgreSQL, Redis, MinIO) Docker Compose ile yapılandırıyoruz.

### 🛠 Teknolojiler
- Docker v24+
- Docker Compose v2+
- PostgreSQL v14
- Redis v7
- MinIO

### 📂 Docker Yapılandırması

```yaml
# filepath: docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: kentnabiz
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server --console-address ":9001" /data

volumes:
  postgres_data:
```

### ✅ Kontrol Noktaları
- [ ] Docker Compose yapılandırması tamamlandı
- [ ] PostgreSQL servis ayakta ve erişilebilir
- [ ] Redis servis ayakta ve erişilebilir
- [ ] MinIO servis ayakta ve erişilebilir

### 📌 Onay Gereksinimleri
- docker-compose up komutu başarılı
- Tüm servislere bağlantı testi yapıldı

## 📌 Adım 1.6: Environment ve Git Hooks Yapılandırması

### Açıklama
Environment değişkenlerinin yönetimi ve git hook'larının yapılandırması.

### 🛠 Teknolojiler
- husky ^8.0.0
- lint-staged ^15.0.0
- dotenv ^16.0.0

### 📂 Environment Yapılandırması
```bash
# filepath: .env.example
# App
NODE_ENV=development
API_PORT=3000
API_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://dev:dev123@localhost:5432/kentnabiz
DATABASE_SSL=false

# Redis
REDIS_URL=redis://localhost:6379

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
```

### 📂 Git Hooks Yapılandırması
```bash
# filepath: .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm lint-staged
```

```bash
# filepath: .husky/commit-msg
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx --no -- commitlint --edit $1
```

### ✅ Kontrol Noktaları
- [ ] `.env.example` dosyası hazır
- [ ] Git hooks aktif
- [ ] Commit lint kuralları tanımlı
- [ ] Environment değişkenleri doğru yükleniyor

### 📌 Onay Gereksinimleri
- Pre-commit hook çalışıyor
- Environment değişkenleri tüm servislerde erişilebilir

## 📌 Adım 1.7: GitHub CI/CD Workflow

### Açıklama
GitHub Actions kullanarak temel CI/CD pipeline'ını kuruyoruz.

### 🛠 Teknolojiler
- GitHub Actions
- pnpm
- Jest

### 📂 Workflow Yapılandırması

```yaml
# filepath: .github/workflows/ci.yml
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
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Run lint
      run: pnpm lint
    
    - name: Run tests
      run: pnpm test
```

### ✅ Kontrol Noktaları
- [ ] GitHub Actions workflow dosyası oluşturuldu
- [ ] pnpm cache yapılandırıldı
- [ ] Test ve lint adımları eklendi
- [ ] Branch protection kuralları ayarlandı

### 📌 Onay Gereksinimleri
- GitHub Actions pipeline'ı başarıyla çalışıyor
- Branch protection kuralları aktif

## 🔍 Faz 1 Sonuç ve Değerlendirme

### ✅ Final Kontrol Listesi
- [ ] Monorepo yapısı ve TurboRepo pipeline'ı hazır
- [ ] Shared paketler oluşturuldu ve kullanılabilir
- [ ] Docker servisleri ve environment yapılandırması tamam
- [ ] Git hooks ve commit standartları aktif
- [ ] CI/CD pipeline'ı çalışıyor

### 🚀 Sonraki Adımlar
1. Backend (NestJS) projesinin oluşturulması
2. Frontend (React) projesinin oluşturulması
3. Mobile (React Native) projesinin oluşturulması
4. Shared paketlerin implementasyonu

### ⚠️ Önemli Notlar
- Node.js ve pnpm sürümlerinin projenin tüm parçalarında tutarlı olduğundan emin olun
- Docker Desktop'ın güncel sürümünü kullanın
- VSCode extension'larını (ESLint, Prettier, Docker) yükleyin
Environment değişkenlerini asla git'e commit etmeyin
- Shared paketlerde breaking change yapmaktan kaçının
- TurboRepo cache'ini efektif kullanmak için outputs doğru tanımlanmalı
- Docker volume'larını düzenli temizleyin
