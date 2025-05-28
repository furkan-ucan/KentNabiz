import { createBrowserRouter, Navigate } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import { LandingPage } from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ReportListPage from '@/pages/ReportListPage';
import NewReportPage from '@/pages/NewReportPage';
import { RootLayout } from '@/layouts/RootLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PublicOnlyRoute } from '@/components/auth/PublicOnlyRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicOnlyRoute />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
    ],
  },
  {
    path: '/login',
    element: <PublicOnlyRoute />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },
  {
    path: '/register',
    element: <PublicOnlyRoute />,
    children: [
      {
        index: true,
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
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
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
