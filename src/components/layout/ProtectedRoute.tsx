import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAppContext();

  // Выводим состояние аутентификации для отладки
  useEffect(() => {
    console.log('ProtectedRoute: Состояние аутентификации:', isAuthenticated);
  }, [isAuthenticated]);

  // Если не аутентифицирован, возвращаем редирект на страницу логина
  if (!isAuthenticated) {
    console.log('ProtectedRoute: Перенаправление на /login');
    return <Navigate to="/login" replace />;
  }

  // Если аутентифицирован, показываем содержимое
  console.log('ProtectedRoute: Пользователь аутентифицирован, показываем контент');
  return <>{children}</>;
}
