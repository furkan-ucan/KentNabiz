import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCategorySpecializationsJoinTable1749433978775 implements MigrationInterface {
  private readonly tableName = 'category_specializations';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.tableName,
        columns: [
          { name: 'categoryId', type: 'int', isPrimary: true },
          { name: 'specializationId', type: 'int', isPrimary: true },
        ],
      })
    );

    await queryRunner.createForeignKey(
      this.tableName,
      new TableForeignKey({
        columnNames: ['categoryId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'report_categories',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      this.tableName,
      new TableForeignKey({
        columnNames: ['specializationId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'specializations',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}
