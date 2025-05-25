import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerformanceIndexes1680269200000 implements MigrationInterface {
  name = 'AddPerformanceIndexes1680269200000';
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users tablosu için roller üzerinde GIN indeksi (array aramalarını hızlandırır)
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_users_roles" ON "public"."users" USING GIN ("roles");`
    );

    // Raporlar tablosu için sık kullanılan filtreleme ve sıralama alanlarına indeksler
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_reports_created_at_status" ON "public"."reports" ("created_at" DESC, "status");`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_reports_status_current_department" ON "public"."reports" ("status", "current_department_id");`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_reports_category_id" ON "public"."reports" ("category_id");`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_reports_category_id";`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_reports_status_current_department";`
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_reports_created_at_status";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_users_roles";`);
  }
}
