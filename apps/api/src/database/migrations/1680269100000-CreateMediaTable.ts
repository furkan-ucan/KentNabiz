import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMediaTable1680269100000 implements MigrationInterface {
  name = 'CreateMediaTable1680269100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Medya tipi için enum oluştur
    await queryRunner.query(`
      CREATE TYPE "public"."media_type_enum" AS ENUM(
        'image', 'video', 'document', 'other'
      );
    `);

    // Medya tablosunu oluştur
    await queryRunner.query(`
      CREATE TABLE "media" (
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

    // Medya indeksleri oluştur
    await queryRunner.query(`
      CREATE INDEX "IDX_media_type" ON "media" ("type")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_media_created_at" ON "media" ("created_at")
    `);

    // Dosya adı ve mimetype için indeks
    await queryRunner.query(`
      CREATE INDEX "IDX_media_filename" ON "media" ("filename")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_media_mimetype" ON "media" ("mimetype")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_media_mimetype"`);
    await queryRunner.query(`DROP INDEX "IDX_media_filename"`);
    await queryRunner.query(`DROP INDEX "IDX_media_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_media_type"`);
    await queryRunner.query(`DROP TABLE "media"`);
    await queryRunner.query(`DROP TYPE "public"."media_type_enum"`);
  }
}
