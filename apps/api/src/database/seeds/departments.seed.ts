﻿import { DataSource } from 'typeorm';
import { Department } from '../../modules/reports/entities/department.entity';
import { MunicipalityDepartment, ReportType } from '@kentnabiz/shared';

export const DepartmentsSeed = async (dataSource: DataSource): Promise<void> => {
  const departmentRepository = dataSource.getRepository(Department);

  // Eğer birim verileri mevcutsa ekleme
  const departmentCount = await departmentRepository.count();
  if (departmentCount > 0) {
    console.log('Birim verileri zaten mevcut, seed işlemi atlanıyor...');
    return;
  }

  console.log('Belediye birimleri oluşturuluyor...');

  const departments = [
    {
      id: 1,
      code: MunicipalityDepartment.GENERAL_AFFAIRS,
      name: 'Genel Konular / Diğer',
      description: 'Sınıflandırılmamış şikayetlerin ilk yönlendirildiği birim',
      isActive: true,
      responsibleReportTypes: [ReportType.OTHER],
    },
    {
      id: 2,
      code: MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE,
      name: 'Fen İşleri ve Altyapı Müdürlüğü',
      description: 'Yollar, kaldırımlar ve temel altyapı ile ilgili sorunların çözüm birimi',
      isActive: true,
      responsibleReportTypes: [
        ReportType.POTHOLE,
        ReportType.SIDEWALK_DAMAGE,
        ReportType.ROAD_DAMAGE,
        ReportType.ROAD_MARKING,
        ReportType.ROAD_BLOCK,
      ],
    },
    {
      id: 3,
      code: MunicipalityDepartment.PLANNING_URBANIZATION,
      name: 'İmar ve Şehircilik Müdürlüğü',
      description: 'İmar planları, yapı denetimi ve şehircilik konuları',
      isActive: true,
      responsibleReportTypes: [ReportType.OTHER], // İmar ile ilgili spesifik tip yok şimdilik
    },
    {
      id: 4,
      code: MunicipalityDepartment.WATER_AND_SEWERAGE,
      name: 'Su ve Kanalizasyon İşleri Müdürlüğü',
      description: 'Su, kanalizasyon ve su baskını ile ilgili sorunlar',
      isActive: true,
      responsibleReportTypes: [
        ReportType.WATER_LEAKAGE,
        ReportType.DRAINAGE_BLOCKAGE,
        ReportType.SEWER_LEAKAGE,
      ],
    },
    {
      id: 5,
      code: MunicipalityDepartment.STREET_LIGHTING,
      name: 'Elektrik ve Aydınlatma Müdürlüğü',
      description: 'Elektrik ve aydınlatma sorunları',
      isActive: true,
      responsibleReportTypes: [ReportType.ELECTRICITY_OUTAGE, ReportType.STREET_LIGHT],
    },
    {
      id: 6,
      code: MunicipalityDepartment.PARKS_AND_GARDENS,
      name: 'Park ve Bahçeler Müdürlüğü',
      description: 'Parklar, yeşil alanlar ve ağaçlar ile ilgili sorunlar',
      isActive: true,
      responsibleReportTypes: [ReportType.TREE_ISSUE, ReportType.PARK_DAMAGE],
    },
    {
      id: 7,
      code: MunicipalityDepartment.ENVIRONMENTAL_PROTECTION,
      name: 'Çevre Koruma ve Kontrol Müdürlüğü',
      description: 'Çevre koruma ve kontrol ile ilgili sorunlar',
      isActive: true,
      responsibleReportTypes: [ReportType.AIR_POLLUTION, ReportType.DUMPING],
    },
    {
      id: 8,
      code: MunicipalityDepartment.CLEANING_SERVICES,
      name: 'Temizlik İşleri Müdürlüğü',
      description: 'Çevre temizliği ve atık yönetimi sorunları',
      isActive: true,
      responsibleReportTypes: [
        ReportType.GARBAGE_COLLECTION,
        ReportType.LITTER,
        ReportType.GRAFFITI,
      ],
    },
    {
      id: 9,
      code: MunicipalityDepartment.TRANSPORTATION_SERVICES,
      name: 'Ulaşım Hizmetleri Müdürlüğü',
      description: 'Toplu taşıma ve ulaşım sorunları',
      isActive: true,
      responsibleReportTypes: [
        ReportType.PUBLIC_TRANSPORT,
        ReportType.PUBLIC_TRANSPORT_STOP,
        ReportType.PARKING_VIOLATION,
        ReportType.TRAFFIC_CONGESTION,
      ],
    },
    {
      id: 10,
      code: MunicipalityDepartment.TRAFFIC_SERVICES,
      name: 'Trafik Hizmetleri Müdürlüğü',
      description: 'Trafik düzeni ve kontrol sorunları',
      isActive: true,
      responsibleReportTypes: [
        ReportType.TRAFFIC_LIGHT,
        ReportType.ROAD_SIGN,
        ReportType.PARKING_VIOLATION,
        ReportType.TRAFFIC_CONGESTION,
      ],
    },
    {
      id: 11,
      code: MunicipalityDepartment.MUNICIPAL_POLICE,
      name: 'Zabıta Müdürlüğü',
      description: 'Belediye zabıtası ile ilgili konular',
      isActive: true,
      responsibleReportTypes: [ReportType.NOISE_COMPLAINT, ReportType.PARKING_VIOLATION],
    },
    {
      id: 12,
      code: MunicipalityDepartment.FIRE_DEPARTMENT,
      name: 'İtfaiye Daire Başkanlığı',
      description: 'İtfaiye ve acil müdahale hizmetleri',
      isActive: true,
      responsibleReportTypes: [ReportType.OTHER], // İtfaiye ile ilgili spesifik tip yok şimdilik
    },
    {
      id: 13,
      code: MunicipalityDepartment.HEALTH_AFFAIRS,
      name: 'Sağlık İşleri Müdürlüğü',
      description: 'Halk sağlığı ve sağlık hizmetleri',
      isActive: true,
      responsibleReportTypes: [ReportType.OTHER], // Sağlık ile ilgili spesifik tip yok şimdilik
    },
    {
      id: 14,
      code: MunicipalityDepartment.VETERINARY_SERVICES,
      name: 'Veteriner İşleri Müdürlüğü',
      description: 'Hayvanlarla ilgili hizmetler',
      isActive: true,
      responsibleReportTypes: [ReportType.ANIMAL_CONTROL],
    },
    {
      id: 15,
      code: MunicipalityDepartment.SOCIAL_ASSISTANCE,
      name: 'Sosyal Yardım İşleri Müdürlüğü',
      description: 'Sosyal yardım ve destek hizmetleri',
      isActive: true,
      responsibleReportTypes: [ReportType.OTHER], // Sosyal yardım ile ilgili spesifik tip yok şimdilik
    },
    {
      id: 16,
      code: MunicipalityDepartment.CULTURE_AND_SOCIAL_AFFAIRS,
      name: 'Kültür ve Sosyal İşler Müdürlüğü',
      description: 'Kültürel etkinlikler ve sosyal faaliyetler',
      isActive: true,
      responsibleReportTypes: [ReportType.OTHER], // Kültür ile ilgili spesifik tip yok şimdilik
    },
  ];

  // Departmanları oluştur ve kaydet
  const departmentEntities = departments.map(dept => departmentRepository.create(dept));
  await departmentRepository.save(departmentEntities);

  console.log('Birim seed işlemi tamamlandı!');
};
