import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Read saved preference, default to 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('codo_theme') || 'light';
  });

  useEffect(() => {
    // Apply data-theme attribute to <html> so CSS variables cascade
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('codo_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
