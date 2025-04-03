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
      CREATE TABLE "departments" (
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
      CREATE INDEX "IDX_departments_code" ON "departments" ("code")
    `);

    // Aktif departmanlar için indeks
    await queryRunner.query(`
      CREATE INDEX "IDX_departments_active" ON "departments" ("is_active")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_departments_active"`);
    await queryRunner.query(`DROP INDEX "IDX_departments_code"`);
    await queryRunner.query(`DROP TABLE "departments"`);
    await queryRunner.query(`DROP TYPE "public"."municipality_department_enum"`);
    // PostGIS eklentilerini kaldırma işlemini production'da yapmamak daha güvenli
  }
}
