// Новый App.jsx с роутингом и Context API
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ModelProvider } from './context/ModelContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AppRoutes from './routes';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ModelProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              <Header />
              <main className="flex-grow">
                <AppRoutes />
              </main>
              <Footer />
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </BrowserRouter>
        </ModelProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
