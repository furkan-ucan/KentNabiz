// apps/web/src/pages/CreateReportPage/styles.ts
import { styled } from '@mui/material/styles';
import {
  StepConnector,
  stepConnectorClasses,
  alpha,
  Theme,
} from '@mui/material';

// Custom Stepper Connector
export const ModernStepConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: `linear-gradient(95deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: `linear-gradient(95deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: alpha(theme.palette.text.disabled, 0.3),
    borderRadius: 1,
  },
}));

// Custom Step Icon
export const ModernStepIcon = styled('div')<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor:
    ownerState.completed || ownerState.active
      ? theme.palette.primary.main
      : alpha(theme.palette.text.disabled, 0.3),
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'all 0.3s ease',
  boxShadow: ownerState.active
    ? `0 4px 10px 0 ${alpha(theme.palette.primary.main, 0.3)}`
    : 'none',
  transform: ownerState.active ? 'scale(1.1)' : 'scale(1)',
  background:
    ownerState.completed || ownerState.active
      ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
      : alpha(theme.palette.text.disabled, 0.3),
}));

// Page container styles
export const getPageContainerStyles = () => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg,
    #000000 0%,
    #1a1a1a 25%,
    #2d2d2d 50%,
    #1a1a1a 75%,
    #000000 100%)`,
  py: { xs: 2, md: 4 },
});

// Progress bar styles
export const getProgressBarStyles = (theme: Theme) => ({
  height: 4,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  '& .MuiLinearProgress-bar': {
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: 2,
  },
});

// Header title styles
export const getHeaderTitleStyles = (theme: Theme) => ({
  fontWeight: 700,
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  mb: 2,
});

// Main card styles
export const getMainCardStyles = (theme: Theme) => ({
  maxWidth: 900,
  mx: 'auto',
  borderRadius: 5,
  border: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
  background: 'rgba(40, 40, 40, 0.95)',
  backdropFilter: 'blur(20px)',
  boxShadow: `
    0 20px 60px ${alpha(theme.palette.primary.main, 0.08)},
    0 0 0 1px ${alpha(theme.palette.primary.main, 0.05)},
    inset 0 1px 0 ${alpha('#ffffff', 0.9)}
  `,
  overflow: 'visible' as const,
  position: 'relative' as const,
  '&::before': {
    content: '""',
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: '5px 5px 0 0',
  },
});

// Floating decoration elements styles
export const getFloatingElementStyles = (theme: Theme) => ({
  topRight: {
    position: 'absolute' as const,
    top: -15,
    right: -15,
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    opacity: 0.1,
    animation: 'pulse 4s ease-in-out infinite',
  },
  bottomLeft: {
    position: 'absolute' as const,
    bottom: -10,
    left: -10,
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
    opacity: 0.08,
    animation: 'pulse 6s ease-in-out infinite reverse',
  },
});

// Step placeholder icon styles
export const getStepIconStyles = (theme: Theme) => ({
  width: 100,
  height: 100,
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  mx: 'auto',
  mb: 3,
  boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
});

// Success step icon styles
export const getSuccessStepIconStyles = (theme: Theme) => ({
  width: 100,
  height: 100,
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  mx: 'auto',
  mb: 3,
  boxShadow: `0 12px 40px ${alpha(theme.palette.success.main, 0.3)}`,
});

// Coming soon badge styles
export const getComingSoonBadgeStyles = (
  theme: Theme,
  variant: 'primary' | 'success' = 'primary'
) => ({
  background: alpha(theme.palette[variant].main, 0.1),
  px: 2,
  py: 1,
  borderRadius: 2,
  fontWeight: 500,
});

// Navigation button styles
export const getNavigationButtonStyles = (theme: Theme) => ({
  back: {
    minWidth: 140,
    borderRadius: 3,
    color: 'text.secondary',
    border: `1px solid ${alpha(theme.palette.text.secondary, 0.2)}`,
    '&:hover': {
      backgroundColor: alpha(theme.palette.text.primary, 0.04),
      borderColor: theme.palette.text.secondary,
      transform: 'translateX(-2px)',
    },
    '&:disabled': {
      opacity: 0.3,
    },
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  next: {
    minWidth: 140,
    borderRadius: 3,
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
    '&:hover': {
      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
      boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.4)}`,
      transform: 'translateY(-3px)',
    },
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    textTransform: 'none' as const,
    fontWeight: 600,
    fontSize: '1rem',
  },
  submit: {
    minWidth: 180,
    borderRadius: 3,
    background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
    boxShadow: `0 8px 25px ${alpha(theme.palette.success.main, 0.3)}`,
    '&:hover': {
      background: `linear-gradient(45deg, ${theme.palette.success.dark}, ${theme.palette.primary.dark})`,
      boxShadow: `0 12px 35px ${alpha(theme.palette.success.main, 0.4)}`,
      transform: 'translateY(-3px)',
    },
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    textTransform: 'none' as const,
    fontWeight: 600,
    fontSize: '1rem',
  },
});

// Progress dots styles
export const getProgressDotStyles = (theme: Theme, isActive: boolean) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: isActive
    ? theme.palette.primary.main
    : alpha(theme.palette.text.disabled, 0.3),
  transition: 'all 0.3s ease',
});

// Page floating elements styles
export const getPageFloatingElementsStyles = () => [
  {
    position: 'fixed' as const,
    top: '20%',
    left: '10%',
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: alpha('#ffffff', 0.1),
    animation: 'float 6s ease-in-out infinite',
    zIndex: 0,
  },
  {
    position: 'fixed' as const,
    top: '60%',
    right: '15%',
    width: 15,
    height: 15,
    borderRadius: '50%',
    background: alpha('#ffffff', 0.08),
    animation: 'float 8s ease-in-out infinite reverse',
    zIndex: 0,
  },
  {
    position: 'fixed' as const,
    bottom: '20%',
    left: '20%',
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: alpha('#ffffff', 0.06),
    animation: 'float 10s ease-in-out infinite',
    zIndex: 0,
  },
];

// CSS Keyframes
export const keyframes = `
  @keyframes float {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
      opacity: 0.7;
    }
    25% {
      transform: translateY(-20px) rotate(90deg);
      opacity: 1;
    }
    50% {
      transform: translateY(-10px) rotate(180deg);
      opacity: 0.8;
    }
    75% {
      transform: translateY(-15px) rotate(270deg);
      opacity: 0.9;
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.05);
      opacity: 1;
    }
  }
`;

// Step Box Style
export const stepBoxStyle = {
  p: 4,
  minHeight: '400px',
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  borderRadius: 3,
  background:
    'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
};
