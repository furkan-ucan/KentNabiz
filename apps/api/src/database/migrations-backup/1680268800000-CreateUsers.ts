import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1680268800000 implements MigrationInterface {
  name = 'CreateUsers1680268800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."user_roles_enum" AS ENUM(
        'CITIZEN',
        'TEAM_MEMBER',
        'DEPARTMENT_SUPERVISOR',
        'SYSTEM_ADMIN'
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "public"."users" (
        "id" SERIAL NOT NULL,
        "email" character varying(255) NOT NULL,
        "full_name" character varying(100) NOT NULL,
        "phone_number" character varying(20),
        "avatar" character varying(255),
        "roles" "public"."user_roles_enum" array NOT NULL DEFAULT '{CITIZEN}',
        "is_email_verified" boolean NOT NULL DEFAULT false,
        "password" character varying(255) NOT NULL,
        "email_verification_token" character varying(255),
        "password_reset_token" character varying(255),
        "password_reset_expires" TIMESTAMP,
        "department_id" integer NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "last_login_at" TIMESTAMP,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      );
    `);

    // Email için indeks oluştur
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_users_email" ON "public"."users" ("email");`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_users_email";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."users";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_roles_enum";`);
  }
}
