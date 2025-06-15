// apps/web/src/components/dashboard/StatsGrid.tsx
import { Box, Skeleton } from '@mui/material';
import {
  BarChart3,
  Calendar,
  CheckCircle,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { StatCard } from './StatCard';

interface StatsData {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  myReports: number;
  averageResolutionTime: number; // gün cinsinden
}

interface StatsGridProps {
  stats: StatsData;
  loading?: boolean;
}

export const StatsGrid = ({ stats, loading = false }: StatsGridProps) => {
  return (
    <Box
      component="section"
      sx={{
        display: 'grid',
        gap: { xs: 2, sm: 3 },
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)', // mobilde 2 sütun
          sm: 'repeat(3, 1fr)', // tablet 3 sütun
          md: 'repeat(5, 1fr)', // masaüstü 5 eşit sütun
        },
        mb: { xs: 4, md: 5 },
      }}
    >
      {loading ? (
        // Loading skeletons
        Array.from(new Array(5)).map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            sx={{
              height: 180,
              borderRadius: 3,
              boxShadow: 2,
            }}
          />
        ))
      ) : (
        <>
          <StatCard
            title="Toplam Rapor"
            value={stats.totalReports}
            icon={BarChart3}
            color="primary"
            delay={0.1}
          />

          <StatCard
            title="Bekleyen"
            value={stats.pendingReports}
            icon={Calendar}
            color="warning"
            delay={0.2}
          />

          <StatCard
            title="Çözülen"
            value={stats.resolvedReports}
            icon={CheckCircle}
            color="success"
            delay={0.3}
          />

          <StatCard
            title="Raporlarım"
            value={stats.myReports}
            icon={TrendingUp}
            color="secondary"
            delay={0.4}
          />

          <StatCard
            title="Ort. Çözüm Süresi"
            value={`${stats.averageResolutionTime} gün`}
            icon={Clock}
            color="info"
            delay={0.5}
          />
        </>
      )}
    </Box>
  );
};
