import { DataSource } from 'typeorm';
import { Specialization } from '../../modules/specializations/entities/specialization.entity';

export async function SpecializationsSeed(dataSource: DataSource): Promise<void> {
  const specializationRepository = dataSource.getRepository(Specialization);

  // Check if specializations already exist
  const existingCount = await specializationRepository.count();
  if (existingCount > 0) {
    console.log('Specializations already seeded, skipping...');
    return;
  }

  const specializations = [
    {
      id: 1,
      code: 'ROAD_MAINTENANCE',
      name: 'Yol Bakım',
      description: 'Yol ve kaldırım bakım onarım işleri',
    },
    {
      id: 2,
      code: 'ENVIRONMENTAL_CLEANING',
      name: 'Çevre Temizliği',
      description: 'Park ve bahçe temizlik işleri',
    },
    {
      id: 3,
      code: 'INFRASTRUCTURE',
      name: 'Altyapı',
      description: 'Su, kanalizasyon ve elektrik altyapı işleri',
    },
    {
      id: 4,
      code: 'TRAFFIC_MANAGEMENT',
      name: 'Trafik Düzenleme',
      description: 'Trafik işaretleri ve düzenleme işleri',
    },
    {
      id: 5,
      code: 'SOCIAL_SERVICES',
      name: 'Sosyal Hizmetler',
      description: 'Vatandaş hizmetleri ve sosyal destek',
    },
  ];

  await specializationRepository.save(specializations);
  console.log('✅ Specializations seeded successfully');
}
