// Theme Toggle Component
import { useState, useEffect } from 'react';
import { getTheme, toggleTheme } from '../services/themeService';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const [currentTheme, setCurrentTheme] = useState(getTheme());

  useEffect(() => {
    // Listen for theme changes from other components
    const handleStorageChange = () => {
      setCurrentTheme(getTheme());
    };

    window.addEventListener('storage', handleStorageChange);
    // Also check periodically in case theme was changed in same window
    const interval = setInterval(() => {
      setCurrentTheme(getTheme());
    }, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleToggle = () => {
    const newTheme = toggleTheme();
    setCurrentTheme(newTheme);
  };

  return (
    <button
      className={`theme-toggle ${currentTheme}`}
      onClick={handleToggle}
      aria-label={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {currentTheme === 'dark' ? (
        <span className="theme-icon">☀️</span>
      ) : (
        <span className="theme-icon">🌙</span>
      )}
      <span className="theme-text">{currentTheme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
};

export default ThemeToggle;

