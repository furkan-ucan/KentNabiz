import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtPayload as AuthUser } from '../../auth/interfaces/jwt-payload.interface';
import { UserRole } from '@kentnabiz/shared';

// Funnel Chart için interface
export interface FunnelStatsResult {
  totalReports: number;
  assignedReports: number;
  resolvedReports: number;
}

// Database sonucu için interface
interface FunnelQueryResult {
  total_reports: string;
  assigned_reports: string;
  resolved_reports: string;
}

@Injectable()
export class FunnelAnalyticsService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * İş Akışı Hunisi verilerini hesaplar
   * Raporların yaşam döngüsündeki aşamaları ve dönüşüm oranlarını gösterir
   */
  async getFunnelStats(
    startDate?: Date,
    endDate?: Date,
    departmentId?: number,
    authUser?: AuthUser
  ): Promise<FunnelStatsResult> {
    try {
      // Base query - report_analytics_mv materialized view'ını kullanıyoruz
      let baseQuery = `
        SELECT
          COUNT(*) AS total_reports,
          COUNT(*) FILTER (WHERE first_assigned_at IS NOT NULL) AS assigned_reports,
          COUNT(*) FILTER (WHERE status = 'DONE') AS resolved_reports
        FROM report_analytics_mv
        WHERE 1=1
      `;
      const params: (string | number | Date)[] = [];
      let paramIndex = 1;

      // Tarih filtresi
      if (startDate && endDate) {
        baseQuery += ` AND created_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
        params.push(startDate, endDate);
        paramIndex += 2;
      }

      // Departman filtresi
      if (departmentId) {
        baseQuery += ` AND department_id = $${paramIndex}`;
        params.push(departmentId);
        paramIndex++;
      } // Kullanıcı rolü bazlı filtreleme
      if (authUser?.roles?.includes(UserRole.CITIZEN)) {
        baseQuery += ` AND user_id = $${paramIndex}`;
        params.push(authUser.sub);
        paramIndex++;
      } else if (authUser?.departmentId && !authUser.roles?.includes(UserRole.SYSTEM_ADMIN)) {
        // Sadece kendi departmanının verilerini görsün
        baseQuery += ` AND department_id = $${paramIndex}`;
        params.push(authUser.departmentId);
        paramIndex++;
      }

      const result = await this.dataSource.query(baseQuery, params);

      if (result && Array.isArray(result) && result.length > 0) {
        const row = result[0] as FunnelQueryResult;
        return {
          totalReports: parseInt(row.total_reports, 10) || 0,
          assignedReports: parseInt(row.assigned_reports, 10) || 0,
          resolvedReports: parseInt(row.resolved_reports, 10) || 0,
        };
      }

      return {
        totalReports: 0,
        assignedReports: 0,
        resolvedReports: 0,
      };
    } catch (error) {
      console.error('Error in getFunnelStats:', error);
      return {
        totalReports: 0,
        assignedReports: 0,
        resolvedReports: 0,
      };
    }
  }
}
