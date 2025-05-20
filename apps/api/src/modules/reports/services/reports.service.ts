import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ReportRepository } from '../repositories/report.repository';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { Report } from '../entities/report.entity';
import { LocationService } from './location.service';
import { DepartmentService } from './department.service';
import { ReportStatus, ReportType, UserRole, MunicipalityDepartment } from '@KentNabiz/shared';
import { ISpatialQueryResult } from '../interfaces/report.interface';
import { JwtPayload as AuthUser } from '../../auth/interfaces/jwt-payload.interface';
import { UsersService } from '../../users/services/users.service';
import { ForwardReportDto } from '../dto/forward-report.dto';
import { DepartmentHistoryResponseDto } from '../dto/department-history.response.dto';
import { ReportMedia } from '../entities/report-media.entity';
import { CreateReportData } from '../repositories/report.repository';

interface IReportFindAllOptions {
  limit?: number;
  page?: number;
  userId?: number;
  reportType?: ReportType; // type -> reportType olarak güncellendi
  status?: ReportStatus;
  departmentCode?: MunicipalityDepartment; // department -> departmentCode olarak güncellendi
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly locationService: LocationService,
    @Inject(forwardRef(() => DepartmentService))
    private readonly departmentService: DepartmentService,
    private readonly usersService: UsersService
  ) {}

  private isTransitionAllowed(currentStatus: ReportStatus, newStatus: ReportStatus): boolean {
    const allowedTransitions: Record<ReportStatus, ReportStatus[]> = {
      [ReportStatus.SUBMITTED]: [
        ReportStatus.UNDER_REVIEW,
        ReportStatus.REJECTED,
        ReportStatus.AWAITING_INFORMATION,
        ReportStatus.FORWARDED,
      ],
      [ReportStatus.UNDER_REVIEW]: [
        ReportStatus.FORWARDED,
        ReportStatus.ASSIGNED_TO_EMPLOYEE,
        ReportStatus.FIELD_WORK_IN_PROGRESS,
        ReportStatus.RESOLVED,
        ReportStatus.REJECTED,
        ReportStatus.AWAITING_INFORMATION,
      ],
      [ReportStatus.FORWARDED]: [
        ReportStatus.UNDER_REVIEW,
        ReportStatus.ASSIGNED_TO_EMPLOYEE,
        ReportStatus.REJECTED,
      ],
      [ReportStatus.ASSIGNED_TO_EMPLOYEE]: [
        ReportStatus.FIELD_WORK_IN_PROGRESS,
        ReportStatus.PENDING_APPROVAL,
        ReportStatus.AWAITING_INFORMATION,
        ReportStatus.UNDER_REVIEW,
      ],
      [ReportStatus.FIELD_WORK_IN_PROGRESS]: [
        ReportStatus.PENDING_APPROVAL,
        ReportStatus.RESOLVED,
        ReportStatus.AWAITING_INFORMATION,
      ],
      [ReportStatus.PENDING_APPROVAL]: [
        ReportStatus.RESOLVED,
        ReportStatus.REJECTED,
        ReportStatus.FIELD_WORK_IN_PROGRESS,
        ReportStatus.UNDER_REVIEW,
      ],
      [ReportStatus.AWAITING_INFORMATION]: [
        ReportStatus.UNDER_REVIEW,
        ReportStatus.FIELD_WORK_IN_PROGRESS,
      ],
      [ReportStatus.REJECTED]: [],
      [ReportStatus.RESOLVED]: [],
    };
    return allowedTransitions[currentStatus]?.includes(newStatus) ?? false;
  }

  private canUserPerformActionOnReport(
    report: Report,
    authUser: AuthUser,
    action: 'view' | 'update_basic' | 'delete' | 'change_status' | 'assign' | 'forward'
  ): boolean {
    if (authUser.roles.includes(UserRole.SYSTEM_ADMIN)) return true;

    if (authUser.roles.includes(UserRole.CITIZEN)) {
      if (report.userId !== authUser.sub) return false;
      if (action === 'view') return true;
      if (
        action === 'update_basic' &&
        (report.status === ReportStatus.SUBMITTED ||
          report.status === ReportStatus.AWAITING_INFORMATION)
      )
        return true;
      if (action === 'delete' && report.status === ReportStatus.SUBMITTED) return true;
      return false;
    }

    if (authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR)) {
      if (report.currentDepartmentId !== authUser.departmentId) return false;
      if (
        action === 'view' ||
        action === 'update_basic' ||
        action === 'change_status' ||
        action === 'assign' ||
        action === 'forward'
      )
        return true;
      return false;
    }

    if (authUser.roles.includes(UserRole.DEPARTMENT_EMPLOYEE)) {
      if (
        report.currentDepartmentId !== authUser.departmentId ||
        report.assignedEmployeeId !== authUser.sub
      )
        return false;
      if (action === 'view') return true;
      if (action === 'update_basic' || action === 'change_status') return true;
      return false;
    }
    return false;
  }

  private canRoleTransitionStatus(
    reportStatus: ReportStatus,
    newStatus: ReportStatus,
    authUserRoles: UserRole[]
  ): boolean {
    if (authUserRoles.includes(UserRole.SYSTEM_ADMIN)) return true;

    if (authUserRoles.includes(UserRole.DEPARTMENT_SUPERVISOR)) {
      const supervisorAllowed: ReportStatus[] = [
        ReportStatus.UNDER_REVIEW,
        ReportStatus.ASSIGNED_TO_EMPLOYEE,
        ReportStatus.FIELD_WORK_IN_PROGRESS,
        ReportStatus.PENDING_APPROVAL,
        ReportStatus.RESOLVED,
        ReportStatus.REJECTED,
        ReportStatus.FORWARDED,
        ReportStatus.AWAITING_INFORMATION,
      ];
      return supervisorAllowed.includes(newStatus);
    }
    if (authUserRoles.includes(UserRole.DEPARTMENT_EMPLOYEE)) {
      const employeeAllowed: ReportStatus[] = [
        ReportStatus.FIELD_WORK_IN_PROGRESS,
        ReportStatus.PENDING_APPROVAL,
        ReportStatus.AWAITING_INFORMATION,
      ];
      if (
        newStatus === ReportStatus.SUBMITTED ||
        newStatus === ReportStatus.RESOLVED ||
        newStatus === ReportStatus.REJECTED ||
        newStatus === ReportStatus.FORWARDED
      )
        return false;
      return employeeAllowed.includes(newStatus);
    }
    return false;
  }

  async findAll(authUser: AuthUser, options?: IReportFindAllOptions): Promise<ISpatialQueryResult> {
    const queryOptions: IReportFindAllOptions = { ...options };

    if (authUser.roles.includes(UserRole.CITIZEN)) {
      queryOptions.userId = authUser.sub;
    } else if (
      authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR) ||
      authUser.roles.includes(UserRole.DEPARTMENT_EMPLOYEE)
    ) {
      if (authUser.departmentId) {
        // Eğer kullanıcı kendi departmanına ait raporları istiyorsa ve özellikle bir departman filtresi belirtmemişse
        if (!options?.departmentCode && authUser.departmentId) {
          try {
            const userDepartment = await this.departmentService.findById(authUser.departmentId);
            queryOptions.departmentCode = userDepartment.code; // department -> departmentCode
          } catch (error) {
            console.error(
              `Department not found for user ${authUser.sub} with departmentId ${authUser.departmentId}: ${(error as Error).message}`
            );
            return {
              data: [],
              total: 0,
              page: options?.page || 1,
              limit: options?.limit || 10,
            };
          }
        }
        // Eğer kullanıcı bir departman filtresi belirtmişse ve bu kendi departmanı değilse (ve admin değilse) hata verilebilir.
        // Ancak şu anki mantıkta, eğer departmentCode belirtilmişse o kullanılır, belirtilmemişse kullanıcının departmanı kullanılır.
        // Bu davranış şimdilik korunuyor.
      } else {
        // Kullanıcının departman ID'si yoksa ve admin değilse ve departman filtresi de yoksa hata fırlat.
        if (!options?.departmentCode && !authUser.roles.includes(UserRole.SYSTEM_ADMIN)) {
          throw new UnauthorizedException(
            'User department information is missing and no department filter provided.'
          );
        }
      }
    }
    // reportRepository.findAll çağrısında options doğrudan geçiliyor, bu options IReportFindAllOptions tipinde olmalı
    // ve reportRepository.findAll da bu güncellenmiş alan adlarını (reportType, departmentCode) beklemeli.
    // Bir önceki adımda ReportRepository güncellenmişti.
    return this.reportRepository.findAll(queryOptions);
  }

  async findOne(id: number, authUser: AuthUser): Promise<Report> {
    const report = await this.reportRepository.findById(id);
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    if (!this.canUserPerformActionOnReport(report, authUser, 'view')) {
      throw new UnauthorizedException('You do not have permission to view this report.');
    }
    return report;
  }

  async create(createReportDto: CreateReportDto, authUser: AuthUser): Promise<Report> {
    const { location, reportType, categoryId, departmentCode, reportMedias, ...reportData } =
      createReportDto;
    const point = this.locationService.createPointFromDto(location);
    const userId = authUser.sub;

    let targetDepartmentId: number;

    if (departmentCode) {
      const departmentEntity = await this.departmentService.findByCode(departmentCode);
      targetDepartmentId = departmentEntity.id;
    } else if (reportType) {
      const suggestedDepartment =
        await this.departmentService.suggestDepartmentForReport(reportType);
      targetDepartmentId = suggestedDepartment.id;
    } else {
      const generalDepartment = await this.departmentService.findByCode(
        MunicipalityDepartment.GENERAL
      );
      targetDepartmentId = generalDepartment.id;
    }

    const dataForRepoCreate: CreateReportData = {
      title: reportData.title,
      description: reportData.description,
      location: point,
      address: reportData.address,
      reportType: reportType,
      status: ReportStatus.SUBMITTED,
      categoryId: categoryId,
      currentDepartmentId: targetDepartmentId,
      reportMedias: reportMedias
        ? reportMedias.map(m => ({ url: m.url, type: m.type }))
        : undefined,
    };

    const createdReport = await this.reportRepository.create(dataForRepoCreate, userId);
    return createdReport;
  }

  async update(id: number, updateReportDto: UpdateReportDto, authUser: AuthUser): Promise<Report> {
    const report = await this.findOne(id, authUser);

    if (!this.canUserPerformActionOnReport(report, authUser, 'update_basic')) {
      throw new UnauthorizedException('You do not have permission to update this report.');
    }

    if (
      authUser.roles.includes(UserRole.CITIZEN) &&
      report.status !== ReportStatus.SUBMITTED &&
      report.status !== ReportStatus.AWAITING_INFORMATION
    ) {
      throw new BadRequestException(
        `Report in status ${report.status} cannot be updated by citizen.`
      );
    }

    const { location, reportType, reportMedias, ...updateData } = updateReportDto;
    const finalUpdateData: Partial<Report> = { ...updateData };

    if (location) {
      finalUpdateData.location = this.locationService.createPointFromDto(location);
    }
    if (reportType) {
      finalUpdateData.reportType = reportType;
    }

    if (reportMedias) {
      (finalUpdateData as Partial<Report> & { reportMedias?: ReportMedia[] }).reportMedias =
        reportMedias.map(m => ({ ...m, reportId: id }) as ReportMedia);
    }

    const updatedReport = await this.reportRepository.update(id, finalUpdateData);
    if (!updatedReport) {
      throw new NotFoundException(`Report with ID ${id} could not be updated or not found.`);
    }
    return this.findOne(id, authUser);
  }

  async remove(id: number, authUser: AuthUser): Promise<void> {
    const report = await this.findOne(id, authUser);

    if (!this.canUserPerformActionOnReport(report, authUser, 'delete')) {
      throw new UnauthorizedException('You do not have permission to delete this report.');
    }
    const result = await this.reportRepository.remove(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Report with ID ${id} not found for deletion.`);
    }
  }

  async updateStatus(
    id: number,
    newStatus: ReportStatus,
    authUser: AuthUser,
    details?: { rejectionReason?: string; resolutionNotes?: string }
  ): Promise<Report> {
    const report = await this.findOne(id, authUser);

    if (!this.canUserPerformActionOnReport(report, authUser, 'change_status')) {
      throw new UnauthorizedException(
        'You do not have permission to change the status of this report.'
      );
    }
    if (!this.canRoleTransitionStatus(report.status, newStatus, authUser.roles)) {
      throw new BadRequestException(
        `User role ${authUser.roles.join(', ')} is not allowed to transition to ${newStatus}.`
      );
    }
    if (!this.isTransitionAllowed(report.status, newStatus)) {
      throw new BadRequestException(
        `Cannot transition report from ${report.status} to ${newStatus}.`
      );
    }

    const updatePayload: Partial<Report> = { status: newStatus };

    if (newStatus === ReportStatus.RESOLVED) {
      updatePayload.closedByUserId = authUser.sub;
      updatePayload.resolvedAt = new Date();
      if (details?.resolutionNotes) {
        updatePayload.resolutionNotes = details.resolutionNotes;
      }
    }
    if (newStatus === ReportStatus.REJECTED) {
      if (!details?.rejectionReason) {
        throw new BadRequestException('Rejection reason is required when rejecting a report.');
      }
      updatePayload.rejectionReason = details.rejectionReason;
      updatePayload.closedByUserId = authUser.sub;
    }

    await this.reportRepository.update(id, updatePayload);
    return this.findOne(id, authUser);
  }

  async assignReportToEmployee(
    reportId: number,
    employeeId: number,
    authUser: AuthUser
  ): Promise<Report> {
    const report = await this.findOne(reportId, authUser);

    if (!this.canUserPerformActionOnReport(report, authUser, 'assign')) {
      throw new UnauthorizedException('You do not have permission to assign this report.');
    }
    const reportDeptId = report.currentDepartmentId;
    if (!reportDeptId) {
      throw new BadRequestException('Report department information is missing for assignment.');
    }

    const employee = await this.usersService.findEmployeeInDepartment(employeeId, reportDeptId);
    if (!employee || !employee.roles.includes(UserRole.DEPARTMENT_EMPLOYEE)) {
      throw new NotFoundException(
        'Target employee not found, not an employee, or not in the correct department.'
      );
    }

    const assignableStatuses: ReportStatus[] = [
      ReportStatus.SUBMITTED,
      ReportStatus.UNDER_REVIEW,
      ReportStatus.FORWARDED,
      ReportStatus.ASSIGNED_TO_EMPLOYEE,
      ReportStatus.AWAITING_INFORMATION,
    ];
    if (!assignableStatuses.includes(report.status)) {
      throw new BadRequestException(`Report in status ${report.status} cannot be assigned.`);
    }

    await this.reportRepository.update(reportId, {
      assignedEmployeeId: employeeId,
      status: ReportStatus.ASSIGNED_TO_EMPLOYEE,
    });

    return this.findOne(reportId, authUser);
  }

  async changeDepartment(
    id: number,
    newDepartmentCode: MunicipalityDepartment,
    reason: string | undefined,
    authUser: AuthUser
  ): Promise<Report> {
    const report = await this.findOne(id, authUser);

    if (!this.canUserPerformActionOnReport(report, authUser, 'forward')) {
      throw new UnauthorizedException('You do not have permission to forward this report.');
    }

    if (report.currentDepartment?.code === newDepartmentCode) {
      throw new BadRequestException(`Report is already in the ${newDepartmentCode} department.`);
    }

    await this.departmentService.findByCode(newDepartmentCode);

    let finalReason = reason;
    if (!reason) {
      if (
        authUser.roles.includes(UserRole.SYSTEM_ADMIN) ||
        authUser.roles.includes(UserRole.DEPARTMENT_SUPERVISOR)
      ) {
        throw new BadRequestException('Reason is required for forwarding by Supervisor/Admin.');
      } else {
        finalReason = 'Department changed by system.';
      }
    }

    const forwardDto: ForwardReportDto = {
      newDepartment: newDepartmentCode,
      reason: finalReason as string,
    };

    await this.departmentService.forwardReport(id, forwardDto, authUser.sub);

    const updatedReportAfterForward = await this.reportRepository.findById(id);
    if (updatedReportAfterForward && updatedReportAfterForward.status !== ReportStatus.FORWARDED) {
      await this.reportRepository.update(id, { status: ReportStatus.FORWARDED });
    }

    return this.findOne(id, authUser);
  }

  async getReportsByUser(
    authUser: AuthUser,
    options?: IReportFindAllOptions // IReportFindAllOptions kullanılacak şekilde güncellendi
  ): Promise<ISpatialQueryResult> {
    // options'dan type ve status gelebilir, bunları reportType ve status olarak doğru şekilde iletmeliyiz.
    const queryOptions: IReportFindAllOptions = {
      ...options,
      userId: authUser.sub,
      // options.type varsa queryOptions.reportType'a ata, yoksa undefined kalsın.
      reportType: options?.reportType, // Eğer options.type geliyorsa, bunu reportType olarak ata.
      // departmentCode burada yönetilmiyor, çünkü bu sadece kullanıcının kendi raporları.
    };
    return this.reportRepository.findAll(queryOptions);
  }

  async findNearby(
    searchDto: { latitude: number; longitude: number; radius: number },
    options?: {
      limit?: number;
      page?: number;
      reportType?: ReportType; // type -> reportType
      status?: ReportStatus;
      departmentCode?: MunicipalityDepartment; // department -> departmentCode
    }
  ): Promise<ISpatialQueryResult> {
    const { latitude, longitude, radius } = searchDto;
    // reportRepository.findNearby çağrısında options doğrudan geçiliyor.
    // ReportRepository.findNearby'ın da bu güncellenmiş alan adlarını (reportType, departmentCode) beklemesi gerekir.
    // Bir önceki adımda ReportRepository güncellenmişti.
    return this.reportRepository.findNearby(latitude, longitude, radius, options);
  }

  async getDepartmentHistory(
    reportId: number,
    authUser: AuthUser
  ): Promise<DepartmentHistoryResponseDto[]> {
    await this.findOne(reportId, authUser);
    const history = await this.departmentService.getReportDepartmentHistory(reportId);
    return history.map(h => {
      if (!h.changedByUser) {
        throw new NotFoundException(`User who changed department history (ID: ${h.id}) not found.`);
      }
      return {
        id: h.id,
        reportId: h.reportId,
        previousDepartment: h.previousDepartment ?? null,
        newDepartment: h.newDepartment,
        reason: h.reason ?? '',
        changedByUser: h.changedByUser,
        changedAt: h.changedAt,
      };
    });
  }

  async suggestDepartmentForReportType(type: ReportType): Promise<MunicipalityDepartment> {
    const department = await this.departmentService.suggestDepartmentForReport(type);
    return department.code;
  }
}
