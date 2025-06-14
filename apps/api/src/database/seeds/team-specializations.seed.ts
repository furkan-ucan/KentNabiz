import { DataSource } from 'typeorm';
import { Team } from '../../modules/teams/entities/team.entity';
import { Specialization } from '../../modules/specializations/entities/specialization.entity';
import { TeamSpecialization } from '../../modules/teams/entities/team-specialization.entity';
import { Logger } from '@nestjs/common';

const logger = new Logger('TeamSpecializationsSeed');

export async function TeamSpecializationsSeed(dataSource: DataSource): Promise<void> {
  const teamSpecRepo = dataSource.getRepository(TeamSpecialization);

  // Eğer zaten veri varsa atla
  const existingCount = await teamSpecRepo.count();
  if (existingCount > 0) {
    logger.log('Takım uzmanlık verileri zaten mevcut, atlanıyor...');
    return;
  }

  logger.log('🔧 Takım uzmanlık alanları tanımlanıyor...');

  const teamRepo = dataSource.getRepository(Team);
  const specRepo = dataSource.getRepository(Specialization);

  // Takım-Uzmanlık eşleşmeleri
  const teamSpecMappings = [
    // Merkez Asfalt ve Onarım Ekibi
    {
      teamName: 'Merkez Asfalt ve Onarım Ekibi',
      specializations: ['ROAD_MAINTENANCE', 'EMERGENCY_RESPONSE'],
    },

    // Kuzey Bölgesi Yol Bakım Ekibi
    {
      teamName: 'Kuzey Bölgesi Yol Bakım Ekibi',
      specializations: ['ROAD_MAINTENANCE', 'TRAFFIC_SYSTEMS'],
    },

    // Acil Müdahale ve Kurtarma Ekibi
    {
      teamName: 'Acil Müdahale ve Kurtarma Ekibi',
      specializations: ['EMERGENCY_RESPONSE', 'ROAD_MAINTENANCE', 'WATER_INFRASTRUCTURE'],
    },

    // Çukur Onarım Özel Ekibi - Bu takım POTHOLE kategorisi için özel
    {
      teamName: 'Çukur Onarım Özel Ekibi',
      specializations: ['ROAD_MAINTENANCE'], // Bu takım özellikle çukur onarımında uzman
    },

    // Su ve Kanalizasyon Bakım Ekibi
    {
      teamName: 'Su ve Kanalizasyon Bakım Ekibi',
      specializations: ['WATER_INFRASTRUCTURE', 'EMERGENCY_RESPONSE'],
    },

    // Elektrik ve Aydınlatma Ekibi
    {
      teamName: 'Elektrik ve Aydınlatma Ekibi',
      specializations: ['ELECTRICAL_MAINTENANCE', 'EMERGENCY_RESPONSE'],
    },

    // Park ve Bahçe Bakım Ekibi
    {
      teamName: 'Park ve Bahçe Bakım Ekibi',
      specializations: ['PARKS_LANDSCAPING', 'ENVIRONMENTAL_HEALTH'],
    },

    // Temizlik ve Atık Yönetimi Ekibi
    {
      teamName: 'Temizlik ve Atık Yönetimi Ekibi',
      specializations: ['WASTE_MANAGEMENT', 'ENVIRONMENTAL_HEALTH'],
    },

    // Trafik Sistemleri Ekibi
    {
      teamName: 'Trafik Sistemleri Ekibi',
      specializations: ['TRAFFIC_SYSTEMS', 'ELECTRICAL_MAINTENANCE'],
    },

    // Zabıta Ekibi
    {
      teamName: 'Zabıta Ekibi',
      specializations: ['PUBLIC_ORDER', 'ENVIRONMENTAL_HEALTH'],
    },
  ];

  let totalAssigned = 0;

  for (const mapping of teamSpecMappings) {
    // Takımı bul
    const team = await teamRepo.findOne({
      where: { name: mapping.teamName },
    });

    if (!team) {
      logger.warn(`❌ Takım bulunamadı: ${mapping.teamName}`);
      continue;
    }

    // Bu takım için uzmanlıkları ata
    for (const specCode of mapping.specializations) {
      const specialization = await specRepo.findOne({
        where: { code: specCode },
      });

      if (!specialization) {
        logger.warn(`❌ Uzmanlık bulunamadı: ${specCode}`);
        continue;
      }

      // Zaten var mı kontrol et
      const existing = await teamSpecRepo.findOne({
        where: {
          teamId: team.id,
          specializationId: specialization.id,
        },
      });

      if (!existing) {
        await teamSpecRepo.save(
          teamSpecRepo.create({
            teamId: team.id,
            specializationId: specialization.id,
          })
        );
        totalAssigned++;
        logger.log(`✅ ${team.name} → ${specialization.name}`);
      }
    }
  }

  logger.log(`🎉 Toplam ${totalAssigned} takım-uzmanlık ilişkisi başarıyla kuruldu!`);
}
