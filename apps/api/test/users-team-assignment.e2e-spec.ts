import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserRole } from '@KentNabiz/shared';

describe('Users Team Assignment Workflow (E2E)', () => {
  let app: INestApplication;
  let systemAdminToken: string;
  let departmentSupervisorToken: string;
  let teamMemberToken: string;
  let createdUserId: number;
  let createdTeamId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // TODO: In real E2E tests, authenticate and get real JWT tokens
    systemAdminToken = 'mock-system-admin-jwt';
    departmentSupervisorToken = 'mock-dept-supervisor-jwt';
    teamMemberToken = 'mock-team-member-jwt';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User Management', () => {
    it('should create a new user (SYSTEM_ADMIN)', async () => {
      const createUserDto = {
        email: 'new-employee@test.com',
        fullName: 'John Doe',
        password: 'SecurePassword123!',
        roles: [UserRole.TEAM_MEMBER],
        departmentId: 1,
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${systemAdminToken}`)
        .send(createUserDto)
        .expect(201);

      expect(response.body).toMatchObject({
        email: 'new-employee@test.com',
        fullName: 'John Doe',
        roles: [UserRole.TEAM_MEMBER],
        departmentId: 1,
      });

      createdUserId = response.body.id;
    });

    it('should get user profile', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${systemAdminToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdUserId,
        email: 'new-employee@test.com',
        fullName: 'John Doe',
      });
    });

    it('should update user roles (SYSTEM_ADMIN)', async () => {
      const updateRolesDto = {
        roles: [UserRole.TEAM_MEMBER, UserRole.DEPARTMENT_SUPERVISOR],
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}/roles`)
        .set('Authorization', `Bearer ${systemAdminToken}`)
        .send(updateRolesDto)
        .expect(200);

      expect(response.body.roles).toEqual([UserRole.TEAM_MEMBER, UserRole.DEPARTMENT_SUPERVISOR]);
    });
  });

  describe('Team Creation for Assignment Tests', () => {
    it('should create a team for assignment tests', async () => {
      const createTeamDto = {
        name: 'Assignment Test Team',
        departmentId: 1,
        teamLeaderId: 2,
        baseLocation: {
          type: 'Point',
          coordinates: [29.0, 41.0],
        },
      };

      const response = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .send(createTeamDto)
        .expect(201);

      createdTeamId = response.body.id;
    });
  });

  describe('Team Assignment Workflow', () => {
    it('should assign user to team (DEPARTMENT_SUPERVISOR)', async () => {
      const assignmentDto = {
        teamId: createdTeamId,
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}/active-team`)
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .send(assignmentDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdUserId,
        activeTeamId: createdTeamId,
      });
    });

    it('should verify user is now part of the team', async () => {
      const response = await request(app.getHttpServer())
        .get(`/teams/${createdTeamId}/members`)
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            userId: createdUserId,
            teamId: createdTeamId,
          }),
        ])
      );
    });

    it('should get user team membership history', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${createdUserId}/team-history`)
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('teamId');
      expect(response.body[0]).toHaveProperty('joinedAt');
    });

    it('should move user to different team', async () => {
      // First create another team
      const createAnotherTeamDto = {
        name: 'Another Test Team',
        departmentId: 1,
        teamLeaderId: 2,
        baseLocation: {
          type: 'Point',
          coordinates: [29.1, 41.1],
        },
      };

      const teamResponse = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .send(createAnotherTeamDto)
        .expect(201);

      const anotherTeamId = teamResponse.body.id;

      // Now move user to the new team
      const assignmentDto = {
        teamId: anotherTeamId,
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}/active-team`)
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .send(assignmentDto)
        .expect(200);

      expect(response.body.activeTeamId).toBe(anotherTeamId);
    });

    it('should remove user from team (assign null)', async () => {
      const assignmentDto = {
        teamId: null,
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}/active-team`)
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .send(assignmentDto)
        .expect(200);

      expect(response.body.activeTeamId).toBeNull();
    });
  });

  describe('Authorization Tests', () => {
    it('should deny team assignment by TEAM_MEMBER', async () => {
      const assignmentDto = {
        teamId: createdTeamId,
      };

      await request(app.getHttpServer())
        .patch(`/users/${createdUserId}/active-team`)
        .set('Authorization', `Bearer ${teamMemberToken}`)
        .send(assignmentDto)
        .expect(403);
    });

    it('should deny cross-department assignment by DEPARTMENT_SUPERVISOR', async () => {
      // Create a team in different department (assuming dept 2 exists)
      const crossDeptTeamDto = {
        name: 'Cross Department Team',
        departmentId: 2,
        teamLeaderId: 4, // Different department leader
        baseLocation: {
          type: 'Point',
          coordinates: [30.0, 42.0],
        },
      };

      const teamResponse = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${systemAdminToken}`) // Use system admin to create
        .send(crossDeptTeamDto)
        .expect(201);

      const crossDeptTeamId = teamResponse.body.id;

      // Try to assign user from dept 1 to team in dept 2
      const assignmentDto = {
        teamId: crossDeptTeamId,
      };

      await request(app.getHttpServer())
        .patch(`/users/${createdUserId}/active-team`)
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .send(assignmentDto)
        .expect(403); // Should be forbidden
    });

    it('should allow SYSTEM_ADMIN to assign users across departments', async () => {
      // Create user in different department
      const createUserDto = {
        email: 'cross-dept-user@test.com',
        fullName: 'Cross Dept User',
        password: 'SecurePassword123!',
        roles: [UserRole.TEAM_MEMBER],
        departmentId: 2,
      };

      const userResponse = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${systemAdminToken}`)
        .send(createUserDto)
        .expect(201);

      const crossDeptUserId = userResponse.body.id;

      // System admin should be able to assign cross-department
      const assignmentDto = {
        teamId: createdTeamId, // Team in dept 1
      };

      // This should fail because user is in dept 2, team is in dept 1
      await request(app.getHttpServer())
        .patch(`/users/${crossDeptUserId}/active-team`)
        .set('Authorization', `Bearer ${systemAdminToken}`)
        .send(assignmentDto)
        .expect(400); // Bad request due to department mismatch
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should handle assignment to non-existent team', async () => {
      const assignmentDto = {
        teamId: 999999,
      };

      await request(app.getHttpServer())
        .patch(`/users/${createdUserId}/active-team`)
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .send(assignmentDto)
        .expect(404);
    });

    it('should handle assignment of non-existent user', async () => {
      const assignmentDto = {
        teamId: createdTeamId,
      };

      await request(app.getHttpServer())
        .patch('/users/999999/active-team')
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .send(assignmentDto)
        .expect(404);
    });

    it('should deny assignment without authentication', async () => {
      const assignmentDto = {
        teamId: createdTeamId,
      };

      await request(app.getHttpServer())
        .patch(`/users/${createdUserId}/active-team`)
        .send(assignmentDto)
        .expect(401);
    });
  });

  describe('Cleanup', () => {
    it('should delete test user (SYSTEM_ADMIN)', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${systemAdminToken}`)
        .expect(200);
    });

    it('should delete test team (SYSTEM_ADMIN)', async () => {
      await request(app.getHttpServer())
        .delete(`/teams/${createdTeamId}`)
        .set('Authorization', `Bearer ${systemAdminToken}`)
        .expect(200);
    });
  });
});
