import { DataSource } from 'typeorm';
import { ReportCategory } from '../../modules/reports/entities/report-category.entity';

export const CategoriesSeed = async (dataSource: DataSource): Promise<void> => {
  const categoryRepository = dataSource.getRepository(ReportCategory);

  // Eğer kategori verileri mevcutsa ekleme
  const categoryCount = await categoryRepository.count();
  if (categoryCount > 0) {
    console.log('Kategori verileri zaten mevcut, seed işlemi atlanıyor...');
    return;
  }

  console.log('Rapor kategorileri oluşturuluyor...');

  // Ana kategoriler
  const mainCategories = [
    {
      name: 'Altyapı',
      code: 'INFRASTRUCTURE',
      description: 'Yollar, su, elektrik vb. altyapı sorunları',
      icon: 'fa-hammer',
      isActive: true,
      sortOrder: 10,
    },
    {
      name: 'Ulaşım',
      code: 'TRANSPORT',
      description: 'Toplu taşıma ve trafik sorunları',
      icon: 'fa-bus',
      isActive: true,
      sortOrder: 20,
    },
    {
      name: 'Çevre',
      code: 'ENVIRONMENT',
      description: 'Çevre temizliği ve çevre sorunları',
      icon: 'fa-leaf',
      isActive: true,
      sortOrder: 30,
    },
    {
      name: 'Park ve Bahçeler',
      code: 'PARKS',
      description: 'Parklar ve yeşil alanlar ile ilgili sorunlar',
      icon: 'fa-tree',
      isActive: true,
      sortOrder: 40,
    },
    {
      name: 'Güvenlik',
      code: 'SECURITY',
      description: 'Güvenlik sorunları ve tehlikeli durumlar',
      icon: 'fa-shield-alt',
      isActive: true,
      sortOrder: 50,
    },
    {
      name: 'Diğer',
      code: 'OTHER',
      description: 'Diğer kategorilere girmeyen sorunlar',
      icon: 'fa-question-circle',
      isActive: true,
      sortOrder: 999,
    },
  ];

  // Map'i tip güvenliği için tanımlayalım
  const categoryMap = new Map<string, ReportCategory>();

  // Ana kategorileri oluştur
  console.log('Ana kategoriler oluşturuluyor...');
  for (const category of mainCategories) {
    const savedCategory = await categoryRepository.save(categoryRepository.create(category));
    categoryMap.set(category.code, savedCategory);
  }

  // Alt kategoriler - Altyapı
  console.log('Altyapı alt kategorileri oluşturuluyor...');
  const infrastructureCategory = categoryMap.get('INFRASTRUCTURE');
  if (infrastructureCategory) {
    const infrastructureId = infrastructureCategory.id;
    const subcategories = [
      {
        name: 'Yol / Kaldırım Hasarı',
        code: 'INFRASTRUCTURE_ROAD',
        description: 'Yol ve kaldırımlardaki çukur, kırık ve hasarlar',
        icon: 'fa-road',
        isActive: true,
        sortOrder: 1,
        parentId: infrastructureId,
      },
      {
        name: 'Su Arızası',
        code: 'INFRASTRUCTURE_WATER',
        description: 'Su kesintisi, sızıntı, boru patlaması vb.',
        icon: 'fa-tint',
        isActive: true,
        sortOrder: 2,
        parentId: infrastructureId,
      },
      {
        name: 'Elektrik Arızası',
        code: 'INFRASTRUCTURE_ELECTRICITY',
        description: 'Elektrik kesintisi, aydınlatma sorunu, kablo arızası',
        icon: 'fa-bolt',
        isActive: true,
        sortOrder: 3,
        parentId: infrastructureId,
      },
      {
        name: 'Sokak Aydınlatması',
        code: 'INFRASTRUCTURE_LIGHT',
        description: 'Sokak lambası arızaları ve aydınlatma sorunları',
        icon: 'fa-lightbulb',
        isActive: true,
        sortOrder: 4,
        parentId: infrastructureId,
      },
    ];

    // Alt kategorileri kaydet
    await categoryRepository.save(subcategories.map((cat) => categoryRepository.create(cat)));
  }

  // Alt kategoriler - Ulaşım
  console.log('Ulaşım alt kategorileri oluşturuluyor...');
  const transportCategory = categoryMap.get('TRANSPORT');
  if (transportCategory) {
    const transportId = transportCategory.id;
    const subcategories = [
      {
        name: 'Otobüs',
        code: 'TRANSPORT_BUS',
        description: 'Otobüs seferleri, güzergahlar ve durak sorunları',
        icon: 'fa-bus',
        isActive: true,
        sortOrder: 1,
        parentId: transportId,
      },
      {
        name: 'Trafik',
        code: 'TRANSPORT_TRAFFIC',
        description: 'Trafik sorunları, trafik ışıkları ve yoğunluk',
        icon: 'fa-traffic-light',
        isActive: true,
        sortOrder: 2,
        parentId: transportId,
      },
      {
        name: 'Park İhlali',
        code: 'TRANSPORT_PARKING',
        description: 'Yasak park ve park ihlalleri',
        icon: 'fa-parking',
        isActive: true,
        sortOrder: 3,
        parentId: transportId,
      },
    ];

    // Alt kategorileri kaydet
    await categoryRepository.save(subcategories.map((cat) => categoryRepository.create(cat)));
  }

  // Alt kategoriler - Çevre ve Temizlik
  console.log('Çevre alt kategorileri oluşturuluyor...');
  const environmentCategory = categoryMap.get('ENVIRONMENT');
  if (environmentCategory) {
    const environmentId = environmentCategory.id;
    const subcategories = [
      {
        name: 'Çöp',
        code: 'ENVIRONMENT_GARBAGE',
        description: 'Çöp toplama ve atık sorunları',
        icon: 'fa-trash',
        isActive: true,
        sortOrder: 1,
        parentId: environmentId,
      },
      {
        name: 'Kirlilik',
        code: 'ENVIRONMENT_POLLUTION',
        description: 'Hava, su ve gürültü kirliliği',
        icon: 'fa-smog',
        isActive: true,
        sortOrder: 2,
        parentId: environmentId,
      },
      {
        name: 'Grafiti',
        code: 'ENVIRONMENT_GRAFFITI',
        description: 'İzinsiz duvar yazıları ve grafitiler',
        icon: 'fa-spray-can',
        isActive: true,
        sortOrder: 3,
        parentId: environmentId,
      },
    ];

    // Alt kategorileri kaydet
    await categoryRepository.save(subcategories.map((cat) => categoryRepository.create(cat)));
  }

  // Alt kategoriler - Park ve Bahçeler
  console.log('Park alt kategorileri oluşturuluyor...');
  const parksCategory = categoryMap.get('PARKS');
  if (parksCategory) {
    const parksId = parksCategory.id;
    const subcategories = [
      {
        name: 'Park Hasarı',
        code: 'PARKS_DAMAGE',
        description: 'Park ve çocuk oyun alanlarındaki hasar ve sorunlar',
        icon: 'fa-child',
        isActive: true,
        sortOrder: 1,
        parentId: parksId,
      },
      {
        name: 'Ağaç Sorunu',
        code: 'PARKS_TREE',
        description: 'Tehlikeli ağaçlar ve bitki sorunları',
        icon: 'fa-tree',
        isActive: true,
        sortOrder: 2,
        parentId: parksId,
      },
    ];

    // Alt kategorileri kaydet
    await categoryRepository.save(subcategories.map((cat) => categoryRepository.create(cat)));
  }

  // Alt kategoriler - Güvenlik
  console.log('Güvenlik alt kategorileri oluşturuluyor...');
  const securityCategory = categoryMap.get('SECURITY');
  if (securityCategory) {
    const securityId = securityCategory.id;
    const subcategories = [
      {
        name: 'Hırsızlık',
        code: 'SECURITY_THEFT',
        description: 'Hırsızlık olayları',
        icon: 'fa-user-shield',
        isActive: true,
        sortOrder: 1,
        parentId: securityId,
      },
      {
        name: 'Şiddet',
        code: 'SECURITY_VIOLENCE',
        description: 'Şiddet olayları',
        icon: 'fa-fist-raised',
        isActive: true,
        sortOrder: 2,
        parentId: securityId,
      },
      {
        name: 'Diğer Güvenlik Sorunları',
        code: 'SECURITY_OTHER',
        description: 'Diğer güvenlik sorunları',
        icon: 'fa-shield-alt',
        isActive: true,
        sortOrder: 3,
        parentId: securityId,
      },
    ];

    // Alt kategorileri kaydet
    await categoryRepository.save(subcategories.map((cat) => categoryRepository.create(cat)));
  }

  // Diğer alt kategoriler
  console.log('Diğer alt kategoriler oluşturuluyor...');
  const otherCategory = categoryMap.get('OTHER');
  if (otherCategory) {
    const otherId = otherCategory.id;
    const subcategories = [
      {
        name: 'Diğer Sorunlar',
        code: 'OTHER_ISSUES',
        description: 'Diğer sorunlar',
        icon: 'fa-question-circle',
        isActive: true,
        sortOrder: 1,
        parentId: otherId,
      },
    ];

    // Alt kategorileri kaydet
    await categoryRepository.save(subcategories.map((cat) => categoryRepository.create(cat)));
  }

  console.log('Tüm kategoriler başarıyla oluşturuldu.');
};
