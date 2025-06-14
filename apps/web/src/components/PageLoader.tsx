// src/components/PageLoader.tsx
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export const PageLoader: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '50vh',
      gap: 2,
    }}
  >
    <CircularProgress size={40} thickness={4} />
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ fontFamily: 'Roboto, sans-serif' }}
    >
      Yükleniyor...
    </Typography>
  </Box>
);
