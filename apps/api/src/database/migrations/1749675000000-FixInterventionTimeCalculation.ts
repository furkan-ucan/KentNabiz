import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Fix Intervention Time Calculation in Analytics Materialized View
 *
 * Düzeltme: Müdahale süresi hesaplama mantığını değiştiriyor
 * Eski: İlk Kabul - İlk Atama (bazen negatif çıkabilir)
 * Yeni: İlk Kabul - Rapor Oluşturma (her zaman pozitif)
 *
 * Bu, vatandaşın raporu oluşturduğu andan,
 * gerçek müdahalenin başladığı ana kadar geçen süreyi ölçer.
 */
export class FixInterventionTimeCalculation1749675000000 implements MigrationInterface {
  private readonly viewName = 'report_analytics_mv';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Mevcut Materialized View'ı kaldır
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS ${this.viewName};`);

    // 2. Düzeltilmiş Materialized View'ı oluştur
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW ${this.viewName} AS
      SELECT
          r.id AS report_id,
          r.title,
          r.description,
          r.status,
          r.current_department_id AS department_id,
          r.category_id,
          c.code AS category_code,
          r.user_id,
          r.created_at,
          r.updated_at,
          r.resolved_at,
          -- Çözüm süresi: resolved_at - created_at (saniye cinsinden)
          CASE
              WHEN r.resolved_at IS NOT NULL AND r.created_at IS NOT NULL THEN
                  EXTRACT(EPOCH FROM (r.resolved_at - r.created_at))
              ELSE NULL
          END AS resolution_duration_seconds,
          -- MÜDAHALENİ SÜRESİ: İlk kabul zamanı - rapor oluşturma zamanı
          -- Bu, raporun oluşturulmasından gerçek müdahalenin başlamasına kadar geçen süreyi ölçer
          CASE
              WHEN (
                  SELECT MIN(a.accepted_at)
                  FROM assignments a
                  WHERE a.report_id = r.id AND a.deleted_at IS NULL AND a.accepted_at IS NOT NULL
              ) IS NOT NULL THEN
                  EXTRACT(EPOCH FROM (
                      (
                          SELECT MIN(a.accepted_at)
                          FROM assignments a
                          WHERE a.report_id = r.id AND a.deleted_at IS NULL AND a.accepted_at IS NOT NULL
                      ) - r.created_at
                  ))
              ELSE NULL
          END AS intervention_duration_seconds,
          -- İlk atama zamanı (ek bilgi olarak)
          (
              SELECT MIN(a.assigned_at)
              FROM assignments a
              WHERE a.report_id = r.id AND a.deleted_at IS NULL
          ) AS first_assigned_at,
          -- İlk kabul zamanı (ek bilgi olarak)
          (
              SELECT MIN(a.accepted_at)
              FROM assignments a
              WHERE a.report_id = r.id AND a.deleted_at IS NULL AND a.accepted_at IS NOT NULL
          ) AS first_accepted_at
      FROM
          reports r
      LEFT JOIN
          departments d ON r.current_department_id = d.id
      LEFT JOIN
          report_categories c ON r.category_id = c.id
      WHERE
          r.deleted_at IS NULL;
    `);

    // 3. View üzerinde indexler oluştur (performans için)
    await queryRunner.query(
      `CREATE INDEX idx_report_analytics_mv_department_id ON ${this.viewName} (department_id);`
    );
    await queryRunner.query(
      `CREATE INDEX idx_report_analytics_mv_status ON ${this.viewName} (status);`
    );
    await queryRunner.query(
      `CREATE INDEX idx_report_analytics_mv_created_at ON ${this.viewName} (created_at);`
    );
    await queryRunner.query(
      `CREATE INDEX idx_report_analytics_mv_category_code ON ${this.viewName} (category_code);`
    );
    await queryRunner.query(
      `CREATE INDEX idx_report_analytics_mv_intervention_duration ON ${this.viewName} (intervention_duration_seconds) WHERE intervention_duration_seconds IS NOT NULL;`
    );

    // 4. View'ı refresh et
    await queryRunner.query(`REFRESH MATERIALIZED VIEW ${this.viewName};`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: Eski versiyonu geri yükle (eski mantık)
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS ${this.viewName};`);

    // Eski versiyonu geri oluştur (intervention_duration_seconds ile eski mantık)
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW ${this.viewName} AS
      SELECT
          r.id AS report_id,
          r.title,
          r.description,
          r.status,
          r.current_department_id AS department_id,
          r.category_id,
          c.code AS category_code,
          r.user_id,
          r.created_at,
          r.updated_at,
          r.resolved_at,
          -- Çözüm süresi: resolved_at - created_at (saniye cinsinden)
          CASE
              WHEN r.resolved_at IS NOT NULL AND r.created_at IS NOT NULL THEN
                  EXTRACT(EPOCH FROM (r.resolved_at - r.created_at))
              ELSE NULL
          END AS resolution_duration_seconds,
          -- ESKİ MANTIK: İlk kabul - İlk atama (bu bazen negatif çıkabilir)
          CASE
              WHEN (
                  SELECT MIN(a.accepted_at)
                  FROM assignments a
                  WHERE a.report_id = r.id AND a.deleted_at IS NULL AND a.accepted_at IS NOT NULL
              ) IS NOT NULL AND (
                  SELECT MIN(a.created_at)
                  FROM assignments a
                  WHERE a.report_id = r.id AND a.deleted_at IS NULL
              ) IS NOT NULL THEN
                  EXTRACT(EPOCH FROM (
                      (
                          SELECT MIN(a.accepted_at)
                          FROM assignments a
                          WHERE a.report_id = r.id AND a.deleted_at IS NULL AND a.accepted_at IS NOT NULL
                      ) - (
                          SELECT MIN(a.created_at)
                          FROM assignments a
                          WHERE a.report_id = r.id AND a.deleted_at IS NULL
                      )
                  ))
              ELSE NULL
          END AS intervention_duration_seconds
      FROM
          reports r
      LEFT JOIN
          departments d ON r.current_department_id = d.id
      LEFT JOIN
          report_categories c ON r.category_id = c.id
      WHERE
          r.deleted_at IS NULL;
    `);

    await queryRunner.query(
      `CREATE INDEX idx_report_analytics_mv_department_id ON ${this.viewName} (department_id);`
    );
    await queryRunner.query(
      `CREATE INDEX idx_report_analytics_mv_status ON ${this.viewName} (status);`
    );
    await queryRunner.query(
      `CREATE INDEX idx_report_analytics_mv_created_at ON ${this.viewName} (created_at);`
    );
    await queryRunner.query(
      `CREATE INDEX idx_report_analytics_mv_category_code ON ${this.viewName} (category_code);`
    );

    await queryRunner.query(`REFRESH MATERIALIZED VIEW ${this.viewName};`);
  }
}
