/**
 * @file CreateCategoriesAndReportsTable1680269000000.ts
 * @description Creates core reporting tables: report_categories, reports, report_medias, department_history.
 * Includes PostGIS support and enum-based report typing.
 * @module database/migrations
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoriesAndReportsTable1680269000000 implements MigrationInterface {
  name = 'CreateCategoriesAndReportsTable1680269000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rapor kategorileri için gerekli tabloyu oluştur
    await queryRunner.query(`
      CREATE TABLE "report_categories" (
        "id" SERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "code" character varying(50) NOT NULL,
        "description" text,
        "icon" character varying(50),
        "parent_id" integer,
        "is_active" boolean NOT NULL DEFAULT true,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_report_categories_code" UNIQUE ("code"),
        CONSTRAINT "PK_report_categories" PRIMARY KEY ("id"),
        CONSTRAINT "FK_report_categories_parent" FOREIGN KEY ("parent_id")
          REFERENCES "report_categories" ("id") ON DELETE SET NULL
      )
    `);

    // Kategori indeksleri
    await queryRunner.query(`
      CREATE INDEX "IDX_report_categories_code" ON "report_categories" ("code")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_report_categories_parent" ON "report_categories" ("parent_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_report_categories_active" ON "report_categories" ("is_active")
    `);

    // Report Type enum oluştur
    await queryRunner.query(`
      CREATE TYPE "public"."report_type_enum" AS ENUM(
        'POTHOLE', 'ROAD_DAMAGE', 'WATER_LEAKAGE', 'ELECTRICITY_OUTAGE',
        'TREE_ISSUE', 'GARBAGE_COLLECTION', 'TRAFFIC_LIGHT', 'STREET_LIGHT',
        'LITTER', 'GRAFFITI', 'PARK_DAMAGE', 'PARKING_VIOLATION',
        'PUBLIC_TRANSPORT', 'PUBLIC_TRANSPORT_VIOLATION', 'PUBLIC_TRANSPORT_STOP',
        'PUBLIC_TRANSPORT_VEHICLE', 'OTHER'
      );
    `);

    // Report Status enum oluştur
    await queryRunner.query(`
      CREATE TYPE "public"."report_status_enum" AS ENUM(
        'REPORTED', 'IN_PROGRESS', 'DEPARTMENT_CHANGED', 'RESOLVED',
        'REJECTED'
      );
    `);

    // Raporlar tablosunu oluştur (PostGIS Geography desteği ile)
    await queryRunner.query(`
      CREATE TABLE "reports" (
        "id" SERIAL NOT NULL,
        "title" character varying(100) NOT NULL,
        "description" text NOT NULL,
        "location" geography(Point, 4326) NOT NULL,
        "address" character varying(255) NOT NULL,
        "type" "public"."report_type_enum" NOT NULL DEFAULT 'OTHER',
        "category_id" integer,
        "status" "public"."report_status_enum" NOT NULL DEFAULT 'REPORTED',
        "department" "public"."municipality_department_enum" NOT NULL DEFAULT 'GENERAL',
        "department_id" integer,
        "department_change_reason" text,
        "department_changed_by" integer,
        "department_changed_at" TIMESTAMP,
        "user_id" integer NOT NULL,
        "admin_id" integer,
        "previous_department" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reports" PRIMARY KEY ("id"),
        CONSTRAINT "FK_reports_category" FOREIGN KEY ("category_id")
          REFERENCES "report_categories" ("id") ON DELETE SET NULL,
        CONSTRAINT "FK_reports_department" FOREIGN KEY ("department_id")
          REFERENCES "departments" ("id") ON DELETE SET NULL,
        CONSTRAINT "FK_reports_user" FOREIGN KEY ("user_id")
          REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reports_admin" FOREIGN KEY ("admin_id")
          REFERENCES "users" ("id") ON DELETE SET NULL
      )
    `);

    // Raporlar için indeksler oluştur
    await queryRunner.query(`
      CREATE INDEX "IDX_reports_type" ON "reports" ("type")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_reports_status" ON "reports" ("status")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_reports_department" ON "reports" ("department")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_reports_user" ON "reports" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_reports_created_at" ON "reports" ("created_at")
    `);

    // Önemli: PostGIS spatial index
    await queryRunner.query(`
      CREATE INDEX "IDX_reports_location" ON "reports" USING GIST ("location")
    `);

    // Rapor medya dosyaları tablosu oluştur
    await queryRunner.query(`
      CREATE TABLE "report_medias" (
        "id" SERIAL NOT NULL,
        "report_id" integer NOT NULL,
        "url" character varying(255) NOT NULL,
        "type" character varying(50) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_report_medias" PRIMARY KEY ("id"),
        CONSTRAINT "FK_report_medias_report" FOREIGN KEY ("report_id")
          REFERENCES "reports" ("id") ON DELETE CASCADE
      )
    `);

    // Medya indeksi oluştur
    await queryRunner.query(`
      CREATE INDEX "IDX_report_medias_report" ON "report_medias" ("report_id")
    `);

    // Departman değişiklik geçmişi tablosu
    await queryRunner.query(`
      CREATE TABLE "department_history" (
        "id" SERIAL NOT NULL,
        "report_id" integer NOT NULL,
        "old_department" "public"."municipality_department_enum" NOT NULL,
        "new_department" "public"."municipality_department_enum" NOT NULL,
        "reason" text,
        "changed_by_department" "public"."municipality_department_enum" NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_department_history" PRIMARY KEY ("id"),
        CONSTRAINT "FK_department_history_report" FOREIGN KEY ("report_id")
          REFERENCES "reports" ("id") ON DELETE CASCADE
      )
    `);

    // Departman geçmişi indeksi
    await queryRunner.query(`
      CREATE INDEX "IDX_department_history_report" ON "department_history" ("report_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Tablolar ve indeksler için down
    await queryRunner.query(`DROP INDEX "IDX_department_history_report"`);
    await queryRunner.query(`DROP TABLE "department_history"`);

    await queryRunner.query(`DROP INDEX "IDX_report_medias_report"`);
    await queryRunner.query(`DROP TABLE "report_medias"`);

    await queryRunner.query(`DROP INDEX "IDX_reports_location"`);
    await queryRunner.query(`DROP INDEX "IDX_reports_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_reports_user"`);
    await queryRunner.query(`DROP INDEX "IDX_reports_department"`);
    await queryRunner.query(`DROP INDEX "IDX_reports_status"`);
    await queryRunner.query(`DROP INDEX "IDX_reports_type"`);
    await queryRunner.query(`DROP TABLE "reports"`);

    await queryRunner.query(`DROP TYPE "public"."report_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."report_type_enum"`);

    await queryRunner.query(`DROP INDEX "IDX_report_categories_active"`);
    await queryRunner.query(`DROP INDEX "IDX_report_categories_parent"`);
    await queryRunner.query(`DROP INDEX "IDX_report_categories_code"`);
    await queryRunner.query(`DROP TABLE "report_categories"`);
  }
}
