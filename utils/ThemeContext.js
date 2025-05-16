import React, { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

export const themes = {
  light: {
    background: "#FFFFFF",
    text: "#1F2937",
    textSecondary: "#6B7280",
    primary: "#6366F1",
    border: "#E5E7EB",
    card: "#F9FAFB",
    cardAlt: "#F3F4F6",
    error: "#EF4444",
  },
  dark: {
    background: "#1F2937",
    text: "#F9FAFB",
    textSecondary: "#9CA3AF",
    primary: "#818CF8",
    border: "#374151",
    card: "#111827",
    cardAlt: "#1E293B",
    error: "#F87171",
  },
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? themes.dark : themes.light;

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
