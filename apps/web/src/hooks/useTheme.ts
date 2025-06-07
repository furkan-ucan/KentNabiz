// apps/web/src/hooks/useTheme.ts
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContextDefinition';

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a CustomThemeProvider');
  }
  return context;
};
