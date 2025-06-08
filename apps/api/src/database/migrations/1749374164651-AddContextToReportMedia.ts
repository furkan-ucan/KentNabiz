import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

// Bu enum, entity'deki tanımın bir kopyasıdır, migration'ın bağımsız çalışmasını sağlar.
enum ReportMediaContext {
  INITIAL_REPORT = 'INITIAL_REPORT',
  RESOLUTION_PROOF = 'RESOLUTION_PROOF',
}

export class AddContextToReportMedia1749374164651 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Medyanın amacını belirten 'media_context' kolonunu ekle
    await queryRunner.addColumn(
      'report_medias',
      new TableColumn({
        name: 'media_context',
        type: 'varchar',
        length: '50',
        isNullable: false,
        default: `'${ReportMediaContext.INITIAL_REPORT}'`, // Mevcut tüm medyalar varsayılan olarak ilk raporun parçasıdır
      })
    );

    // 2. Kanıtı kimin yüklediğini bilmek için 'uploaded_by_user_id' kolonunu ekle
    await queryRunner.addColumn(
      'report_medias',
      new TableColumn({
        name: 'uploaded_by_user_id',
        type: 'int',
        isNullable: true, // Sadece RESOLUTION_PROOF için dolu olacak, bu yüzden nullable
      })
    );

    // 3. Yeni eklenen user_id için Foreign Key kısıtlaması oluştur
    await queryRunner.createForeignKey(
      'report_medias',
      new TableForeignKey({
        name: 'FK_report_medias_user',
        columnNames: ['uploaded_by_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL', // Kullanıcı silinirse kanıt kaydı kalmalı
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Geri alma işlemleri, ekleme sırasının tersi olmalıdır.
    await queryRunner.dropForeignKey('report_medias', 'FK_report_medias_user');
    await queryRunner.dropColumn('report_medias', 'uploaded_by_user_id');
    await queryRunner.dropColumn('report_medias', 'media_context');
  }
}
