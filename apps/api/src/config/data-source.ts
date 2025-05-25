// apps/api/src/config/data-source.ts
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm'; // Use import
import * as path from 'path'; // Use import for path
import * as dotenv from 'dotenv'; // Use import for dotenv

// Load .env from project root
// Use process.cwd() to ensure it finds the root .env regardless of where CLI is run
dotenv.config({ path: path.join(process.cwd(), '.env') });

// __dirname is a valid global in CommonJS modules (what TS compiles to)
if (typeof __dirname === 'undefined') {
  // This check is good practice if you suspect execution context issues
  console.error("__dirname is undefined in data-source.ts. Ensure it's run in a CJS context.");
  process.exit(1);
}

// Determine if running under ts-node (development) or compiled JS (production)
const isTsNode =
  process.argv.some(arg => arg.includes('ts-node')) || process.env.TS_NODE_DEV !== undefined;
const extension = isTsNode ? '.ts' : '.js';

// Paths to COMPILED .js files relative to dist/config/
const entitiesPath = path.join(__dirname, '..', 'modules', '**', `*.entity${extension}`);
const migrationsPath = path.join(__dirname, '..', 'database', 'migrations', `*${extension}`);

// Define options with TypeORM type
const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  // Prefer individual env vars over DATABASE_URL if both might be set, for clarity
  host: process.env.DB_HOST || 'localhost', // Default if not set
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres', // Ensure this is in .env!
  database: process.env.DB_DATABASE || 'kentnabiz',

  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false, // Example SSL based on env
  synchronize: false, // MUST be false for migrations
  logging: process.env.NODE_ENV === 'development', // Log SQL in dev
  entities: [entitiesPath],
  migrations: [migrationsPath],
  migrationsTableName: 'migrations', // Explicit table name
  // metadataTableName: 'typeorm_metadata', // Usually not needed unless migrating from older versions
};

// Create the DataSource instance
const AppDataSource = new DataSource(dataSourceOptions);

// Use `export default` for direct CommonJS compatibility (module.exports = AppDataSource)
// This makes it easy to require/import in other TS/JS files compiled to CJS.
export default AppDataSource;
