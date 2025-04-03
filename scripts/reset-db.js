import { execSync } from 'child_process';
import path from 'path';

console.log('🔄 Veritabanı sıfırlanıyor...');

try {
  // Tüm migrasyonları sayısını al
  const result = execSync(
    'npx typeorm-ts-node-esm -d apps/api/src/config/data-source.ts migration:show',
    { encoding: 'utf8' }
  );
  const migrations = result.split('\n').filter(line => line.includes('[X]')).length;
  console.log(`📊 ${migrations} uygulanan migrasyon bulundu`);

  // Her birini tek tek geri al
  for (let i = 0; i < migrations; i++) {
    console.log(`⏪ Migrasyon geri alınıyor: ${i + 1}/${migrations}`);
    execSync('npx typeorm-ts-node-esm -d apps/api/src/config/data-source.ts migration:revert', {
      stdio: 'inherit',
    });
  }

  console.log('✅ Tüm migrasyonlar başarıyla geri alındı');
} catch (error) {
  console.error('❌ Veritabanı sıfırlama hatası:', error.message);
  process.exit(1);
}
