import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNotesToAssignment1747840000000 implements MigrationInterface {
  name = 'AddNotesToAssignment1747840000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'assignments',
      new TableColumn({
        name: 'notes',
        type: 'text',
        isNullable: true,
        comment: 'Atama ile ilgili notlar ve açıklamalar',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('assignments', 'notes');
  }
}
