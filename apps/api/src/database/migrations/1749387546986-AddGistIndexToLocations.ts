import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGistIndexToLocations1749387546986 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // PostGIS eklentisinin aktif olduğundan emin ol (genellikle zaten aktiftir)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis;`);

    // Raporlar tablosundaki location kolonu için GIST indeksi
    await queryRunner.query(
      `CREATE INDEX "IDX_reports_location_gist" ON "reports" USING GIST ("location");`
    );

    // Takımlar tablosundaki location kolonları için GIST indeksleri
    await queryRunner.query(
      `CREATE INDEX "IDX_teams_base_location_gist" ON "teams" USING GIST ("base_location");`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_teams_current_location_gist" ON "teams" USING GIST ("current_location");`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reports_location_gist";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_teams_base_location_gist";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_teams_current_location_gist";`);
  }
}
