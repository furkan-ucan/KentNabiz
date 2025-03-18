# KentNabız Projesi

Kent Nabız, şehir yaşamını iyileştirmek ve vatandaşların yerel yönetimlerle etkileşimini artırmak için geliştirilmiş bir dijital platform projesidir.

## Proje Altyapısı

Bu proje aşağıdaki teknolojileri kullanmaktadır:

- Monorepo Yapısı (Turborepo)
- TypeScript
- Node.js
- React
- PostgreSQL
- Redis
- MinIO (S3 uyumlu nesne depolama)
- Docker

## Geliştirme Ortamı Kurulumu

### Ön Koşullar

- Node.js 18 veya üzeri
- pnpm 8 veya üzeri
- Docker ve Docker Compose

### Kurulum Adımları

1. Repoyu klonlayın

```bash
git clone https://github.com/kullanici/kentnabiz.git
cd kentnabiz
```

2. Bağımlılıkları yükleyin

```bash
pnpm install
```

3. Çevre değişkenlerini ayarlayın

```bash
cp .env.example .env
```

4. Docker servislerini başlatın

```bash
docker-compose up -d
```

5. Servislerin çalıştığını doğrulayın

```bash
node scripts/check-services.js
```

6. Uygulamayı geliştirme modunda başlatın

```bash
pnpm dev
```

## CI/CD ve Kalite Kontrol

- CI/CD: GitHub Actions
- Formatting: Prettier
- Linting: ESLint
- Test: Jest
- Commit standardı: Conventional Commits
- Git Hooks: Husky ve lint-staged

## Katkıda Bulunma

1. Bir feature branch oluşturun
2. Değişikliklerinizi commit edin (Conventional Commits standardına uygun olarak)
3. Branch'i pushlayın
4. Pull Request açın

## Lisans

[MIT Lisansı](LICENSE)
