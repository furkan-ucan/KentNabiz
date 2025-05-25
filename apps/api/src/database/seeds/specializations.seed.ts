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
      name: 'Yol Bakım',
      description: 'Yol ve kaldırım bakım onarım işleri',
      isActive: true,
    },
    {
      id: 2,
      name: 'Çevre Temizliği',
      description: 'Park ve bahçe temizlik işleri',
      isActive: true,
    },
    {
      id: 3,
      name: 'Altyapı',
      description: 'Su, kanalizasyon ve elektrik altyapı işleri',
      isActive: true,
    },
    {
      id: 4,
      name: 'Trafik Düzenleme',
      description: 'Trafik işaretleri ve düzenleme işleri',
      isActive: true,
    },
    {
      id: 5,
      name: 'Sosyal Hizmetler',
      description: 'Vatandaş hizmetleri ve sosyal destek',
      isActive: true,
    },
  ];

  await specializationRepository.save(specializations);
  console.log('✅ Specializations seeded successfully');
}
