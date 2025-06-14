import { DataSource, In } from 'typeorm';
import { ReportCategory } from '../../modules/reports/entities/report-category.entity';
import { Specialization } from '../../modules/specializations/entities/specialization.entity';
import { Logger } from '@nestjs/common';

const logger = new Logger('CategorySpecializationsSeed');

export async function CategorySpecializationsSeed(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();
  const count = (await queryRunner.query(
    'SELECT COUNT(*) FROM category_specializations'
  )) as Array<{ count: string }>;
  if (parseInt(count[0]?.count || '0', 10) > 0) {
    logger.log('Kategori-Uzmanlık ilişkileri zaten mevcut, atlanıyor...');
    await queryRunner.release();
    return;
  }
  await queryRunner.release();

  logger.log('🔗 Akıllı kategori-uzmanlık ilişkileri kuruluyor...');

  const categoryRepo = dataSource.getRepository(ReportCategory);
  const specRepo = dataSource.getRepository(Specialization);

  const mappings = {
    ROAD_MAINTENANCE: ['POTHOLE', 'SIDEWALK_DAMAGE', 'ROAD_DAMAGE', 'ROAD_BLOCK'],
    WATER_INFRASTRUCTURE: ['WATER_ISSUES', 'SEWER_ISSUES'],
    ELECTRICAL_MAINTENANCE: ['STREET_LIGHTING', 'ELECTRICITY_OUTAGE'],
    PARKS_LANDSCAPING: ['PARK_GARDEN_ISSUES', 'TREE_ISSUES'],
    WASTE_MANAGEMENT: ['GARBAGE_COLLECTION', 'POLLUTION', 'GRAFFITI'],
    TRAFFIC_SYSTEMS: ['TRAFFIC_ISSUES', 'ROAD_MARKING', 'PUBLIC_TRANSPORT'],
    PUBLIC_ORDER: ['NOISE_COMPLAINT', 'PARKING_VIOLATION'],
    EMERGENCY_RESPONSE: ['ROAD_BLOCK', 'EMERGENCY'], // Acil durumlar
    ENVIRONMENTAL_HEALTH: ['POLLUTION', 'ANIMAL_ISSUES'], // Çevre sağlığı
  };

  let totalMappings = 0;
  for (const [specCode, categoryCodes] of Object.entries(mappings)) {
    const specialization = await specRepo.findOneBy({ code: specCode });
    const categories = await categoryRepo.findBy({ code: In(categoryCodes) });

    if (!specialization) {
      logger.warn(`Uzmanlık bulunamadı: ${specCode}`);
      continue;
    }

    if (categories.length === 0) {
      logger.warn(`Kategoriler bulunamadı: ${categoryCodes.join(', ')}`);
      continue;
    }

    // Her kategoriyi o uzmanlığa bağla
    for (const category of categories) {
      try {
        await dataSource
          .createQueryBuilder()
          .relation(ReportCategory, 'requiredSpecializations')
          .of(category)
          .add(specialization);
        totalMappings++;
      } catch {
        // İlişki zaten varsa hata vermez, devam eder
        logger.debug(`İlişki zaten mevcut: ${category.code} -> ${specCode}`);
      }
    }
    logger.log(`✅ ${specCode} -> ${categories.map(c => c.code).join(', ')}`);
  }

  logger.log(`🎉 Toplam ${totalMappings} kategori-uzmanlık ilişkisi başarıyla kuruldu!`);
}
