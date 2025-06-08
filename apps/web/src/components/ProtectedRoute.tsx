import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import { UserRole } from '@kentnabiz/shared';
import { isAuthenticated, hasAnyRole, getCurrentUser } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

/**
 * Role-based erişim kontrolü yapan ProtectedRoute bileşeni
 *
 * @param children - Korunacak bileşen
 * @param allowedRoles - İzin verilen roller (boşsa sadece auth kontrol eder)
 * @param requireAuth - Auth gerekli mi (default: true)
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true,
}) => {
  const location = useLocation();
  const currentUser = getCurrentUser();

  // Auth kontrolü
  if (requireAuth && !isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role kontrolü (eğer allowedRoles belirtilmişse)
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        p={3}
      >
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
          <Typography variant="h5" color="error" gutterBottom>
            Erişim Reddedildi
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Bu sayfaya erişim için gerekli yetkiniz bulunmuyor.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerekli rol(ler): {allowedRoles.join(', ')}
          </Typography>
          {currentUser && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Mevcut rolünüz: {currentUser.roles?.join(', ') || 'Tanımsız'}
            </Typography>
          )}
        </Paper>
      </Box>
    );
  }

  return <>{children}</>;
};
