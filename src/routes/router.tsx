import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { AddProjectPage } from '../pages/AddProjectPage';
import { ProjectDetailPage } from '../pages/ProjectDetailPage';
import { UsersPage } from '../pages/UsersPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { SettingsPage } from '../pages/SettingsPage';
import { useAuthStore } from '../stores/authStore';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'projects', element: <ProjectsPage /> },
          { path: 'projects/new', element: <AddProjectPage /> },
          { path: 'projects/:projectId', element: <ProjectDetailPage /> },
          { path: 'users', element: <AdminRoute><UsersPage /></AdminRoute> },
          { path: 'categories', element: <AdminRoute><CategoriesPage /></AdminRoute> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
