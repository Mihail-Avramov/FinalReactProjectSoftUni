import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/api/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

// Защитен маршрут за автентикирани потребители
export const RequireAuth = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    // Съхраняваме текущия URL, за да се върнем след вход
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  return children;
};

// Защитен маршрут само за неавтентикирани потребители (напр. login/register страници)
export const RequireGuest = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (isAuthenticated) {
    // Ако вече сме автентикирани, пренасочваме към началната страница
    // или към страницата, от която сме били пренасочени
    const from = location.state?.from || '/';
    return <Navigate to={from} replace />;
  }
  
  return children;
};