import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPostGISAndDepartments1680268900000 implements MigrationInterface {
  name = 'AddPostGISAndDepartments1680268900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // PostGIS eklentilerini yükle
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis_topology`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS fuzzystrmatch`);

    // Municipality birim enum'ını oluştur
    await queryRunner.query(`
      CREATE TYPE "public"."municipality_department_enum" AS ENUM(
        'GENERAL', 'ROADS', 'WATER', 'ELECTRICITY', 'PARKS','FIRE', 'HEALTH',
        'BUILDING', 'MUNICIPALITY',
        'ENVIRONMENTAL', 'INFRASTRUCTURE', 'TRANSPORTATION', 'TRAFFIC', 'OTHER'
      );
    `);

    // Belediye birimleri tablosunu oluştur
    await queryRunner.query(`
      CREATE TABLE "public"."departments" (
        "id" SERIAL NOT NULL,
        "code" "public"."municipality_department_enum" NOT NULL,
        "name" character varying(100) NOT NULL,
        "description" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "responsible_report_types" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_departments_code" UNIQUE ("code"),
        CONSTRAINT "PK_departments" PRIMARY KEY ("id")
      )
    `);

    // Departman kodu için indeks oluştur
    await queryRunner.query(`
      CREATE INDEX "IDX_departments_code" ON "public"."departments" ("code")
    `);

    // Aktif departmanlar için indeks
    await queryRunner.query(`
      CREATE INDEX "IDX_departments_active" ON "public"."departments" ("is_active")
    `);

    // users tablosuna department_id için foreign key ekle
    await queryRunner.query(`
      ALTER TABLE "public"."users"
      ADD CONSTRAINT "FK_users_department"
      FOREIGN KEY ("department_id")
      REFERENCES "public"."departments"("id")
      ON DELETE SET NULL
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // users tablosundan department_id foreign key'ini kaldır
    await queryRunner.query(`
      ALTER TABLE "public"."users"
      DROP CONSTRAINT IF EXISTS "FK_users_department"
    `);

    await queryRunner.query(`DROP INDEX "IDX_departments_active"`);
    await queryRunner.query(`DROP INDEX "IDX_departments_code"`);
    await queryRunner.query(`DROP TABLE "public"."departments"`);
    await queryRunner.query(`DROP TYPE "public"."municipality_department_enum"`);
    // PostGIS eklentilerini kaldırma işlemini production'da yapmamak daha güvenli
  }
}
