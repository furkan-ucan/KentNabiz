import { DataSource } from 'typeorm';
import { Report } from '../../modules/reports/entities/report.entity';
import { ReportMedia } from '../../modules/reports/entities/report-media.entity';
import { ReportType, ReportStatus } from '@KentNabiz/shared'; // Adjust import path if necessary
import { faker } from '@faker-js/faker/locale/tr';
import { Point } from 'geojson';

export const ReportsSeed = async (dataSource: DataSource): Promise<void> => {
  const reportRepository = dataSource.getRepository(Report);
  const reportMediaRepository = dataSource.getRepository(ReportMedia);

  const reportCount = await reportRepository.count();
  if (reportCount > 0) {
    console.log('Rapor verileri zaten mevcut, seed işlemi atlanıyor...');
    return;
  }

  console.log('Örnek rapor verileri oluşturuluyor...');

  const istanbulCoordinates = [
    { lat: 41.0082, lng: 28.9784, address: 'Taksim Meydanı, Beyoğlu' },
    { lat: 41.0352, lng: 28.9833, address: 'Şişli Merkez, İstanbul' },
    { lat: 41.0053, lng: 29.0244, address: 'Bağdat Caddesi, Kadıköy' },
    { lat: 41.0202, lng: 29.09, address: 'Üsküdar Merkez, İstanbul' },
    { lat: 41.0111, lng: 28.9701, address: 'Galata Kulesi, Beyoğlu' },
    { lat: 40.9862, lng: 29.0282, address: 'Bostancı Sahil, Kadıköy' },
    { lat: 41.0766, lng: 29.0249, address: 'Maslak, Sarıyer' },
    { lat: 40.9917, lng: 29.024, address: 'Fenerbahçe, Kadıköy' },
    { lat: 41.085, lng: 29.0514, address: 'Bebek Sahili, Beşiktaş' },
    { lat: 41.007, lng: 28.976, address: 'İstiklal Caddesi, Beyoğlu' },
  ];

  const reportTitles = [
    'Kaldırım Bozulmuş',
    'Sokak Lambası Yanmıyor',
    'Çöpler Toplanmadı',
    'Su Borusu Patlamış',
    'Yol Çukurlarla Dolu',
    'Ağaç Devrilme Tehlikesi',
    'Trafik Işığı Arızalı',
    'Park Ekipmanları Kırılmış',
    'Kanalizasyon Tıkanması',
    'Durak Tabelası Düşmüş',
  ];

  const reportDescriptions = [
    'Kaldırımda büyük bir çökme meydana gelmiş, yayaların geçişi tehlikeli.',
    'Sokak lambası üç gündür yanmıyor, akşamları sokak tamamen karanlık.',
    'Üç gündür çöpler alınmadı, kötü koku ve çevre kirliliği oluşuyor.',
    'Ana su borusu patlamış durumda, sokak su içinde kaldı.',
    'Yolda derin çukurlar oluşmuş, araçlar zarar görüyor.',
    'Fırtınadan dolayı ağaç yan yatmış, devrilme tehlikesi var.',
    'Trafik ışığı sürekli sarı yanıp sönüyor, kazaya sebebiyet verebilir.',
    'Parktaki salıncak ve kaydıraklar kırılmış, çocuklar için tehlikeli.',
    'Kanalizasyon tıkanmış, pis su sokağa taşıyor.',
    'Otobüs durağı tabelası yerinden çıkmış, düşme tehlikesi var.',
  ];

  const mediaUrls = [
    'https://storage.kentnabiz.com/rapor-fotograflari/kaldirim-bozuk.jpg',
    'https://storage.kentnabiz.com/rapor-fotograflari/sokak-lambasi.jpg',
    'https://storage.kentnabiz.com/rapor-fotograflari/cop-birikimi.jpg',
    'https://storage.kentnabiz.com/rapor-fotograflari/su-borusu.jpg',
    'https://storage.kentnabiz.com/rapor-fotograflari/yol-cukur.jpg',
    'https://storage.kentnabiz.com/rapor-fotograflari/agac-tehlike.jpg',
    'https://storage.kentnabiz.com/rapor-fotograflari/trafik-isigi.jpg',
    'https://storage.kentnabiz.com/rapor-fotograflari/park-ekipman.jpg',
    'https://storage.kentnabiz.com/rapor-fotograflari/kanalizasyon.jpg',
    'https://storage.kentnabiz.com/rapor-fotograflari/durak-tabela.jpg',
  ];

  const reportTypes = [
    ReportType.ROAD_DAMAGE,
    ReportType.STREET_LIGHT,
    ReportType.GARBAGE_COLLECTION,
    ReportType.WATER_LEAKAGE,
    ReportType.POTHOLE,
    ReportType.TREE_ISSUE,
    ReportType.TRAFFIC_LIGHT,
    ReportType.PARK_DAMAGE,
    ReportType.WATER_LEAKAGE,
    ReportType.PUBLIC_TRANSPORT_STOP,
  ];

  const reports: Report[] = [];

  for (let i = 0; i < 50; i++) {
    const randIndex = i % 10;
    const coord = istanbulCoordinates[randIndex];

    const location: Point = {
      type: 'Point',
      coordinates: [coord.lng, coord.lat],
    };

    const fakeStreet: string = faker.address.street();
    const fakeParagraph: string = faker.lorem.paragraph();
    const fakeAddress: string = faker.address.streetAddress();

    const randomStatus: ReportStatus = faker.helpers.arrayElement(Object.values(ReportStatus));
    const randomDate: Date = faker.date.recent({ days: 3 });
    const report = reportRepository.create({
      title: `${reportTitles[randIndex]} - ${fakeStreet}`,
      description: `${reportDescriptions[randIndex]} ${fakeParagraph}`,
      location,
      address: `${coord.address}, ${fakeAddress}`,
      reportType: reportTypes[randIndex],
      status: randomStatus,
      currentDepartmentId: (randIndex % 3) + 1,
      userId: Math.floor(Math.random() * 4) + 1,
      createdAt: randomDate,
      updatedAt: randomDate,
    });

    reports.push(report);
  }

  const savedReports = await reportRepository.save(reports);

  const reportMedias: ReportMedia[] = [];

  for (const report of savedReports) {
    const mediaCount = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < mediaCount; i++) {
      const mediaUrl: string = (
        faker.helpers as unknown as {
          arrayElement<T>(input: T[]): T;
        }
      ).arrayElement(mediaUrls);

      const media = reportMediaRepository.create({
        reportId: report.id,
        url: mediaUrl,
        type: 'image/jpeg',
      });

      reportMedias.push(media);
    }
  }

  await reportMediaRepository.save(reportMedias);

  console.log(`${savedReports.length} rapor ve ${reportMedias.length} medya oluşturuldu!`);
};
