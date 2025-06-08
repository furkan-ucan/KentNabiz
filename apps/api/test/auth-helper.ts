// Set JWT_SECRET before any imports
process.env.JWT_SECRET = 'test-jwt-secret-for-e2e-tests-fixed';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-for-e2e-tests-fixed';

import { sign } from 'jsonwebtoken';
import { UserRole } from '@kentnabiz/shared';

interface TestUser {
  id: number;
  email: string;
  roles: UserRole[];
  departmentId: number | null;
  activeTeamId?: number;
}

export class AuthHelper {
  private static readonly JWT_SECRET = process.env.JWT_SECRET!;

  static readonly TEST_USERS = {
    CITIZEN: {
      id: 1,
      email: 'citizen@test.com',
      roles: [UserRole.CITIZEN],
      departmentId: null,
    } as TestUser,
    TEAM_MEMBER: {
      id: 2,
      email: 'team.member@test.com',
      roles: [UserRole.TEAM_MEMBER],
      departmentId: 1,
      activeTeamId: 1,
    } as TestUser,
    DEPARTMENT_SUPERVISOR: {
      id: 3,
      email: 'supervisor@test.com',
      roles: [UserRole.DEPARTMENT_SUPERVISOR],
      departmentId: 1,
    } as TestUser,
    SYSTEM_ADMIN: {
      id: 4,
      email: 'admin@test.com',
      roles: [UserRole.SYSTEM_ADMIN],
      departmentId: null,
    } as TestUser,
  };

  private generateToken(user: TestUser): string {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      departmentId: user.departmentId,
      activeTeamId: user.activeTeamId,
      jti: `test-${user.id}-${Date.now()}`,
    };

    console.log(`[AuthHelper.generateToken] Creating token for user ${user.id} (${user.email})`);
    console.log(`[AuthHelper.generateToken] Payload:`, JSON.stringify(payload, null, 2));

    return sign(payload, AuthHelper.JWT_SECRET, {
      expiresIn: '1h',
      issuer: 'kentnabiz-test',
    });
  }

  getCitizenToken(): string {
    return this.generateToken(AuthHelper.TEST_USERS.CITIZEN);
  }

  getTeamMemberToken(): string {
    return this.generateToken(AuthHelper.TEST_USERS.TEAM_MEMBER);
  }

  getSupervisorToken(): string {
    return this.generateToken(AuthHelper.TEST_USERS.DEPARTMENT_SUPERVISOR);
  }

  getSystemAdminToken(): string {
    return this.generateToken(AuthHelper.TEST_USERS.SYSTEM_ADMIN);
  }
}
