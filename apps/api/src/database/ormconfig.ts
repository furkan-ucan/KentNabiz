import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';

config();

const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME', 'postgres'),
  password: configService.get<string>('DB_PASSWORD', 'postgres'),
  database: configService.get<string>('DB_DATABASE', 'kentnabiz'),
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: configService.get<string>('NODE_ENV') === 'development',
  ssl:
    configService.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
  // Performans iyileştirmeleri
  connectTimeoutMS: 10000,
  maxQueryExecutionTime: 1000,
  poolSize: 20,
  cache: {
    duration: 30000, // 30 saniye
  },
};

export const AppDataSource = new DataSource(dataSourceOptions);

// 🔧 PostGIS uzantılarını ayrı initialize sonrası çalıştırmak için yardımcı fonksiyon
export async function ensurePostgisExtensions() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  await queryRunner.query('CREATE EXTENSION IF NOT EXISTS postgis');
  await queryRunner.query('CREATE EXTENSION IF NOT EXISTS postgis_topology');
  await queryRunner.query('CREATE EXTENSION IF NOT EXISTS fuzzystrmatch');
  // Coğrafi sorgular için ek uzantılar
  await queryRunner.query('CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder');
  await queryRunner.query('CREATE EXTENSION IF NOT EXISTS address_standardizer');

  await queryRunner.release();
}

// Migration işlemlerini kolaylaştıran yardımcı fonksiyon
export async function runMigrations() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  try {
    const pendingMigrations = await AppDataSource.showMigrations();
    if (pendingMigrations) {
      console.log('📦 Bekleyen migrations işlemleri bulundu, çalıştırılıyor...');
      const migrations = await AppDataSource.runMigrations();
      console.log(`✅ ${migrations.length} migrations başarıyla uygulandı!`);
      return migrations;
    } else {
      console.log('✅ Tüm migrations işlemleri güncel.');
      return [];
    }
  } catch (error) {
    console.error('❌ Migrations işlemleri sırasında hata oluştu:', error);
    throw error;
  }
}

// CLI'dan doğrudan çalıştırılırsa migrations işlemlerini başlat
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('📋 Migration işlemleri tamamlandı');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration işlemi başarısız oldu:', error);
      process.exit(1);
    });
}
