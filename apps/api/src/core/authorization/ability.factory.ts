import { Injectable } from '@nestjs/common';
import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { UserRole, ReportStatus } from '@kentnabiz/shared';
import { User } from '../../modules/users/entities/user.entity';
import { Report } from '../../modules/reports/entities/report.entity';
import { Assignment } from '../../modules/reports/entities/assignment.entity';
import { Team } from '../../modules/teams/entities/team.entity';
import { SUB_STATUS } from '../../modules/reports/constants/report.constants';

export enum Action {
  Manage = 'manage', // Her şeyi yapabilir (genellikle admin için)
  Create = 'create',
  Read = 'read',
  ReadPrivate = 'readPrivate', // Kendi özel detaylarını okuma
  Update = 'update',
  Delete = 'delete', // Genellikle soft delete'e karşılık gelir
  Cancel = 'cancel', // Rapor iptali
  StartWork = 'startWork',
  CompleteWork = 'completeWork', // Ekip üyesi işi bitirdi -> PENDING_APPROVAL
  Approve = 'approve', // Süpervizör onayı -> DONE
  Reject = 'reject', // Süpervizör reddi -> REJECTED
  Forward = 'forward',
  Reopen = 'reopen',
  Assign = 'assign', // Raporu ekibe/kişiye atama
  Support = 'support', // Raporu destekleme (+1)
  Unsupport = 'unsupport', // Rapor desteğini geri çekme
}

// Hangi entity'ler üzerinde yetki kontrolü yapılacağını tanımlar
// 'all' özel bir keyword, her şeyi ifade eder.
export type Subjects =
  | InferSubjects<typeof Report | typeof Assignment | typeof User | typeof Team>
  | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class AbilityFactory {
  defineAbility(user: User | null) {
    // Kullanıcı null olabilir (public endpoint'ler için)
    const { can, build } = new AbilityBuilder<AppAbility>(Ability as AbilityClass<AppAbility>);

    if (!user) {
      // Misafir kullanıcı (henüz login olmamış)
      can(Action.Read, Report, { status: { $nin: [ReportStatus.CANCELLED] } }); // İptal olmayanları okuyabilir
      // Belki public raporlar için 'create' Report da olabilir
      // can(Action.Create, Report);
      return build({
        detectSubjectType: item => {
          // Plain object'ler için constructor property kontrol et
          if (item && typeof item === 'object' && item.constructor) {
            return item.constructor as ExtractSubjectType<Subjects>;
          }
          // Eğer object'te constructor yoksa, class ismine göre tahmin et
          if (item && typeof item === 'object') {
            // Report property'lerini kontrol et
            if ('status' in item && 'title' in item && 'description' in item) {
              return Report as ExtractSubjectType<Subjects>;
            }
            // Team property'lerini kontrol et
            if ('departmentId' in item && 'name' in item) {
              return Team as ExtractSubjectType<Subjects>;
            }
            // User property'lerini kontrol et
            if ('email' in item && 'roles' in item) {
              return User as ExtractSubjectType<Subjects>;
            }
          }
          // Son çare olarak constructor'ı kullan
          return item.constructor as ExtractSubjectType<Subjects>;
        },
      });
    }

    // Her rol için ortak yetkiler buraya eklenebilir
    // can(Action.Read, 'Profile', { id: user.id }); // Kendi profilini okuyabilir

    /** ----- CITIZEN ----- */
    if (user.roles.includes(UserRole.CITIZEN)) {
      can(Action.Create, Report);
      can(Action.Read, Report); // Tüm raporları okuyabilir (public)
      can(Action.ReadPrivate, Report, { userId: user.id }); // Kendi raporlarının özel detaylarını okuyabilir
      can(Action.Update, Report, { userId: user.id, status: ReportStatus.OPEN }); // Sadece açık ve kendi raporunu güncelleyebilir
      can(Action.Cancel, Report, { userId: user.id, status: ReportStatus.OPEN }); // Sadece açık ve kendi raporunu iptal edebilir
      can(Action.Support, Report, {
        status: { $in: [ReportStatus.OPEN, ReportStatus.IN_REVIEW, ReportStatus.IN_PROGRESS] },
      }); // Açık/incelenen/çalışılan raporları destekleyebilir
      can(Action.Unsupport, Report, {
        status: { $in: [ReportStatus.OPEN, ReportStatus.IN_REVIEW, ReportStatus.IN_PROGRESS] },
      }); // Açık/incelenen/çalışılan raporlarda desteği geri çekebilir
    }

    /** ----- TEAM_MEMBER ----- */
    if (user.roles.includes(UserRole.TEAM_MEMBER)) {
      // Kendi departmanındaki raporları okuyabilir
      can(Action.Read, Report, { currentDepartmentId: user.departmentId });

      // Atanmış raporların durumunu güncelleyebilir (IN_REVIEW -> IN_PROGRESS, IN_PROGRESS -> DONE)
      can(Action.Update, Report, {
        currentDepartmentId: user.departmentId,
        status: { $in: [ReportStatus.IN_REVIEW, ReportStatus.IN_PROGRESS] },
        // assignments.assigneeTeamId kontrolü guard/servis seviyesinde yapılacak
      });

      can(Action.StartWork, Report, {
        status: ReportStatus.IN_REVIEW,
        currentDepartmentId: user.departmentId,
        // assignments.assigneeTeamId kontrolü guard/servis seviyesinde yapılacak
      });

      can(Action.CompleteWork, Report, {
        status: ReportStatus.IN_PROGRESS,
        currentDepartmentId: user.departmentId,
        // assignments.assigneeTeamId kontrolü guard/servis seviyesinde yapılacak
      });
    }

    /** ----- DEPARTMENT_SUPERVISOR ----- */
    if (user.roles.includes(UserRole.DEPARTMENT_SUPERVISOR)) {
      can(Action.Read, Report, { currentDepartmentId: user.departmentId });
      can(Action.Update, Report, { currentDepartmentId: user.departmentId });
      can(Action.Assign, Report, {
        currentDepartmentId: user.departmentId,
        status: { $in: [ReportStatus.OPEN, ReportStatus.IN_REVIEW] },
      });
      can(Action.Approve, Report, {
        currentDepartmentId: user.departmentId,
        status: ReportStatus.IN_PROGRESS,
        subStatus: SUB_STATUS.PENDING_APPROVAL,
      });
      can(Action.Reject, Report, {
        currentDepartmentId: user.departmentId,
        status: { $in: [ReportStatus.IN_REVIEW, ReportStatus.IN_PROGRESS] },
      });
      can(Action.Forward, Report, { currentDepartmentId: user.departmentId });
      can(Action.Reopen, Report, {
        currentDepartmentId: user.departmentId,
        status: { $in: [ReportStatus.DONE, ReportStatus.REJECTED, ReportStatus.CANCELLED] },
      });

      // Team yönetimi
      can(Action.Create, Team, { departmentId: user.departmentId });
      can(Action.Manage, Team, { departmentId: user.departmentId });
    }

    /** ----- SYSTEM_ADMIN ----- */
    if (user.roles.includes(UserRole.SYSTEM_ADMIN)) {
      can(Action.Manage, 'all'); // Her şeyi yönetebilir
    }

    // Genel yasaklama örneği (herkes için geçerli)
    // cannot(Action.Delete, Report); // Raporları kimse silemesin (hard delete)

    return build({
      detectSubjectType: item => {
        // Plain object'ler için constructor property kontrol et
        if (item && typeof item === 'object' && item.constructor) {
          return item.constructor as ExtractSubjectType<Subjects>;
        }
        // Eğer object'te constructor yoksa, class ismine göre tahmin et
        if (item && typeof item === 'object') {
          // Report property'lerini kontrol et
          if ('status' in item && 'title' in item && 'description' in item) {
            return Report as ExtractSubjectType<Subjects>;
          }
          // Team property'lerini kontrol et
          if ('departmentId' in item && 'name' in item) {
            return Team as ExtractSubjectType<Subjects>;
          }
          // User property'lerini kontrol et
          if ('email' in item && 'roles' in item) {
            return User as ExtractSubjectType<Subjects>;
          }
        }
        // Son çare olarak constructor'ı kullan
        return item.constructor as ExtractSubjectType<Subjects>;
      },
    });
  }
}
