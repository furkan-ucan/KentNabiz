import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSupportCountColumn1748148200000 implements MigrationInterface {
  name = 'AddSupportCountColumn1748148200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add support_count column to reports table
    await queryRunner.query(
      `ALTER TABLE "reports" ADD "support_count" integer NOT NULL DEFAULT '0'`
    );

    // Create report_supports table if it doesn't exist
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "report_supports" (
                "id" SERIAL NOT NULL, 
                "report_id" integer NOT NULL, 
                "user_id" integer NOT NULL, 
                "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "UQ_c7db9d9a7beadbf34217c69ec08" UNIQUE ("report_id", "user_id"), 
                CONSTRAINT "PK_35c338dedd23858faef44c31bea" PRIMARY KEY ("id")
            )
        `);

    // Add foreign key constraints for report_supports table
    await queryRunner.query(
      `ALTER TABLE "report_supports" ADD CONSTRAINT "FK_851ee05f4165ba3e48a69938b93" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "report_supports" ADD CONSTRAINT "FK_d2437b34d879b950462dbaa9a7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "report_supports" DROP CONSTRAINT "FK_d2437b34d879b950462dbaa9a7"`
    );
    await queryRunner.query(
      `ALTER TABLE "report_supports" DROP CONSTRAINT "FK_851ee05f4165ba3e48a69938b93"`
    );

    // Drop report_supports table
    await queryRunner.query(`DROP TABLE "report_supports"`);

    // Remove support_count column from reports table
    await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "support_count"`);
  }
}
