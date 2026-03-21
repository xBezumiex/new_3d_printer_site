// Защищенный роут - требует авторизации, сохраняет URL для редиректа
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Загрузка...</p>
      </div>
    </div>
  );
}

// Роут только для неавторизованных (login, register)
export function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

// Роут только для администраторов
export function AdminRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}

// Обычный защищённый роут
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Spinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
