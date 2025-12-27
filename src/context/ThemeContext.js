// src/context/ThemeContext.js
import React, { createContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, commonGradient } from '../theme/Theme';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const scheme = useColorScheme();

  const theme = useMemo(() => {
    return scheme === 'dark'
      ? { ...darkTheme, gradient: commonGradient }
      : { ...lightTheme, gradient: commonGradient };
  }, [scheme]);

  return (
    <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
  );
};
