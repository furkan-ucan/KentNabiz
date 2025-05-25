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
    // Rapor kategorileri tablosunu oluştur
    await queryRunner.query(`
      CREATE TABLE "public"."report_categories" (
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
        CONSTRAINT "PK_report_categories_id" PRIMARY KEY ("id")
      );
    `);
    // Add indexes for report_categories
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_report_categories_code" ON "public"."report_categories" ("code");`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_report_categories_parent_id" ON "public"."report_categories" ("parent_id");`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_report_categories_is_active" ON "public"."report_categories" ("is_active");`
    );

    // Rapor tipleri için enum oluştur
    await queryRunner.query(`
      CREATE TYPE "public"."report_type_enum" AS ENUM (
        'POTHOLE',
        'ROAD_DAMAGE',
        'ROAD_SIGN',
        'ROAD_MARKING',
        'ROAD_CONSTRUCTION',
        'ROAD_MAINTENANCE',
        'ROAD_CLEANING',
        'ROAD_REPAIR',
        'ROAD_BLOCK',
        'TRAFFIC_LIGHT',
        'STREET_LIGHT',
        'ELECTRICITY_OUTAGE',
        'WATER_LEAKAGE',
        'LITTER',
        'GRAFFITI',
        'PARK_DAMAGE',
        'TREE_ISSUE',
        'PARKING_VIOLATION',
        'PUBLIC_TRANSPORT',
        'PUBLIC_TRANSPORT_VIOLATION',
        'PUBLIC_TRANSPORT_STOP',
        'PUBLIC_TRANSPORT_VEHICLE',
        'GARBAGE_COLLECTION',
        'OTHER'
      );
    `);

    // Rapor durumları için enum oluştur
    await queryRunner.query(`
      CREATE TYPE "public"."report_status_enum" AS ENUM(
        'SUBMITTED',
        'UNDER_REVIEW',
        'FORWARDED',
        'ASSIGNED_TO_EMPLOYEE',
        'FIELD_WORK_IN_PROGRESS',
        'PENDING_APPROVAL',
        'RESOLVED',
        'REJECTED',
        'AWAITING_INFORMATION'
      );
    `);

    // Raporlar tablosunu oluştur
    await queryRunner.query(`
      CREATE TABLE "public"."reports" (
        "id" SERIAL NOT NULL,
        "title" character varying(100) NOT NULL,
        "description" text NOT NULL,
        "location" geography(Point, 4326) NOT NULL,
        "address" character varying(255) NOT NULL,
        "report_type" "public"."report_type_enum" NULL,
        "category_id" integer,
        "status" "public"."report_status_enum" NOT NULL DEFAULT 'SUBMITTED',
        "current_department_id" integer NOT NULL,
        "user_id" integer NOT NULL,
        "assigned_employee_id" integer NULL,
        "closed_by_user_id" integer NULL,
        "resolution_notes" text NULL,
        "rejection_reason" text NULL,
        "resolved_at" TIMESTAMP NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reports" PRIMARY KEY ("id"),
        CONSTRAINT "FK_reports_category" FOREIGN KEY ("category_id") REFERENCES "public"."report_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
        CONSTRAINT "FK_reports_current_department" FOREIGN KEY ("current_department_id") REFERENCES "public"."departments"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_reports_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_reports_assigned_employee" FOREIGN KEY ("assigned_employee_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
        CONSTRAINT "FK_reports_closed_by_user" FOREIGN KEY ("closed_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      );
    `);

    // Rapor medyaları tablosunu oluştur
    await queryRunner.query(`
      CREATE TABLE "public"."report_medias" (
        "id" SERIAL NOT NULL,
        "report_id" integer NOT NULL,
        "url" character varying(255) NOT NULL,
        "type" character varying(50) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_report_medias" PRIMARY KEY ("id"),
        CONSTRAINT "FK_report_medias_report" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `);

    // Departman değişiklik geçmişi tablosunu oluştur
    await queryRunner.query(`
      CREATE TABLE "public"."department_history" (
        "id" SERIAL NOT NULL,
        "report_id" integer NOT NULL,
        "previous_department_id" integer NULL,
        "new_department_id" integer NOT NULL,
        "reason" text,
        "changed_by_user_id" integer NULL,
        "changed_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_department_history" PRIMARY KEY ("id"),
        CONSTRAINT "FK_department_history_report" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_department_history_prev_dept" FOREIGN KEY ("previous_department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
        CONSTRAINT "FK_department_history_new_dept" FOREIGN KEY ("new_department_id") REFERENCES "public"."departments"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_department_history_user" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      );
    `);

    // İndeksler
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_reports_report_type" ON "public"."reports" ("report_type");`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_reports_current_department_id" ON "public"."reports" ("current_department_id");`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_reports_user_id" ON "public"."reports" ("user_id");`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_reports_location" ON "public"."reports" USING GIST ("location");`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_report_medias_report_id" ON "public"."report_medias" ("report_id");`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_department_history_report_id" ON "public"."department_history" ("report_id");`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_department_history_report_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_report_medias_report_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_reports_location";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_reports_user_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_reports_current_department_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_reports_report_type";`);

    await queryRunner.query(`DROP TABLE IF EXISTS "public"."department_history";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."report_medias";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."reports";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."report_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."report_type_enum";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."report_categories";`);
  }
}
