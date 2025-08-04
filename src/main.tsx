import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Инициализируем тему сразу при загрузке
const initTheme = () => {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const root = document.documentElement;
  
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// Применяем тему до рендера приложения
initTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
