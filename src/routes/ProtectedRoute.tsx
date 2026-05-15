import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.forceResetPassword && location.pathname !== '/settings') {
    return <Navigate to="/settings" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
