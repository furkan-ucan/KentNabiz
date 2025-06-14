import { DataSource } from 'typeorm';
import { Specialization } from '../../modules/specializations/entities/specialization.entity';
import { MunicipalityDepartment } from '@kentnabiz/shared';
import { Logger } from '@nestjs/common';

const logger = new Logger('SpecializationsSeed');

export async function SpecializationsSeed(dataSource: DataSource): Promise<void> {
  const specializationRepository = dataSource.getRepository(Specialization);
  if ((await specializationRepository.count()) > 0) {
    logger.log('Uzmanlık verileri zaten mevcut, atlanıyor...');
    return;
  }

  logger.log('💎 Zenginleştirilmiş uzmanlık alanları oluşturuluyor...');
  const specializations = [
    {
      code: 'ROAD_MAINTENANCE',
      name: 'Yol Bakım ve Asfalt Uzmanlığı',
      description:
        'Çukur tamiri, yol çatlak onarımı, asfalt yenileme, kaldırım düzenlemesi ve yol yüzeyi işlemleri. Sıcak asfalt, soğuk asfalt ve yamama teknikleri dahil.',
      typicalDepartmentCode: MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE,
    },
    {
      code: 'WATER_INFRASTRUCTURE',
      name: 'Su Altyapısı ve Kanalizasyon Uzmanlığı',
      description:
        'İçme suyu borusu patlakları, kanalizasyon tıkanıklıkları, drenaj sistemi arızaları, su sayacı değişimi ve yağmur suyu drenaj sistemleri.',
      typicalDepartmentCode: MunicipalityDepartment.WATER_AND_SEWERAGE,
    },
    {
      code: 'ELECTRICAL_MAINTENANCE',
      name: 'Elektrik ve Aydınlatma Uzmanlığı',
      description:
        'Sokak aydınlatması arızaları, elektrik direği montajı, trafo sorunları, elektrik kesintileri ve LED aydınlatma sistemleri kurulumu.',
      typicalDepartmentCode: MunicipalityDepartment.STREET_LIGHTING,
    },
    {
      code: 'PARKS_LANDSCAPING',
      name: 'Park ve Peyzaj Uzmanlığı',
      description:
        'Park ekipmanları bakımı, ağaç budama ve dikimi, çim ekimi ve bakımı, çiçek tarhları düzenlemesi, oyun alanları kurulumu ve peyzaj tasarımı.',
      typicalDepartmentCode: MunicipalityDepartment.PARKS_AND_GARDENS,
    },
    {
      code: 'WASTE_MANAGEMENT',
      name: 'Atık Yönetimi ve Çevre Temizliği',
      description:
        'Çöp konteynerleri değişimi, moloz toplama, grafiti temizliği, çevre kirliliği temizliği, geri dönüşüm sistemleri ve özel atık toplama.',
      typicalDepartmentCode: MunicipalityDepartment.CLEANING_SERVICES,
    },
    {
      code: 'TRAFFIC_SYSTEMS',
      name: 'Trafik Sistemleri ve Levhalar',
      description:
        'Trafik ışıkları bakımı, yol levhaları montajı, yol çizgisi çekimi, hız kesici montajı ve trafik güvenlik sistemleri kurulumu.',
      typicalDepartmentCode: MunicipalityDepartment.TRAFFIC_SERVICES,
    },
    {
      code: 'PUBLIC_ORDER',
      name: 'Kamu Düzeni ve Zabıta Uzmanlığı',
      description:
        'Gürültü şikayetleri, kaçak yapı tespiti, seyyar satıcı denetimi, park ihlalleri, açık alan işgali ve zabıta cezai işlemleri.',
      typicalDepartmentCode: MunicipalityDepartment.MUNICIPAL_POLICE,
    },
    {
      code: 'EMERGENCY_RESPONSE',
      name: 'Acil Müdahale ve Kurtarma',
      description:
        'Doğal afet müdahalesi, acil yol açma, kurtarma operasyonları, acil altyapı onarımları ve koordinasyon işlemleri.',
      typicalDepartmentCode: MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE,
    },
    {
      code: 'ENVIRONMENTAL_HEALTH',
      name: 'Çevre Sağlığı ve Hijyen',
      description:
        'Çevre kirliliği tespiti, haşere mücadelesi, hijyen denetimi, çevre sağlığı risk değerlendirmesi ve dezenfeksiyon işlemleri.',
      typicalDepartmentCode: MunicipalityDepartment.CLEANING_SERVICES,
    },
  ];

  await specializationRepository.save(specializationRepository.create(specializations));
  logger.log(`✅ ${specializations.length} adet zenginleştirilmiş uzmanlık başarıyla oluşturuldu.`);
}
