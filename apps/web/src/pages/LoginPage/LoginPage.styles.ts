// apps/web/src/pages/LoginPage/LoginPage.styles.ts
import { type SxProps, type Theme } from '@mui/material/styles';

export const pageContainerStyles: SxProps<Theme> = {
  display: 'flex', // Added for centering
  flexDirection: 'column', // Added for centering
  alignItems: 'center', // Added for centering
  justifyContent: 'center',
  minHeight: '100vh',
  background:
    'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 30%, #2d2d44 70%, #404040 100%)',
  position: 'relative',
  py: { xs: 4, md: 6 }, // Add some padding for smaller screens
  px: { xs: 2, sm: 3 }, // Add some padding for smaller screens
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'radial-gradient(circle at 30% 40%, rgba(100, 100, 120, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(80, 80, 100, 0.05) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
};

export const contentWrapperStyles: SxProps<Theme> = {
  display: 'flex', // Ensure flex is explicitly set
  flexDirection: { xs: 'column-reverse', md: 'row' },
  justifyContent: 'center',
  alignItems: 'center', // Align items to center for better responsive behavior
  gap: { xs: 6, sm: 8, md: 12 }, // Adjusted gap for different screen sizes
  p: 0, // Padding is handled by pageContainerStyles
  mx: 'auto',
  maxWidth: '1200px',
  width: '100%',
  position: 'relative', // Ensure zIndex works if needed
  zIndex: 1, // Ensure content is above pseudo-elements
};

export const loginCardStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignSelf: { xs: 'center', md: 'flex-start' }, // Center on small screens, align top on medium+
  width: '100%', // Full width on extra-small screens
  maxWidth: { xs: '400px', sm: '420px' }, // Max width for form consistency
  p: { xs: 3, sm: 4 },
  gap: 2, // Consistent gap
  backgroundColor: 'rgba(26, 32, 44, 0.75)', // Slightly more opaque
  backdropFilter: 'blur(15px)', // Increased blur
  border: '1px solid rgba(255, 255, 255, 0.1)', // Slightly more visible border
  borderRadius: 3,
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35), 0 8px 25px rgba(0,0,0,0.25)', // Adjusted shadow
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
    borderRadius: 'inherit', // Inherit border radius
    pointerEvents: 'none',
  },
};

export const loginTitleStyles: SxProps<Theme> = {
  width: '100%',
  fontSize: 'clamp(1.6rem, 7vw, 1.85rem)', // Adjusted clamp for title
  color: '#f8f9fa',
  fontWeight: 600,
  mb: 1.5, // Increased margin bottom
  textAlign: 'center',
};

export const kentNabizLogoStyles: SxProps<Theme> = {
  fontWeight: 700,
  color: '#f8f9fa',
  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
};

export const nabizGradientStyles: SxProps<Theme> = {
  background: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 50%, #2196f3 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textFillColor: 'transparent', // Standard property
};

export const registerLinkTextStyles: SxProps<Theme> = {
  textAlign: 'center',
  mt: 2.5, // Increased margin top
  color: '#b0b0b0',
  fontSize: '0.9rem',
};

export const registerLinkStyles: SxProps<Theme> = {
  color: '#64b5f6',
  textDecoration: 'none',
  fontWeight: 500,
  '&:hover': {
    textDecoration: 'underline',
    color: '#42a5f5',
  },
};
