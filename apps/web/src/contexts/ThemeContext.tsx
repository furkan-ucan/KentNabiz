// apps/web/src/contexts/ThemeContext.tsx
import React, { useState, ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { ThemeContext } from './ThemeContextDefinition';

// Mat Light tema renkleri
const matteLightBase = "#F5F5F5";
const matteLightCard = "#FFFFFF";
const accentModernLight = "#5C6BC0";
const txtPrimaryLight = "#212121";

// Mat Dark tema renkleri (mevcut)
const matteBase = "#181818";
const matteCard = "#242424";
const accentModern = "#5C6BC0";
const txtPrimary = "#E0E0E0";

interface CustomThemeProviderProps {
  children: ReactNode;
}

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(true); // Varsayılan olarak dark mode

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme = createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      background: {
        default: isDark ? matteBase : matteLightBase,
        paper: isDark ? matteCard : matteLightCard,
      },
      text: {
        primary: isDark ? txtPrimary : txtPrimaryLight,
        secondary: alpha(isDark ? txtPrimary : txtPrimaryLight, 0.6),
      },
      primary: { main: isDark ? accentModern : accentModernLight },
      secondary: { main: alpha(isDark ? accentModern : accentModernLight, 0.8) },
    },

    typography: {
      fontFamily: '"Inter", sans-serif',
      h4: { fontWeight: 600 },
      button: { textTransform: "none" },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? matteBase : matteLightBase,
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? matteCard : matteLightCard,
            borderRadius: 12,
            boxShadow: `2px 2px 6px ${alpha(isDark ? "#000" : "#999", 0.5)}`,
            transition: "transform .2s ease, box-shadow .2s ease",
            "&:hover": {
              transform: "translateY(-3px)",
              boxShadow: `4px 4px 12px ${alpha(isDark ? "#000" : "#999", 0.7)}`,
            },
          },
        },
      },

      MuiButton: {
        defaultProps: { size: "medium", disableElevation: true },
        styleOverrides: {
          containedPrimary: {
            background: `linear-gradient(135deg, ${isDark ? accentModern : accentModernLight}, ${alpha(isDark ? accentModern : accentModernLight, 0.7)})`,
            color: isDark ? txtPrimary : "#FFFFFF",
            borderRadius: 12,
            transition: "transform .2s ease, box-shadow .2s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: `2px 2px 6px ${alpha(isDark ? "#000" : "#999", 0.6)}`,
            },
          },
        },
      },

      MuiTextField: {
        defaultProps: { variant: "outlined", fullWidth: true },
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              backgroundColor: alpha(isDark ? txtPrimary : txtPrimaryLight, 0.05),
              borderRadius: 8,
              "& fieldset": { borderColor: alpha(isDark ? txtPrimary : txtPrimaryLight, 0.2) },
              "&:hover fieldset": { borderColor: alpha(isDark ? txtPrimary : txtPrimaryLight, 0.4) },
              "&.Mui-focused fieldset": {
                borderColor: isDark ? accentModern : accentModernLight,
                boxShadow: `0 0 4px ${alpha(isDark ? accentModern : accentModernLight, 0.5)}`,
              },
            },
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ isDarkMode: isDark, toggleTheme }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
