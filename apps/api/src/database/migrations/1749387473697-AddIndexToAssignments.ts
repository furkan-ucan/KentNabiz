import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddIndexToAssignments1749387473697 implements MigrationInterface {
  private readonly indexName = 'IDX_assignments_team_id_status';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'assignments',
      new TableIndex({
        name: this.indexName,
        columnNames: ['assignee_team_id', 'assignment_status'], // snake_case kolon adlarını kullanın
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('assignments', this.indexName);
  }
}
