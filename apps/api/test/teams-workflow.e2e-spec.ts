import { randomBytes } from 'crypto';
import { AuthHelper } from './auth-helper';

// Set test environment variables for JWT BEFORE any imports
process.env.JWT_SECRET = 'test-jwt-secret-for-e2e-tests-fixed';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-for-e2e-tests-fixed';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserRole } from '@KentNabiz/shared';

describe('Teams Workflow (E2E)', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let systemAdminToken: string;
  let departmentSupervisorToken: string;
  let teamMemberToken: string;
  let createdTeamId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Initialize AuthHelper and generate tokens
    authHelper = new AuthHelper();
    systemAdminToken = authHelper.getSystemAdminToken();
    departmentSupervisorToken = authHelper.getSupervisorToken();
    teamMemberToken = authHelper.getTeamMemberToken();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Team CRUD Operations', () => {
    it('should create a new team (DEPARTMENT_SUPERVISOR)', async () => {
      const createTeamDto = {
        name: 'Emergency Response Team',
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

      expect(response.body.data).toMatchObject({
        name: 'Emergency Response Team',
        departmentId: 1,
        status: 'AVAILABLE',
      });

      createdTeamId = response.body.data.id;
    });

    it('should get team by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/teams/${createdTeamId}`)
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: createdTeamId,
        name: 'Emergency Response Team',
        departmentId: 1,
      });
    });

    it('should update team details (DEPARTMENT_SUPERVISOR)', async () => {
      const updateTeamDto = {
        name: 'Updated Emergency Response Team',
        status: 'ON_DUTY',
      };

      const response = await request(app.getHttpServer())
        .patch(`/teams/${createdTeamId}`)
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .send(updateTeamDto)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: createdTeamId,
        name: 'Updated Emergency Response Team',
        status: 'ON_DUTY', // Fixed enum value
      });
    });

    it('should list teams with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/teams?page=1&limit=10')
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      // Note: API returns simple array, not paginated response
    });
  });

  describe('Team Member Management', () => {
    it('should add member to team (DEPARTMENT_SUPERVISOR)', async () => {
      const addMemberDto = {
        userId: 3,
        specializations: ['ELECTRICAL', 'PLUMBING'],
      };

      const response = await request(app.getHttpServer())
        .post(`/teams/${createdTeamId}/members`)
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .send(addMemberDto)
        .expect(201);

      expect(response.body.data).toMatchObject({
        teamId: createdTeamId,
        userId: 3,
        specializations: ['ELECTRICAL', 'PLUMBING'],
      });
    });

    it('should get team members', async () => {
      const response = await request(app.getHttpServer())
        .get(`/teams/${createdTeamId}/members`)
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should update member specializations', async () => {
      const updateMemberDto = {
        specializations: ['ELECTRICAL', 'CARPENTRY'],
      };

      const response = await request(app.getHttpServer())
        .patch(`/teams/${createdTeamId}/members/3`)
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .send(updateMemberDto)
        .expect(200);

      expect(response.body.data.specializations).toEqual(['ELECTRICAL', 'CARPENTRY']);
    });

    it('should remove member from team (DEPARTMENT_SUPERVISOR)', async () => {
      await request(app.getHttpServer())
        .delete(`/teams/${createdTeamId}/members/3`)
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .expect(200);
    });
  });

  describe('Authorization Tests', () => {
    it('should deny team creation for TEAM_MEMBER', async () => {
      const createTeamDto = {
        name: 'Unauthorized Team',
        departmentId: 1,
        teamLeaderId: 2,
        baseLocation: {
          type: 'Point',
          coordinates: [29.0, 41.0],
        },
      };

      await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${teamMemberToken}`)
        .send(createTeamDto)
        .expect(403);
    });

    it('should allow SYSTEM_ADMIN to access any team', async () => {
      const response = await request(app.getHttpServer())
        .get(`/teams/${createdTeamId}`)
        .set('Authorization', `Bearer ${systemAdminToken}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdTeamId);
    });

    it('should deny access without authentication', async () => {
      await request(app.getHttpServer()).get(`/teams/${createdTeamId}`).expect(401);
    });
  });

  describe('Team Location Management', () => {
    it('should update team location', async () => {
      const updateLocationDto = {
        currentLocation: {
          type: 'Point',
          coordinates: [29.1, 41.1],
        },
      };

      const response = await request(app.getHttpServer())
        .patch(`/teams/${createdTeamId}/location`)
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .send(updateLocationDto)
        .expect(200);

      expect(response.body.data.currentLocation).toMatchObject({
        type: 'Point',
        coordinates: [29.1, 41.1],
      });
    });

    it('should get teams by location radius', async () => {
      const response = await request(app.getHttpServer())
        .get('/teams/nearby?lat=29.0&lng=41.0&radius=1000')
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Team Cleanup', () => {
    it('should delete team (SYSTEM_ADMIN)', async () => {
      await request(app.getHttpServer())
        .delete(`/teams/${createdTeamId}`)
        .set('Authorization', `Bearer ${systemAdminToken}`)
        .expect(204);
    });

    it('should confirm team is deleted', async () => {
      await request(app.getHttpServer())
        .get(`/teams/${createdTeamId}`)
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .expect(404);
    });
  });
});
