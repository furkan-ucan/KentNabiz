import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { App } from './App';
import { CustomThemeProvider } from './providers/ThemeProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CustomThemeProvider>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CustomThemeProvider>
  </React.StrictMode>
);
