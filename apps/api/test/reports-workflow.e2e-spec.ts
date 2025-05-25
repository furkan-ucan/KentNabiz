import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ReportType } from '@KentNabiz/shared';

describe('Reports Workflow (E2E)', () => {
  let app: INestApplication;
  let citizenToken: string;
  let departmentSupervisorToken: string;
  let teamMemberToken: string;
  let systemAdminToken: string;
  let createdReportId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // TODO: In real E2E tests, authenticate and get real JWT tokens
    citizenToken = 'mock-citizen-jwt';
    departmentSupervisorToken = 'mock-dept-supervisor-jwt';
    teamMemberToken = 'mock-team-member-jwt';
    systemAdminToken = 'mock-system-admin-jwt';
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
          type: 'Point',
          coordinates: [29.0, 41.0],
        },
        address: '123 Main Street, Istanbul',
      };

      const response = await request(app.getHttpServer())
        .post('/reports')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send(createReportDto)
        .expect(201);

      expect(response.body).toMatchObject({
        title: 'Pothole on Main Street',
        description: 'Large pothole causing traffic issues',
        reportType: ReportType.POTHOLE,
        status: 'OPEN',
      });

      createdReportId = response.body.id;
    });

    it('should get report by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reports/${createdReportId}`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdReportId,
        title: 'Pothole on Main Street',
        status: 'OPEN',
      });
    });

    it('should list reports with filters and pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports?page=1&limit=10&status=OPEN&reportType=POTHOLE')
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
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
      const assignToTeamDto = {
        teamId: 1,
      };

      const response = await request(app.getHttpServer())
        .post(`/reports/${createdReportId}/assign-team`)
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .send(assignToTeamDto)
        .expect(200);

      expect(response.body).toHaveProperty('assignments');
      expect(response.body.assignments).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            assigneeType: 'TEAM',
            assigneeId: 1,
            status: 'ACTIVE',
          }),
        ])
      );
    });

    it('should assign report to user (DEPARTMENT_SUPERVISOR)', async () => {
      const assignToUserDto = {
        userId: 3,
      };

      const response = await request(app.getHttpServer())
        .post(`/reports/${createdReportId}/assign-user`)
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .send(assignToUserDto)
        .expect(200);

      expect(response.body).toHaveProperty('assignments');
      expect(response.body.assignments).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            assigneeType: 'USER',
            assigneeId: 3,
            status: 'ACTIVE',
          }),
        ])
      );
    });

    it('should deny assignment by unauthorized user', async () => {
      const assignToTeamDto = {
        teamId: 1,
      };

      await request(app.getHttpServer())
        .post(`/reports/${createdReportId}/assign-team`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .send(assignToTeamDto)
        .expect(403);
    });
  });

  describe('Report Status Management', () => {
    it('should update report status (TEAM_MEMBER)', async () => {
      const updateStatusDto = {
        newStatus: 'IN_PROGRESS',
        note: 'Started working on the pothole repair',
      };

      const response = await request(app.getHttpServer())
        .patch(`/reports/${createdReportId}/status`)
        .set('Authorization', `Bearer ${teamMemberToken}`)
        .send(updateStatusDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdReportId,
        status: 'IN_PROGRESS',
      });
    });

    it('should update report status with sub-status', async () => {
      const updateStatusDto = {
        newStatus: 'DONE',
        subStatus: 'PENDING_APPROVAL',
        note: 'Repair completed, waiting for inspection',
      };

      const response = await request(app.getHttpServer())
        .patch(`/reports/${createdReportId}/status`)
        .set('Authorization', `Bearer ${teamMemberToken}`)
        .send(updateStatusDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdReportId,
        status: 'DONE',
        subStatus: 'PENDING_APPROVAL',
      });
    });

    it('should get report status history', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reports/${createdReportId}/status-history`)
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('oldStatus');
      expect(response.body[0]).toHaveProperty('newStatus');
      expect(response.body[0]).toHaveProperty('changedAt');
    });
  });

  describe('Report Forwarding', () => {
    it('should forward report to different department (DEPARTMENT_SUPERVISOR)', async () => {
      const forwardReportDto = {
        newDepartment: 'HEALTH',
        reason: 'This issue is related to public health, not roads',
      };

      const response = await request(app.getHttpServer())
        .post(`/reports/${createdReportId}/forward`)
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .send(forwardReportDto)
        .expect(200);

      expect(response.body).toHaveProperty('currentDepartmentId');
      expect(response.body.status).toBe('IN_REVIEW');
    });

    it('should get department history', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reports/${createdReportId}/department-history`)
        .set('Authorization', `Bearer ${systemAdminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('oldDepartmentId');
      expect(response.body[0]).toHaveProperty('newDepartmentId');
    });
  });

  describe('Report Media Management', () => {
    it('should upload report media', async () => {
      // Note: In real tests, you would create a test image file
      const response = await request(app.getHttpServer())
        .post(`/reports/${createdReportId}/media`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .attach('files', Buffer.from('fake image data'), 'test-image.jpg')
        .expect(201);

      expect(response.body).toHaveProperty('uploadedFiles');
      expect(Array.isArray(response.body.uploadedFiles)).toBe(true);
    });

    it('should get report media', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reports/${createdReportId}/media`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Report Analytics and Search', () => {
    it('should search reports by location radius', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports/nearby?lat=29.0&lng=41.0&radius=1000')
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get reports statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports/analytics/statistics?period=monthly')
        .set('Authorization', `Bearer ${systemAdminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalReports');
      expect(response.body).toHaveProperty('statusDistribution');
      expect(response.body).toHaveProperty('typeDistribution');
    });

    it('should get department performance metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports/analytics/performance?departmentId=1&period=monthly')
        .set('Authorization', `Bearer ${departmentSupervisorToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('averageResolutionTime');
      expect(response.body).toHaveProperty('completionRate');
      expect(response.body).toHaveProperty('reportVolume');
    });
  });

  describe('Authorization and Security', () => {
    it('should allow citizens to only view their own reports', async () => {
      // Citizen trying to access someone else's report
      await request(app.getHttpServer())
        .get('/reports/999999')
        .set('Authorization', `Bearer ${citizenToken}`)
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
        .set('Authorization', `Bearer ${systemAdminToken}`)
        .expect(200);

      expect(response.body.id).toBe(createdReportId);
    });
  });

  describe('Report Cleanup', () => {
    it('should archive report (SYSTEM_ADMIN)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/reports/${createdReportId}/archive`)
        .set('Authorization', `Bearer ${systemAdminToken}`)
        .expect(200);

      expect(response.body.status).toBe('ARCHIVED');
    });
  });
});
