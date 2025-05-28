import { createBrowserRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import ReportListPage from '@/pages/ReportListPage';
import NewReportPage from '@/pages/NewReportPage';
import { RootLayout } from '@/layouts/RootLayout';

export const router = createBrowserRouter([
  {
    path: '/',
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
]);
