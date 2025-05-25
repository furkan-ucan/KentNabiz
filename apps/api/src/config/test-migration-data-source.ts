import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Import all entities explicitly for migration
import { User } from '../modules/users/entities/user.entity';
import { Department } from '../modules/reports/entities/department.entity';
import { Team } from '../modules/teams/entities/team.entity';
import { Specialization } from '../modules/specializations/entities/specialization.entity';
import { Report } from '../modules/reports/entities/report.entity';
import { Assignment } from '../modules/reports/entities/assignment.entity';
import { ReportStatusHistory } from '../modules/reports/entities/report-status-history.entity';
import { DepartmentHistory } from '../modules/reports/entities/department-history.entity';
import { ReportCategory } from '../modules/reports/entities/report-category.entity';
import { ReportMedia } from '../modules/reports/entities/report-media.entity';
import { ReportSupport } from '../modules/reports/entities/report-support.entity';
import { TeamSpecialization } from '../modules/teams/entities/team-specialization.entity';
import { TeamMembershipHistory } from '../modules/users/entities/team-membership-history.entity';

// Load .env from project root
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Determine if running under ts-node (development) or compiled JS (production)
const isTsNode =
  process.argv.some(arg => arg.includes('ts-node')) || process.env.TS_NODE_DEV !== undefined;
const extension = isTsNode ? '.ts' : '.js';

// Paths to migrations
const migrationsPath = path.join(__dirname, '..', 'database', 'migrations', `*${extension}`);

// Test migration data source - specifically for running migrations on test DB
const TestMigrationDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'dev',
  password: process.env.DB_PASSWORD || 'dev123',
  database: 'kentnabiz_test', // Fixed test database name

  ssl: false,
  synchronize: false, // Use migrations only
  logging: false,
  entities: [
    User,
    Department,
    Team,
    Specialization,
    Report,
    Assignment,
    ReportStatusHistory,
    DepartmentHistory,
    ReportCategory,
    ReportMedia,
    ReportSupport,
    TeamSpecialization,
    TeamMembershipHistory,
  ],
  migrations: [migrationsPath],
  migrationsTableName: 'migrations',
});

export default TestMigrationDataSource;
