// apps/web/src/pages/RegisterPage/RegisterPage.styles.ts
import { type SxProps, type Theme } from '@mui/material/styles';

export const registerPageStyles: SxProps<Theme> = {
  minHeight: '100vh',
  background: theme =>
    `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[900]} 100%)`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme => `
      radial-gradient(circle at 20% 20%, ${theme.palette.primary.main}15 0%, transparent 25%),
      radial-gradient(circle at 80% 80%, ${theme.palette.secondary.main}15 0%, transparent 25%),
      radial-gradient(circle at 40% 60%, ${theme.palette.success.main}10 0%, transparent 25%)
    `,
    pointerEvents: 'none',
  },
};

export const titleStyles: SxProps<Theme> = {
  color: theme => theme.palette.text.primary,
  fontWeight: 700,
  textAlign: 'left',
  mb: 1,
  background: theme =>
    `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

export const subtitleStyles: SxProps<Theme> = {
  color: theme => theme.palette.text.secondary,
  textAlign: 'left',
  lineHeight: 1.6,
  mb: 3,
};
