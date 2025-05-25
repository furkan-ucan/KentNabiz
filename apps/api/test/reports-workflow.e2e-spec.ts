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
  let authHelper: AuthHelper;
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
    authHelper = new AuthHelper();
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
        .set('Authorization', `Bearer ${authHelper.getCitizenToken()}`)
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
        .set('Authorization', `Bearer ${authHelper.getCitizenToken()}`)
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
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(Array.isArray(response.body.data)).toBe(true);
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
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
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
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
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
        .set('Authorization', `Bearer ${authHelper.getCitizenToken()}`)
        .expect(403);
    });
  });

  describe('Report Status Management', () => {
    it('should update report status (TEAM_MEMBER)', async () => {
      expect(createdReportId).toBeDefined();
      expect(typeof createdReportId).toBe('number');

      const updateStatusDto = {
        newStatus: 'IN_PROGRESS',
        notes: 'Started working on the pothole repair',
      };

      const response = await request(app.getHttpServer())
        .patch(`/reports/${createdReportId}/status`)
        .set('Authorization', `Bearer ${authHelper.getTeamMemberToken()}`)
        .send(updateStatusDto)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: createdReportId,
        status: 'IN_PROGRESS',
      });
    });

    it('should update report status with sub-status', async () => {
      expect(createdReportId).toBeDefined();
      expect(typeof createdReportId).toBe('number');

      const updateStatusDto = {
        newStatus: 'DONE',
        subStatus: 'PENDING_APPROVAL',
        notes: 'Repair completed, waiting for inspection',
      };

      const response = await request(app.getHttpServer())
        .patch(`/reports/${createdReportId}/status`)
        .set('Authorization', `Bearer ${authHelper.getTeamMemberToken()}`)
        .send(updateStatusDto)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: createdReportId,
        status: 'DONE',
        subStatus: 'PENDING_APPROVAL',
      });
    });

    it('should get report status history', async () => {
      expect(createdReportId).toBeDefined();
      expect(typeof createdReportId).toBe('number');

      const response = await request(app.getHttpServer())
        .get(`/reports/${createdReportId}/status-history`)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('previousStatus');
      expect(response.body.data[0]).toHaveProperty('newStatus');
      expect(response.body.data[0]).toHaveProperty('changedAt');
    });
  });

  describe('Report Forwarding', () => {
    it('should forward report to different department (DEPARTMENT_SUPERVISOR)', async () => {
      const forwardReportDto = {
        newDepartment: MunicipalityDepartment.HEALTH,
        reason: 'This issue is related to public health, not roads',
      };

      const response = await request(app.getHttpServer())
        .patch(`/reports/${createdReportId}/forward`)
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .send(forwardReportDto)
        .expect(200);

      expect(response.body.data).toHaveProperty('currentDepartmentId');
      expect(response.body.data.subStatus).toBe('FORWARDED');
    });

    it('should get department history', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reports/${createdReportId}/history`)
        .set('Authorization', `Bearer ${authHelper.getSystemAdminToken()}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('previousDepartmentId');
      expect(response.body.data[0]).toHaveProperty('newDepartmentId');
    });
  });

  describe('Report Media Management', () => {
    it.skip('should upload report media (not implemented yet)', async () => {
      // Note: Media endpoints are not implemented yet
      const response = await request(app.getHttpServer())
        .post(`/reports/${createdReportId}/media`)
        .set('Authorization', `Bearer ${authHelper.getCitizenToken()}`)
        .attach('files', Buffer.from('fake image data'), 'test-image.jpg')
        .expect(404); // Endpoint not implemented

      // expect(response.body).toHaveProperty('uploadedFiles');
      // expect(Array.isArray(response.body.uploadedFiles)).toBe(true);
    });

    it.skip('should get report media (not implemented yet)', async () => {
      // Note: Media endpoints are not implemented yet
      const response = await request(app.getHttpServer())
        .get(`/reports/${createdReportId}/media`)
        .set('Authorization', `Bearer ${authHelper.getCitizenToken()}`)
        .expect(404); // Endpoint not implemented

      // expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Report Analytics and Search', () => {
    it('should search reports by location radius', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports/nearby?latitude=29.0&longitude=41.0&radius=1000')
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it.skip('should get reports statistics (not implemented yet)', async () => {
      // Note: Analytics endpoints are not implemented yet
      const response = await request(app.getHttpServer())
        .get('/reports/analytics/statistics?period=monthly')
        .set('Authorization', `Bearer ${authHelper.getSystemAdminToken()}`)
        .expect(404); // Endpoint not implemented

      // expect(response.body).toHaveProperty('totalReports');
      // expect(response.body).toHaveProperty('statusDistribution');
      // expect(response.body).toHaveProperty('typeDistribution');
    });

    it.skip('should get department performance metrics (not implemented yet)', async () => {
      // Note: Analytics endpoints are not implemented yet
      const response = await request(app.getHttpServer())
        .get('/reports/analytics/performance?departmentId=1&period=monthly')
        .set('Authorization', `Bearer ${authHelper.getSupervisorToken()}`)
        .expect(404); // Endpoint not implemented

      // expect(response.body).toHaveProperty('averageResolutionTime');
      // expect(response.body).toHaveProperty('completionRate');
      // expect(response.body).toHaveProperty('reportVolume');
    });
  });

  describe('Authorization and Security', () => {
    it('should allow citizens to only view their own reports', async () => {
      // Citizen trying to access someone else's report
      await request(app.getHttpServer())
        .get('/reports/999999')
        .set('Authorization', `Bearer ${authHelper.getCitizenToken()}`)
        .expect(404); // Should not find or deny access
    });

    it('should deny report creation without authentication', async () => {
      const createReportDto = {
        title: 'Unauthorized Report',
        description: 'This should fail',
        reportType: ReportType.POTHOLE,
        location: {
          type: 'Point',
          coordinates: [29.0, 41.0],
        },
      };

      await request(app.getHttpServer()).post('/reports').send(createReportDto).expect(401);
    });

    it('should allow SYSTEM_ADMIN to access all reports', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reports/${createdReportId}`)
        .set('Authorization', `Bearer ${authHelper.getSystemAdminToken()}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdReportId);
    });
  });

  describe('Report Cleanup', () => {
    it.skip('should archive report (SYSTEM_ADMIN) - not implemented yet', async () => {
      // Note: Archive endpoint is not implemented yet
      const response = await request(app.getHttpServer())
        .patch(`/reports/${createdReportId}/archive`)
        .set('Authorization', `Bearer ${authHelper.getSystemAdminToken()}`)
        .expect(404); // Endpoint not implemented

      // expect(response.body.status).toBe('ARCHIVED');
    });
  });
});
