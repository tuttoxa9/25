import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Получаем первоначальную тему из localStorage или используем светлую тему по умолчанию
  const [theme, setTheme] = useState<Theme>(() => {
    // Проверяем localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null;

    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }

    // По умолчанию - светлая тема (независимо от системных настроек)
    return 'light';
  });

  // Функция для переключения темы
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Применяем класс темы к body при изменении темы
  useEffect(() => {
    const root = window.document.documentElement;

    // Удаляем старый класс и добавляем новый
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Сохраняем выбор пользователя в localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Хук для использования контекста темы
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
