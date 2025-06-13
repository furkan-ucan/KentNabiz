import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtPayload as AuthUser } from '../../auth/interfaces/jwt-payload.interface';
import { UserRole } from '@kentnabiz/shared';

// Temporal Distribution için interface'ler
export interface TemporalQueryDto {
  granularity: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  departmentId?: number;
}

export interface TemporalDataPoint {
  date: string;
  createdCount: number;
  resolvedCount: number;
}

// Database sonucu için interface
interface TemporalQueryResult {
  date: string;
  createdCount: string;
  resolvedCount: string;
}

@Injectable()
export class TemporalAnalyticsService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Rapor akış trendi verilerini hesaplar
   * Zaman içinde oluşturulan ve çözülen rapor sayılarını gösterir
   */
  async getTemporalDistribution(
    filters: TemporalQueryDto,
    authUser?: AuthUser
  ): Promise<TemporalDataPoint[]> {
    try {
      const { granularity, startDate, endDate, departmentId } = filters;

      // Rol bazlı departman filtresi
      const effectiveDepartmentId = authUser?.roles?.includes(UserRole.SYSTEM_ADMIN)
        ? departmentId
        : authUser?.departmentId;

      // Granularity için SQL 'date_trunc' karşılığını güvenli bir şekilde belirle
      const truncValueMap = {
        daily: 'day',
        weekly: 'week',
        monthly: 'month',
      };
      const truncValue = truncValueMap[granularity] || 'day';

      // İnterval değerini belirle
      const intervalMap = {
        daily: '1 day',
        weekly: '1 week',
        monthly: '1 month',
      };
      const intervalValue = intervalMap[granularity] || '1 day';

      const baseQuery = `
        WITH date_series AS (
          SELECT generate_series($1::date, $2::date, '${intervalValue}') AS "date"
        ),
        created_reports AS (
          SELECT 
            date_trunc('${truncValue}', created_at) AS "date", 
            COUNT(*) as count
          FROM report_analytics_mv
          WHERE created_at BETWEEN $1 AND $2
            ${effectiveDepartmentId ? 'AND department_id = $3' : ''}
          GROUP BY 1
        ),
        resolved_reports AS (
          SELECT 
            date_trunc('${truncValue}', resolved_at) AS "date", 
            COUNT(*) as count
          FROM report_analytics_mv
          WHERE resolved_at BETWEEN $1 AND $2
            AND status = 'DONE'
            ${effectiveDepartmentId ? 'AND department_id = $3' : ''}
          GROUP BY 1
        )
        SELECT
          TO_CHAR(ds.date, 'YYYY-MM-DD') as "date",
          COALESCE(cr.count, 0)::int as "createdCount",
          COALESCE(rr.count, 0)::int as "resolvedCount"
        FROM date_series ds
        LEFT JOIN created_reports cr ON ds.date = cr.date
        LEFT JOIN resolved_reports rr ON ds.date = rr.date
        ORDER BY ds.date ASC;
      `;

      const params = effectiveDepartmentId
        ? [startDate, endDate, effectiveDepartmentId]
        : [startDate, endDate];

      const result: TemporalQueryResult[] = await this.dataSource.query(baseQuery, params);

      // Transform ve return
      return result.map(
        (row: TemporalQueryResult): TemporalDataPoint => ({
          date: row.date,
          createdCount: parseInt(row.createdCount, 10) || 0,
          resolvedCount: parseInt(row.resolvedCount, 10) || 0,
        })
      );
    } catch (error) {
      console.error('Temporal distribution calculation error:', error);

      // Hata durumunda boş array döndür
      return [];
    }
  }

  /**
   * Trend analizi (isteğe bağlı gelecek özellik için)
   * Artış/azalış oranlarını hesaplayabilir
   */
  async getTrendAnalysis(_filters: TemporalQueryDto, _authUser?: AuthUser): Promise<never[]> {
    // TODO: Gelecekte trend analizi hesaplayacak
    // Şimdilik boş array döndür
    return Promise.resolve([]);
  }
}
