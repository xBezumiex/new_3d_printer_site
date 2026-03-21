// Маршруты приложения с ленивой загрузкой для оптимизации производительности
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute, { GuestRoute, AdminRoute } from './components/auth/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

// Скелетон-заглушка при загрузке страницы
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        <p className="text-sm text-gray-400 dark:text-gray-500">Загрузка...</p>
      </div>
    </div>
  );
}

// Ленивая загрузка всех страниц (code splitting)
const HomePage         = lazy(() => import('./pages/HomePage'));
const LoginPage        = lazy(() => import('./pages/LoginPage'));
const RegisterPage     = lazy(() => import('./pages/RegisterPage'));
const ProfilePage      = lazy(() => import('./pages/ProfilePage'));
const DashboardPage    = lazy(() => import('./pages/DashboardPage'));
const UploadPage       = lazy(() => import('./pages/UploadPage'));
const CalculatorPage   = lazy(() => import('./pages/CalculatorPage'));
const OrderPage        = lazy(() => import('./pages/OrderPage'));
const OrderDetailPage  = lazy(() => import('./pages/OrderDetailPage'));
const PostsPage        = lazy(() => import('./pages/PostsPage'));
const PostDetailPage   = lazy(() => import('./pages/PostDetailPage'));
const CreatePostPage   = lazy(() => import('./pages/CreatePostPage'));
const SearchPage       = lazy(() => import('./pages/SearchPage'));
const CoursesPage      = lazy(() => import('./pages/CoursesPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const MaterialsPage    = lazy(() => import('./pages/MaterialsPage'));
const FaqPage          = lazy(() => import('./pages/FaqPage'));
const AboutPage        = lazy(() => import('./pages/AboutPage'));
const AdminPage        = lazy(() => import('./pages/AdminPage'));
const ContactPage      = lazy(() => import('./pages/ContactPage'));
const NotFoundPage     = lazy(() => import('./pages/NotFoundPage'));

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/"          element={<HomePage />} />
          <Route path="/login"     element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register"  element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/faq"       element={<FaqPage />} />
          <Route path="/about"     element={<AboutPage />} />
          <Route path="/contact"   element={<ContactPage />} />

          {/* Посты */}
          <Route path="/posts"     element={<PostsPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />

          {/* Поиск */}
          <Route path="/search"    element={<SearchPage />} />

          {/* Курсы */}
          <Route path="/courses"     element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />

          {/* Профили пользователей */}
          <Route path="/users/:id" element={<ProfilePage />} />

          {/* Защищённые маршруты */}
          <Route path="/upload"    element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
          <Route path="/order"     element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/posts/create" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />

          {/* Только для администраторов */}
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}
