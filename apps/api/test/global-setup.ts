import { DataSource } from 'typeorm';
import TestMigrationDataSource from '../src/config/test-migration-data-source';
import TestDataSource from '../src/config/test-data-source';

export default async (): Promise<void> => {
  console.log('🌍 Global E2E Setup - Running migrations and seeding data...');

  let migrationRunnerSource: DataSource | undefined;
  let testDataSource: DataSource | undefined;

  try {
    // Initialize migration runner
    migrationRunnerSource = TestMigrationDataSource;
    if (!migrationRunnerSource.isInitialized) {
      await migrationRunnerSource.initialize();
    }

    console.log('🧹 Cleaning test database schema...');
    // Create a dedicated query runner to clean the schema
    const cleanupRunner = migrationRunnerSource.createQueryRunner();
    await cleanupRunner.query(`DROP SCHEMA IF EXISTS public CASCADE`);
    await cleanupRunner.query(`CREATE SCHEMA public`);
    await cleanupRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
    await cleanupRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis_topology`);
    await cleanupRunner.query(`CREATE EXTENSION IF NOT EXISTS fuzzystrmatch`);
    await cleanupRunner.release();
    console.log('✅ Test database schema cleaned successfully.');

    console.log('🔄 Running migrations on test database...');
    const executedMigrations = await migrationRunnerSource.runMigrations();
    console.log('✅ Migrations completed successfully.');
    if (executedMigrations && executedMigrations.length > 0) {
      console.log('Executed migrations:');
      executedMigrations.forEach(m => console.log(`  - ${m.name}`));
    } else {
      console.log('No pending migrations to run.');
    }
    console.log(`Total executed: ${executedMigrations.length} migrations.`);

    // Close migration runner
    if (migrationRunnerSource && migrationRunnerSource.isInitialized) {
      await migrationRunnerSource.destroy();
    }

    // Initialize test data source
    testDataSource = TestDataSource;
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
    }

    console.log('✅ Test data source initialized.');

    // Close test data source
    if (testDataSource && testDataSource.isInitialized) {
      await testDataSource.destroy();
    }

    console.log('🎉 Global E2E Setup completed successfully!');
  } catch (error) {
    console.error('❌ Global E2E Setup failed:', error);

    // Cleanup on error
    if (migrationRunnerSource && migrationRunnerSource.isInitialized) {
      await migrationRunnerSource.destroy();
    }
    if (testDataSource && testDataSource.isInitialized) {
      await testDataSource.destroy();
    }

    throw new Error(error instanceof Error ? error.message : 'Unknown error during global setup');
  }
};
