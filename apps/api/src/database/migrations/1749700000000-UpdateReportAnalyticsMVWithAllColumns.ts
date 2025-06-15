import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateReportAnalyticsMVWithAllColumns1749700000000 implements MigrationInterface {
  private readonly viewName = 'report_analytics_mv';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Mevcut materialized view'ı sil
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS ${this.viewName};`);

    // Tüm gerekli kolonları içeren yeni materialized view oluştur
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW ${this.viewName} AS
      SELECT
          r.id AS report_id,
          r.status,
          r.current_department_id AS department_id,
          d.code AS department_code,
          r.category_id,
          c.code AS category_code,
          r.created_at,
          r.resolved_at,          -- Çözüm süresini saniye cinsinden hesapla
          CASE
              WHEN r.resolved_at IS NOT NULL THEN
                  EXTRACT(EPOCH FROM (r.resolved_at - r.created_at))
              ELSE NULL
          END AS resolution_duration_seconds,-- İlk atama tarihini hesapla (en eski assignment kaydından)
          (
              SELECT MIN(a.created_at)
              FROM assignments a
              WHERE a.report_id = r.id
              AND a.deleted_at IS NULL
          ) AS first_assigned_at,
          -- Müdahale süresini saniye cinsinden hesapla (ilk atamaya kadar geçen süre)
          CASE
              WHEN (
                  SELECT MIN(a.created_at)
                  FROM assignments a
                  WHERE a.report_id = r.id
                  AND a.deleted_at IS NULL
              ) IS NOT NULL THEN
                  EXTRACT(EPOCH FROM (
                      (
                          SELECT MIN(a.created_at)
                          FROM assignments a
                          WHERE a.report_id = r.id
                          AND a.deleted_at IS NULL
                      ) - r.created_at
                  ))
              ELSE NULL
          END AS intervention_duration_seconds,          -- Destek talep sayısını hesapla
          (
              SELECT COUNT(*)
              FROM report_supports sr
              WHERE sr.report_id = r.id
          ) AS support_count
      FROM
          reports r
      LEFT JOIN
          departments d ON r.current_department_id = d.id
      LEFT JOIN
          report_categories c ON r.category_id = c.id
      WHERE
          r.deleted_at IS NULL;
    `);

    // View üzerinde indexler oluştur
    await queryRunner.query(
      `CREATE INDEX idx_report_analytics_mv_department_id ON ${this.viewName} (department_id);`
    );
    await queryRunner.query(
      `CREATE INDEX idx_report_analytics_mv_created_at ON ${this.viewName} (created_at);`
    );
    await queryRunner.query(
      `CREATE INDEX idx_report_analytics_mv_status ON ${this.viewName} (status);`
    );
    await queryRunner.query(
      `CREATE INDEX idx_report_analytics_mv_category_id ON ${this.viewName} (category_id);`
    );
    await queryRunner.query(
      `CREATE INDEX idx_report_analytics_mv_first_assigned_at ON ${this.viewName} (first_assigned_at);`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Geri alırken önceki versiyona döner
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS ${this.viewName};`);

    // Önceki basit versiyonu yeniden oluştur
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW ${this.viewName} AS
      SELECT
          r.id AS report_id,
          r.status,
          r.current_department_id AS department_id,
          d.code AS department_code,
          r.category_id,
          c.code AS category_code,
          r.created_at,
          r.resolved_at,
          -- Çözüm süresini saniye cinsinden hesapla
          CASE
              WHEN r.resolved_at IS NOT NULL THEN
                  EXTRACT(EPOCH FROM (r.resolved_at - r.created_at))
              ELSE NULL
          END AS resolution_duration_seconds
      FROM
          reports r
      LEFT JOIN
          departments d ON r.current_department_id = d.id
      LEFT JOIN
          report_categories c ON r.category_id = c.id
      WHERE
          r.deleted_at IS NULL;
    `);

    // Temel indexleri yeniden oluştur
    await queryRunner.query(
      `CREATE INDEX idx_report_analytics_mv_department_id ON ${this.viewName} (department_id);`
    );
    await queryRunner.query(
      `CREATE INDEX idx_report_analytics_mv_created_at ON ${this.viewName} (created_at);`
    );
    await queryRunner.query(
      `CREATE INDEX idx_report_analytics_mv_status ON ${this.viewName} (status);`
    );
  }
}
