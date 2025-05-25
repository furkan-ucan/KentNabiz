import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthHelper } from './auth-helper';
import TestDataSource from '../src/config/test-data-source';
import { TeamStatus } from '../../../packages/shared/src/types/team.types';

describe('Team Management E2E', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let createdTeamId: number;
  let testDepartmentId: number;
  let testSpecializationId: number;
  let testUserId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same validation pipe as in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      })
    );

    await app.init();
    authHelper = new AuthHelper();

    // Get test data IDs from seeded data
    const departmentRepo = TestDataSource.getRepository('Department');
    const departments = await departmentRepo.find();
    testDepartmentId = departments[0]?.id || 1;

    const specializationRepo = TestDataSource.getRepository('Specialization');
    const specializations = await specializationRepo.find();
    testSpecializationId = specializations[0]?.id || 1;

    const userRepo = TestDataSource.getRepository('User');
    const users = await userRepo.find();
    testUserId = users.find((u: any) => u.email === 'teammember@test.com')?.id || 3;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Team CRUD Operations', () => {
    it('1. Should create a new team (DEPARTMENT_SUPERVISOR)', async () => {
      const createTeamDto = {
        name: 'Emergency Response Team Alpha',
        departmentId: testDepartmentId,
        teamLeaderId: AuthHelper.TEST_USERS.DEPARTMENT_SUPERVISOR.id,
        baseLocation: {
          type: 'Point',
          coordinates: [29.0, 41.0],
        },
      };

      const response = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .send(createTeamDto)
        .expect(201);

      expect(response.body.data).toMatchObject({
        name: 'Emergency Response Team Alpha',
        departmentId: testDepartmentId,
        teamLeaderId: AuthHelper.TEST_USERS.DEPARTMENT_SUPERVISOR.id,
        status: TeamStatus.AVAILABLE,
      });

      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.baseLocation).toMatchObject({
        type: 'Point',
        coordinates: [29.0, 41.0],
      });

      createdTeamId = response.body.data.id;
      expect(createdTeamId).toBeDefined();
      expect(typeof createdTeamId).toBe('number');
    });

    it('2. Should get team by ID (DEPARTMENT_SUPERVISOR)', async () => {
      expect(createdTeamId).toBeDefined();
      expect(typeof createdTeamId).toBe('number');

      const response = await request(app.getHttpServer())
        .get(`/teams/${createdTeamId}`)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: createdTeamId,
        name: 'Emergency Response Team Alpha',
        departmentId: testDepartmentId,
        status: TeamStatus.AVAILABLE,
      });
    });

    it('3. Should update team details (DEPARTMENT_SUPERVISOR)', async () => {
      expect(createdTeamId).toBeDefined();
      expect(typeof createdTeamId).toBe('number');

      const updateTeamDto = {
        name: 'Emergency Response Team Alpha - Updated',
        status: TeamStatus.ON_DUTY,
      };

      const response = await request(app.getHttpServer())
        .patch(`/teams/${createdTeamId}`)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .send(updateTeamDto)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: createdTeamId,
        name: 'Emergency Response Team Alpha - Updated',
        status: TeamStatus.ON_DUTY,
      });
    });

    it('4. Should list teams with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/teams?page=1&limit=10')
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Should include our created team
      const ourTeam = response.body.data.find((team: { id: number }) => team.id === createdTeamId);
      expect(ourTeam).toBeDefined();
    });

    it('5. Should get teams by department', async () => {
      const response = await request(app.getHttpServer())
        .get(`/teams/department/${testDepartmentId}`)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);

      // All teams should belong to the specified department
      response.body.data.forEach((team: { departmentId: number }) => {
        expect(team.departmentId).toBe(testDepartmentId);
      });
    });
  });

  describe('Team Member Management', () => {
    it('1. Should add member to team (DEPARTMENT_SUPERVISOR)', async () => {
      expect(createdTeamId).toBeDefined();
      expect(testUserId).toBeDefined();
      expect(typeof createdTeamId).toBe('number');
      expect(typeof testUserId).toBe('number');

      const response = await request(app.getHttpServer())
        .post(`/teams/${createdTeamId}/members/${testUserId}`)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .expect(200);

      // The response should be the updated team or confirmation
      expect(response.body.data).toBeDefined();
    });

    it('2. Should get team members', async () => {
      expect(createdTeamId).toBeDefined();
      expect(typeof createdTeamId).toBe('number');

      const response = await request(app.getHttpServer())
        .get(`/teams/${createdTeamId}/members`)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);

      // Should include the member we just added
      const addedMember = response.body.data.find(
        (member: { id: number }) => member.id === testUserId
      );
      expect(addedMember).toBeDefined();
    });

    it('3. Should remove member from team (DEPARTMENT_SUPERVISOR)', async () => {
      expect(createdTeamId).toBeDefined();
      expect(testUserId).toBeDefined();
      expect(typeof createdTeamId).toBe('number');
      expect(typeof testUserId).toBe('number');

      await request(app.getHttpServer())
        .delete(`/teams/${createdTeamId}/members/${testUserId}`)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .expect(200);

      // Verify member was removed
      const response = await request(app.getHttpServer())
        .get(`/teams/${createdTeamId}/members`)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .expect(200);

      const removedMember = response.body.data.find(
        (member: { id: number }) => member.id === testUserId
      );
      expect(removedMember).toBeUndefined();
    });
  });

  describe('Team Specialization Management', () => {
    it('1. Should add specialization to team (DEPARTMENT_SUPERVISOR)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/teams/${createdTeamId}/specializations/${testSpecializationId}`)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('2. Should get team specializations', async () => {
      const response = await request(app.getHttpServer())
        .get(`/teams/${createdTeamId}/specializations`)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);

      // Should include the specialization we just added
      const addedSpecialization = response.body.data.find(
        (spec: { id: number }) => spec.id === testSpecializationId
      );
      expect(addedSpecialization).toBeDefined();
    });

    it('3. Should remove specialization from team (DEPARTMENT_SUPERVISOR)', async () => {
      await request(app.getHttpServer())
        .delete(`/teams/${createdTeamId}/specializations/${testSpecializationId}`)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .expect(204);

      // Verify specialization was removed
      const response = await request(app.getHttpServer())
        .get(`/teams/${createdTeamId}/specializations`)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .expect(200);

      const removedSpecialization = response.body.data.find(
        (spec: { id: number }) => spec.id === testSpecializationId
      );
      expect(removedSpecialization).toBeUndefined();
    });
  });

  describe('Location and Proximity Features', () => {
    it('Should find nearby teams', async () => {
      const response = await request(app.getHttpServer())
        .get('/teams/nearby?lat=41.0&lng=29.0&specializationId=' + testSpecializationId)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);

      // Teams should be sorted by distance (closest first)
      if (response.body.data.length > 1) {
        // Verify that teams have location data
        response.body.data.forEach(
          (team: { baseLocation?: { type: string; coordinates: number[] } }) => {
            if (team.baseLocation) {
              expect(team.baseLocation.type).toBe('Point');
              expect(Array.isArray(team.baseLocation.coordinates)).toBe(true);
              expect(team.baseLocation.coordinates.length).toBe(2);
            }
          }
        );
      }
    });
  });

  describe('Authorization Tests', () => {
    it('Should deny team creation for TEAM_MEMBER', async () => {
      const createTeamDto = {
        name: 'Unauthorized Team',
        departmentId: testDepartmentId,
        teamLeaderId: AuthHelper.TEST_USERS.DEPARTMENT_SUPERVISOR.id,
        baseLocation: {
          type: 'Point',
          coordinates: [29.0, 41.0],
        },
      };

      await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authHelper.getTeamMemberToken()}`)
        .send(createTeamDto)
        .expect(403);
    });

    it('Should deny team member addition for TEAM_MEMBER', async () => {
      await request(app.getHttpServer())
        .post(`/teams/${createdTeamId}/members/${testUserId}`)
        .set('Authorization', `Bearer ${authHelper.getTeamMemberToken()}`)
        .expect(403);
    });

    it('Should allow SYSTEM_ADMIN to access any team', async () => {
      const response = await request(app.getHttpServer())
        .get(`/teams/${createdTeamId}`)
        .set('Authorization', `Bearer ${authHelper.getSystemAdminToken()}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: createdTeamId,
        name: 'Emergency Response Team Alpha',
        departmentId: testDepartmentId,
        status: TeamStatus.AVAILABLE,
      });
    });

    it('Should deny access without authentication', async () => {
      await request(app.getHttpServer()).get(`/teams/${createdTeamId}`).expect(401);
    });
  });

  describe('Validation Tests', () => {
    it('Should reject invalid team creation data', async () => {
      const invalidTeamDto = {
        name: '', // Empty name should fail
        departmentId: 'invalid', // Should be number
        teamLeaderId: 'invalid', // Should be number
        baseLocation: {
          type: 'InvalidType', // Should be 'Point'
          coordinates: [29.0], // Should have 2 coordinates
        },
      };

      await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .send(invalidTeamDto)
        .expect(400);
    });

    it('Should reject invalid team status update', async () => {
      const invalidUpdateDto = {
        status: 'INVALID_STATUS', // Invalid enum value
      };

      await request(app.getHttpServer())
        .patch(`/teams/${createdTeamId}`)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .send(invalidUpdateDto)
        .expect(400);
    });

    it('Should reject adding non-existent user to team', async () => {
      const nonExistentUserId = 99999;

      await request(app.getHttpServer())
        .post(`/teams/${createdTeamId}/members/${nonExistentUserId}`)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .expect(404);
    });

    it('Should reject adding non-existent specialization to team', async () => {
      const nonExistentSpecializationId = 99999;

      await request(app.getHttpServer())
        .post(`/teams/${createdTeamId}/specializations/${nonExistentSpecializationId}`)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .expect(404);
    });

    it('Should reject invalid coordinates in nearby search', async () => {
      await request(app.getHttpServer())
        .get('/teams/nearby?lat=invalid&lng=29.0')
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .expect(400);
    });
  });

  describe('Team Deletion', () => {
    it('Should delete team (DEPARTMENT_SUPERVISOR)', async () => {
      await request(app.getHttpServer())
        .delete(`/teams/${createdTeamId}`)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .expect(204);

      // Verify team was deleted
      await request(app.getHttpServer())
        .get(`/teams/${createdTeamId}`)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .expect(404);
    });

    it('Should handle deletion of non-existent team gracefully', async () => {
      const nonExistentTeamId = 99999;

      await request(app.getHttpServer())
        .delete(`/teams/${nonExistentTeamId}`)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .expect(404);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('Should handle team operations with invalid IDs', async () => {
      const invalidId = 'not-a-number';

      await request(app.getHttpServer())
        .get(`/teams/${invalidId}`)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .expect(400);
    });

    it('Should handle concurrent team member additions gracefully', async () => {
      // Create a new team for this test
      const createTeamDto = {
        name: 'Concurrent Test Team',
        departmentId: testDepartmentId,
        teamLeaderId: AuthHelper.TEST_USERS.DEPARTMENT_SUPERVISOR.id,
      };

      const teamResponse = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .send(createTeamDto)
        .expect(201);

      const newTeamId = teamResponse.body.id;

      // Try to add the same user twice (should handle gracefully)
      const addMemberPromise1 = request(app.getHttpServer())
        .post(`/teams/${newTeamId}/members/${testUserId}`)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`);

      const addMemberPromise2 = request(app.getHttpServer())
        .post(`/teams/${newTeamId}/members/${testUserId}`)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`);

      const [response1, response2] = await Promise.allSettled([
        addMemberPromise1,
        addMemberPromise2,
      ]);

      // At least one should succeed, one might fail with conflict
      const responses = [response1, response2].map(r =>
        r.status === 'fulfilled' ? r.value.status : null
      );

      expect(responses).toContain(200); // At least one success

      // Clean up
      await request(app.getHttpServer())
        .delete(`/teams/${newTeamId}`)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`);
    });
  });
});
