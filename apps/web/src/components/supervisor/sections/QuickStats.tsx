import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Stack, Box } from '@mui/material';
import { ReportStatus } from '@kentnabiz/shared';

interface DashboardStats {
  pendingReports: number;
  resolvedToday: number;
}

interface QuickStatsProps {
  statusCounts?: Record<string, number | undefined>;
  isLoading?: boolean;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  statusCounts,
  isLoading = false,
}) => {
  // Dashboard istatistikleri status counts'tan hesaplanır - memoized
  const dashboardStats: DashboardStats = useMemo(() => {
    const pendingReports =
      (statusCounts?.[ReportStatus.OPEN] || 0) +
      (statusCounts?.[ReportStatus.IN_REVIEW] || 0);
    const resolvedToday = statusCounts?.[ReportStatus.DONE] || 0; // Geçici olarak, gerçekte bugünkü çözülen raporlar olmalı

    return { pendingReports, resolvedToday };
  }, [statusCounts]);

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Bugünkü Özet
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Yükleniyor...
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Bugünkü Özet
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Çözülen Raporlar
            </Typography>
            <Typography variant="h4" color="success.main">
              {dashboardStats.resolvedToday}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Bekleyen İncelemeler
            </Typography>
            <Typography variant="h4" color="warning.main">
              {dashboardStats.pendingReports}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
