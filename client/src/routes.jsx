// Маршруты приложения с ленивой загрузкой для оптимизации производительности
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute, { GuestRoute, AdminRoute } from './components/auth/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import ChunkErrorBoundary from './components/ChunkErrorBoundary';

// Скелетон-заглушка при загрузке страницы
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
        <p className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
          Загрузка...
        </p>
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
const LessonPage       = lazy(() => import('./pages/LessonPage'));
const MaterialsPage    = lazy(() => import('./pages/MaterialsPage'));
const FaqPage          = lazy(() => import('./pages/FaqPage'));
const AboutPage        = lazy(() => import('./pages/AboutPage'));
const AdminPage        = lazy(() => import('./pages/AdminPage'));
const ChatPage             = lazy(() => import('./pages/ChatPage'));
const NotificationsPage    = lazy(() => import('./pages/NotificationsPage'));
const ContactPage          = lazy(() => import('./pages/ContactPage'));
const NotFoundPage         = lazy(() => import('./pages/NotFoundPage'));

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <ChunkErrorBoundary>
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
          <Route path="/lessons/:id" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />

          {/* Профили пользователей */}
          <Route path="/users/:id" element={<ProfilePage />} />

          {/* Защищённые маршруты */}
          <Route path="/upload"    element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
          <Route path="/order"     element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/posts/create" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />

          <Route path="/chat"          element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/chat/:userId"  element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

          {/* Только для администраторов */}
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      </ChunkErrorBoundary>
    </>
  );
}
