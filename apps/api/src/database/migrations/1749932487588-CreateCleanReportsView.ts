import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCleanReportsView1749932487588 implements MigrationInterface {
  private readonly viewName = 'clean_reports_vw';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW IF EXISTS ${this.viewName};`);

    await queryRunner.query(`
            CREATE VIEW ${this.viewName} AS
            SELECT
                r.id,
                r.title,
                r.status,
                r.sub_status,
                r.created_at,
                r.updated_at,
                r.resolved_at,
                r.deleted_at,

                -- İlişkili ID'ler ve Kodlar
                r.user_id,
                r.current_department_id AS department_id,
                d.code AS department_code,
                r.category_id,
                c.code AS category_code,

                -- Coğrafi Veri
                r.location,
                ST_Y(r.location::geometry) AS latitude,  -- Enlem
                ST_X(r.location::geometry) AS longitude, -- Boylam

                -- Sayısal Metrikler
                r.support_count,

                -- İlk ve son atama/kabul zamanları
                (SELECT MIN(a.assigned_at) FROM assignments a WHERE a.report_id = r.id) as first_assigned_at,
                (SELECT MIN(a.accepted_at) FROM assignments a WHERE a.report_id = r.id) as first_accepted_at,
                (SELECT MAX(a.completed_at) FROM assignments a WHERE a.report_id = r.id) as last_completed_at

            FROM
                reports r
            LEFT JOIN
                departments d ON r.current_department_id = d.id
            LEFT JOIN
                report_categories c ON r.category_id = c.id
            WHERE
                r.deleted_at IS NULL;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW IF EXISTS ${this.viewName};`);
  }
}
