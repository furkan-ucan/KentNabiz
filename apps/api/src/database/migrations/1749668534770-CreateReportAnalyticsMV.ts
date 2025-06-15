import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReportAnalyticsMV1749668534770 implements MigrationInterface {
  private readonly viewName = 'report_analytics_mv';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Bu Materialized View, her rapor için temel analitik metrikleri önceden hesaplar.
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS ${this.viewName};`);
  }
}
