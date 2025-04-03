import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join, dirname } from 'path'; // Import dirname
import { fileURLToPath } from 'url'; // Import fileURLToPath

config(); // Load .env variables

// --- ESM compatible __dirname calculation ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// --- End ESM compatible __dirname calculation ---

// Using ConfigService directly might be okay for CLI, but relies on .env being loaded
const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  // Prefer using process.env directly after dotenv.config() for CLI tools
  // or ensure ConfigService correctly reads them without full Nest app bootstrap.
  host: process.env.DB_HOST || 'localhost', // Example using process.env
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'kentnabiz',
  // Use the calculated __dirname
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')], // Correct path relative to this file's location
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')], // Correct path relative to this file's location
  synchronize: false, // Should be false for migrations
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Performance options (adjust as needed)
  connectTimeoutMS: 10000,
  // maxQueryExecutionTime: 1000, // Be careful with this in production
  poolSize: parseInt(process.env.DB_POOL_SIZE || '20', 10), // Allow config via env
  // Cache options (consider if needed for CLI)
  // cache: {
  //   duration: 30000, // 30 seconds
  // },
};

// Export the DataSource instance for TypeORM CLI and potentially the app
export const AppDataSource = new DataSource(dataSourceOptions);

// 🔧 Helper function to ensure PostGIS extensions exist (can be called elsewhere)
export async function ensurePostgisExtensions() {
  // Initialize only if not already done
  const dataSource = AppDataSource.isInitialized ? AppDataSource : await AppDataSource.initialize();
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    console.log('Ensuring PostGIS extensions...');
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS postgis');
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS postgis_topology');
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS fuzzystrmatch');
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder');
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS address_standardizer');
    console.log('PostGIS extensions check complete.');
  } catch (error) {
    console.error('Error ensuring PostGIS extensions:', error);
  } finally {
    await queryRunner.release();
  }
}

// Helper function to run migrations (can be called elsewhere)
export async function runMigrations() {
  // Initialize only if not already done
  const dataSource = AppDataSource.isInitialized ? AppDataSource : await AppDataSource.initialize();

  try {
    const pendingMigrations = await dataSource.showMigrations();
    if (pendingMigrations) {
      console.log('📦 Pending migrations found, running...');
      const migrations = await dataSource.runMigrations();
      console.log(`✅ ${migrations.length} migration(s) successfully applied!`);
      return migrations;
    } else {
      console.log('✅ All migrations are up to date.');
      return [];
    }
  } catch (error) {
    console.error('❌ Error during migration run:', error);
    throw error; // Re-throw to indicate failure
  }
}

// --- Removed `if (require.main === module)` block ---
// This block is CommonJS specific and shouldn't be in a config file
// intended for ESM or import by other tools/applications.
// Run migrations explicitly via TypeORM CLI commands.
