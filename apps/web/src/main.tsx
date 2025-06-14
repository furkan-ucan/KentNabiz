import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CssBaseline from '@mui/material/CssBaseline';
import { App } from './App';
import { CustomThemeProvider } from './providers/ThemeProvider';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/lib/assets/MarkerCluster.css';
import 'react-leaflet-cluster/lib/assets/MarkerCluster.Default.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './index.css';

// React Query client oluştur - Performans optimizasyonları ile
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 dakika - verileri 10 dk boyunca fresh kabul et
      gcTime: 30 * 60 * 1000, // 30 dakika - cache'te 30 dk tut
      refetchOnMount: true, // Mount'ta refetch yap ama staleTime ile kontrol et
      refetchInterval: false, // Otomatik polling'i kapat
      networkMode: 'online', // Sadece online'ken çalış
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider>
        <CssBaseline />
        <App />
      </CustomThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
