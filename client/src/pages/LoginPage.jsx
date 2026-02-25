// Страница входа
import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            Вход в аккаунт
          </h2>
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow rounded-lg sm:px-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
