// Context для темной темы
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme должен использоваться внутри ThemeProvider');
  }
  return context;
};

const THEME_KEY = 'theme_v2';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Загрузка темы из localStorage (ключ v2, старый игнорируется)
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return 'dark';
  });

  // Применение темы к документу
  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Переключение темы
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Установка конкретной темы
  const setThemeMode = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
    }
  };

  const value = {
    theme,
    toggleTheme,
    setTheme: setThemeMode,
    isDark: theme === 'dark'
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
