import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateFactReportsTable1749932697472 implements MigrationInterface {
  private readonly tableName = 'fact_reports';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.tableName,
        columns: [
          { name: 'report_id', type: 'int', isPrimary: true },
          { name: 'created_at_dt', type: 'date' }, // Sadece tarih (gün bazlı gruplama için)
          { name: 'created_at_ts', type: 'timestamptz' }, // Tam zaman damgası

          // Boyut Anahtarları (Dimension Keys)
          { name: 'department_id', type: 'int', isNullable: true },
          { name: 'category_id', type: 'int', isNullable: true },
          { name: 'user_id', type: 'int', isNullable: true },

          // Olay Metrikleri (Fact Measures)
          { name: 'first_response_duration_secs', type: 'bigint', isNullable: true },
          { name: 'intervention_duration_secs', type: 'bigint', isNullable: true },
          { name: 'resolution_duration_secs', type: 'bigint', isNullable: true },
          { name: 'support_count', type: 'int', default: 0 },

          // Durum Bilgisi
          { name: 'final_status', type: 'varchar', length: '50' },

          // Coğrafi Koordinatlar (Performans için düz kolonlar)
          { name: 'latitude', type: 'numeric', precision: 10, scale: 7, isNullable: true },
          { name: 'longitude', type: 'numeric', precision: 10, scale: 7, isNullable: true },

          // ETL Metadata
          { name: 'last_updated_at', type: 'timestamptz', default: 'NOW()' },
        ],
      })
    );

    // Performans için indeksler
    await queryRunner.createIndex(
      this.tableName,
      new TableIndex({
        name: `idx_${this.tableName}_created_dt`,
        columnNames: ['created_at_dt'],
      })
    );
    await queryRunner.createIndex(
      this.tableName,
      new TableIndex({
        name: `idx_${this.tableName}_department`,
        columnNames: ['department_id'],
      })
    );
    await queryRunner.createIndex(
      this.tableName,
      new TableIndex({
        name: `idx_${this.tableName}_category`,
        columnNames: ['category_id'],
      })
    );
    await queryRunner.createIndex(
      this.tableName,
      new TableIndex({
        name: `idx_${this.tableName}_status`,
        columnNames: ['final_status'],
      })
    );
    await queryRunner.createIndex(
      this.tableName,
      new TableIndex({
        name: `idx_${this.tableName}_coords`,
        columnNames: ['latitude', 'longitude'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}
