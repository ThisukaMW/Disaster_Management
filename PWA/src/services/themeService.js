// Theme Service - Manages dark/light mode with localStorage persistence
const THEME_KEY = 'resq-theme';
const DEFAULT_THEME = 'dark'; // Default to dark mode

export const getTheme = () => {
  const savedTheme = localStorage.getItem(THEME_KEY);
  return savedTheme || DEFAULT_THEME;
};

export const setTheme = (theme) => {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
};

export const toggleTheme = () => {
  const currentTheme = getTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  return newTheme;
};

export const applyTheme = (theme) => {
  const root = document.documentElement;
  const body = document.body;
  
  if (theme === 'dark') {
    root.classList.add('dark-mode');
    root.classList.remove('light-mode');
    body.classList.add('dark-mode');
    body.classList.remove('light-mode');
  } else {
    root.classList.add('light-mode');
    root.classList.remove('dark-mode');
    body.classList.add('light-mode');
    body.classList.remove('dark-mode');
  }
};

// Initialize theme on load
export const initTheme = () => {
  const theme = getTheme();
  applyTheme(theme);
};

