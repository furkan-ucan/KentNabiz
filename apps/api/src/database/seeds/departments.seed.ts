import { DataSource } from 'typeorm';
import { Department } from '../../modules/reports/entities/department.entity';
import {
  MunicipalityDepartment,
  ReportType,
} from '../../modules/reports/interfaces/report.interface';

export const DepartmentsSeed = async (dataSource: DataSource): Promise<void> => {
  const departmentRepository = dataSource.getRepository(Department);

  // Eğer birim verileri mevcutsa ekleme
  const departmentCount = await departmentRepository.count();
  if (departmentCount > 0) {
    console.log('Birim verileri zaten mevcut, seed işlemi atlanıyor...');
    return;
  }

  console.log('Belediye birimleri oluşturuluyor...');

  // Örnek birimler
  const departments = [
    {
      code: MunicipalityDepartment.GENERAL,
      name: 'Genel Birim',
      description: 'Sınıflandırılmamış şikayetlerin ilk yönlendirildiği birim',
      isActive: true,
      responsibleReportTypes: [ReportType.OTHER],
    },
    {
      code: MunicipalityDepartment.ROADS,
      name: 'Yollar ve Altyapı Müdürlüğü',
      description: 'Yollar ve altyapı ile ilgili sorunların çözüm birimi',
      isActive: true,
      responsibleReportTypes: [
        ReportType.POTHOLE,
        ReportType.ROAD_DAMAGE,
        ReportType.TRAFFIC_LIGHT,
        ReportType.STREET_LIGHT,
      ],
    },
    {
      code: MunicipalityDepartment.WATER,
      name: 'Su ve Kanalizasyon Müdürlüğü',
      description: 'Su, kanalizasyon ve su baskını ile ilgili sorunlar',
      isActive: true,
      responsibleReportTypes: [ReportType.WATER_LEAKAGE],
    },
    {
      code: MunicipalityDepartment.ELECTRICITY,
      name: 'Elektrik İşleri Müdürlüğü',
      description: 'Elektrik ve aydınlatma sorunları',
      isActive: true,
      responsibleReportTypes: [ReportType.ELECTRICITY_OUTAGE, ReportType.STREET_LIGHT],
    },
    {
      code: MunicipalityDepartment.PARKS,
      name: 'Park ve Bahçeler Müdürlüğü',
      description: 'Parklar, yeşil alanlar ve ağaçlar ile ilgili sorunlar',
      isActive: true,
      responsibleReportTypes: [ReportType.TREE_ISSUE, ReportType.PARK_DAMAGE],
    },
    {
      code: MunicipalityDepartment.ENVIRONMENTAL,
      name: 'Çevre Koruma ve Temizlik Müdürlüğü',
      description: 'Çevre temizliği ve atık yönetimi sorunları',
      isActive: true,
      responsibleReportTypes: [
        ReportType.GARBAGE_COLLECTION,
        ReportType.LITTER,
        ReportType.GRAFFITI,
      ],
    },
    {
      code: MunicipalityDepartment.INFRASTRUCTURE,
      name: 'Altyapı Müdürlüğü',
      description: 'Genel altyapı sorunları',
      isActive: true,
      responsibleReportTypes: [],
    },
    {
      code: MunicipalityDepartment.TRANSPORTATION,
      name: 'Ulaşım Hizmetleri Müdürlüğü',
      description: 'Toplu taşıma ve ulaşım sorunları',
      isActive: true,
      responsibleReportTypes: [
        ReportType.PUBLIC_TRANSPORT,
        ReportType.PUBLIC_TRANSPORT_STOP,
        ReportType.PUBLIC_TRANSPORT_VEHICLE,
        ReportType.PUBLIC_TRANSPORT_VIOLATION,
        ReportType.PARKING_VIOLATION,
      ],
    },
    {
      code: MunicipalityDepartment.OTHER,
      name: 'Diğer Birimler',
      description: 'Tanımlanmamış diğer birimler',
      isActive: true,
      responsibleReportTypes: [ReportType.OTHER],
    },
  ];

  // Departmanları oluştur ve kaydet
  const departmentEntities = departments.map((dept) => departmentRepository.create(dept));
  await departmentRepository.save(departmentEntities);

  console.log('Birim seed işlemi tamamlandı!');
};
