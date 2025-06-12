// apps/api/src/modules/reports/services/report-forwarding.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Report } from '../entities/report.entity';
import { Department } from '../entities/department.entity';
import { DepartmentHistory } from '../entities/department-history.entity';
import { Assignment } from '../entities/assignment.entity';
import { ForwardReportDto } from '../dto/forward-report.dto';
import { ReportStatus, AssignmentStatus } from '@kentnabiz/shared';

@Injectable()
export class ReportForwardingService {
  private readonly logger = new Logger(ReportForwardingService.name);

  constructor(private readonly dataSource: DataSource) {}

  async forward(reportId: number, dto: ForwardReportDto, changedByUserId: number): Promise<Report> {
    return this.dataSource.transaction(async manager => {
      // Raporu pessimistic lock ile getir
      const report = await manager.findOne(Report, {
        where: { id: reportId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!report) {
        throw new NotFoundException(`Rapor ID ${reportId} bulunamadı`);
      }

      // Güvenlik kontrolleri
      if (report.currentDepartmentId !== dto.fromDepartmentId) {
        throw new BadRequestException('Rapor, belirtilen kaynak departman ait değil.');
      }

      if (report.currentDepartmentId === dto.targetDepartmentId) {
        throw new BadRequestException('Rapor zaten hedef departmanda.');
      }

      // Hedef departmanı kontrol et
      const targetDepartment = await manager.findOne(Department, {
        where: { id: dto.targetDepartmentId, isActive: true },
      });

      if (!targetDepartment) {
        throw new BadRequestException('Hedef departman bulunamadı veya aktif değil.');
      }

      // Kaynak departmanı da kontrol et (ek güvenlik)
      const fromDepartment = await manager.findOne(Department, {
        where: { id: dto.fromDepartmentId, isActive: true },
      });

      if (!fromDepartment) {
        throw new BadRequestException('Kaynak departman bulunamadı veya aktif değil.');
      }

      const previousDepartmentId = report.currentDepartmentId;

      // Raporu güncelle
      report.currentDepartmentId = dto.targetDepartmentId;
      report.departmentCode = targetDepartment.code;
      report.status = ReportStatus.IN_REVIEW; // Yönlendirilen rapor tekrar incelemeye alınır
      report.updatedAt = new Date();

      await manager.save(Report, report);

      // Departman geçmişi kaydet
      const history = manager.create(DepartmentHistory, {
        reportId,
        previousDepartmentId,
        newDepartmentId: dto.targetDepartmentId,
        reason: dto.reason,
        changedByUserId,
        changedAt: new Date(),
      });

      await manager.save(DepartmentHistory, history);
      // Mevcut atamaları iptal et (yeni departmana ait değiller)
      await manager.update(
        Assignment,
        { reportId, status: AssignmentStatus.ACTIVE },
        {
          status: AssignmentStatus.CANCELLED,
          cancelledAt: new Date(),
          notes: `Rapor ${fromDepartment.name} departmanından ${targetDepartment.name} departmanına yönlendirildiği için önceki atama iptal edilmiştir. Sebep: ${dto.reason}`,
        }
      );

      this.logger.log(
        `Rapor ${reportId}, departman ${previousDepartmentId}'den ${dto.targetDepartmentId}'e yönlendirildi. Sebep: ${dto.reason}`
      );

      return report;
    });
  }
}
