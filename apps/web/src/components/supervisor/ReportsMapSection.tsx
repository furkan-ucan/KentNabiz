import React, { lazy, Suspense } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Stack,
  Typography,
} from '@mui/material';
import { Map as MapIcon } from '@mui/icons-material';
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
        height: '500px',
        minHeight: '400px',
        // Harita performansı için GPU acceleration
        willChange: 'transform',
        contain: 'layout style paint',
      }}
    >
      <CardHeader
        title="Rapor Konumları"
        titleTypographyProps={{ variant: 'h6', fontSize: '1rem' }}
        avatar={<MapIcon color="primary" />}
        sx={{ pb: 1 }}
      />
      <CardContent
        sx={{
          height: 'calc(100% - 72px)', // Header için alan bırak
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
              height="100%"
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
