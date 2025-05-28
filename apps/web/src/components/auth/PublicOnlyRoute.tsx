import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

export const PublicOnlyRoute: React.FC = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    // Kullanıcı zaten giriş yapmışsa, ana uygulama sayfasına yönlendir.
    return <Navigate to="/app" replace />;
  }

  // Kullanıcı giriş yapmamışsa, login/register gibi public sayfaların içeriğini göster.
  return <Outlet />;
};
