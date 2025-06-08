// apps/web/src/pages/LoginPage/LoginForm.styles.ts
import { type SxProps, type Theme } from '@mui/material/styles';

export const formStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: 2.5, // Increased gap for better spacing
};

export const errorAlertStyles: SxProps<Theme> = {
  mb: 2,
  backgroundColor: theme => theme.palette.error.main + '1a', // 10% opacity
  border: theme => `1px solid ${theme.palette.error.main}4d`, // 30% opacity
  color: theme => theme.palette.error.light,
  '& .MuiAlert-icon': {
    color: theme => theme.palette.error.main,
  },
};

export const formLabelStyles: SxProps<Theme> = {
  color: theme => theme.palette.text.secondary,
  mb: 0.5,
  fontSize: '0.9rem',
  '&.Mui-focused': {
    color: theme => theme.palette.primary.light,
  },
};

export const textFieldStyles: SxProps<Theme> = {
  '& .MuiInputLabel-root': {
    color: theme => theme.palette.text.secondary,
    fontSize: '0.95rem',
    '&.Mui-focused': {
      color: theme => theme.palette.primary.main,
    },
    '&.Mui-error': {
      color: theme => theme.palette.error.main,
    },
  },
  '& .MuiOutlinedInput-root': {
    color: theme => theme.palette.text.primary,
    backgroundColor: theme => `${theme.palette.background.default}cc`, // 80% opacity
    borderRadius: 2.5,
    fontSize: '0.95rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(8px)',
    '& fieldset': {
      borderColor: theme => `${theme.palette.divider}80`, // 50% opacity
      borderWidth: '1.5px',
    },
    '&:hover': {
      backgroundColor: theme => `${theme.palette.background.default}e6`, // 90% opacity
      '& fieldset': {
        borderColor: theme => theme.palette.text.secondary,
      },
    },
    '&.Mui-focused': {
      backgroundColor: theme => theme.palette.background.default,
      '& fieldset': {
        borderColor: theme => theme.palette.primary.main,
        borderWidth: '2px',
      },
    },
    '&.Mui-error': {
      '& fieldset': {
        borderColor: theme => theme.palette.error.main,
        borderWidth: '2px',
      },
    },
  },
  '& .MuiInputBase-input': {
    padding: '14px 16px',
    '&::placeholder': {
      color: theme => theme.palette.text.secondary,
      opacity: 0.7,
    },
  },
  '& .MuiFormHelperText-root': {
    color: theme => theme.palette.error.main,
    fontSize: '0.8rem',
    marginTop: '6px',
    marginLeft: '2px',
    '&.Mui-error': {
      color: theme => theme.palette.error.main,
    },
  },
};

export const passwordLabelWrapperStyles: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline', // Align items vertically
  mb: 0.5, // Add margin bottom to separate from TextField
};

export const forgotPasswordLinkStyles: SxProps<Theme> = {
  color: theme => theme.palette.primary.light,
  textDecoration: 'none',
  fontSize: '0.85rem',
  '&:hover': {
    textDecoration: 'underline',
    color: theme => theme.palette.primary.main,
  },
};

export const checkboxStyles: SxProps<Theme> = {
  color: theme => theme.palette.text.secondary,
  padding: '6px',
  '&.Mui-checked': {
    color: theme => theme.palette.primary.main,
  },
  '&:hover': {
    backgroundColor: theme => `${theme.palette.primary.main}1a`, // 10% opacity
  },
};

export const rememberMeLabelStyles: SxProps<Theme> = {
  color: theme => theme.palette.text.secondary,
  fontSize: '0.9rem',
};

export const rememberMeControlStyles: SxProps<Theme> = {
  my: 1,
  mx: 0,
};

export const submitButtonStyles = (isSubmitting: boolean): SxProps<Theme> => ({
  mt: 3,
  py: 1.5,
  fontSize: '1rem',
  fontWeight: 600,
  borderRadius: 2.5,
  textTransform: 'none' as const,
  background: theme =>
    isSubmitting
      ? theme.palette.action.disabled
      : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme => theme.palette.primary.contrastText,
  border: 'none',
  boxShadow: theme => `0 6px 20px ${theme.palette.primary.main}30`, // 18% opacity
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: theme =>
      isSubmitting
        ? theme.palette.action.disabled
        : `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
    transform: isSubmitting ? 'none' : 'translateY(-2px)',
    boxShadow: theme =>
      isSubmitting
        ? `0 6px 20px ${theme.palette.primary.main}30`
        : `0 8px 25px ${theme.palette.primary.main}40`, // 25% opacity
  },
  '&:active': {
    transform: isSubmitting ? 'none' : 'translateY(0)',
    boxShadow: theme =>
      isSubmitting
        ? `0 6px 20px ${theme.palette.primary.main}30`
        : `0 4px 15px ${theme.palette.primary.main}30`,
  },
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
});

export const submitButtonLoadingStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
};
