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
      imageUrl:
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop&crop=center',
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
      imageUrl:
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop&crop=center',
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
      imageUrl:
        'https://images.unsplash.com/photo-1573152958734-1922c188fba3?w=600&h=400&fit=crop&crop=center',
      location: { latitude: 40.985, longitude: 29.021 },
      commentCount: 7,
      supportCount: 25,
    },
    {
      id: 104,
      title: 'Su Borusu Patlaması',
      excerpt:
        'Ana su borusu patlamış, yol sular altında kalmış durumda. Acil müdahale gerekiyor.',
      status: ReportStatus.DONE,
      reportType: ReportType.WATER_LEAKAGE,
      createdAt: '2024-06-07T10:30:00Z',
      imageUrl:
        'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&h=400&fit=crop&crop=center',
      location: { latitude: 40.995, longitude: 29.015 },
      commentCount: 15,
      supportCount: 48,
    },
    {
      id: 105,
      title: 'Park Alanında Çöp Yığılması',
      excerpt:
        'Çocuk parkının yanındaki çöp konteynerları taşmış, çevrede kötü koku oluşuyor.',
      status: ReportStatus.OPEN,
      reportType: ReportType.GARBAGE_COLLECTION,
      createdAt: '2024-06-06T16:45:00Z',
      imageUrl:
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=400&fit=crop&crop=center',
      location: { latitude: 40.988, longitude: 29.025 },
      commentCount: 5,
      supportCount: 18,
    },
  ],
};
