import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInterventionTimeToAnalyticsMV1749670138943 implements MigrationInterface {
  private readonly viewName = 'report_analytics_mv';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Önce mevcut Materialized View'ı drop edelim
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS ${this.viewName};`);

    // İndeksleri de drop edelim (eğer varsa)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_report_analytics_mv_department_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_report_analytics_mv_created_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_report_analytics_mv_status;`);

    // Yeni Materialized View'ı müdahale süresi hesaplamasıyla birlikte oluşturalım
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
                -- İlk atama zamanını bulalım (assignments.assigned_at kullanmalı)
                (
                    SELECT MIN(a.assigned_at)
                    FROM assignments a
                    WHERE a.report_id = r.id AND a.deleted_at IS NULL
                ) AS first_assigned_at,
                -- İlk kabul edilme zamanını bulalım
                (
                    SELECT MIN(a.accepted_at)
                    FROM assignments a
                    WHERE a.report_id = r.id AND a.deleted_at IS NULL AND a.accepted_at IS NOT NULL
                ) AS first_accepted_at,
                -- Çözüm süresini saniye cinsinden hesapla
                CASE
                    WHEN r.resolved_at IS NOT NULL THEN
                        EXTRACT(EPOCH FROM (r.resolved_at - r.created_at))
                    ELSE NULL
                END AS resolution_duration_seconds,
                -- Müdahale süresini saniye cinsinden hesapla (ilk atamadan kabul edilene kadar)
                CASE
                    WHEN (
                        SELECT MIN(a.accepted_at)
                        FROM assignments a
                        WHERE a.report_id = r.id AND a.deleted_at IS NULL AND a.accepted_at IS NOT NULL
                    ) IS NOT NULL AND (
                        SELECT MIN(a.assigned_at)
                        FROM assignments a
                        WHERE a.report_id = r.id AND a.deleted_at IS NULL
                    ) IS NOT NULL THEN
                        EXTRACT(EPOCH FROM (
                            (
                                SELECT MIN(a.accepted_at)
                                FROM assignments a
                                WHERE a.report_id = r.id AND a.deleted_at IS NULL AND a.accepted_at IS NOT NULL
                            ) - (
                                SELECT MIN(a.assigned_at)
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

    // View üzerinde indexler oluşturmak, sorgu performansını kat kat artırır.
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
      `CREATE INDEX idx_report_analytics_mv_first_accepted ON ${this.viewName} (first_accepted_at);`
    );
    await queryRunner.query(
      `CREATE INDEX idx_report_analytics_mv_first_assignment ON ${this.viewName} (first_assigned_at);`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Down migration'da eski hali geri yükleyelim
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS ${this.viewName};`);

    // Eski Materialized View'ı geri oluşturalım (müdahale süresi olmadan)
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

    // Eski indexleri geri oluşturalım
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
