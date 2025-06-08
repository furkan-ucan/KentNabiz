import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSoftDeleteColumns1749387805069 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users tablosuna deleted_at kolonu ekle
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        isNullable: true,
        default: null,
      })
    );

    // Teams tablosuna deleted_at kolonu ekle
    await queryRunner.addColumn(
      'teams',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        isNullable: true,
        default: null,
      })
    );

    // Teams tablosuna created_at ve updated_at kolonları da ekle (yoksa)
    await queryRunner.addColumn(
      'teams',
      new TableColumn({
        name: 'created_at',
        type: 'timestamptz',
        default: 'CURRENT_TIMESTAMP',
      })
    );

    await queryRunner.addColumn(
      'teams',
      new TableColumn({
        name: 'updated_at',
        type: 'timestamptz',
        default: 'CURRENT_TIMESTAMP',
      })
    );

    // Reports tablosuna deleted_at kolonu ekle
    await queryRunner.addColumn(
      'reports',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        isNullable: true,
        default: null,
      })
    );

    // Assignments tablosuna created_at, updated_at ve deleted_at kolonları ekle
    await queryRunner.addColumn(
      'assignments',
      new TableColumn({
        name: 'created_at',
        type: 'timestamptz',
        default: 'CURRENT_TIMESTAMP',
      })
    );

    await queryRunner.addColumn(
      'assignments',
      new TableColumn({
        name: 'updated_at',
        type: 'timestamptz',
        default: 'CURRENT_TIMESTAMP',
      })
    );

    await queryRunner.addColumn(
      'assignments',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        isNullable: true,
        default: null,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse the operations
    await queryRunner.dropColumn('users', 'deleted_at');
    await queryRunner.dropColumn('teams', 'deleted_at');
    await queryRunner.dropColumn('teams', 'created_at');
    await queryRunner.dropColumn('teams', 'updated_at');
    await queryRunner.dropColumn('reports', 'deleted_at');
    await queryRunner.dropColumn('assignments', 'created_at');
    await queryRunner.dropColumn('assignments', 'updated_at');
    await queryRunner.dropColumn('assignments', 'deleted_at');
  }
}
