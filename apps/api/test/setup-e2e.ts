import { DataSource } from 'typeorm';
import testConfig from '../config/test-data-source';

let testDataSource: DataSource;

beforeAll(async () => {
  console.log('🧪 Setting up E2E test environment...');
  testDataSource = new DataSource(testConfig);
  await testDataSource.initialize();
});

afterAll(async () => {
  console.log('🧹 E2E test environment cleaned up');
  if (testDataSource && testDataSource.isInitialized) {
    await testDataSource.destroy();
  }
});

export const clearDatabase = async (): Promise<void> => {
  // Example:
  // await testDataSource.query(
  //   'TRUNCATE report_status_history, assignments, reports, users RESTART IDENTITY CASCADE'
  // );
};

export const seedTestData = async (): Promise<void> => {
  // Example:
  // await testDataSource.getRepository(User).save({ email: 'test@a.com', ... });
};

export { testDataSource };
