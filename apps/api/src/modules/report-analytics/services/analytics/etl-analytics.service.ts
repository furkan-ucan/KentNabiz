/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CoreAnalyticsService } from './core-analytics.service';

@Injectable()
export class ETLAnalyticsService extends CoreAnalyticsService {
  /**
   * Populate fact_reports table from clean_reports_vw
   * This is the main ETL process for the data warehouse
   */
  async populateFactReports(): Promise<void> {
    this.logger.log('🚀 Starting ETL process: clean_reports_vw → fact_reports');

    try {
      const query = `
        INSERT INTO fact_reports (
          report_id,
          created_at_dt,
          created_at_ts,
          department_id,
          category_id,
          user_id,
          first_response_duration_secs,
          intervention_duration_secs,
          resolution_duration_secs,
          support_count,
          final_status,
          latitude,
          longitude,
          last_updated_at
        )
        SELECT
          id as report_id,
          created_at::date as created_at_dt,
          created_at as created_at_ts,
          department_id,
          category_id,
          user_id,
          -- İlk müdahale süresi (saniye): İlk atama zamanı - oluşturulma zamanı
          CASE
            WHEN first_assigned_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM (first_assigned_at - created_at))
            ELSE NULL
          END as first_response_duration_secs,
          -- Müdahale süresi (saniye): İlk kabul - ilk atama
          CASE
            WHEN first_accepted_at IS NOT NULL AND first_assigned_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM (first_accepted_at - first_assigned_at))
            ELSE NULL
          END as intervention_duration_secs,
          -- Toplam çözüm süresi (saniye): Çözülme - oluşturulma
          CASE
            WHEN resolved_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM (resolved_at - created_at))
            ELSE NULL
          END as resolution_duration_secs,
          support_count,
          status as final_status,
          latitude,
          longitude,
          NOW() as last_updated_at
        FROM
          clean_reports_vw
        ON CONFLICT (report_id) DO UPDATE SET
          created_at_dt = EXCLUDED.created_at_dt,
          created_at_ts = EXCLUDED.created_at_ts,
          department_id = EXCLUDED.department_id,
          category_id = EXCLUDED.category_id,
          first_response_duration_secs = EXCLUDED.first_response_duration_secs,
          intervention_duration_secs = EXCLUDED.intervention_duration_secs,
          resolution_duration_secs = EXCLUDED.resolution_duration_secs,
          support_count = EXCLUDED.support_count,
          final_status = EXCLUDED.final_status,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          last_updated_at = NOW();
      `;
      const result = await this.dataSource.query(query);
      const processedRows = Array.isArray(result) ? result.length : 'N/A';
      this.logger.log(
        `✅ fact_reports table populated successfully. Processed rows: ${processedRows}`
      );
    } catch (error: unknown) {
      this.logger.error('❌ Error populating fact_reports table:', error);
      throw error;
    }
  }

  /**
   * Scheduled ETL process - runs every day at 3 AM
   * This ensures the data warehouse is kept up to date
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleFactTablePopulation() {
    this.logger.log('🕰️ Scheduled ETL process started at 3 AM');
    try {
      await this.populateFactReports();
      this.logger.log('🎉 Scheduled ETL process completed successfully');
    } catch (error: unknown) {
      this.logger.error('💥 Scheduled ETL process failed:', error);
    }
  }

  /**
   * Manual ETL trigger - for admin endpoint
   */
  async triggerManualETL(): Promise<{ success: boolean; message: string }> {
    this.logger.log('🔧 Manual ETL process triggered');
    try {
      await this.populateFactReports();
      return {
        success: true,
        message: 'ETL process completed successfully',
      };
    } catch (error: unknown) {
      this.logger.error('💥 Manual ETL process failed:', error);
      return {
        success: false,
        message: `ETL process failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get ETL status and statistics
   */
  async getETLStatus(): Promise<{
    lastUpdated: Date | null;
    sourceCount: number;
    targetCount: number;
    isInSync: boolean;
  }> {
    try {
      // Get latest update time from fact_reports
      const lastUpdateResult = await this.dataSource.query(`
        SELECT MAX(last_updated_at) as last_updated
        FROM fact_reports
      `);

      // Get source count from clean_reports_vw
      const sourceCountResult = await this.dataSource.query(`
        SELECT COUNT(*) as count
        FROM clean_reports_vw
      `);

      // Get target count from fact_reports
      const targetCountResult = await this.dataSource.query(`
        SELECT COUNT(*) as count
        FROM fact_reports
      `);

      const lastUpdated = lastUpdateResult[0]?.last_updated || null;
      const sourceCount = parseInt(sourceCountResult[0]?.count || '0');
      const targetCount = parseInt(targetCountResult[0]?.count || '0');
      const isInSync = sourceCount === targetCount;

      return {
        lastUpdated,
        sourceCount,
        targetCount,
        isInSync,
      };
    } catch (error) {
      this.logger.error('Error getting ETL status:', error);
      throw error;
    }
  }

  /**
   * Validate data quality after ETL
   */
  async validateDataQuality(): Promise<{
    validationResults: Array<{
      check: string;
      passed: boolean;
      details?: string;
    }>;
    overallScore: number;
  }> {
    const validationResults = [];
    let passedChecks = 0;

    try {
      // Check 1: No null report_ids
      const nullIdCheck = await this.dataSource.query(`
        SELECT COUNT(*) as count
        FROM fact_reports
        WHERE report_id IS NULL
      `);
      const hasNullIds = parseInt(nullIdCheck[0]?.count || '0') > 0;
      validationResults.push({
        check: 'No null report IDs',
        passed: !hasNullIds,
        details: hasNullIds ? `Found ${nullIdCheck[0].count} null report IDs` : undefined,
      });
      if (!hasNullIds) passedChecks++;

      // Check 2: All dates are valid
      const invalidDateCheck = await this.dataSource.query(`
        SELECT COUNT(*) as count
        FROM fact_reports
        WHERE created_at_dt IS NULL OR created_at_ts IS NULL
      `);
      const hasInvalidDates = parseInt(invalidDateCheck[0]?.count || '0') > 0;
      validationResults.push({
        check: 'Valid date fields',
        passed: !hasInvalidDates,
        details: hasInvalidDates ? `Found ${invalidDateCheck[0].count} invalid dates` : undefined,
      });
      if (!hasInvalidDates) passedChecks++;

      // Check 3: Reasonable duration values
      const unreasonableDurationCheck = await this.dataSource.query(`
        SELECT COUNT(*) as count
        FROM fact_reports
        WHERE resolution_duration_secs < 0
           OR first_response_duration_secs < 0
           OR intervention_duration_secs < 0
      `);
      const hasUnreasonableDurations = parseInt(unreasonableDurationCheck[0]?.count || '0') > 0;
      validationResults.push({
        check: 'Reasonable duration values',
        passed: !hasUnreasonableDurations,
        details: hasUnreasonableDurations
          ? `Found ${unreasonableDurationCheck[0].count} negative durations`
          : undefined,
      });
      if (!hasUnreasonableDurations) passedChecks++;

      // Check 4: Valid coordinates
      const invalidCoordsCheck = await this.dataSource.query(`
        SELECT COUNT(*) as count
        FROM fact_reports
        WHERE (latitude IS NOT NULL AND (latitude < -90 OR latitude > 90))
           OR (longitude IS NOT NULL AND (longitude < -180 OR longitude > 180))
      `);
      const hasInvalidCoords = parseInt(invalidCoordsCheck[0]?.count || '0') > 0;
      validationResults.push({
        check: 'Valid coordinates',
        passed: !hasInvalidCoords,
        details: hasInvalidCoords
          ? `Found ${invalidCoordsCheck[0].count} invalid coordinates`
          : undefined,
      });
      if (!hasInvalidCoords) passedChecks++;

      const overallScore = (passedChecks / validationResults.length) * 100;

      return {
        validationResults,
        overallScore,
      };
    } catch (error) {
      this.logger.error('Error validating data quality:', error);
      throw error;
    }
  }
}
