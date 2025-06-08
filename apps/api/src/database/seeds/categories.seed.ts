import { DataSource } from 'typeorm';
import { ReportCategory } from '../../modules/reports/entities/report-category.entity';
import { Department } from '../../modules/reports/entities/department.entity';
import { MunicipalityDepartment, ReportType } from '@kentnabiz/shared';

export const CategoriesSeed = async (dataSource: DataSource): Promise<void> => {
  const categoryRepository = dataSource.getRepository(ReportCategory);
  const departmentRepository = dataSource.getRepository(Department);

  // Eğer kategori verileri mevcutsa ekleme
  const categoryCount = await categoryRepository.count();
  if (categoryCount > 0) {
    console.log('Kategori verileri zaten mevcut, seed işlemi atlanıyor...');
    return;
  }

  console.log('Rapor kategorileri oluşturuluyor...');

  // Departmanları çekiyoruz
  const roadsDept = await departmentRepository.findOne({
    where: { code: MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE },
  });
  const waterDept = await departmentRepository.findOne({
    where: { code: MunicipalityDepartment.WATER_AND_SEWERAGE },
  });
  const lightingDept = await departmentRepository.findOne({
    where: { code: MunicipalityDepartment.STREET_LIGHTING },
  });
  const parksDept = await departmentRepository.findOne({
    where: { code: MunicipalityDepartment.PARKS_AND_GARDENS },
  });
  const envDept = await departmentRepository.findOne({
    where: { code: MunicipalityDepartment.ENVIRONMENTAL_PROTECTION },
  });
  const cleaningDept = await departmentRepository.findOne({
    where: { code: MunicipalityDepartment.CLEANING_SERVICES },
  });
  const transportDept = await departmentRepository.findOne({
    where: { code: MunicipalityDepartment.TRANSPORTATION_SERVICES },
  });
  const trafficDept = await departmentRepository.findOne({
    where: { code: MunicipalityDepartment.TRAFFIC_SERVICES },
  });
  const policeDept = await departmentRepository.findOne({
    where: { code: MunicipalityDepartment.MUNICIPAL_POLICE },
  });
  const generalDept = await departmentRepository.findOne({
    where: { code: MunicipalityDepartment.GENERAL_AFFAIRS },
  });

  if (
    !roadsDept ||
    !waterDept ||
    !lightingDept ||
    !parksDept ||
    !envDept ||
    !cleaningDept ||
    !transportDept ||
    !trafficDept ||
    !policeDept ||
    !generalDept
  ) {
    throw new Error('Departmanlar bulunamadı. Önce departments.seed.ts çalıştırın.');
  }

  // Ana kategoriler (artık departmana bağlı)
  const mainCategories = [
    {
      name: 'Yol ve Kaldırım Sorunları',
      code: 'ROADS_SIDEWALKS',
      description: 'Yollar ve kaldırımlardaki hasarlar',
      icon: 'fa-road',
      departmentId: roadsDept.id,
      defaultReportType: ReportType.ROAD_DAMAGE,
      isActive: true,
      sortOrder: 10,
    },
    {
      name: 'Çukur',
      code: 'POTHOLE',
      description: 'Yollardaki çukurlar',
      icon: 'fa-exclamation-triangle',
      departmentId: roadsDept.id,
      defaultReportType: ReportType.POTHOLE,
      isActive: true,
      sortOrder: 11,
    },
    {
      name: 'Kaldırım Hasarı',
      code: 'SIDEWALK_DAMAGE',
      description: 'Kaldırımlardaki hasarlar',
      icon: 'fa-walking',
      departmentId: roadsDept.id,
      defaultReportType: ReportType.SIDEWALK_DAMAGE,
      isActive: true,
      sortOrder: 12,
    },
    {
      name: 'Su Arızaları',
      code: 'WATER_ISSUES',
      description: 'Su sızıntısı ve arızaları',
      icon: 'fa-tint',
      departmentId: waterDept.id,
      defaultReportType: ReportType.WATER_LEAKAGE,
      isActive: true,
      sortOrder: 20,
    },
    {
      name: 'Kanalizasyon Sorunları',
      code: 'SEWER_ISSUES',
      description: 'Kanalizasyon tıkanıklığı ve sorunları',
      icon: 'fa-exclamation-circle',
      departmentId: waterDept.id,
      defaultReportType: ReportType.SEWER_LEAKAGE,
      isActive: true,
      sortOrder: 21,
    },
    {
      name: 'Sokak Aydınlatması',
      code: 'STREET_LIGHTING',
      description: 'Sokak lambası arızaları',
      icon: 'fa-lightbulb',
      departmentId: lightingDept.id,
      defaultReportType: ReportType.STREET_LIGHT,
      isActive: true,
      sortOrder: 30,
    },
    {
      name: 'Elektrik Kesintisi',
      code: 'ELECTRICITY_OUTAGE',
      description: 'Elektrik kesintisi ve arızalar',
      icon: 'fa-bolt',
      departmentId: lightingDept.id,
      defaultReportType: ReportType.ELECTRICITY_OUTAGE,
      isActive: true,
      sortOrder: 31,
    },
    {
      name: 'Park ve Bahçe Sorunları',
      code: 'PARK_GARDEN_ISSUES',
      description: 'Park ve yeşil alan sorunları',
      icon: 'fa-tree',
      departmentId: parksDept.id,
      defaultReportType: ReportType.PARK_DAMAGE,
      isActive: true,
      sortOrder: 40,
    },
    {
      name: 'Ağaç Sorunları',
      code: 'TREE_ISSUES',
      description: 'Tehlikeli ağaçlar ve bitki sorunları',
      icon: 'fa-tree',
      departmentId: parksDept.id,
      defaultReportType: ReportType.TREE_ISSUE,
      isActive: true,
      sortOrder: 41,
    },
    {
      name: 'Çöp Toplama',
      code: 'GARBAGE_COLLECTION',
      description: 'Çöp toplama ve atık sorunları',
      icon: 'fa-trash',
      departmentId: cleaningDept.id,
      defaultReportType: ReportType.GARBAGE_COLLECTION,
      isActive: true,
      sortOrder: 50,
    },
    {
      name: 'Çevre Kirliliği',
      code: 'POLLUTION',
      description: 'Çevre kirliliği ve atık yığını',
      icon: 'fa-smog',
      departmentId: envDept.id,
      defaultReportType: ReportType.AIR_POLLUTION,
      isActive: true,
      sortOrder: 51,
    },
    {
      name: 'Grafiti',
      code: 'GRAFFITI',
      description: 'İzinsiz duvar yazıları',
      icon: 'fa-spray-can',
      departmentId: cleaningDept.id,
      defaultReportType: ReportType.GRAFFITI,
      isActive: true,
      sortOrder: 52,
    },
    {
      name: 'Toplu Taşıma',
      code: 'PUBLIC_TRANSPORT',
      description: 'Otobüs ve toplu taşıma sorunları',
      icon: 'fa-bus',
      departmentId: transportDept.id,
      defaultReportType: ReportType.PUBLIC_TRANSPORT,
      isActive: true,
      sortOrder: 60,
    },
    {
      name: 'Trafik Sorunları',
      code: 'TRAFFIC_ISSUES',
      description: 'Trafik ışığı ve trafik sorunları',
      icon: 'fa-traffic-light',
      departmentId: trafficDept.id,
      defaultReportType: ReportType.TRAFFIC_LIGHT,
      isActive: true,
      sortOrder: 61,
    },
    {
      name: 'Park İhlali',
      code: 'PARKING_VIOLATION',
      description: 'Yasak park ve park ihlalleri',
      icon: 'fa-parking',
      departmentId: policeDept.id,
      defaultReportType: ReportType.PARKING_VIOLATION,
      isActive: true,
      sortOrder: 62,
    },
    {
      name: 'Gürültü Şikayeti',
      code: 'NOISE_COMPLAINT',
      description: 'Gürültü kirliliği şikayetleri',
      icon: 'fa-volume-up',
      departmentId: policeDept.id,
      defaultReportType: ReportType.NOISE_COMPLAINT,
      isActive: true,
      sortOrder: 63,
    },
    {
      name: 'Diğer',
      code: 'OTHER',
      description: 'Diğer kategorilere girmeyen sorunlar',
      icon: 'fa-question-circle',
      departmentId: generalDept.id,
      defaultReportType: ReportType.OTHER,
      isActive: true,
      sortOrder: 999,
    },
  ];

  // Kategorileri oluştur
  console.log('Kategoriler oluşturuluyor...');
  for (const category of mainCategories) {
    const savedCategory = await categoryRepository.save(categoryRepository.create(category));
    console.log(
      `✅ Kategori oluşturuldu: ${savedCategory.name} (${savedCategory.code}) - Departman ID: ${savedCategory.departmentId}`
    );
  }

  console.log('Tüm kategoriler başarıyla oluşturuldu.');
};
