// apps/web/src/providers/LoadingProvider.tsx
import React, { useState, ReactNode } from 'react';
import { Backdrop, CircularProgress, Typography, Box } from '@mui/material';
import { LoadingContext } from '../contexts/LoadingContext';

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const showLoading = (msg = 'Yükleniyor...') => {
    setMessage(msg);
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setMessage('');
  };

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, isLoading }}>
      {children}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }}
        open={isLoading}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CircularProgress color="primary" size={48} />
          {message && (
            <Typography variant="body1" color="inherit">
              {message}
            </Typography>
          )}
        </Box>
      </Backdrop>
    </LoadingContext.Provider>
  );
};
