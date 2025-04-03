import { DataSource } from 'typeorm';
import { UsersSeed } from './users.seed';
import { DepartmentsSeed } from './departments.seed';
import { CategoriesSeed } from './categories.seed';
import { ReportsSeed } from './reports.seed';
import { ensurePostgisExtensions } from '../ormconfig';
import { fileURLToPath } from 'url';

/**
 * Tüm database seed işlemlerini sıralı olarak gerçekleştiren ana fonksiyon
 * @param dataSource Aktif veri kaynağı
 */
export async function runSeeds(dataSource: DataSource): Promise<void> {
  console.log('🌱 Veritabanı seed işlemi başlatılıyor...');

  try {
    // PostGIS uzantılarının yüklü olduğundan emin ol
    await ensurePostgisExtensions();
    console.log('✅ PostGIS eklentileri kontrol edildi');

    // Kullanıcıları ekle (diğer seed işlemlerinin bağımlılığı)
    await UsersSeed(dataSource);

    // Departmanları ekle
    await DepartmentsSeed(dataSource);

    // Kategorileri ekle
    await CategoriesSeed(dataSource);

    // Örnek raporları ve medyaları ekle (son olarak, bağımlılıklar nedeniyle)
    await ReportsSeed(dataSource);

    console.log('✅ Tüm seed işlemleri başarıyla tamamlandı!');
  } catch (error) {
    console.error('❌ Seed işlemi sırasında hata oluştu:', error);
    throw error;
  }
}

/**
 * Bu modül doğrudan CLI'dan çalıştırıldığında seed işlemini başlatır.
 * ESM ortamında ana modül kontrolü için fileURLToPath(import.meta.url) kullanılır.
 */
if (fileURLToPath(import.meta.url) === process.argv[1]) {
  import('../ormconfig')
    .then(async ({ AppDataSource }) => {
      // Veritabanı bağlantısını başlat
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      try {
        await runSeeds(AppDataSource);
        process.exit(0);
      } catch (error) {
        console.error('Seed işlemi başarısız oldu:', error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('OrmConfig yüklenirken hata oluştu:', error);
      process.exit(1);
    });
}
