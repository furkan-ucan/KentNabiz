import { DataSource } from 'typeorm';
import { Report } from '../../modules/reports/entities/report.entity';
import { ReportCategory } from '../../modules/reports/entities/report-category.entity';
import { User } from '../../modules/users/entities/user.entity';
import { ReportStatus, UserRole } from '@kentnabiz/shared';
import { faker } from '@faker-js/faker/locale/tr';
import { Point } from 'geojson';
import { Logger } from '@nestjs/common';

const logger = new Logger('ReportsSeed');

// Gerçekçi İslahiye konumları (GeoJSON'dan çıkarılan koordinatlar)
const REALISTIC_LOCATIONS = [
  { name: 'İslahiye Merkez', coords: [38.559336, 38.906777] },
  { name: 'Yolbaşı Mahallesi', coords: [40.659775, 40.985932] },
  { name: 'Kazıklı Mahallesi', coords: [36.665142, 36.827734] },
  { name: 'Çınarlı Mahallesi', coords: [36.733008, 36.871274] },
  { name: 'Burunsuzlar Mahallesi', coords: [36.780939, 36.942055] },
  { name: 'Ortaklı Mahallesi', coords: [36.877638, 36.985569] },
  { name: 'Güngören Mahallesi', coords: [36.743217, 36.953064] },
  { name: 'Kale Mahallesi', coords: [36.765983, 36.917694] },
  { name: 'Yesemek Mahallesi', coords: [36.837528, 36.917556] },
  { name: 'Kırıkçalı Mahallesi', coords: [36.70551, 36.913722] },
  { name: 'Tandır Mahallesi', coords: [36.622651, 37.000089] },
  { name: 'Köklü Mahallesi', coords: [36.501635, 36.992587] },
  { name: 'Karacaören Mahallesi', coords: [36.884419, 36.93004] },
  { name: 'Esenler Mahallesi', coords: [36.529852, 36.909695] },
  { name: 'Pınarbaşı Mahallesi', coords: [36.630588, 37.02436] },
  { name: 'Kayabaşı Mahallesi', coords: [36.536461, 36.910252] },
  { name: 'Yağızlar Mahallesi', coords: [36.44394, 36.931607] },
  { name: 'Hasanlök Mahallesi', coords: [36.488424, 36.922705] },
  { name: 'Karakaya Mahallesi', coords: [36.810358, 36.969747] },
  { name: 'Yeniceli Mahallesi', coords: [36.937065, 37.037254] },
  { name: 'Aydınlık Mahallesi', coords: [36.623799, 37.02788] },
  { name: 'Alaca Mahallesi', coords: [36.672256, 37.143317] },
  { name: 'Kozdere Mahallesi', coords: [36.744804, 37.062112] },
  { name: 'Elbistanhüyüğü Mahallesi', coords: [36.631124, 37.025638] },
  { name: 'Cumhuriyet Mahallesi', coords: [36.635585, 37.005637] },
];

// Gerçekçi rapor şablonları
const REALISTIC_REPORTS = [
  {
    titles: [
      'Yolda Büyük Çukur Oluştu',
      'Asfalt Çatlağı Tehlike Yaratıyor',
      'Yol Kenarı Bordür Kırık',
      'Kavşakta Asfalt Çökmesi',
    ],
    descriptions: [
      'Ana cadde üzerinde araç geçişini engelleyen büyük çukur var. Özellikle yağmurlu havalarda su birikimi oluşuyor.',
      'Yol yüzeyinde oluşan derin çatlaklar araçlara zarar veriyor. Acil onarım gerekiyor.',
      'Kaldırım kenarındaki bordür taşları kırılmış durumda. Yayalar için tehlike oluşturuyor.',
      'Kavşak girişinde asfalt çökmesi nedeniyle trafik akışı zorlaşıyor.',
    ],
  },
  {
    titles: [
      'Sokak Lambası Yanmıyor',
      'Elektrik Direği Eğilmiş',
      'Trafo Arızası - Mahalle Karanlık',
      'LED Armatür Arızalı',
    ],
    descriptions: [
      'Sokak lambaları birkaç gündür yanmıyor. Mahalle karanlık kalıyor, güvenlik problemi var.',
      'Fırtınada eğilen elektrik direği düşme tehlikesi yaratıyor. Acil müdahale gerekiyor.',
      'Mahalle trafosunda arıza nedeniyle sokak aydınlatması çalışmıyor.',
      'Yeni takılan LED armatürler sürekli yanıp sönüyor, düzgün çalışmıyor.',
    ],
  },
  {
    titles: [
      'Su Borusu Patladı',
      'Kanalizasyon Tıkanıklığı',
      'Yağmur Suyu Drenajı Çalışmıyor',
      'Su Sayacı Arızalı',
    ],
    descriptions: [
      'Ana su hattında patlama oluştu. Sokak sular altında kaldı, evlere su gitmiyor.',
      'Kanalizasyon tıkanıklığı nedeniyle pis su yollara taşıyor. Hijyen problemi var.',
      'Yağmur sonrası sokaklar su baskınına uğruyor. Drenaj sistemi yetersiz.',
      'Su sayacında kaçak var. Sürekli su akıyor, fatura yüksek geliyor.',
    ],
  },
  {
    titles: [
      'Park Ekipmanları Kırık',
      'Ağaçlar Budanmamış',
      'Çim Alanlar Bakımsız',
      'Çocuk Oyun Alanı Tehlikeli',
    ],
    descriptions: [
      'Park içindeki banklar ve çöp kutuları kırık durumda. Yenilenmesi gerekiyor.',
      'Büyüyen ağaç dalları yolu kapatıyor ve elektrik tellerine değiyor.',
      'Park içindeki çim alanlar kuruymuş ve bakımsız görünüyor.',
      'Oyun parkındaki kaydıraklar ve salıncaklar güvenli değil, çocuklar için tehlikeli.',
    ],
  },
];

export const ReportsSeed = async (dataSource: DataSource): Promise<void> => {
  const reportRepository = dataSource.getRepository(Report);
  if ((await reportRepository.count()) > 0) {
    logger.log('Rapor verileri zaten mevcut, seed işlemi atlanıyor...');
    return;
  }

  logger.log('🏙️ Gerçekçi şehir simülasyonu rapor verileri oluşturuluyor...');

  const categoryRepo = dataSource.getRepository(ReportCategory);
  const userRepo = dataSource.getRepository(User);

  const allCategories = await categoryRepo.find({ relations: ['department'] });
  const citizens = await userRepo
    .createQueryBuilder('user')
    .where(':role = ANY(user.roles)', { role: UserRole.CITIZEN })
    .getMany();

  if (citizens.length === 0) {
    logger.error('Rapor oluşturmak için vatandaş bulunamadı. Lütfen önce UsersSeed çalıştırın.');
    throw new Error('Rapor oluşturmak için vatandaş bulunamadı. Lütfen önce UsersSeed çalıştırın.');
  }

  if (allCategories.length === 0) {
    logger.error(
      'Rapor oluşturmak için kategori bulunamadı. Lütfen önce CategoriesSeed çalıştırın.'
    );
    throw new Error(
      'Rapor oluşturmak için kategori bulunamadı. Lütfen önce CategoriesSeed çalıştırın.'
    );
  }

  const reportsToCreate: Partial<Report>[] = [];

  // Her kategori için en az 3-5 rapor oluştur
  for (const category of allCategories) {
    if (!category.department) {
      logger.warn(`Kategori ${category.name} için departman bulunamadı, atlanıyor.`);
      continue;
    }

    const reportCount = faker.number.int({ min: 3, max: 7 });
    const categoryReports =
      REALISTIC_REPORTS.find(template =>
        template.titles.some(title =>
          title.toLowerCase().includes(category.name.toLowerCase().split(' ')[0])
        )
      ) || REALISTIC_REPORTS[0];

    for (let i = 0; i < reportCount; i++) {
      const locationData = faker.helpers.arrayElement(REALISTIC_LOCATIONS);
      const location: Point = {
        type: 'Point',
        coordinates: locationData.coords,
      };

      // İş akışı kurallarına uygun olarak tüm raporlar OPEN ile başlar
      // Durum geçişleri sadece AssignmentsSeed tarafından yapılacak
      // Bu, "atanmamış rapor IN_PROGRESS/DONE olamaz" kuralını garanti eder
      const status = ReportStatus.OPEN;
      const subStatus = null; // Başlangıçta sub-status yok

      // Başlangıçta tüm raporlar için orta seviye destek sayısı
      const supportCount = faker.number.int({ min: 1, max: 8 });

      const report: Partial<Report> = {
        title: faker.helpers.arrayElement(categoryReports.titles),
        description: faker.helpers.arrayElement(categoryReports.descriptions),
        location,
        address: `${locationData.name}, ${faker.location.streetAddress()}`,
        reportType: category.defaultReportType,
        status,
        subStatus,
        supportCount,
        userId: faker.helpers.arrayElement(citizens).id,
        categoryId: category.id,
        currentDepartmentId: category.department.id,
        departmentCode: category.department.code,
        createdAt: faker.date.recent({ days: 90 }),
        // updatedAt başlangıçta aynı olacak, durum değiştiğinde AssignmentsSeed güncelleyecek
        updatedAt: undefined,
      };
      reportsToCreate.push(report);
    }
  }

  // Ek olarak bazı trend raporlar ekle
  const trendingReports = [
    {
      title: 'Kış Nedeniyle Yol Buzlanması',
      description: 'Soğuk hava nedeniyle yollarda buzlanma oluşuyor. Tuz serpilmesi gerekiyor.',
      priority: 'HIGH',
    },
    {
      title: 'Sonbahar Yaprak Temizliği Gerekli',
      description: 'Dökülen yapraklar yolları kapatıyor ve kaygan zemin oluşturuyor.',
      priority: 'MEDIUM',
    },
    {
      title: 'Yağmur Sonrası Su Birikintileri',
      description: 'Sağanak yağmur sonrası caddelerde su birikintileri oluşuyor.',
      priority: 'HIGH',
    },
  ];

  for (const trendReport of trendingReports) {
    const locationData = faker.helpers.arrayElement(REALISTIC_LOCATIONS);
    const category = faker.helpers.arrayElement(allCategories.filter(c => c.department));

    if (category?.department) {
      const report: Partial<Report> = {
        title: trendReport.title,
        description: trendReport.description,
        location: {
          type: 'Point',
          coordinates: locationData.coords,
        },
        address: `${locationData.name}, ${faker.location.streetAddress()}`,
        reportType: category.defaultReportType,
        status: ReportStatus.OPEN,
        supportCount: faker.number.int({ min: 5, max: 20 }),
        userId: faker.helpers.arrayElement(citizens).id,
        categoryId: category.id,
        currentDepartmentId: category.department.id,
        departmentCode: category.department.code,
        createdAt: faker.date.recent({ days: 7 }),
      };
      reportsToCreate.push(report);
    }
  }

  const reportEntities = reportRepository.create(reportsToCreate);
  await reportRepository.save(reportEntities);

  logger.log(`✅ ${reportEntities.length} adet gerçekçi şehir simülasyon raporu oluşturuldu.`);
  logger.log(
    `📊 Ortalama kategori başına ${Math.round(reportsToCreate.length / allCategories.length)} rapor oluşturuldu.`
  );
};
