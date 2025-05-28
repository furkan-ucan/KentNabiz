import { ReportStatus, ReportType } from '@kentnabiz/shared';

export interface MockReport {
  id: number;
  title: string;
  excerpt: string;
  status: ReportStatus;
  reportType: ReportType;
  createdAt: string; // ISO 8601 formatında tarih
  imageUrl?: string; // Opsiyonel
  location?: {
    // Opsiyonel, harita önizlemesi için
    latitude: number;
    longitude: number;
  };
  commentCount?: number; // Opsiyonel
  supportCount?: number; // Opsiyonel
}

export interface MockStats {
  totalReports: number;
  resolvedReports: number;
  inProgressReports: number;
}

export interface HomepageMocks {
  stats: MockStats;
  latestReports: MockReport[];
}

export const homeMocks: HomepageMocks = {
  stats: {
    totalReports: 138,
    resolvedReports: 92,
    inProgressReports: 21,
  },
  latestReports: [
    {
      id: 101,
      title: "Bağdat Caddesi'nde Büyük Çukur",
      excerpt:
        'Kaldırımda yayaların yürümesini zorlaştıran ve tekerlekli sandalyeler için tehlike oluşturan derin bir çukur.',
      status: ReportStatus.OPEN,
      reportType: ReportType.POTHOLE,
      createdAt: '2024-06-10T08:15:00Z',
      imageUrl: '/images/mock/pothole_kadikoy.jpg',
      location: { latitude: 40.9733, longitude: 29.0444 },
      commentCount: 3,
      supportCount: 12,
    },
    {
      id: 102,
      title: 'Parktaki Kırık Salıncaklar',
      excerpt:
        'Çocuk parkındaki salıncaklardan ikisi kırılmış ve kullanılamaz durumda. Acil onarım gerekiyor.',
      status: ReportStatus.IN_REVIEW,
      reportType: ReportType.PARK_DAMAGE,
      createdAt: '2024-06-09T14:30:00Z',
      imageUrl: '/images/mock/broken_swing.jpg',
      location: { latitude: 41.01, longitude: 28.99 },
      commentCount: 1,
      supportCount: 5,
    },
    {
      id: 103,
      title: 'Sokak Lambası Arızası - Gece Karanlık',
      excerpt:
        'Ana cadde üzerindeki 3 sokak lambası yanmıyor, akşamları bölge tehlikeli oluyor.',
      status: ReportStatus.IN_PROGRESS,
      reportType: ReportType.STREET_LIGHT,
      createdAt: '2024-06-08T21:00:00Z',
      location: { latitude: 40.985, longitude: 29.021 },
      commentCount: 7,
      supportCount: 25,
    },
  ],
};
