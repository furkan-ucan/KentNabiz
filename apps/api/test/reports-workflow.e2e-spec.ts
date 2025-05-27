// Set test environment variables for JWT BEFORE any imports
process.env.JWT_SECRET = 'test-jwt-secret-for-e2e-tests-fixed';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-for-e2e-tests-fixed';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ReportType, MunicipalityDepartment } from '@KentNabiz/shared';
import { AuthHelper } from './auth-helper';

describe('Reports Workflow (E2E)', () => {
  let app: INestApplication;
  let sauthHelper: AuthHelper;
  let createdReportId: number;

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
    sauthHelper = new AuthHelper();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Report Creation', () => {
    it('should create a new report (CITIZEN)', async () => {
      const createReportDto = {
        title: 'Pothole on Main Street',
        description: 'Large pothole causing traffic issues',
        reportType: ReportType.POTHOLE,
        location: {
          latitude: 41.0,
          longitude: 29.0,
        },
        address: '123 Main Street, Istanbul',
      };

      const response = await request(app.getHttpServer())
        .post('/reports')
        .set('Authorization', `Bearer ${sauthHelper.getCitizenToken()}`)
        .send(createReportDto)
        .expect(201);

      expect(response.body.data).toMatchObject({
        title: 'Pothole on Main Street',
        description: 'Large pothole causing traffic issues',
        reportType: ReportType.POTHOLE,
        status: 'OPEN',
      });

      createdReportId = response.body.data.id;
      expect(createdReportId).toBeDefined();
      expect(typeof createdReportId).toBe('number');
    });

    it('should get report by id', async () => {
      expect(createdReportId).toBeDefined();
      expect(typeof createdReportId).toBe('number');

      const response = await request(app.getHttpServer())
        .get(`/reports/${createdReportId}`)
        .set('Authorization', `Bearer ${sauthHelper.getCitizenToken()}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: createdReportId,
        title: 'Pothole on Main Street',
        status: 'OPEN',
      });
    });

    it('should list reports with filters and pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports?page=1&limit=10&status=OPEN&reportType=POTHOLE')
        .set('Authorization', `Bearer ${sauthHelper.getSupervisorToken()}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('limit', 10);
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('should search reports by location radius', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports/nearby?latitude=41.0&longitude=29.0&radius=5000')
        .set('Authorization', `Bearer ${sauthHelper.getSupervisorToken()}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data.data).toHaveProperty('data');
      expect(response.body.data.data).toHaveProperty('total');
      expect(response.body.data.data).toHaveProperty('page');
      expect(response.body.data.data).toHaveProperty('limit');
      expect(Array.isArray(response.body.data.data.data)).toBe(true);
    });
  });

  describe('Report Assignment', () => {
    it('should assign report to team (DEPARTMENT_SUPERVISOR)', async () => {
      expect(createdReportId).toBeDefined();
      expect(typeof createdReportId).toBe('number');

      const assignToTeamDto = {
        teamId: 1,
      };

      const response = await request(app.getHttpServer())
        .patch(`/reports/${createdReportId}/assign-team/1`)
        .set('Authorization', `Bearer ${sauthHelper.getSupervisorToken()}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('assignments');
      expect(response.body.data.assignments).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            assigneeType: 'TEAM',
            assigneeTeamId: 1,
            status: 'ACTIVE',
          }),
        ])
      );
    });

    it('should assign report to user (DEPARTMENT_SUPERVISOR)', async () => {
      expect(createdReportId).toBeDefined();
      expect(typeof createdReportId).toBe('number');

      const response = await request(app.getHttpServer())
        .patch(`/reports/${createdReportId}/assign-user/3`)
        .set('Authorization', `Bearer ${sauthHelper.getSupervisorToken()}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('assignments');
      expect(response.body.data.assignments).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            assigneeType: 'USER',
            assigneeUserId: 3,
            status: 'ACTIVE',
          }),
        ])
      );
    });

    it('should deny assignment by unauthorized user', async () => {
      expect(createdReportId).toBeDefined();
      expect(typeof createdReportId).toBe('number');

      await request(app.getHttpServer())
        .patch(`/reports/${createdReportId}/assign-team/1`)
        .set('Authorization', `Bearer ${sauthHelper.getCitizenToken()}`)
        .expect(403);
    });
  });

  describe('Report Status Management', () => {
    let reportIdForTeamMemberTest: number;

    beforeAll(async () => {
      // Create a new report specifically for team member tests
      const createReportDto = {
        title: 'Team Member Test Report',
        description: 'Report for testing team member status updates',
        reportType: ReportType.POTHOLE,
        location: {
          latitude: 41.0,
          longitude: 29.0,
        },
        address: '456 Team Test Street, Istanbul',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/reports')
        .set('Authorization', `Bearer ${sauthHelper.getCitizenToken()}`)
        .send(createReportDto)
        .expect(201);

      reportIdForTeamMemberTest = createResponse.body.data.id;

      // Assign it to team 1 (where TEAM_MEMBER belongs) and keep it assigned to team
      await request(app.getHttpServer())
        .patch(`/reports/${reportIdForTeamMemberTest}/assign-team/1`)
        .set('Authorization', `Bearer ${sauthHelper.getSupervisorToken()}`)
        .expect(200);
    });

    it('should update report status (TEAM_MEMBER)', async () => {
      expect(reportIdForTeamMemberTest).toBeDefined();
      expect(typeof reportIdForTeamMemberTest).toBe('number');

      const updateStatusDto = {
        newStatus: 'IN_PROGRESS',
        notes: 'Started working on the pothole repair',
      };

      const response = await request(app.getHttpServer())
        .patch(`/reports/${reportIdForTeamMemberTest}/status`)
        .set('Authorization', `Bearer ${sauthHelper.getTeamMemberToken()}`)
        .send(updateStatusDto)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: reportIdForTeamMemberTest,
        status: 'IN_PROGRESS',
      });
    });

    it('should update report status with sub-status', async () => {
      expect(reportIdForTeamMemberTest).toBeDefined();
      expect(typeof reportIdForTeamMemberTest).toBe('number');

      const updateStatusDto = {
        newStatus: 'DONE',
        subStatus: 'PENDING_APPROVAL',
        notes: 'Repair completed, waiting for inspection',
      };

      const response = await request(app.getHttpServer())
        .patch(`/reports/${reportIdForTeamMemberTest}/status`)
        .set('Authorization', `Bearer ${sauthHelper.getTeamMemberToken()}`)
        .send(updateStatusDto)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: reportIdForTeamMemberTest,
        status: 'IN_PROGRESS', // TEAM_MEMBER completing work sets status to IN_PROGRESS
        subStatus: 'PENDING_APPROVAL',
      });
    });

    it('should get report status history', async () => {
      expect(reportIdForTeamMemberTest).toBeDefined();
      expect(typeof reportIdForTeamMemberTest).toBe('number');

      const response = await request(app.getHttpServer())
        .get(`/reports/${reportIdForTeamMemberTest}/status-history`)
        .set('Authorization', `Bearer ${sauthHelper.getSupervisorToken()}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
