// apps/web/src/config/analytics.config.ts
import {
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Timer as TimerIcon,
  FlashOn as FlashOnIcon,
  ReportProblem as ReportProblemIcon,
  HourglassTop as HourglassTopIcon,
  Assignment as AssignmentIcon,
  Speed as SpeedIcon,
  Replay as ReplayIcon,
  TrendingUp as TrendingUpIcon,
  ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import { ReactNode } from 'react';

// Basic type for KPI data
export interface KpiData {
  [key: string]:
    | number
    | { count: number; reportIds: number[] }
    | object
    | undefined;
  strategicKpis?: {
    reopenedReports?: { count: number; reportIds: number[] };
    trendingIssue?: {
      categoryName: string | null;
      categoryCode: string | null;
      percentageIncrease: number;
      currentPeriodCount: number;
      previousPeriodCount: number;
    };
    citizenInteraction?: { totalSupports: number };
  };
}

export interface KpiDefinition {
  id: string;
  title: string;
  icon: ReactNode;
  color: string;
  suffix?: string;
  formatType?: 'number' | 'percentage' | 'duration' | 'trend';
  isClickable?: boolean;
  filterKey?: string;
  filterValue?: string;
  description?: string;
  targetUrl?: string | null;
}

export const KPI_DEFINITIONS: KpiDefinition[] = [
  // İlk Satır - Operasyonel KPIs
  {
    id: 'totalReportCount',
    title: 'Toplam Rapor',
    icon: <AssessmentIcon />,
    color: 'primary.main',
    formatType: 'number',
    description: 'Sistemdeki toplam rapor sayısı',
    targetUrl: null,
  },
  {
    id: 'UNASSIGNED',
    title: 'Atanmamış Raporlar',
    icon: <ReportProblemIcon />,
    color: 'error.main',
    formatType: 'number',
    isClickable: true,
    filterKey: 'status',
    filterValue: 'UNASSIGNED',
    description: 'Henüz kimseye atanmamış raporlar',
    targetUrl: '/supervisor/dashboard?status=OPEN&assignment=unassigned',
  },
  {
    id: 'PENDING_APPROVAL',
    title: 'Onay Bekleyen',
    icon: <HourglassTopIcon />,
    color: 'warning.main',
    formatType: 'number',
    isClickable: true,
    filterKey: 'status',
    filterValue: 'PENDING_APPROVAL',
    description: 'İnceleme/onay aşamasındaki raporlar',
    targetUrl:
      '/supervisor/dashboard?status=IN_PROGRESS&subStatus=PENDING_APPROVAL',
  },
  {
    id: 'IN_PROGRESS',
    title: 'Devam Eden İşler',
    icon: <AssignmentIcon />,
    color: 'info.main',
    formatType: 'number',
    isClickable: true,
    filterKey: 'status',
    filterValue: 'IN_PROGRESS',
    description: 'Şu anda üzerinde çalışılan raporlar',
    targetUrl: '/supervisor/dashboard?status=IN_PROGRESS',
  },
  {
    id: 'OVERDUE',
    title: 'Geciken Raporlar',
    icon: <HourglassTopIcon />,
    color: 'error.main',
    formatType: 'number',
    isClickable: true,
    filterKey: 'status',
    filterValue: 'OVERDUE',
    description: 'Süresi geçmiş raporlar (7 günden eski)',
    targetUrl: '/supervisor/dashboard?status=IN_PROGRESS&overdue=true',
  },
  {
    id: 'reopenedReports',
    title: 'Yeniden Açılan',
    icon: <ReplayIcon />,
    color: 'warning.main',
    formatType: 'number',
    isClickable: true,
    filterKey: 'reopened',
    filterValue: 'true',
    description:
      'Çözüldükten sonra yeniden açılan raporlar - kalite kontrol metriği',
    targetUrl: '/supervisor/dashboard?reopened=true',
  },

  // İkinci Satır - Performans KPIs
  {
    id: 'resolutionRate',
    title: 'Başarı Oranı',
    icon: <CheckCircleIcon />,
    color: 'success.main',
    suffix: '%',
    formatType: 'percentage',
    description: 'Çözülen raporların toplam raporlara oranı',
    targetUrl: null,
  },
  {
    id: 'avgResolutionDays',
    title: 'Ort. Çözüm Süresi',
    icon: <TimerIcon />,
    color: 'info.main',
    suffix: ' Gün',
    formatType: 'duration',
    description: 'Raporların ortalama çözülme süresi',
    targetUrl: null,
  },
  {
    id: 'avgInterventionHours',
    title: 'Ort. Müdahale Süresi',
    icon: <FlashOnIcon />,
    color: 'secondary.main',
    suffix: ' Saat',
    formatType: 'duration',
    description: 'Atamadan kabule kadar geçen ortalama süre',
    targetUrl: null,
  },
  {
    id: 'avgFirstResponseHours',
    title: 'Ort. İlk Yanıt Süresi',
    icon: <SpeedIcon />,
    color: 'warning.main',
    suffix: ' Saat',
    formatType: 'duration',
    description:
      'Raporun oluşturulmasından atanmasına kadar geçen ortalama süre',
    targetUrl: null,
  },
  {
    id: 'trendingIssue',
    title: 'Yükselen Trend',
    icon: <TrendingUpIcon />,
    color: 'info.main',
    formatType: 'trend',
    isClickable: true,
    description:
      'Son 7 günde en çok artan kategori - proaktif planlama metriği',
    targetUrl: null, // Bu dinamik olarak ayarlanacak
  },
  {
    id: 'citizenInteraction',
    title: 'Vatandaş Etkileşimi',
    icon: <ThumbUpIcon />,
    color: 'success.main',
    formatType: 'number',
    suffix: ' Destek',
    isClickable: true,
    filterKey: 'hasSupport',
    filterValue: 'true',
    description: 'Toplam vatandaş desteği - önceliklendirme metriği',
    targetUrl: '/supervisor/dashboard?supported=true',
  },
];

// Helper function to format KPI values based on type
export const formatKpiValue = (
  value: number | undefined | null,
  definition: KpiDefinition,
  data?: KpiData | null
): string => {
  if (value === undefined || value === null) return '-';

  switch (definition.formatType) {
    case 'percentage':
      return `${value.toFixed(1)}${definition.suffix || '%'}`;
    case 'duration':
      if (definition.suffix?.includes('Gün')) {
        return `${value.toFixed(1)}${definition.suffix}`;
      } else if (definition.suffix?.includes('Saat')) {
        return `${Math.round(value)}${definition.suffix}`;
      }
      return `${value}${definition.suffix || ''}`;
    case 'trend':
      // Special formatting for trending issue
      if (definition.id === 'trendingIssue' && data) {
        // Console'dan gelen veri yapısına göre: strategicKpis.data.trendingIssue
        const strategicKpis = data.strategicKpis as {
          data?: {
            trendingIssue?: {
              categoryName?: string;
              percentageIncrease?: number;
            };
          };
        };
        const trend = strategicKpis?.data?.trendingIssue;

        // Sadece artış gösteren ve kategori adı olan durumları göster
        if (
          trend?.categoryName &&
          trend.percentageIncrease &&
          trend.percentageIncrease > 0
        ) {
          const percentageValue = trend.percentageIncrease;
          let increaseText: string;

          if (percentageValue >= 999) {
            increaseText = 'YENİ';
          } else {
            increaseText = `+${percentageValue}%`;
          }

          return `${trend.categoryName} (${increaseText})`;
        }
      }
      return '-';
    case 'number':
    default:
      return `${Math.round(value)}${definition.suffix || ''}`;
  }
};

// Helper function to get KPI value from API data
export const getKpiValueFromData = (
  data: KpiData | null,
  definition: KpiDefinition
): number | undefined => {
  if (!data) return undefined;

  // Strategic KPIs handling - console.log'dan gelen gerçek veri yapısına göre
  if (definition.id === 'reopenedReports') {
    // Console'dan: strategicKpis.data.reopenedReports.count
    const strategicKpis = data.strategicKpis as {
      data?: { reopenedReports?: { count?: number } };
    };
    return strategicKpis?.data?.reopenedReports?.count;
  }
  if (definition.id === 'trendingIssue') {
    // Console'dan: strategicKpis.data.trendingIssue.percentageIncrease
    const strategicKpis = data.strategicKpis as {
      data?: {
        trendingIssue?: { percentageIncrease?: number; categoryCode?: string };
      };
    };
    const percentageIncrease =
      strategicKpis?.data?.trendingIssue?.percentageIncrease;
    const categoryCode = strategicKpis?.data?.trendingIssue?.categoryCode;

    // Sadece artış varsa ve kategori mevcutsa göster
    return percentageIncrease && percentageIncrease > 0 && categoryCode
      ? percentageIncrease
      : undefined;
  }

  if (definition.id === 'citizenInteraction') {
    // Console'dan: strategicKpis.data.citizenInteraction.totalSupports
    const strategicKpis = data.strategicKpis as {
      data?: { citizenInteraction?: { totalSupports?: number } };
    };
    return strategicKpis?.data?.citizenInteraction?.totalSupports;
  }

  const value = data[definition.id];
  // For count-based KPIs (like UNASSIGNED, OVERDUE, etc.)
  if (typeof value === 'object' && value && 'count' in value) {
    const countValue = value as { count: number; reportIds: number[] };
    return countValue.count;
  }

  // For direct value KPIs (like totalReportCount, resolutionRate, etc.)
  if (typeof value === 'number') {
    return value;
  }

  return undefined;
};
