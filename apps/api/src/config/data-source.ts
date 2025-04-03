import 'reflect-metadata'; // Keep this for TypeORM decorators
import { DataSource } from 'typeorm';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

// Load .env file
dotenv.config();

// ESM-compatible way to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true', // Make sure DATABASE_SSL is set in your .env if needed
  synchronize: false, // Recommended to be false for production and migration-based workflows
  logging: process.env.NODE_ENV === 'development', // Log queries only in development
  // This dynamic glob pattern should correctly find your entities
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  // This dynamic glob pattern should correctly find your migrations
  migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
  // It's often good practice to explicitly set migrations table name
  // migrationsTableName: 'typeorm_migrations',
});
