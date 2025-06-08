import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserRole } from '@kentnabiz/shared';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { SupervisorDashboardPage } from './pages/SupervisorDashboardPage';
import { CreateReportPage } from './pages/CreateReportPage';
import { RootLayout } from './layouts/RootLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { isAuthenticated, isDepartmentSupervisor } from './utils/auth';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: false, // Disable for better UX
      retry: 1,
    },
  },
});

// Smart root route component
const RootRedirect = () => {
  if (!isAuthenticated()) {
    return <LandingPage />;
  }

  // Kullanıcı authenticated - uygun dashboard'a yönlendir
  if (isDepartmentSupervisor()) {
    return <Navigate to="/dashboard/supervisor" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        {/* Smart Root Route */}
        <Route path="/" element={<RootRedirect />} />

        {/* Landing Page (açık erişim için) */}
        <Route path="/landing" element={<LandingPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes with Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RootLayout>
                <DashboardPage />
              </RootLayout>
            </ProtectedRoute>
          }
        />

        {/* Supervisor Dashboard - Role-based Protection */}
        <Route
          path="/dashboard/supervisor"
          element={
            <ProtectedRoute allowedRoles={[UserRole.DEPARTMENT_SUPERVISOR]}>
              <RootLayout>
                <SupervisorDashboardPage />
              </RootLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/new"
          element={
            <ProtectedRoute>
              <RootLayout>
                <CreateReportPage />
              </RootLayout>
            </ProtectedRoute>
          }
        />

        {/* Report Detail Page */}
        <Route
          path="/reports/:id"
          element={
            <ProtectedRoute>
              <RootLayout>
                <div>Report Detail Page (To be implemented)</div>
              </RootLayout>
            </ProtectedRoute>
          }
        />

        {/* Default dashboard redirect */}
        <Route path="/app" element={<Navigate to="/dashboard" replace />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </QueryClientProvider>
  );
}
