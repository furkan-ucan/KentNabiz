// apps/web/src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            p: 3,
          }}
        >
          <Card sx={{ maxWidth: 500, textAlign: 'center' }}>
            <CardContent sx={{ p: 4 }}>
              <ErrorIcon
                sx={{
                  fontSize: 64,
                  color: 'error.main',
                  mb: 2,
                }}
              />
              <Typography variant="h5" gutterBottom>
                Bir Hata Oluştu
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Üzgünüz, beklenmeyen bir hata oluştu. Sayfayı yenilemeyi deneyin.
              </Typography>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={() => window.location.reload()}
                sx={{ mr: 2 }}
              >
                Sayfayı Yenile
              </Button>
              <Button
                variant="outlined"
                onClick={() => this.setState({ hasError: false })}
              >
                Tekrar Dene
              </Button>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}
