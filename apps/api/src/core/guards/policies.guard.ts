import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
  Inject,
  forwardRef,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppAbility, AbilityFactory, Subjects } from '../authorization/ability.factory';
import { Report } from '../../modules/reports/entities/report.entity';
import { User } from '../../modules/users/entities/user.entity';
import { ReportsService } from '../../modules/reports/services/reports.service';
import { Request } from 'express';

interface IPolicyHandler {
  handle(ability: AppAbility, request: Request): boolean; // request'ten subject'i almak için
}

type PolicyHandlerCallback = (
  ability: AppAbility,
  subject: Subjects | typeof Report | Report
) => boolean; // subject zorunlu
export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;

export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: AbilityFactory, // AbilityFactory'yi inject et
    @Inject(forwardRef(() => ReportsService)) // Dairesel bağımlılık için forwardRef
    private reportsService: ReportsService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(CHECK_POLICIES_KEY, context.getHandler()) || [];

    if (policyHandlers.length === 0) {
      return true; // Policy tanımlanmamışsa erişime izin ver
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as Request & { user?: User }).user; // JwtAuthGuard'dan gelen kullanıcıyı varsayıyoruz

    if (!user) return false; // Kullanıcı yoksa yetki yok

    const ability = this.abilityFactory.defineAbility(user);

    // Rapor ID'sini request parametrelerinden al
    const reportId = request.params.id ? parseInt(request.params.id, 10) : undefined;
    let reportSubject: Report | typeof Report = Report; // Varsayılan olarak class'ın kendisi

    if (reportId && !isNaN(reportId)) {
      try {
        // Report nesnesini fetch et
        reportSubject = await this.reportsService.findOneForAuthCheck(reportId);
      } catch (error) {
        if (error instanceof NotFoundException) {
          // Rapor bulunamadı, yetki kontrolü false dönecek
          return false;
        }
        throw error; // Diğer hataları yukarı fırlat
      }
    }

    // Her bir handler'ı, elde edilen subject ile çalıştır
    return policyHandlers.every(handler => {
      if (typeof handler === 'function') {
        return handler(ability, reportSubject);
      }
      return handler.handle(ability, request);
    });
  }
}
