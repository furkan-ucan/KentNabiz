import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1680268800000 implements MigrationInterface {
  name = 'CreateUsers1680268800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."user_roles_enum" AS ENUM('admin', 'user', 'moderator');
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "email" character varying NOT NULL,
        "full_name" character varying NOT NULL,
        "phone_number" character varying,
        "avatar" character varying,
        "roles" "public"."user_roles_enum" array NOT NULL DEFAULT '{user}',
        "password" character varying NOT NULL,
        "is_email_verified" boolean NOT NULL DEFAULT false,
        "email_verification_token" character varying,
        "password_reset_token" character varying,
        "password_reset_expires" TIMESTAMP,
        "last_login_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Email için indeks oluştur
    await queryRunner.query(`
      CREATE INDEX "IDX_users_email" ON "users" ("email")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."user_roles_enum"`);
  }
}
