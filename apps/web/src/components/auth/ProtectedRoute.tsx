import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

export const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Kullanıcı giriş yapmamışsa, login sayfasına yönlendir.
    // `state={{ from: location }}` ile login sonrası geri döneceği yeri sakla.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kullanıcı giriş yapmışsa, istenen rotanın içeriğini (Outlet) göster.
  return <Outlet />;
};
