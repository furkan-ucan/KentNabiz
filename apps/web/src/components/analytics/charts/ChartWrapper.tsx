import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Skeleton,
  Alert,
} from '@mui/material';

interface ChartWrapperProps {
  title: string;
  isLoading?: boolean;
  error?: string;
  children: React.ReactNode;
  headerAccessory?: React.ReactNode;
  className?: string;
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  isLoading = false,
  error,
  children,
  headerAccessory,
  className = '',
}) => {
  return (
    <Card className={className} sx={{ height: '100%' }}>
      <CardHeader
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Typography variant="h6" component="h3" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        {headerAccessory && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {headerAccessory}
          </Box>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Box sx={{ space: 2 }}>
            <Skeleton variant="text" width="100%" height={24} />
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="rectangular" width="100%" height={256} />
          </Box>
        ) : error ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 256,
              textAlign: 'center',
            }}
          >
            <Alert severity="error" sx={{ maxWidth: 400 }}>
              <Typography variant="body2">
                Veri yüklenirken bir hata oluştu
              </Typography>
              <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                {error}
              </Typography>
            </Alert>
          </Box>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};
