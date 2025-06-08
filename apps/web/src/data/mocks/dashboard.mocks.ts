import {
  SharedReport,
  ReportStatus,
  ReportType,
  MunicipalityDepartment,
} from '@kentnabiz/shared';

// Mock Active Reports
export const mockActiveReports: SharedReport[] = [
  {
    id: 1,
    title: 'Kaldırımda Tehlikeli Çukur Oluşumu ve Acil Onarım Talebi',
    description:
      'Ana cadde üzerindeki kaldırımda yayalar için tehlike arz eden derin bir çukur bulunmaktadır. Özellikle yağmurlu havalarda görünmez hale geliyor.',
    status: ReportStatus.IN_PROGRESS,
    address: 'Atatürk Bulvarı No: 125, Merkez/Ankara',
    location: {
      type: 'Point',
      coordinates: [32.8597, 39.9334],
    },
    user: {
      id: 123,
      fullName: 'Ahmet Yılmaz',
    },
    category: {
      id: 1,
      name: 'Yol Bakım',
      type: ReportType.POTHOLE,
    },
    currentDepartment: {
      id: 1,
      name: 'Fen İşleri Müdürlüğü',
      department: MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE,
    },
    assignedToEmployee: {
      id: 101,
      fullName: 'Murat Demir',
      title: 'Fen Teknisyeni',
      departmentId: 1,
    },
    createdAt: new Date(Date.now() - 86400000 * 2), // 2 gün önce
    updatedAt: new Date(Date.now() - 3600000 * 6), // 6 saat önce
    reportMedias: [
      {
        id: 1,
        url: 'https://picsum.photos/seed/pothole1/800/600',
        thumbnailUrl: 'https://picsum.photos/seed/pothole1/400/300',
        type: 'image',
        filename: 'pothole1.jpg',
        size: 1024000,
      },
    ],
  },
  {
    id: 2,
    title: 'Sokak Lambası Çalışmıyor',
    description:
      'Park sokağında bulunan sokak lambası 1 haftadır çalışmıyor. Gece yürüyüş yapanlar için güvenlik riski oluşturuyor.',
    status: ReportStatus.IN_REVIEW,
    address: 'Park Sokağı, Çankaya/Ankara',
    location: {
      type: 'Point',
      coordinates: [32.8547, 39.9284],
    },
    user: {
      id: 124,
      fullName: 'Fatma Özkan',
    },
    category: {
      id: 2,
      name: 'Aydınlatma',
      type: ReportType.STREET_LIGHT,
    },
    currentDepartment: {
      id: 2,
      name: 'Elektrik İşleri Müdürlüğü',
      department: MunicipalityDepartment.STREET_LIGHTING,
    },
    createdAt: new Date(Date.now() - 86400000 * 5), // 5 gün önce
    updatedAt: new Date(Date.now() - 86400000 * 1), // 1 gün önce
    reportMedias: [
      {
        id: 2,
        url: 'https://picsum.photos/seed/streetlight/800/600',
        thumbnailUrl: 'https://picsum.photos/seed/streetlight/400/300',
        type: 'image',
        filename: 'streetlight.jpg',
        size: 856000,
      },
    ],
  },
  {
    id: 3,
    title: 'Çöp Konteyneri Taşıyor',
    description:
      'Mahallemizdeki çöp konteyneri tamamen dolu ve etrafına çöpler saçılmış durumda. Koku ve hijyen sorunu yaratıyor.',
    status: ReportStatus.OPEN,
    address: 'Yeni Mahalle 5. Sokak No:12',
    location: {
      type: 'Point',
      coordinates: [32.8447, 39.9184],
    },
    user: {
      id: 125,
      fullName: 'Mehmet Kaya',
    },
    category: {
      id: 3,
      name: 'Çöp ve Temizlik',
      type: ReportType.LITTER,
    },
    currentDepartment: {
      id: 3,
      name: 'Temizlik İşleri Müdürlüğü',
      department: MunicipalityDepartment.CLEANING_SERVICES,
    },
    createdAt: new Date(Date.now() - 86400000 * 1), // 1 gün önce
    updatedAt: new Date(Date.now() - 86400000 * 1), // 1 gün önce
    reportMedias: [
      {
        id: 3,
        url: 'https://picsum.photos/seed/garbage/800/600',
        thumbnailUrl: 'https://picsum.photos/seed/garbage/400/300',
        type: 'image',
        filename: 'garbage.jpg',
        size: 1200000,
      },
    ],
  },
];

// Mock Solved Reports
export const mockSolvedReports: SharedReport[] = [
  {
    id: 4,
    title: 'Bozuk Sokak Lambası Tamir Edildi',
    description:
      'Cadde sokağındaki bozuk sokak lambası başarıyla tamir edildi.',
    status: ReportStatus.DONE,
    address: 'Cadde Sokağı No:45, Kızılay/Ankara',
    location: {
      type: 'Point',
      coordinates: [32.849, 39.92],
    },
    user: {
      id: 126,
      fullName: 'Ayşe Demir',
    },
    category: {
      id: 2,
      name: 'Aydınlatma',
      type: ReportType.STREET_LIGHT,
    },
    currentDepartment: {
      id: 2,
      name: 'Elektrik İşleri Müdürlüğü',
      department: MunicipalityDepartment.STREET_LIGHTING,
    },
    assignedToEmployee: {
      id: 102,
      fullName: 'Hasan Çelik',
      title: 'Elektrik Teknisyeni',
      departmentId: 2,
    },
    createdAt: new Date(Date.now() - 86400000 * 7), // 7 gün önce
    updatedAt: new Date(Date.now() - 86400000 * 2), // 2 gün önce
    reportMedias: [
      {
        id: 4,
        url: 'https://picsum.photos/seed/fixed-light/800/600',
        thumbnailUrl: 'https://picsum.photos/seed/fixed-light/400/300',
        type: 'image',
        filename: 'fixed-light.jpg',
        size: 890000,
      },
    ],
  },
  {
    id: 5,
    title: 'Yol Çukuru Kapatıldı',
    description: 'Ana yoldaki büyük çukur asfalt dökülerek kapatıldı.',
    status: ReportStatus.DONE,
    address: 'Ana Yol, Merkez/Ankara',
    location: {
      type: 'Point',
      coordinates: [32.852, 39.925],
    },
    user: {
      id: 127,
      fullName: 'Ali Yıldız',
    },
    category: {
      id: 1,
      name: 'Yol Bakım',
      type: ReportType.ROAD_DAMAGE,
    },
    currentDepartment: {
      id: 1,
      name: 'Fen İşleri Müdürlüğü',
      department: MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE,
    },
    assignedToEmployee: {
      id: 103,
      fullName: 'Osman Türk',
      title: 'Yol Teknisyeni',
      departmentId: 1,
    },
    createdAt: new Date(Date.now() - 86400000 * 10), // 10 gün önce
    updatedAt: new Date(Date.now() - 86400000 * 3), // 3 gün önce
    reportMedias: [
      {
        id: 5,
        url: 'https://picsum.photos/seed/fixed-road/800/600',
        thumbnailUrl: 'https://picsum.photos/seed/fixed-road/400/300',
        type: 'image',
        filename: 'fixed-road.jpg',
        size: 1100000,
      },
    ],
  },
  {
    id: 6,
    title: 'Su Sızıntısı Giderildi',
    description: 'Borudan olan su sızıntısı tespit edilip onarıldı.',
    status: ReportStatus.DONE,
    address: 'Su Sokağı No:8, Merkez/Ankara',
    location: {
      type: 'Point',
      coordinates: [32.843, 39.918],
    },
    user: {
      id: 128,
      fullName: 'Zeynep Ak',
    },
    category: {
      id: 4,
      name: 'Su ve Kanalizasyon',
      type: ReportType.WATER_LEAKAGE,
    },
    currentDepartment: {
      id: 4,
      name: 'Su İşleri Müdürlüğü',
      department: MunicipalityDepartment.WATER_AND_SEWERAGE,
    },
    assignedToEmployee: {
      id: 104,
      fullName: 'Mustafa Su',
      title: 'Su Teknisyeni',
      departmentId: 4,
    },
    createdAt: new Date(Date.now() - 86400000 * 14), // 14 gün önce
    updatedAt: new Date(Date.now() - 86400000 * 5), // 5 gün önce
    reportMedias: [
      {
        id: 6,
        url: 'https://picsum.photos/seed/water-fix/800/600',
        thumbnailUrl: 'https://picsum.photos/seed/water-fix/400/300',
        type: 'image',
        filename: 'water-fix.jpg',
        size: 950000,
      },
    ],
  },
];

// City Stats Mock Data
export interface CityStatsDto {
  totalResolved: number;
  thisMonthResolved: number;
  activeCitizens: number;
  totalReports: number;
  averageResolutionTime: number; // gün cinsinden
}

export const mockCityStats: CityStatsDto = {
  totalResolved: 1258,
  thisMonthResolved: 73,
  activeCitizens: 512,
  totalReports: 1456,
  averageResolutionTime: 8.5,
};

// Helper function for mock data delay simulation
export const fetchMockData = <T>(data: T, delay = 1000): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), delay));

// Mock error scenarios (for testing)
export const mockErrorScenarios = {
  networkError: () => Promise.reject(new Error('Ağ bağlantısı hatası')),
  serverError: () => Promise.reject(new Error('Sunucu hatası (500)')),
  notFound: () => Promise.reject(new Error('Veri bulunamadı (404)')),
};
