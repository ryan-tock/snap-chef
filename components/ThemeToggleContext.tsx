// ThemeToggleContext.ts
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

export interface ThemeToggleContextProps {
  isDark: boolean;
  toggleDarkMode: () => void;
}

const ThemeToggleContext = createContext<ThemeToggleContextProps | undefined>(undefined);

export const ThemeToggleProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  // Use the system color scheme as the initial state
  const systemColorScheme = useColorScheme(); // 'light' | 'dark' | null
  const [isDark, setIsDark] = useState<boolean>(systemColorScheme === 'dark');

  const toggleDarkMode = (): void => {
    setIsDark((prev) => !prev);
  };

  return (
    <ThemeToggleContext.Provider value={{ isDark, toggleDarkMode }}>
      {children}
    </ThemeToggleContext.Provider>
  );
};

export const useThemeToggle = (): ThemeToggleContextProps => {
  const context = useContext(ThemeToggleContext);
  if (!context) {
    throw new Error('useThemeToggle must be used within a ThemeToggleProvider');
  }
  return context;
};
