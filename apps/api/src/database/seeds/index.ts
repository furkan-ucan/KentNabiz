// apps/api/src/database/seeds/index.ts
import 'reflect-metadata';
import type { DataSource } from 'typeorm';

import { UsersSeed } from './users.seed';
import { DepartmentsSeed } from './departments.seed';
import { CategoriesSeed } from './categories.seed';
import { ReportsSeed } from './reports.seed';
import { TeamsSeed } from './teams.seed';
import { SpecializationsSeed } from './specializations.seed';

// Fix: Use default import for AppDataSource
import AppDataSource from '../../config/data-source';

async function runSeeds(dataSource: DataSource): Promise<void> {
  if (!dataSource || !dataSource.isInitialized) {
    throw new Error('DataSource must be initialized before running seeds.');
  }
  console.log('🌱 Veritabanı seed işlemi başlatılıyor...');
  try {
    console.log('✅ PostGIS varsayılan olarak etkinleştirildi veya kontrol edildi.');
    await DepartmentsSeed(dataSource);
    await CategoriesSeed(dataSource);
    await SpecializationsSeed(dataSource);
    await UsersSeed(dataSource);
    await TeamsSeed(dataSource);
    await ReportsSeed(dataSource);
    console.log('✅ Tüm seed işlemleri başarıyla tamamlandı!');
  } catch (error) {
    console.error('❌ Seed işlemi sırasında hata oluştu:', error);
    throw error;
  }
}

// --- Add void operator here ---
void (async () => {
  // --- END CHANGE ---
  if (require.main !== module) {
    return;
  }

  console.log('Seeder script running directly (CommonJS check)...');

  if (!AppDataSource || typeof AppDataSource.initialize !== 'function') {
    console.error('❌ Failed to load AppDataSource correctly from config/data-source.');
    process.exit(1);
  }

  let exitCode = 0;
  const initPromise = AppDataSource.isInitialized
    ? Promise.resolve(AppDataSource)
    : AppDataSource.initialize();

  try {
    const initializedDataSource = await initPromise;
    console.log('Seeder: Data Source initialized successfully.');
    try {
      await runSeeds(initializedDataSource);
      console.log('Seeder: runSeeds completed.');
    } catch (seedError) {
      console.error('❌ Seed işlemi başarısız oldu:', seedError);
      exitCode = 1;
    } finally {
      if (initializedDataSource?.isInitialized) {
        await initializedDataSource.destroy();
        console.log(`Seeder: Data Source destroyed.`);
      }
    }
  } catch (initError: unknown) {
    console.error('❌ DataSource başlatılırken hata oluştu:', initError);
    exitCode = 1;
    if (AppDataSource?.isInitialized) {
      await AppDataSource.destroy().catch(destroyError => {
        console.error('Error destroying DataSource after init failure:', destroyError);
      });
    }
  } finally {
    console.log(`Seeder exiting with code: ${exitCode}`);
    process.exit(exitCode);
  }
})();
