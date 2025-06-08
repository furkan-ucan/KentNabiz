// apps/web/src/pages/LoginPage/FeaturesColumn.styles.ts
import { type SxProps, type Theme } from '@mui/material/styles';

export const featuresColumnContainerStyles: SxProps<Theme> = {
  flexDirection: 'column',
  alignSelf: 'flex-start',
  gap: 3,
  maxWidth: 450,
  width: '100%',
};

export const featureCardStyles: SxProps<Theme> = {
  gap: 2,
  p: 3,
  borderRadius: 3,
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  minHeight: '100px',
  alignItems: 'flex-start',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
    borderRadius: 3,
    opacity: 0,
    transition: 'opacity 0.4s ease',
    pointerEvents: 'none',
  },
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    '&::before': {
      opacity: 1,
    },
  },
};

export const featureIconStyles: SxProps<Theme> = {
  color: theme => (theme.palette.mode === 'dark' ? '#8a9ba8' : '#566474'), // Dinamik renk
  fontSize: '1.8rem',
  opacity: 0.9,
  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
};

export const featureIconWrapperStyles: SxProps<Theme> = {
  flexShrink: 0,
  mt: 0.5,
};

export const featureTextWrapperStyles: SxProps<Theme> = {
  position: 'relative',
  zIndex: 1,
  flex: 1,
};

export const featureTitleStyles: SxProps<Theme> = {
  fontWeight: 600,
  color: '#f1f5f9',
  fontSize: '1.05rem',
  lineHeight: 1.3,
  mb: 1,
};

export const featureDescriptionStyles: SxProps<Theme> = {
  color: '#cbd5e0',
  lineHeight: 1.6,
  fontSize: '0.9rem',
};
