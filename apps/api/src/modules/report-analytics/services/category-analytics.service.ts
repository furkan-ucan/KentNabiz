import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtPayload as AuthUser } from '../../auth/interfaces/jwt-payload.interface';
import { UserRole } from '@kentnabiz/shared';

// Category Distribution için interface
export interface CategoryDistributionResult {
  categoryId: number;
  categoryName: string;
  categoryCode: string;
  count: number;
}

// Database sonucu için interface
interface CategoryQueryResult {
  category_id: string;
  category_name: string;
  category_code: string;
  report_count: string;
}

@Injectable()
export class CategoryAnalyticsService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * En çok rapor alan kategorileri hesaplar
   * Horizontal bar chart için kullanılır
   */
  async getCategoryDistribution(
    startDate?: Date,
    endDate?: Date,
    departmentId?: number,
    authUser?: AuthUser,
    limit: number = 10
  ): Promise<CategoryDistributionResult[]> {
    try {
      // Base query - report_analytics_mv materialized view'ını kullanıyoruz
      let baseQuery = `
        SELECT
          rc.id as category_id,
          rc.name as category_name,
          rc.code as category_code,
          COUNT(*) as report_count
        FROM report_analytics_mv rav
        INNER JOIN report_categories rc ON rav.category_id = rc.id
        WHERE 1=1
      `;

      const params: (string | number | Date)[] = [];
      let paramIndex = 1;

      // Tarih filtresi
      if (startDate && endDate) {
        baseQuery += ` AND rav.created_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
        params.push(startDate, endDate);
        paramIndex += 2;
      }

      // Departman filtresi (role-based access control)
      const effectiveDepartmentId = authUser?.roles?.includes(UserRole.SYSTEM_ADMIN)
        ? departmentId
        : authUser?.departmentId;

      if (effectiveDepartmentId) {
        baseQuery += ` AND rav.department_id = $${paramIndex}`;
        params.push(effectiveDepartmentId);
        paramIndex++;
      }

      // Grup ve sıralama
      baseQuery += `
        GROUP BY rc.id, rc.name, rc.code
        ORDER BY report_count DESC
        LIMIT $${paramIndex}
      `;
      params.push(limit); // Query execution
      const result: CategoryQueryResult[] = await this.dataSource.query(baseQuery, params);

      // Transform ve return
      return result.map(
        (row: CategoryQueryResult): CategoryDistributionResult => ({
          categoryId: parseInt(row.category_id, 10),
          categoryName: row.category_name || 'Bilinmeyen Kategori',
          categoryCode: row.category_code || 'UNKNOWN',
          count: parseInt(row.report_count, 10) || 0,
        })
      );
    } catch (error) {
      console.error('Category distribution calculation error:', error);

      // Hata durumunda boş array döndür
      return [];
    }
  }
  /**
   * Kategori trend analizi (isteğe bağlı gelecek özellik için)
   */
  getCategoryTrends(
    _startDate?: Date,
    _endDate?: Date,
    _departmentId?: number,
    _authUser?: AuthUser
  ): Promise<never[]> {
    // TODO: Gelecekte kategori trendlerini hesaplayacak
    // Şimdilik boş array döndür
    return Promise.resolve([]);
  }
}
