import { DataSource } from 'typeorm';
import TestDataSource from '../src/config/test-data-source';
import { User } from '../src/modules/users/entities/user.entity';
import { Department } from '../src/modules/reports/entities/department.entity';
import { Team } from '../src/modules/teams/entities/team.entity';
import { Specialization } from '../src/modules/specializations/entities/specialization.entity';
import {
  UserRole,
  TeamStatus,
  MunicipalityDepartment,
  AssigneeType,
  AssignmentStatus,
  ReportStatus,
} from '@KentNabiz/shared';
import { ReportType } from '@KentNabiz/shared';
import * as bcrypt from 'bcryptjs';

export const clearDatabase = async (dataSource: DataSource): Promise<void> => {
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
    'migrations', // Migration tablosunu da temizle ki migration'lar tekrar çalışsın
  ];

  for (const tableName of tablesToClear) {
    try {
      await dataSource.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`);
    } catch (error: unknown) {
      // Ignore errors for tables that don't exist or are already empty
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`Warning: Could not truncate table ${tableName}:`, errorMessage);
    }
  }
};

export const seedTestData = async (dataSource?: DataSource): Promise<void> => {
  const testDataSource = dataSource || TestDataSource;

  // Clear existing data first
  await clearDatabase(testDataSource);

  // Create departments
  const departmentRepo = testDataSource.getRepository(Department);
  const departments = await departmentRepo.save([
    {
      name: 'Genel İşler',
      code: MunicipalityDepartment.GENERAL,
      description: 'Genel işler departmanı',
      isActive: true,
      responsibleReportTypes: [ReportType.OTHER],
    },
    {
      name: 'Yollar ve Altyapı',
      code: MunicipalityDepartment.ROADS,
      description: 'Yollar ve altyapı departmanı',
      isActive: true,
      responsibleReportTypes: [
        ReportType.POTHOLE,
        ReportType.ROAD_DAMAGE,
        ReportType.ROAD_MAINTENANCE,
      ],
    },
    {
      name: 'Parklar ve Bahçeler',
      code: MunicipalityDepartment.PARKS,
      description: 'Parklar ve bahçeler departmanı',
      isActive: true,
      responsibleReportTypes: [ReportType.PARK_DAMAGE, ReportType.TREE_ISSUE],
    },
    {
      name: 'Sağlık Birimi',
      code: MunicipalityDepartment.HEALTH,
      description: 'Sağlık ile ilgili şikayetlerin yönlendirildiği birim',
      isActive: true,
      responsibleReportTypes: [ReportType.OTHER],
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

  // Create test teams first (so we can use team id for activeTeamId)
  const teamRepo = testDataSource.getRepository(Team);
  const testTeams = await teamRepo.save([
    {
      name: 'Test Emergency Team',
      departmentId: departments[0].id,
      status: TeamStatus.AVAILABLE,
      baseLocation: { type: 'Point', coordinates: [29.0, 41.0] },
    },
    {
      name: 'Test Roads Team',
      departmentId: departments[1].id,
      status: TeamStatus.AVAILABLE,
      baseLocation: { type: 'Point', coordinates: [29.1, 41.1] },
    },
  ]);

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
      email: 'team.member@test.com',
      fullName: 'Test TeamMember',
      password: hashedPassword,
      roles: [UserRole.TEAM_MEMBER],
      departmentId: departments[0].id,
      activeTeamId: testTeams[0].id,
      isEmailVerified: true,
    },
    {
      email: 'admin@test.com',
      fullName: 'Test Admin',
      password: hashedPassword,
      roles: [UserRole.SYSTEM_ADMIN],
    },
  ]);

  // Create test reports first (needed for assignments)
  const reportRepo = testDataSource.getRepository('reports');
  const testReports = await reportRepo.save([
    {
      title: 'Test Report 1',
      description: 'Test report for assignments',
      location: { type: 'Point', coordinates: [29.0, 41.0] },
      address: 'Test Address 1',
      reportType: ReportType.OTHER,
      status: ReportStatus.IN_PROGRESS,
      currentDepartmentId: departments[0].id,
      userId: users[0].id, // citizen@test.com
    },
    {
      title: 'Test Report 2',
      description: 'Another test report',
      location: { type: 'Point', coordinates: [29.1, 41.1] },
      address: 'Test Address 2',
      reportType: ReportType.ROAD_DAMAGE,
      status: ReportStatus.OPEN,
      currentDepartmentId: departments[1].id,
      userId: users[0].id, // citizen@test.com
    },
  ]);

  // Create team membership history for team member
  const teamMembershipRepo = testDataSource.getRepository('team_membership_history');
  await teamMembershipRepo
    .createQueryBuilder()
    .insert()
    .values([
      {
        userId: users[2].id, // team.member@test.com
        teamId: testTeams[0].id, // Test Emergency Team
        joinedAt: new Date(),
        roleInTeam: 'MEMBER',
      },
    ])
    .orIgnore()
    .execute();

  // Create assignments for test reports with conflict handling
  const assignmentRepo = testDataSource.getRepository('assignments');
  await assignmentRepo
    .createQueryBuilder()
    .insert()
    .values([
      {
        reportId: testReports[0].id,
        assigneeType: AssigneeType.USER,
        assigneeUserId: users[2].id, // team.member@test.com
        assignedById: users[1].id, // supervisor@test.com
        assignmentStatus: AssignmentStatus.ACTIVE,
        assignedAt: new Date(),
        acceptedAt: new Date(), // Important: set acceptedAt for active assignments
      },
      {
        reportId: testReports[1].id, // Use different report to avoid unique constraint
        assigneeType: AssigneeType.TEAM,
        assigneeTeamId: testTeams[0].id, // Test Emergency Team
        assignedById: users[1].id, // supervisor@test.com
        assignmentStatus: AssignmentStatus.ACTIVE,
        assignedAt: new Date(),
        acceptedAt: new Date(),
      },
    ])
    .orIgnore()
    .execute();

  console.log('✅ Test data seeded successfully');
};
