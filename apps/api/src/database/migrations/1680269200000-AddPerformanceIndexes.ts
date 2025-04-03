import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerformanceIndexes1680269200000 implements MigrationInterface {
  name = 'AddPerformanceIndexes1680269200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Kullanıcı tablosu için ek indeks optimizasyonları
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_roles" ON "users" USING GIN ("roles")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_last_login" ON "users" ("last_login_at")
    `);

    // Raporlar için zaman bazlı indeks optimizasyonları
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_reports_created_at_status" ON "reports" ("created_at", "status")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_reports_status_department" ON "reports" ("status", "department")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_reports_category_id" ON "reports" ("category_id")
    `);

    // Bölgesel sorguları hızlandırmak için coğrafi indeks iyileştirmesi
    // ST_GeoHash fonksiyonu ile fazla sayıda aynı noktanın bulunduğu bölgeler için performans artışı
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_reports_location_geohash" ON "reports" (ST_GeoHash(location::geometry, 5))
    `);

    // Medya dosyaları için ek indeks
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_media_type_created_at" ON "media" ("type", "created_at")
    `);

    // Kategori tablosu için ek indeks
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_report_categories_parent_active" ON "report_categories" ("parent_id", "is_active")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_report_categories_sort" ON "report_categories" ("sort_order")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Oluşturulan indeksleri kaldır
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_report_categories_sort"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_report_categories_parent_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_type_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reports_location_geohash"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reports_category_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reports_status_department"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reports_created_at_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_last_login"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_roles"`);
  }
}
