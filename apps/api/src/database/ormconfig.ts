import 'reflect-metadata'; // Keep for TypeORM runtime decorator reflection if needed
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path'; // Use Node's path module

config(); // Load .env variables from the root of the project or current working directory

// --- NO ESM __dirname calculation needed ---
// In CommonJS modules (which TS compiles to with "module": "CommonJS"),
// __dirname is a built-in global variable representing the directory of the current file.

// --- Define paths relative to the COMPILED location of this file ---
// Assuming this file compiles to: dist/database/ormconfig.js
// Entities compile to: dist/modules/**/*.entity.js (adjust 'modules' if different)
// Migrations compile to: dist/database/migrations/*.js

const entitiesPath = join(__dirname, '..', '**', '*.entity.js');
// Explanation:
// __dirname = dist/database
// '..' = go up to dist/
// '**' = search recursively in all subdirectories
// '*.entity.js' = find files ending with .entity.js

const migrationsPath = join(__dirname, 'migrations', '*.js');
// Explanation:
// __dirname = dist/database
// 'migrations' = look inside the sibling migrations folder
// '*.js' = find files ending with .js

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  // Use process.env directly, as dotenv.config() has been called.
  // This is generally safer and simpler for CLI tools than using Nest's ConfigService.
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres', // Ensure this is set in your .env!
  database: process.env.DB_DATABASE || 'kentnabiz',

  // Point to the compiled JavaScript files
  entities: [entitiesPath],
  migrations: [migrationsPath],

  migrationsTableName: 'typeorm_migrations', // Optional: Explicitly name the migrations table

  synchronize: false, // MUST be false if you are using migrations
  logging: process.env.NODE_ENV === 'development', // Log SQL only in dev

  // SSL configuration example (adjust as needed for your hosting provider)
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false } // Common for some providers like Heroku, Render; check provider docs
      : false,

  // Connection Pool options (optional, adjust based on load)
  poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10), // Default to 10 connections

  // Connection Timeout (optional)
  connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT_MS || '10000', 10), // 10 seconds
};

// Export the DataSource instance. TypeORM CLI tools look for this export.
export const AppDataSource = new DataSource(dataSourceOptions);

// --- Helper Functions (optional, can be kept if used elsewhere) ---

/**
 * Ensures necessary PostGIS extensions are enabled in the database.
 * Connects using AppDataSource.
 */
export async function ensurePostgisExtensions() {
  const isInitialized = AppDataSource.isInitialized;
  const dataSource = isInitialized ? AppDataSource : await AppDataSource.initialize();
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    console.log('Ensuring PostGIS extensions...');
    // Add relevant extensions - ensure your DB user has permissions
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    // Add other extensions if used (e.g., postgis_topology)
    // await queryRunner.query('CREATE EXTENSION IF NOT EXISTS postgis_topology;');
    console.log('PostGIS extensions check complete.');
  } catch (error) {
    console.error(
      'Error ensuring PostGIS extensions:',
      error instanceof Error ? error.message : String(error)
    );
    // Decide if you want to throw the error or just log it
  } finally {
    await queryRunner.release();
    // Only destroy if we initialized it within this function
    if (!isInitialized && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

/**
 * Runs pending migrations using AppDataSource.
 */
export async function runMigrations() {
  const isInitialized = AppDataSource.isInitialized;
  const dataSource = isInitialized ? AppDataSource : await AppDataSource.initialize();

  try {
    console.log('Checking for pending migrations...');
    const pendingMigrations = await dataSource.showMigrations(); // TypeORM v0.3+

    if (!pendingMigrations) {
      // Check if the method returns false or equivalent for no pending migrations
      console.log('✅ All migrations are up to date.');
      return [];
    }
    // Note: showMigrations might just return true/false or list pending ones.
    // runMigrations executes them regardless if showMigrations indicates pending ones.

    console.log('📦 Pending migrations found, running...');
    const executedMigrations = await dataSource.runMigrations();

    if (executedMigrations.length > 0) {
      console.log(`✅ ${executedMigrations.length} migration(s) successfully applied:`);
      executedMigrations.forEach(m => console.log(`   - ${m.name}`));
    } else {
      console.log('✅ No migrations needed to be applied (or runMigrations returned empty).');
    }

    return executedMigrations;
  } catch (error) {
    console.error('❌ Error during migration run:', error);
    throw error; // Re-throw to indicate failure
  } finally {
    // Only destroy if we initialized it within this function
    if (!isInitialized && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// --- DO NOT add `if (require.main === module)` here ---
// This file is primarily for configuration export.
// Execute migrations using TypeORM CLI commands (e.g., `typeorm migration:run -d path/to/compiled/ormconfig.js`)
// Execute seeding using a separate script file.
