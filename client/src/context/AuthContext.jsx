// Context для авторизации
import { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth.api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка пользователя при монтировании
  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  // Загрузка данных текущего пользователя
  const loadUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Ошибка загрузки пользователя:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Регистрация
  const register = async (userData) => {
    const response = await authApi.register(userData);
    const { user, token } = response.data;

    setUser(user);
    setToken(token);
    setIsAuthenticated(true);

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    return response;
  };

  // Логин
  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    const { user, token } = response.data;

    setUser(user);
    setToken(token);
    setIsAuthenticated(true);

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    return response;
  };

  // Логаут
  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Обновление профиля (через auth API)
  const updateUserProfile = async (profileData) => {
    const response = await authApi.updateProfile(profileData);
    setUser(response.data.user);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response;
  };

  // Обновление данных пользователя в контексте
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    register,
    login,
    logout,
    loadUser,
    updateUserProfile,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
