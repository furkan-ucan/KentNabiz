import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddIndexToReportsDepartmentStatus1747836000000 implements MigrationInterface {
  name = 'AddIndexToReportsDepartmentStatus1747836000000';

  private readonly indexName = 'IDX_reports_department_id_status';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 'up' metodu, migration'ı çalıştırdığımızda çalışır.
    // Bu metot, indeksi oluşturacak.
    await queryRunner.createIndex(
      'reports',
      new TableIndex({
        name: this.indexName,
        columnNames: ['current_department_id', 'status'],
        isUnique: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 'down' metodu, migration'ı geri aldığımızda çalışır.
    // Bu metot, oluşturduğumuz indeksi güvenli bir şekilde kaldıracak.
    await queryRunner.dropIndex('reports', this.indexName);
  }
}
