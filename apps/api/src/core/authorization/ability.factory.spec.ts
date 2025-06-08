import { Test, TestingModule } from '@nestjs/testing';
import { AbilityFactory, Action } from './ability.factory';
import { User } from '../../modules/users/entities/user.entity';
import { Report } from '../../modules/reports/entities/report.entity';
import { Team } from '../../modules/teams/entities/team.entity';
import { SUB_STATUS } from '../../modules/reports/constants/report.constants';
import { UserRole, ReportStatus } from '@kentnabiz/shared';

describe('AbilityFactory', () => {
  let abilityFactory: AbilityFactory;

  // Mock kullanıcıları
  const citizenUser = {
    id: 1,
    email: 'citizen@test.com',
    fullName: 'Citizen User',
    roles: [UserRole.CITIZEN],
    departmentId: null,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const teamMemberUser = {
    id: 2,
    email: 'teammember@test.com',
    fullName: 'Team Member User',
    roles: [UserRole.TEAM_MEMBER],
    departmentId: 1,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const supervisorUser = {
    id: 3,
    email: 'supervisor@test.com',
    fullName: 'Supervisor User',
    roles: [UserRole.DEPARTMENT_SUPERVISOR],
    departmentId: 1,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const systemAdminUser = {
    id: 4,
    email: 'admin@test.com',
    fullName: 'Admin User',
    roles: [UserRole.SYSTEM_ADMIN],
    departmentId: null,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const multiRoleUser = {
    id: 5,
    email: 'multirole@test.com',
    fullName: 'Multi Role User',
    roles: [UserRole.CITIZEN, UserRole.TEAM_MEMBER],
    departmentId: 2,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  // Mock rapor nesnesi
  const mockReport = Object.create(Report.prototype);
  Object.assign(mockReport, {
    id: 1,
    title: 'Test Report',
    description: 'Test description',
    status: ReportStatus.OPEN,
    userId: 1,
    currentDepartmentId: 1,
    subStatus: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Helper function to create proper Report instances
  const createReportInstance = (overrides: Partial<Report> = {}): Report => {
    return Object.assign(Object.create(Report.prototype), mockReport, overrides) as Report;
  };

  // Helper function to create proper Team instances
  const createTeamInstance = (overrides: Partial<Team> = {}): Team => {
    return Object.assign(Object.create(Team.prototype), overrides) as Team;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AbilityFactory],
    }).compile();

    abilityFactory = module.get<AbilityFactory>(AbilityFactory);
  });

  it('should be defined', () => {
    expect(abilityFactory).toBeDefined();
  });

  describe('Guest User (null)', () => {
    it('should allow reading non-cancelled reports', () => {
      const ability = abilityFactory.defineAbility(null);

      const openReport = Object.assign(Object.create(Report.prototype), mockReport, {
        status: ReportStatus.OPEN,
      });
      const cancelledReport = Object.assign(Object.create(Report.prototype), mockReport, {
        status: ReportStatus.CANCELLED,
      });

      expect(ability.can(Action.Read, openReport)).toBe(true);
      expect(ability.can(Action.Read, cancelledReport)).toBe(false);
    });

    it('should not allow creating, updating or other actions', () => {
      const ability = abilityFactory.defineAbility(null);

      expect(ability.can(Action.Create, Report)).toBe(false);
      expect(ability.can(Action.Update, mockReport)).toBe(false);
      expect(ability.can(Action.Support, mockReport)).toBe(false);
    });
  });

  describe('Citizen User', () => {
    let ability: any;

    beforeEach(() => {
      ability = abilityFactory.defineAbility(citizenUser);
    });

    it('should allow creating reports', () => {
      expect(ability.can(Action.Create, Report)).toBe(true);
    });

    it('should allow reading all reports (public access)', () => {
      const anyReport = Object.assign(Object.create(Report.prototype), mockReport, { userId: 999 }); // Başka kullanıcının raporu
      expect(ability.can(Action.Read, anyReport)).toBe(true);
    });

    it('should allow reading private details of own reports only', () => {
      const ownReport = Object.assign(Object.create(Report.prototype), mockReport, {
        userId: citizenUser.id,
      });
      const otherReport = Object.assign(Object.create(Report.prototype), mockReport, {
        userId: 999,
      });

      expect(ability.can(Action.ReadPrivate, ownReport)).toBe(true);
      expect(ability.can(Action.ReadPrivate, otherReport)).toBe(false);
    });

    it('should allow updating own open reports only', () => {
      const ownOpenReport = Object.assign(Object.create(Report.prototype), mockReport, {
        userId: citizenUser.id,
        status: ReportStatus.OPEN,
      });
      const ownClosedReport = Object.assign(Object.create(Report.prototype), mockReport, {
        userId: citizenUser.id,
        status: ReportStatus.DONE,
      });
      const otherReport = Object.assign(Object.create(Report.prototype), mockReport, {
        userId: 999,
        status: ReportStatus.OPEN,
      });

      expect(ability.can(Action.Update, ownOpenReport)).toBe(true);
      expect(ability.can(Action.Update, ownClosedReport)).toBe(false);
      expect(ability.can(Action.Update, otherReport)).toBe(false);
    });

    it('should allow cancelling own open reports only', () => {
      const ownOpenReport = Object.assign(Object.create(Report.prototype), mockReport, {
        userId: citizenUser.id,
        status: ReportStatus.OPEN,
      });
      const ownClosedReport = Object.assign(Object.create(Report.prototype), mockReport, {
        userId: citizenUser.id,
        status: ReportStatus.DONE,
      });

      expect(ability.can(Action.Cancel, ownOpenReport)).toBe(true);
      expect(ability.can(Action.Cancel, ownClosedReport)).toBe(false);
    });

    it('should allow supporting reports in certain statuses', () => {
      const openReport = Object.assign(Object.create(Report.prototype), mockReport, {
        status: ReportStatus.OPEN,
      });
      const inReviewReport = Object.assign(Object.create(Report.prototype), mockReport, {
        status: ReportStatus.IN_REVIEW,
      });
      const inProgressReport = Object.assign(Object.create(Report.prototype), mockReport, {
        status: ReportStatus.IN_PROGRESS,
      });
      const doneReport = Object.assign(Object.create(Report.prototype), mockReport, {
        status: ReportStatus.DONE,
      });

      expect(ability.can(Action.Support, openReport)).toBe(true);
      expect(ability.can(Action.Support, inReviewReport)).toBe(true);
      expect(ability.can(Action.Support, inProgressReport)).toBe(true);
      expect(ability.can(Action.Support, doneReport)).toBe(false);
    });

    it('should not allow administrative actions', () => {
      expect(ability.can(Action.Assign, mockReport)).toBe(false);
      expect(ability.can(Action.Approve, mockReport)).toBe(false);
      expect(ability.can(Action.StartWork, mockReport)).toBe(false);
    });
  });

  describe('Team Member User', () => {
    let ability: any;

    beforeEach(() => {
      ability = abilityFactory.defineAbility(teamMemberUser);
    });

    it('should allow reading reports from own department', () => {
      const sameDeptReport = createReportInstance({
        currentDepartmentId: teamMemberUser.departmentId!,
      });
      const otherDeptReport = createReportInstance({ currentDepartmentId: 999 });

      expect(ability.can(Action.Read, sameDeptReport)).toBe(true);
      expect(ability.can(Action.Read, otherDeptReport)).toBe(false);
    });

    it('should allow starting work on IN_REVIEW reports from own department', () => {
      const validReport = createReportInstance({
        status: ReportStatus.IN_REVIEW,
        currentDepartmentId: teamMemberUser.departmentId!,
      });
      const wrongStatusReport = createReportInstance({
        status: ReportStatus.OPEN,
        currentDepartmentId: teamMemberUser.departmentId!,
      });
      const wrongDeptReport = createReportInstance({
        status: ReportStatus.IN_REVIEW,
        currentDepartmentId: 999,
      });

      expect(ability.can(Action.StartWork, validReport)).toBe(true);
      expect(ability.can(Action.StartWork, wrongStatusReport)).toBe(false);
      expect(ability.can(Action.StartWork, wrongDeptReport)).toBe(false);
    });

    it('should allow completing work on IN_PROGRESS reports from own department', () => {
      const validReport = createReportInstance({
        status: ReportStatus.IN_PROGRESS,
        currentDepartmentId: teamMemberUser.departmentId!,
      });
      const wrongStatusReport = createReportInstance({
        status: ReportStatus.IN_REVIEW,
        currentDepartmentId: teamMemberUser.departmentId!,
      });

      expect(ability.can(Action.CompleteWork, validReport)).toBe(true);
      expect(ability.can(Action.CompleteWork, wrongStatusReport)).toBe(false);
    });

    it('should not allow supervisor actions', () => {
      const report = createReportInstance({ currentDepartmentId: teamMemberUser.departmentId! });

      expect(ability.can(Action.Assign, report)).toBe(false);
      expect(ability.can(Action.Approve, report)).toBe(false);
      expect(ability.can(Action.Reject, report)).toBe(false);
    });
  });

  describe('Department Supervisor User', () => {
    let ability: any;

    beforeEach(() => {
      ability = abilityFactory.defineAbility(supervisorUser);
    });

    it('should allow reading reports from own department', () => {
      const sameDeptReport = createReportInstance({
        currentDepartmentId: supervisorUser.departmentId!,
      });
      const otherDeptReport = createReportInstance({ currentDepartmentId: 999 });

      expect(ability.can(Action.Read, sameDeptReport)).toBe(true);
      expect(ability.can(Action.Read, otherDeptReport)).toBe(false);
    });

    it('should allow updating reports from own department', () => {
      const sameDeptReport = createReportInstance({
        currentDepartmentId: supervisorUser.departmentId!,
      });
      const otherDeptReport = createReportInstance({ currentDepartmentId: 999 });

      expect(ability.can(Action.Update, sameDeptReport)).toBe(true);
      expect(ability.can(Action.Update, otherDeptReport)).toBe(false);
    });

    it('should allow assigning OPEN or IN_REVIEW reports from own department', () => {
      const openReport = createReportInstance({
        status: ReportStatus.OPEN,
        currentDepartmentId: supervisorUser.departmentId!,
      });
      const inReviewReport = createReportInstance({
        status: ReportStatus.IN_REVIEW,
        currentDepartmentId: supervisorUser.departmentId!,
      });
      const inProgressReport = createReportInstance({
        status: ReportStatus.IN_PROGRESS,
        currentDepartmentId: supervisorUser.departmentId!,
      });

      expect(ability.can(Action.Assign, openReport)).toBe(true);
      expect(ability.can(Action.Assign, inReviewReport)).toBe(true);
      expect(ability.can(Action.Assign, inProgressReport)).toBe(false);
    });

    it('should allow approving IN_PROGRESS reports with PENDING_APPROVAL substatus', () => {
      const validReport = createReportInstance({
        status: ReportStatus.IN_PROGRESS,
        subStatus: SUB_STATUS.PENDING_APPROVAL,
        currentDepartmentId: supervisorUser.departmentId!,
      });
      const wrongStatusReport = createReportInstance({
        status: ReportStatus.OPEN,
        subStatus: SUB_STATUS.PENDING_APPROVAL,
        currentDepartmentId: supervisorUser.departmentId!,
      });

      expect(ability.can(Action.Approve, validReport)).toBe(true);
      expect(ability.can(Action.Approve, wrongStatusReport)).toBe(false);
    });

    it('should allow rejecting IN_REVIEW or IN_PROGRESS reports', () => {
      const inReviewReport = createReportInstance({
        status: ReportStatus.IN_REVIEW,
        currentDepartmentId: supervisorUser.departmentId!,
      });
      const inProgressReport = createReportInstance({
        status: ReportStatus.IN_PROGRESS,
        currentDepartmentId: supervisorUser.departmentId!,
      });
      const openReport = createReportInstance({
        status: ReportStatus.OPEN,
        currentDepartmentId: supervisorUser.departmentId!,
      });

      expect(ability.can(Action.Reject, inReviewReport)).toBe(true);
      expect(ability.can(Action.Reject, inProgressReport)).toBe(true);
      expect(ability.can(Action.Reject, openReport)).toBe(false);
    });

    it('should allow forwarding reports from own department', () => {
      const sameDeptReport = createReportInstance({
        currentDepartmentId: supervisorUser.departmentId!,
      });
      const otherDeptReport = createReportInstance({ currentDepartmentId: 999 });

      expect(ability.can(Action.Forward, sameDeptReport)).toBe(true);
      expect(ability.can(Action.Forward, otherDeptReport)).toBe(false);
    });

    it('should allow reopening closed reports from own department', () => {
      const doneReport = createReportInstance({
        status: ReportStatus.DONE,
        currentDepartmentId: supervisorUser.departmentId!,
      });
      const rejectedReport = createReportInstance({
        status: ReportStatus.REJECTED,
        currentDepartmentId: supervisorUser.departmentId!,
      });
      const openReport = createReportInstance({
        status: ReportStatus.OPEN,
        currentDepartmentId: supervisorUser.departmentId!,
      });

      expect(ability.can(Action.Reopen, doneReport)).toBe(true);
      expect(ability.can(Action.Reopen, rejectedReport)).toBe(true);
      expect(ability.can(Action.Reopen, openReport)).toBe(false);
    });

    it('should allow team management for own department', () => {
      const ownDeptTeam = createTeamInstance({ departmentId: supervisorUser.departmentId! });
      const otherDeptTeam = createTeamInstance({ departmentId: 999 });

      expect(ability.can(Action.Create, ownDeptTeam)).toBe(true);
      expect(ability.can(Action.Manage, ownDeptTeam)).toBe(true);
      expect(ability.can(Action.Create, otherDeptTeam)).toBe(false);
      expect(ability.can(Action.Manage, otherDeptTeam)).toBe(false);
    });
  });

  describe('System Admin User', () => {
    let ability: any;

    beforeEach(() => {
      ability = abilityFactory.defineAbility(systemAdminUser);
    });

    it('should allow managing everything', () => {
      expect(ability.can(Action.Manage, Report)).toBe(true);
      expect(ability.can(Action.Manage, User)).toBe(true);
      expect(ability.can(Action.Manage, Team)).toBe(true);
      expect(ability.can(Action.Manage, 'all')).toBe(true);
    });

    it('should allow all specific actions on any report', () => {
      const anyReport = createReportInstance({ currentDepartmentId: 999 });

      expect(ability.can(Action.Read, anyReport)).toBe(true);
      expect(ability.can(Action.Update, anyReport)).toBe(true);
      expect(ability.can(Action.Delete, anyReport)).toBe(true);
      expect(ability.can(Action.Assign, anyReport)).toBe(true);
      expect(ability.can(Action.Approve, anyReport)).toBe(true);
      expect(ability.can(Action.Reject, anyReport)).toBe(true);
    });
  });

  describe('Multi-Role User', () => {
    let ability: any;

    beforeEach(() => {
      ability = abilityFactory.defineAbility(multiRoleUser);
    });

    it('should have abilities from both roles', () => {
      // Citizen abilities
      expect(ability.can(Action.Create, Report)).toBe(true);

      // Team Member abilities for own department
      const sameDeptReport = createReportInstance({
        currentDepartmentId: multiRoleUser.departmentId!,
      });
      expect(
        ability.can(
          Action.StartWork,
          createReportInstance({
            ...sameDeptReport,
            status: ReportStatus.IN_REVIEW,
          })
        )
      ).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle user without department for department-specific roles', () => {
      const teamMemberWithoutDept = {
        ...teamMemberUser,
        departmentId: null,
      } as User;

      const ability = abilityFactory.defineAbility(teamMemberWithoutDept);
      const report = createReportInstance({ currentDepartmentId: 1 });

      expect(ability.can(Action.Read, report)).toBe(false);
    });

    it('should handle user with empty roles array', () => {
      const userWithoutRoles = {
        ...citizenUser,
        roles: [],
      } as unknown as User;

      const ability = abilityFactory.defineAbility(userWithoutRoles);

      expect(ability.can(Action.Create, Report)).toBe(false);
      expect(ability.can(Action.Read, mockReport)).toBe(false);
    });

    it('should handle undefined user properties gracefully', () => {
      const incompleteUser = {
        id: 1,
        roles: [UserRole.CITIZEN],
      } as User;

      const ability = abilityFactory.defineAbility(incompleteUser);

      expect(ability.can(Action.Create, Report)).toBe(true);
    });
  });
});
