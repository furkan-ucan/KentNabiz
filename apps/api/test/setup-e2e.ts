import { DataSource } from 'typeorm';
import TestDataSource from '../src/config/test-data-source';

let testDataSource: DataSource;

beforeAll(async () => {
  console.log('🧪 Setting up E2E test environment...');

  // Initialize test data source (migrations and seeding are done in globalSetup)
  testDataSource = TestDataSource;
  if (!testDataSource.isInitialized) {
    await testDataSource.initialize();
  }

  console.log('✅ E2E test environment ready (using globally seeded data).');
}, 30000);

afterAll(async () => {
  console.log('🧹 E2E test environment cleaned up');
  if (testDataSource && testDataSource.isInitialized) {
    await testDataSource.destroy();
  }
});

export { testDataSource };
