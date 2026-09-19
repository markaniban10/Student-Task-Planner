// context/ThemeContext.js
//
// Provides a LIGHT / DARK color scheme to the whole app, the same way
// TaskContext provides the task list: a Context + a custom hook (useTheme)
// so any screen or component can read the current colors and call
// toggleTheme() without passing props down through every level.

import React, { createContext, useContext, useState } from 'react';

const lightColors = {
  background: '#F5F6F8',
  surface: '#FFFFFF',
  text: '#111827',
  subtext: '#6B7280',
  border: '#E5E7EB',
  primary: '#0F6A45',
  primaryLight: '#E6F4EC',
  chipBackground: '#EFEFEF',
  chipText: '#4B5563',
  danger: '#D64545',
  warning: '#C98A1B',
  statusBarStyle: 'dark',
};

const darkColors = {
  background: '#121212',
  surface: '#1E1E1E',
  text: '#F3F4F6',
  subtext: '#9CA3AF',
  border: '#2D2D2D',
  primary: '#34D399',
  primaryLight: '#123A2A',
  chipBackground: '#2A2A2A',
  chipText: '#D1D5DB',
  danger: '#F87171',
  warning: '#FBBF24',
  statusBarStyle: 'light',
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const colors = isDark ? darkColors : lightColors;

  const toggleTheme = () => setIsDark((previous) => !previous);

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}