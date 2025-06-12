// apps/web/src/routes/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { RootLayout } from '@/layouts/RootLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PageLoader } from '@/components/PageLoader';
import { UserRole } from '@kentnabiz/shared';

// Critical pages - loaded immediately
import { LandingPage } from '@/pages/LandingPage';

// Lazy loaded pages for better performance
const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then(m => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('@/pages/RegisterPage').then(m => ({ default: m.RegisterPage }))
);
const DashboardRedirectPage = lazy(() =>
  import('@/pages/DashboardRedirectPage').then(m => ({
    default: m.DashboardRedirectPage,
  }))
);
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage }))
);
const TeamLeaderDashboardPage = lazy(() =>
  import('@/pages/TeamLeaderDashboardPage').then(m => ({
    default: m.TeamLeaderDashboardPage,
  }))
);
const SupervisorDashboardPage = lazy(() =>
  import('@/pages/SupervisorDashboardPage').then(m => ({
    default: m.SupervisorDashboardPage,
  }))
);
const CreateReportPage = lazy(() =>
  import('@/pages/CreateReportPage').then(m => ({
    default: m.CreateReportPage,
  }))
);
const ReportDetailPage = lazy(() =>
  import('@/pages/ReportDetailPage').then(m => ({
    default: m.ReportDetailPage,
  }))
);
const MyReportsPage = lazy(() =>
  import('@/pages/MyReportsPage').then(m => ({ default: m.MyReportsPage }))
);
const AnalyticsPage = lazy(() =>
  import('@/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage }))
);

export const router = createBrowserRouter([
  // Public rotalar (Layout olmadan)
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<PageLoader />}>
        <RegisterPage />
      </Suspense>
    ),
  },

  // Supervisor routes - separate from dashboard
  {
    path: '/supervisor',
    element: (
      <ProtectedRoute
        allowedRoles={[UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN]}
      >
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <SupervisorDashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SupervisorDashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'teams',
        element: (
          <Suspense fallback={<PageLoader />}>
            <div>Teams Management Page</div>
          </Suspense>
        ),
      },
      {
        path: 'categories',
        element: (
          <Suspense fallback={<PageLoader />}>
            <div>Categories Management Page</div>
          </Suspense>
        ),
      },
      {
        path: 'employees',
        element: (
          <Suspense fallback={<PageLoader />}>
            <div>Employees Management Page</div>
          </Suspense>
        ),
      },
      {
        path: 'expertise',
        element: (
          <Suspense fallback={<PageLoader />}>
            <div>Expertise Management Page</div>
          </Suspense>
        ),
      },
      {
        path: 'departments',
        element: (
          <Suspense fallback={<PageLoader />}>
            <div>Departments Management Page</div>
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<PageLoader />}>
            <div>Settings Management Page</div>
          </Suspense>
        ),
      },
      {
        path: 'analytics',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AnalyticsPage />
          </Suspense>
        ),
      },
    ],
  },

  // Protected rotalar (RootLayout ile) - nested structure
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <DashboardRedirectPage />
          </Suspense>
        ),
      },
      {
        path: 'leader',
        element: (
          <ProtectedRoute
            allowedRoles={[
              UserRole.TEAM_MEMBER,
              UserRole.DEPARTMENT_SUPERVISOR,
              UserRole.SYSTEM_ADMIN,
            ]}
          >
            <Suspense fallback={<PageLoader />}>
              <TeamLeaderDashboardPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'citizen',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.CITIZEN]}>
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'reports/new',
        element: (
          <ProtectedRoute
            allowedRoles={[
              UserRole.CITIZEN,
              UserRole.TEAM_MEMBER,
              UserRole.DEPARTMENT_SUPERVISOR,
              UserRole.SYSTEM_ADMIN,
            ]}
          >
            <Suspense fallback={<PageLoader />}>
              <CreateReportPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'reports',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.CITIZEN]}>
            <Suspense fallback={<PageLoader />}>
              <MyReportsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'reports/:id',
        element: (
          <ProtectedRoute
            allowedRoles={[
              UserRole.CITIZEN,
              UserRole.TEAM_MEMBER,
              UserRole.DEPARTMENT_SUPERVISOR,
              UserRole.SYSTEM_ADMIN,
            ]}
          >
            <Suspense fallback={<PageLoader />}>
              <ReportDetailPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Legacy separate routes (backward compatibility)
  {
    path: '/citizen-dashboard',
    element: (
      <ProtectedRoute allowedRoles={[UserRole.CITIZEN]}>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <DashboardPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/leader-dashboard',
    element: (
      <ProtectedRoute
        allowedRoles={[
          UserRole.TEAM_MEMBER,
          UserRole.DEPARTMENT_SUPERVISOR,
          UserRole.SYSTEM_ADMIN,
        ]}
      >
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <TeamLeaderDashboardPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/supervisor-dashboard',
    element: (
      <ProtectedRoute
        allowedRoles={[UserRole.DEPARTMENT_SUPERVISOR, UserRole.SYSTEM_ADMIN]}
      >
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <SupervisorDashboardPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/reports/new',
    element: (
      <ProtectedRoute
        allowedRoles={[
          UserRole.CITIZEN,
          UserRole.TEAM_MEMBER,
          UserRole.DEPARTMENT_SUPERVISOR,
          UserRole.SYSTEM_ADMIN,
        ]}
      >
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <CreateReportPage />
          </Suspense>
        ),
      },
    ],
  },
]);
