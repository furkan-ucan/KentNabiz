import { createBrowserRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import { LandingPage } from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import ReportListPage from '@/pages/ReportListPage';
import NewReportPage from '@/pages/NewReportPage';
import { RootLayout } from '@/layouts/RootLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/app',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'reports',
        element: <ReportListPage />,
      },
      {
        path: 'reports/new',
        element: <NewReportPage />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <LoginPage />, // Geçici olarak LoginPage kullanıyoruz
  },
]);
