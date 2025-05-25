import { DataSource } from 'typeorm';
import TestDataSource from '../src/config/test-data-source';
import { User } from '../src/modules/users/entities/user.entity';
import { Department } from '../src/modules/reports/entities/department.entity';
import { Team } from '../src/modules/teams/entities/team.entity';
import { Specialization } from '../src/modules/specializations/entities/specialization.entity';
import { UserRole, TeamStatus, MunicipalityDepartment } from '@KentNabiz/shared';
import * as bcrypt from 'bcryptjs';

let testDataSource: DataSource;

beforeAll(async () => {
  console.log('🧪 Setting up E2E test environment...');
  testDataSource = TestDataSource;

  if (!testDataSource.isInitialized) {
    await testDataSource.initialize();
  }

  // Seed test data
  await seedTestData();
});

afterAll(async () => {
  console.log('🧹 E2E test environment cleaned up');
  if (testDataSource && testDataSource.isInitialized) {
    await testDataSource.destroy();
  }
});

export const clearDatabase = async (): Promise<void> => {
  // Clear tables in the correct order to avoid foreign key constraint errors
  const tablesToClear = [
    'assignments',
    'report_status_history',
    'department_history',
    'report_medias',
    'reports',
    'team_membership_history',
    'team_specializations',
    'teams',
    'specializations',
    'users',
    'departments',
    'report_categories',
    'media',
  ];

  for (const tableName of tablesToClear) {
    try {
      await testDataSource.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`);
    } catch (error: unknown) {
      // Ignore errors for tables that don't exist or are already empty
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`Warning: Could not truncate table ${tableName}:`, errorMessage);
    }
  }
};

export const seedTestData = async (): Promise<void> => {
  // Clear existing data first
  await clearDatabase();

  // Create departments
  const departmentRepo = testDataSource.getRepository(Department);
  const departments = await departmentRepo.save([
    {
      name: 'Genel İşler',
      code: MunicipalityDepartment.GENERAL,
      description: 'Genel işler departmanı',
    },
    {
      name: 'Yollar ve Altyapı',
      code: MunicipalityDepartment.ROADS,
      description: 'Yollar ve altyapı departmanı',
    },
    {
      name: 'Parklar ve Bahçeler',
      code: MunicipalityDepartment.PARKS,
      description: 'Parklar ve bahçeler departmanı',
    },
  ]);

  // Create specializations
  const specializationRepo = testDataSource.getRepository(Specialization);
  const specializations = await specializationRepo.save([
    {
      name: 'Elektrik',
      code: 'ELECTRICAL',
      description: 'Elektrik işleri',
      typicalDepartmentCode: departments[0].code,
    },
    {
      name: 'Tesisatçılık',
      code: 'PLUMBING',
      description: 'Tesisatçılık işleri',
      typicalDepartmentCode: departments[0].code,
    },
    {
      name: 'Yol Bakım',
      code: 'ROAD_MAINTENANCE',
      description: 'Yol bakım işleri',
      typicalDepartmentCode: departments[1].code,
    },
  ]);

  // Create test users
  const userRepo = testDataSource.getRepository(User);
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await userRepo.save([
    {
      email: 'citizen@test.com',
      fullName: 'Test Citizen',
      password: hashedPassword,
      roles: [UserRole.CITIZEN],
    },
    {
      email: 'supervisor@test.com',
      fullName: 'Test Supervisor',
      password: hashedPassword,
      roles: [UserRole.DEPARTMENT_SUPERVISOR],
      departmentId: departments[0].id,
    },
    {
      email: 'teammember@test.com',
      fullName: 'Test TeamMember',
      password: hashedPassword,
      roles: [UserRole.TEAM_MEMBER],
      departmentId: departments[0].id,
    },
    {
      email: 'admin@test.com',
      fullName: 'Test Admin',
      password: hashedPassword,
      roles: [UserRole.SYSTEM_ADMIN],
    },
  ]);

  // Create test teams
  const teamRepo = testDataSource.getRepository(Team);
  await teamRepo.save([
    {
      name: 'Test Emergency Team',
      departmentId: departments[0].id,
      teamLeaderId: users[1].id, // supervisor
      status: TeamStatus.AVAILABLE,
      baseLocation: {
        type: 'Point',
        coordinates: [29.0, 41.0],
      },
    },
    {
      name: 'Test Roads Team',
      departmentId: departments[1].id,
      teamLeaderId: users[1].id, // supervisor
      status: TeamStatus.AVAILABLE,
      baseLocation: {
        type: 'Point',
        coordinates: [29.1, 41.1],
      },
    },
  ]);

  console.log('✅ Test data seeded successfully');
};

export { testDataSource };
