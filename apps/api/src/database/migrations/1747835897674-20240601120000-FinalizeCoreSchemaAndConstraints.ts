import { MigrationInterface, QueryRunner } from 'typeorm';

export class FinalizeCoreSchemaAndConstraints20240601120000 implements MigrationInterface {
  name = 'FinalizeCoreSchemaAndConstraints20240601120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ======================================================================
    // 1. EXTENSIONS - PostGIS eklentilerini yükle
    // ======================================================================
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis_topology`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS fuzzystrmatch`);

    // ======================================================================
    // 2. ENUM TYPES - Tüm enum tiplerini oluştur
    // ======================================================================

    // User role enum
    await queryRunner.query(`
      CREATE TYPE "public"."user_roles_enum" AS ENUM(
        'CITIZEN',
        'TEAM_MEMBER', 
        'DEPARTMENT_SUPERVISOR',
        'SYSTEM_ADMIN'
      )
    `);

    // Department codes enum
    await queryRunner.query(`
      CREATE TYPE "public"."municipality_department_enum" AS ENUM(
        'GENERAL', 'ROADS', 'WATER', 'ELECTRICITY', 'PARKS','FIRE', 'HEALTH',
        'BUILDING', 'MUNICIPALITY',
        'ENVIRONMENTAL', 'INFRASTRUCTURE', 'TRANSPORTATION', 'TRAFFIC', 'OTHER'
      )
    `);

    // Report type enum
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
      )
    `);

    // Report status enum - YENİ değerlerle
    await queryRunner.query(
      `CREATE TYPE "public"."report_status_enum" AS ENUM('OPEN', 'IN_REVIEW', 'IN_PROGRESS', 'DONE', 'REJECTED', 'CANCELLED')`
    );

    // Media type enum
    await queryRunner.query(`
      CREATE TYPE "public"."media_type_enum" AS ENUM(
        'image', 'video', 'document', 'other'
      )
    `);

    // YENİ team-based assignment enum'ları
    await queryRunner.query(
      `CREATE TYPE "public"."team_status_enum" AS ENUM('AVAILABLE', 'ON_DUTY', 'OFF_DUTY', 'INACTIVE')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."assignment_status_enum" AS ENUM('ACTIVE', 'COMPLETED', 'CANCELLED')`
    );
    await queryRunner.query(`CREATE TYPE "public"."assignee_type_enum" AS ENUM('USER', 'TEAM')`);

    // ======================================================================
    // 3. CORE TABLES - Önce FK olmadan temel tabloları oluştur
    // ======================================================================

    // Departments table
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

    // Users table - YENİ active_team_id sütunu dahil
    await queryRunner.query(`
      CREATE TABLE "public"."users" (
        "id" SERIAL NOT NULL,
        "email" character varying(255) NOT NULL,
        "full_name" character varying(100) NOT NULL,
        "phone_number" character varying(20),
        "avatar" character varying(255),
        "roles" "public"."user_roles_enum"[] NOT NULL DEFAULT '{CITIZEN}',
        "is_email_verified" boolean NOT NULL DEFAULT false,
        "password" character varying(255) NOT NULL,
        "email_verification_token" character varying(255),
        "password_reset_token" character varying(255),
        "password_reset_expires" TIMESTAMP,
        "department_id" integer,
        "active_team_id" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "last_login_at" TIMESTAMP,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    // Report categories table
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
      )
    `);

    // Reports table - YENİ şema: geometry location, sub_status sütunu, eski atama sütunları kaldırıldı
    await queryRunner.query(`
      CREATE TABLE "public"."reports" (
        "id" SERIAL NOT NULL,
        "title" character varying(100) NOT NULL,
        "description" text NOT NULL,
        "location" geometry(Point,4326) NOT NULL,
        "address" character varying(255) NOT NULL,
        "report_type" "public"."report_type_enum",
        "category_id" integer,
        "status" "public"."report_status_enum" NOT NULL DEFAULT 'OPEN',
        "sub_status" character varying(40),
        "current_department_id" integer NOT NULL,
        "user_id" integer NOT NULL,
        "closed_by_user_id" integer,
        "resolution_notes" text,
        "rejection_reason" text,
        "resolved_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reports" PRIMARY KEY ("id")
      )
    `);

    // Report medias table
    await queryRunner.query(`
      CREATE TABLE "public"."report_medias" (
        "id" SERIAL NOT NULL,
        "report_id" integer NOT NULL,
        "url" character varying(255) NOT NULL,
        "type" character varying(50) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_report_medias" PRIMARY KEY ("id")
      )
    `);

    // Department history table
    await queryRunner.query(`
      CREATE TABLE "public"."department_history" (
        "id" SERIAL NOT NULL,
        "report_id" integer NOT NULL,
        "previous_department_id" integer,
        "new_department_id" integer NOT NULL,
        "reason" text,
        "changed_by_user_id" integer,
        "changed_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_department_history" PRIMARY KEY ("id")
      )
    `);

    // Media table
    await queryRunner.query(`
      CREATE TABLE "public"."media" (
        "id" SERIAL NOT NULL,
        "filename" character varying(255) NOT NULL,
        "originalname" character varying(255) NOT NULL,
        "url" character varying(500) NOT NULL,
        "mimetype" character varying(100) NOT NULL,
        "type" "public"."media_type_enum" NOT NULL DEFAULT 'other',
        "size" integer NOT NULL,
        "metadata" jsonb,
        "thumbnail_url" character varying(500),
        "width" integer,
        "height" integer,
        "bucket_name" character varying(255),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_media" PRIMARY KEY ("id")
      )
    `);

    // ======================================================================
    // 4. YENİ TEAM-BASED ASSIGNMENT TABLES
    // ======================================================================

    // Specializations table
    await queryRunner.query(`
      CREATE TABLE "public"."specializations" (
        "id" SERIAL NOT NULL,
        "code" character varying(100) NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "typical_department_code" character varying(100),
        "example_source" character varying(255),
        CONSTRAINT "PK_specializations_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_specializations_code" UNIQUE ("code")
      )
    `);

    // Teams table
    await queryRunner.query(`
      CREATE TABLE "public"."teams" (
        "id" SERIAL NOT NULL,
        "name" character varying(255) NOT NULL,
        "department_id" integer NOT NULL,
        "team_leader_id" integer,
        "status" "public"."team_status_enum" NOT NULL DEFAULT 'AVAILABLE',
        "base_location" geometry(Point,4326),
        "current_location" geometry(Point,4326),
        "last_location_update" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_teams_id" PRIMARY KEY ("id")
      )
    `);

    // Team specializations junction table
    await queryRunner.query(`
      CREATE TABLE "public"."team_specializations" (
        "team_id" integer NOT NULL,
        "specialization_id" integer NOT NULL,
        CONSTRAINT "PK_team_specializations" PRIMARY KEY ("team_id", "specialization_id")
      )
    `);

    // Team membership history table
    await queryRunner.query(`
      CREATE TABLE "public"."team_membership_history" (
        "id" SERIAL NOT NULL,
        "user_id" integer NOT NULL,
        "team_id" integer NOT NULL,
        "joined_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "left_at" TIMESTAMP WITH TIME ZONE,
        "role_in_team" character varying(100),
        CONSTRAINT "PK_team_membership_history_id" PRIMARY KEY ("id")
      )
    `);

    // Assignments table - Yeni atama sistemi
    await queryRunner.query(`
      CREATE TABLE "public"."assignments" (
        "id" SERIAL NOT NULL,
        "report_id" integer NOT NULL,
        "assignee_type" "public"."assignee_type_enum" NOT NULL,
        "assignee_user_id" integer,
        "assignee_team_id" integer,
        "assignment_status" "public"."assignment_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "assigned_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "completed_at" TIMESTAMP WITH TIME ZONE,
        "assigned_by_user_id" integer,
        CONSTRAINT "PK_assignments_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_assignments_assignee_type_and_ids" CHECK (
          ("assignee_type" = 'USER' AND "assignee_user_id" IS NOT NULL AND "assignee_team_id" IS NULL) OR
          ("assignee_type" = 'TEAM' AND "assignee_team_id" IS NOT NULL AND "assignee_user_id" IS NULL)
        )
      )
    `);

    // Report status history table
    await queryRunner.query(`
      CREATE TABLE "public"."report_status_history" (
        "id" SERIAL NOT NULL,
        "report_id" integer NOT NULL,
        "previous_status" "public"."report_status_enum",
        "new_status" "public"."report_status_enum" NOT NULL,
        "previous_sub_status" character varying(255),
        "new_sub_status" character varying(255),
        "changed_by_user_id" integer,
        "changed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "notes" text,
        CONSTRAINT "PK_report_status_history_id" PRIMARY KEY ("id")
      )
    `);

    // ======================================================================
    // 5. FOREIGN KEY CONSTRAINTS
    // ======================================================================

    // Users foreign keys
    await queryRunner.query(
      `ALTER TABLE "public"."users" ADD CONSTRAINT "FK_users_department" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."users" ADD CONSTRAINT "FK_users_active_team_id" FOREIGN KEY ("active_team_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL`
    );

    // Report categories foreign keys
    await queryRunner.query(
      `ALTER TABLE "public"."report_categories" ADD CONSTRAINT "FK_report_categories_parent" FOREIGN KEY ("parent_id") REFERENCES "public"."report_categories"("id") ON DELETE SET NULL`
    );

    // Reports foreign keys
    await queryRunner.query(
      `ALTER TABLE "public"."reports" ADD CONSTRAINT "FK_reports_category" FOREIGN KEY ("category_id") REFERENCES "public"."report_categories"("id") ON DELETE SET NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."reports" ADD CONSTRAINT "FK_reports_current_department" FOREIGN KEY ("current_department_id") REFERENCES "public"."departments"("id") ON DELETE RESTRICT`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."reports" ADD CONSTRAINT "FK_reports_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."reports" ADD CONSTRAINT "FK_reports_closed_by_user" FOREIGN KEY ("closed_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL`
    );

    // Report medias foreign keys
    await queryRunner.query(
      `ALTER TABLE "public"."report_medias" ADD CONSTRAINT "FK_report_medias_report" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE CASCADE`
    );

    // Department history foreign keys
    await queryRunner.query(
      `ALTER TABLE "public"."department_history" ADD CONSTRAINT "FK_department_history_report" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."department_history" ADD CONSTRAINT "FK_department_history_prev_dept" FOREIGN KEY ("previous_department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."department_history" ADD CONSTRAINT "FK_department_history_new_dept" FOREIGN KEY ("new_department_id") REFERENCES "public"."departments"("id") ON DELETE RESTRICT`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."department_history" ADD CONSTRAINT "FK_department_history_user" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL`
    );

    // Teams foreign keys
    await queryRunner.query(
      `ALTER TABLE "public"."teams" ADD CONSTRAINT "FK_teams_department_id" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE RESTRICT`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."teams" ADD CONSTRAINT "FK_teams_team_leader_id" FOREIGN KEY ("team_leader_id") REFERENCES "public"."users"("id") ON DELETE SET NULL`
    );

    // Team specializations foreign keys
    await queryRunner.query(
      `ALTER TABLE "public"."team_specializations" ADD CONSTRAINT "FK_team_specializations_team_id" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."team_specializations" ADD CONSTRAINT "FK_team_specializations_specialization_id" FOREIGN KEY ("specialization_id") REFERENCES "public"."specializations"("id") ON DELETE CASCADE`
    );

    // Team membership history foreign keys
    await queryRunner.query(
      `ALTER TABLE "public"."team_membership_history" ADD CONSTRAINT "FK_team_membership_history_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."team_membership_history" ADD CONSTRAINT "FK_team_membership_history_team_id" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE`
    );

    // Assignments foreign keys
    await queryRunner.query(
      `ALTER TABLE "public"."assignments" ADD CONSTRAINT "FK_assignments_report_id" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."assignments" ADD CONSTRAINT "FK_assignments_assignee_user_id" FOREIGN KEY ("assignee_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."assignments" ADD CONSTRAINT "FK_assignments_assignee_team_id" FOREIGN KEY ("assignee_team_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."assignments" ADD CONSTRAINT "FK_assignments_assigned_by_user_id" FOREIGN KEY ("assigned_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL`
    );

    // Report status history foreign keys
    await queryRunner.query(
      `ALTER TABLE "public"."report_status_history" ADD CONSTRAINT "FK_report_status_history_report_id" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."report_status_history" ADD CONSTRAINT "FK_report_status_history_changed_by_user_id" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL`
    );

    // ======================================================================
    // 6. INDEXES
    // ======================================================================

    // Department indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_departments_code" ON "public"."departments" ("code")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_departments_active" ON "public"."departments" ("is_active")`
    );

    // Users indexes
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "public"."users" ("email")`);

    // Report categories indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_report_categories_code" ON "public"."report_categories" ("code")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_report_categories_parent_id" ON "public"."report_categories" ("parent_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_report_categories_is_active" ON "public"."report_categories" ("is_active")`
    );

    // Reports indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_reports_report_type" ON "public"."reports" ("report_type")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_reports_current_department_id" ON "public"."reports" ("current_department_id")`
    );
    await queryRunner.query(`CREATE INDEX "IDX_reports_user_id" ON "public"."reports" ("user_id")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_reports_location" ON "public"."reports" USING gist ("location")`
    );

    // Report medias indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_report_medias_report_id" ON "public"."report_medias" ("report_id")`
    );

    // Department history indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_department_history_report_id" ON "public"."department_history" ("report_id")`
    );

    // Media indexes
    await queryRunner.query(`CREATE INDEX "IDX_media_type" ON "public"."media" ("type")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_media_created_at" ON "public"."media" ("created_at")`
    );
    await queryRunner.query(`CREATE INDEX "IDX_media_filename" ON "public"."media" ("filename")`);
    await queryRunner.query(`CREATE INDEX "IDX_media_mimetype" ON "public"."media" ("mimetype")`);

    // Team-based assignment indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_teams_base_location" ON "public"."teams" USING gist ("base_location")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_teams_current_location" ON "public"."teams" USING gist ("current_location")`
    );

    // ======================================================================
    // 7. UNIQUE CONSTRAINTS & PARTIAL INDEXES
    // ======================================================================

    // Bir rapor için sadece bir aktif atama olabilir
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_report_active_assignment" ON "public"."assignments"("report_id") WHERE "assignment_status" = 'ACTIVE'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ======================================================================
    // DOWN - Ters sırada temizlik
    // ======================================================================

    // 1. Partial unique indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_report_active_assignment"`);

    // 2. Regular indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_teams_current_location"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_teams_base_location"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_mimetype"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_filename"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_department_history_report_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_report_medias_report_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reports_location"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reports_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reports_current_department_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reports_report_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_report_categories_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_report_categories_parent_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_report_categories_code"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_departments_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_departments_code"`);

    // 3. Foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "public"."report_status_history" DROP CONSTRAINT IF EXISTS "FK_report_status_history_changed_by_user_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."report_status_history" DROP CONSTRAINT IF EXISTS "FK_report_status_history_report_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."assignments" DROP CONSTRAINT IF EXISTS "FK_assignments_assigned_by_user_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."assignments" DROP CONSTRAINT IF EXISTS "FK_assignments_assignee_team_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."assignments" DROP CONSTRAINT IF EXISTS "FK_assignments_assignee_user_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."assignments" DROP CONSTRAINT IF EXISTS "FK_assignments_report_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."team_membership_history" DROP CONSTRAINT IF EXISTS "FK_team_membership_history_team_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."team_membership_history" DROP CONSTRAINT IF EXISTS "FK_team_membership_history_user_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."team_specializations" DROP CONSTRAINT IF EXISTS "FK_team_specializations_specialization_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."team_specializations" DROP CONSTRAINT IF EXISTS "FK_team_specializations_team_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."teams" DROP CONSTRAINT IF EXISTS "FK_teams_team_leader_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."teams" DROP CONSTRAINT IF EXISTS "FK_teams_department_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."department_history" DROP CONSTRAINT IF EXISTS "FK_department_history_user"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."department_history" DROP CONSTRAINT IF EXISTS "FK_department_history_new_dept"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."department_history" DROP CONSTRAINT IF EXISTS "FK_department_history_prev_dept"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."department_history" DROP CONSTRAINT IF EXISTS "FK_department_history_report"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."report_medias" DROP CONSTRAINT IF EXISTS "FK_report_medias_report"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."reports" DROP CONSTRAINT IF EXISTS "FK_reports_closed_by_user"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."reports" DROP CONSTRAINT IF EXISTS "FK_reports_user"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."reports" DROP CONSTRAINT IF EXISTS "FK_reports_current_department"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."reports" DROP CONSTRAINT IF EXISTS "FK_reports_category"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."report_categories" DROP CONSTRAINT IF EXISTS "FK_report_categories_parent"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."users" DROP CONSTRAINT IF EXISTS "FK_users_active_team_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."users" DROP CONSTRAINT IF EXISTS "FK_users_department"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."assignments" DROP CONSTRAINT IF EXISTS "CHK_assignments_assignee_type_and_ids"`
    );

    // 4. Tables
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."report_status_history"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."assignments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."team_membership_history"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."team_specializations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."teams"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."specializations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."media"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."department_history"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."report_medias"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."reports"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."report_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."departments"`);

    // 5. Enum types
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."assignee_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."assignment_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."team_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."media_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."report_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."report_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."municipality_department_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_roles_enum"`);

    // 6. Extensions - Genellikle bırakılır, production'da risk olabilir
    // await queryRunner.query(`DROP EXTENSION IF EXISTS fuzzystrmatch`);
    // await queryRunner.query(`DROP EXTENSION IF EXISTS postgis_topology`);
    // await queryRunner.query(`DROP EXTENSION IF EXISTS postgis`);
  }
}
