// apps/web/src/theme/muiTheme.ts
import { createTheme, alpha } from '@mui/material/styles';

/* ───────────── MAT + MODERN COLORS ───────────── */
const matteBase = '#181818'; // koyu mat zemin
const matteCard = '#242424'; // kart/paper zemin
const accentModern = '#5C6BC0'; // soft indigo accent
const txtPrimary = '#E0E0E0'; // mat ama okunabilir metin

/* ───────────── THEME ───────────── */
const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: matteBase,
      paper: matteCard,
    },
    primary: {
      main: accentModern,
      light: '#7986CB',
      dark: '#3F51B5',
    },
    secondary: {
      main: alpha(accentModern, 0.8),
      light: '#9FA8DA',
      dark: '#303F9F',
    },
    text: {
      primary: txtPrimary,
      secondary: alpha(txtPrimary, 0.6),
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, fontSize: '2.5rem', lineHeight: 1.2 },
    h2: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.3 },
    h3: { fontWeight: 700, fontSize: '1.75rem', lineHeight: 1.3 },
    h4: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.4 },
    h5: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.4 },
    h6: { fontWeight: 600 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 12, // Modern soft radius
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: matteBase,
          minHeight: '100vh',
          // Optional: subtle noise texture overlay
          // backgroundImage: "url('/noise.png')",
          // backgroundRepeat: "repeat",
          // backgroundSize: "auto",
          '::selection': {
            backgroundColor: alpha(accentModern, 0.3),
          },
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: `${alpha(txtPrimary, 0.3)} transparent`,
        },
        '*::-webkit-scrollbar': {
          width: '6px',
        },
        '*::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: alpha(txtPrimary, 0.3),
          borderRadius: '3px',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: matteCard,
          borderRadius: 12,
          boxShadow: `2px 2px 6px ${alpha('#000', 0.5)}`, // Soft shadow
          transition: 'transform .2s ease, box-shadow .2s ease',
          padding: '24px',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: `4px 4px 12px ${alpha('#000', 0.7)}`,
          },
        },
      },
    },

    MuiButton: {
      defaultProps: { size: 'medium', disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'transform .2s ease, box-shadow .2s ease',
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${accentModern}, ${alpha(accentModern, 0.7)})`,
          color: txtPrimary,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `2px 2px 6px ${alpha('#000', 0.6)}`,
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
          '&:disabled': {
            background: alpha(matteCard, 0.5),
            color: alpha(txtPrimary, 0.5),
            transform: 'none',
            boxShadow: 'none',
          },
        },
        outlined: {
          borderColor: alpha(txtPrimary, 0.3),
          color: txtPrimary,
          '&:hover': {
            borderColor: alpha(txtPrimary, 0.6),
            backgroundColor: alpha(accentModern, 0.1),
            transform: 'translateY(-1px)',
          },
        },
      },
    },

    MuiTextField: {
      defaultProps: { variant: 'outlined', fullWidth: true },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: alpha(txtPrimary, 0.05),
            borderRadius: 8,
            '& fieldset': { borderColor: alpha(txtPrimary, 0.2) },
            '&:hover fieldset': { borderColor: alpha(txtPrimary, 0.4) },
            '&.Mui-focused fieldset': {
              borderColor: accentModern,
              boxShadow: `0 0 4px ${alpha(accentModern, 0.5)}`,
            },
            '&.Mui-error fieldset': {
              borderColor: '#ef4444',
            },
          },
          '& .MuiInputLabel-root': {
            color: alpha(txtPrimary, 0.7),
            '&.Mui-focused': {
              color: accentModern,
            },
            '&.Mui-error': {
              color: '#ef4444',
            },
          },
          '& .MuiInputBase-input': {
            color: txtPrimary,
            '&::placeholder': {
              color: alpha(txtPrimary, 0.5),
              opacity: 1,
            },
          },
          '& .MuiFormHelperText-root': {
            color: alpha(txtPrimary, 0.6),
            '&.Mui-error': {
              color: '#f87171',
            },
          },
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: `1px 1px 4px ${alpha('#000', 0.3)}`,
        },
        standardError: {
          backgroundColor: alpha('#ef4444', 0.15),
          border: `1px solid ${alpha('#ef4444', 0.3)}`,
          color: '#fecaca',
          '& .MuiAlert-icon': {
            color: '#ef4444',
          },
        },
        standardSuccess: {
          backgroundColor: alpha('#10b981', 0.15),
          border: `1px solid ${alpha('#10b981', 0.3)}`,
          color: '#a7f3d0',
          '& .MuiAlert-icon': {
            color: '#10b981',
          },
        },
      },
    },

    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          color: alpha(txtPrimary, 0.8),
          fontSize: '0.9rem',
        },
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: alpha(txtPrimary, 0.6),
          '&.Mui-checked': {
            color: accentModern,
          },
        },
      },
    },

    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '16px',
          paddingRight: '16px',
          '@media (min-width: 600px)': {
            paddingLeft: '24px',
            paddingRight: '24px',
          },
        },
      },
    },

    MuiGrid: {
      styleOverrides: {
        container: {
          margin: 0,
          width: '100%',
        },
      },
    },
  },
});

export default theme;
