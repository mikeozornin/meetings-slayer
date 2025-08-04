import { useState, useEffect } from 'react';

export const useTheme = () => {
  // Инициализируем тему сразу при загрузке
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(getSystemTheme);

  // Определяем текущую тему на основе системных настроек
  useEffect(() => {
    const updateResolvedTheme = () => {
      const systemTheme = getSystemTheme();
      setResolvedTheme(systemTheme);
    };

    // Применяем тему сразу
    updateResolvedTheme();

    // Слушаем изменения системной темы
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      updateResolvedTheme();
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Применяем тему к документу
  useEffect(() => {
    const root = document.documentElement;
    
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [resolvedTheme]);

  return {
    theme: 'system',
    resolvedTheme,
    setTheme: () => {}, // Пустая функция, так как тема всегда системная
  };
}; 