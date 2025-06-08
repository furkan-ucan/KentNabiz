import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CssBaseline from '@mui/material/CssBaseline';
import { App } from './App';
import { CustomThemeProvider } from './providers/ThemeProvider';
import 'leaflet/dist/leaflet.css';
import './index.css';

// React Query client oluştur
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CustomThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
