import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TeamLeaderDashboard } from '@/components/leader/TeamLeaderDashboard';

/**
 * Takım lideri dashboard sayfası
 * Bu sayfa, takım liderlerinin görevlerini yönetmesine olanak tanır
 */
export const TeamLeaderDashboardPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Takım Lideri Paneli
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Takımınızın görevlerini yönetin ve raporları inceleyin.
        </Typography>
      </Paper>

      <Box sx={{ mt: 3 }}>
        <TeamLeaderDashboard />
      </Box>
    </Box>
  );
};
