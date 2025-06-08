// Set test environment variables for JWT BEFORE any imports
process.env.JWT_SECRET = 'test-jwt-secret-for-e2e-tests-fixed';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-for-e2e-tests-fixed';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthHelper } from './auth-helper';
import TestDataSource from '../src/config/test-data-source';
import { ReportType, ReportStatus, MunicipalityDepartment } from '@kentnabiz/shared';
import { UpdateReportStatusDto } from '../src/modules/reports/dto/update-report-status.dto';

describe('Report Lifecycle E2E', () => {
  let app: INestApplication;
  let sauthHelper: AuthHelper;
  let createdReportId: number;
  let testTeamId: number;

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

    // Get test team ID from seeded data
    const teamRepo = TestDataSource.getRepository('Team');
    const teams = await teamRepo.find();
    testTeamId = teams[0]?.id || 1;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete Report Lifecycle', () => {
    it('1. Should create a new report (CITIZEN)', async () => {
      const createReportDto = {
        title: 'Large pothole on Main Street',
        description: 'There is a dangerous pothole that needs immediate attention',
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
        title: 'Large pothole on Main Street',
        description: 'There is a dangerous pothole that needs immediate attention',
        reportType: ReportType.POTHOLE,
        status: ReportStatus.OPEN,
      });

      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.userId).toBe(AuthHelper.TEST_USERS.CITIZEN.id);
      expect(response.body.data.currentDepartmentId).toBeDefined();

      createdReportId = response.body.data.id;
    });

    it('2. Should get report by ID (CITIZEN can see own report)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reports/${createdReportId}`)
        .set('Authorization', `Bearer ${sauthHelper.getCitizenToken()}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: createdReportId,
        title: 'Large pothole on Main Street',
        status: ReportStatus.OPEN,
        userId: AuthHelper.TEST_USERS.CITIZEN.id,
      });
    });

    it('3. Should update report status to IN_REVIEW (DEPARTMENT_SUPERVISOR)', async () => {
      const updateStatusDto = {
        newStatus: ReportStatus.IN_REVIEW,
        notes: 'Report received and under review',
      };

      const response = await request(app.getHttpServer())
        .patch(`/reports/${createdReportId}/status`)
        .set('Authorization', `Bearer ${sauthHelper.getSupervisorToken()}`)
        .send(updateStatusDto)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: createdReportId,
        status: ReportStatus.IN_REVIEW,
      });
    });

    it('4. Should assign report to team (DEPARTMENT_SUPERVISOR)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/reports/${createdReportId}/assign-team/${testTeamId}`)
        .set('Authorization', `Bearer ${sauthHelper.getSupervisorToken()}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('assignments');
      expect(response.body.data.assignments).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            assigneeType: 'TEAM',
            assigneeTeamId: testTeamId,
            status: 'ACTIVE',
          }),
        ])
      );
    });

    it('5. Should start work on report (TEAM_MEMBER)', async () => {
      expect(createdReportId).toBeDefined();
      expect(typeof createdReportId).toBe('number');
      expect(testTeamId).toBeDefined(); // testTeamId'nin tanımlı olduğunu kontrol et
      expect(typeof testTeamId).toBe('number');
      console.log(
        `[LIFECYCLE_TEST_START_WORK] Report ID: ${createdReportId}, Team ID for assignment check: ${testTeamId}`
      );

      const updateDto: UpdateReportStatusDto = {
        newStatus: ReportStatus.IN_PROGRESS,
        notes: 'Started working on the pothole repair',
      };

      const response = await request(app.getHttpServer())
        .patch(`/reports/${createdReportId}/status`)
        .set('Authorization', `Bearer ${sauthHelper.getTeamMemberToken()}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: createdReportId,
        status: ReportStatus.IN_PROGRESS,
      });
    });

    it('6. Should complete work and mark as pending approval (TEAM_MEMBER)', async () => {
      const updateStatusDto = {
        newStatus: ReportStatus.DONE,
        notes: 'Pothole repair completed, waiting for inspection',
        resolutionNotes: 'Filled the pothole with asphalt and compacted properly',
      };

      const response = await request(app.getHttpServer())
        .patch(`/reports/${createdReportId}/status`)
        .set('Authorization', `Bearer ${sauthHelper.getTeamMemberToken()}`)
        .send(updateStatusDto)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: createdReportId,
        status: ReportStatus.IN_PROGRESS,
        subStatus: 'PENDING_APPROVAL',
        resolutionNotes: updateStatusDto.resolutionNotes,
      });
    });

    it('7. Should approve completed work (DEPARTMENT_SUPERVISOR)', async () => {
      const updateStatusDto = {
        newStatus: ReportStatus.DONE,
        notes: 'Work approved after inspection',
      };

      const response = await request(app.getHttpServer())
        .patch(`/reports/${createdReportId}/status`)
        .set('Authorization', `Bearer ${sauthHelper.getSupervisorToken()}`)
        .send(updateStatusDto)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: createdReportId,
        status: ReportStatus.DONE,
        subStatus: null, // Should be cleared after approval
      });
      expect(response.body.data.resolvedAt).toBeDefined();
    });

    it('8. Should get status history for the report', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reports/${createdReportId}/status-history`)
        .set('Authorization', `Bearer ${sauthHelper.getSupervisorToken()}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Should have multiple status changes
      const statusChanges = response.body.data;
      expect(statusChanges).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            newStatus: ReportStatus.IN_REVIEW,
          }),
          expect.objectContaining({
            newStatus: ReportStatus.IN_PROGRESS,
          }),
          expect.objectContaining({
            newStatus: ReportStatus.DONE,
          }),
        ])
      );
    });
  });

  describe('Authorization Tests', () => {
    it('Should deny report assignment by unauthorized user (CITIZEN)', async () => {
      await request(app.getHttpServer())
        .patch(`/reports/${createdReportId}/assign-team/${testTeamId}`)
        .set('Authorization', `Bearer ${sauthHelper.getCitizenToken()}`)
        .expect(403);
    });

    it('Should deny status update by unauthorized user (CITIZEN trying to change to IN_PROGRESS)', async () => {
      const updateStatusDto = {
        newStatus: ReportStatus.IN_PROGRESS,
        notes: 'Unauthorized attempt',
      };

      await request(app.getHttpServer())
        .patch(`/reports/${createdReportId}/status`)
        .set('Authorization', `Bearer ${sauthHelper.getCitizenToken()}`)
        .send(updateStatusDto)
        .expect(403);
    });

    it('Should deny access without authentication', async () => {
      await request(app.getHttpServer()).get(`/reports/${createdReportId}`).expect(401);
    });
  });

  describe('Validation Tests', () => {
    it('Should reject invalid report creation data', async () => {
      const invalidReportDto = {
        title: '', // Empty title should fail
        description: 'Valid description',
        reportType: 'INVALID_TYPE', // Invalid enum
        location: {
          type: 'Point',
          coordinates: [29.0], // Invalid coordinates (should be [lng, lat])
        },
        address: '123 Main Street',
      };

      await request(app.getHttpServer())
        .post('/reports')
        .set('Authorization', `Bearer ${sauthHelper.getCitizenToken()}`)
        .send(invalidReportDto)
        .expect(400);
    });

    it('Should reject invalid status update', async () => {
      const invalidStatusDto = {
        newStatus: 'INVALID_STATUS',
        notes: 'Valid note',
      };

      await request(app.getHttpServer())
        .patch(`/reports/${createdReportId}/status`)
        .set('Authorization', `Bearer ${sauthHelper.getSupervisorToken()}`)
        .send(invalidStatusDto)
        .expect(400);
    });

    it('Should reject assignment to non-existent team', async () => {
      const nonExistentTeamId = 99999;

      await request(app.getHttpServer())
        .patch(`/reports/${createdReportId}/assign-team/${nonExistentTeamId}`)
        .set('Authorization', `Bearer ${sauthHelper.getSupervisorToken()}`)
        .expect(404);
    });
  });

  describe('Report Forwarding', () => {
    it('Should forward report to another department (DEPARTMENT_SUPERVISOR)', async () => {
      const forwardDto = {
        newDepartment: MunicipalityDepartment.PARKS,
        reason: 'This issue is related to park maintenance, not roads',
      };

      const response = await request(app.getHttpServer())
        .patch(`/reports/${createdReportId}/forward`)
        .set('Authorization', `Bearer ${sauthHelper.getSupervisorToken()}`)
        .send(forwardDto)
        .expect(200);

      expect(response.body.data.currentDepartmentId).toBeDefined();
      // Should have updated the department
    });

    it('Should get department change history', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reports/${createdReportId}/history`)
        .set('Authorization', `Bearer ${sauthHelper.getSupervisorToken()}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('newDepartment');
        expect(response.body.data[0]).toHaveProperty('reason');
        expect(response.body.data[0]).toHaveProperty('changedAt');
      }
    });
  });

  describe('Query and Filtering', () => {
    it('Should list reports with pagination and filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports?page=1&limit=10&status=DONE&reportType=POTHOLE')
        .set('Authorization', `Bearer ${sauthHelper.getSupervisorToken()}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('limit', 10);
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('Should find nearby reports', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports/nearby?latitude=41.0&longitude=29.0&radius=1000')
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

    it("Should get user's own reports", async () => {
      const response = await request(app.getHttpServer())
        .get('/reports/my-reports')
        .set('Authorization', `Bearer ${sauthHelper.getCitizenToken()}`)
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
});
