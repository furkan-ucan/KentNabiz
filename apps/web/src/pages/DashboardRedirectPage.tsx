import { Navigate } from 'react-router-dom';
import { getCurrentUser, hasAnyRole } from '@/utils/auth';
import { UserRole } from '@kentnabiz/shared';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Bu bileşen, giriş yapmış kullanıcıyı rolüne göre
 * doğru dashboard'a yönlendirir.
 */
export const DashboardRedirectPage = () => {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    // Bu durum normalde ProtectedRoute tarafından yakalanır, ama bir güvenlik önlemi.
    return <Navigate to="/login" replace />;
  }
  // Rol öncelik sırası: Admin > Supervisor > Leader > Member > Citizen
  if (hasAnyRole([UserRole.SYSTEM_ADMIN])) {
    return <Navigate to="/dashboard/admin" replace />; // Gelecekteki admin paneli
  }
  if (hasAnyRole([UserRole.DEPARTMENT_SUPERVISOR])) {
    return <Navigate to="/supervisor" replace />;
  }

  // Şimdilik TEAM_MEMBER rolündeki kullanıcıları lider dashboard'ına yönlendirelim
  // Gelecekte isTeamLeader kontrolü eklenebilir
  if (hasAnyRole([UserRole.TEAM_MEMBER])) {
    return <Navigate to="/dashboard/leader" replace />;
  }

  if (hasAnyRole([UserRole.CITIZEN])) {
    return <Navigate to="/dashboard/citizen" replace />;
  }

  // Eğer hiçbir rol eşleşmezse (beklenmedik durum), yönlendirme ekranı göster
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        gap: 2,
      }}
    >
      <CircularProgress size={40} />
      <Typography variant="body1" color="text.secondary">
        Yönlendiriliyor...
      </Typography>
    </Box>
  );
};
