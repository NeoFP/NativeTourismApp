import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const themes = {
  dark: {
    background: '#1A1A1A',
    card: '#252525',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    primary: '#6366F1',
    border: 'rgba(99, 102, 241, 0.2)',
  },
  light: {
    background: '#F9FAFB',
    card: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    primary: '#6366F1',
    border: 'rgba(99, 102, 241, 0.2)',
  },
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const theme = isDark ? themes.dark : themes.light;

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
} 