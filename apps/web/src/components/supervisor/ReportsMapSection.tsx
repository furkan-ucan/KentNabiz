import React, { lazy, Suspense } from 'react';
import { Card, CardContent, Box, Stack, Typography } from '@mui/material';
import type { SharedReport } from '@kentnabiz/shared';

const LazyInteractiveReportMap = lazy(
  () => import('./maps/InteractiveReportMap')
);

interface ReportsMapSectionProps {
  reports: SharedReport[];
  isLoading: boolean;
  onReportClick: (report: SharedReport) => void;
}

export const ReportsMapSection: React.FC<ReportsMapSectionProps> = ({
  reports,
  isLoading,
  onReportClick,
}) => {
  return (
    <Card
      sx={{
        height: '80vh',
        minHeight: '600px',
        // Harita performansı için GPU acceleration
        willChange: 'transform',
        contain: 'layout style paint',
      }}
    >
      <CardContent
        sx={{
          height: '100%',
          p: 0,
          // Hardware acceleration için style hints
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      >
        {reports.length > 0 && !isLoading ? (
          <Suspense fallback={<div>Harita yükleniyor...</div>}>
            <LazyInteractiveReportMap
              reports={reports}
              onReportClick={onReportClick}
              height="500px"
            />
          </Suspense>
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
            }}
          >
            <Stack spacing={2} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {isLoading
                  ? 'Veri yükleniyor...'
                  : 'Harita için veri bekleniyor'}
              </Typography>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
