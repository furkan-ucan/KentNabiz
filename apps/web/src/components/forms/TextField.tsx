import React, { forwardRef, useState } from 'react';
import {
  TextField as MuiTextField,
  type TextFieldProps,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const GlassTextField = styled(MuiTextField)(() => ({
  // Label stilleri
  '& label': {
    color: '#e0e0e0', // Açık gri label
  },
  '& label.Mui-focused': {
    color: '#64b5f6', // Vurgu mavisi
  },
  // Input sarmalayıcı stilleri
  '& .MuiOutlinedInput-root': {
    color: '#f8f9fa', // Beyaz metin
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.2s ease-in-out',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)', // Yarı transparan kenarlık
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#64b5f6', // Vurgu mavisi
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
  },
  // Placeholder stilleri
  '& .MuiOutlinedInput-input::placeholder': {
    color: 'rgba(255, 255, 255, 0.6)',
    opacity: 1,
  },
}));

// Bizim projemizde kullanacağımız nihai TextField bileşeni
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ type = 'text', InputProps, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    const handleClickShowPassword = () => {
      setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (
      event: React.MouseEvent<HTMLButtonElement>
    ) => {
      event.preventDefault();
    };

    return (
      <GlassTextField
        fullWidth
        variant="outlined"
        type={isPassword && !showPassword ? 'password' : 'text'}
        inputRef={ref}
        InputProps={{
          ...InputProps,
          endAdornment: isPassword ? (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                    color: '#64b5f6',
                  },
                }}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ) : (
            InputProps?.endAdornment
          ),
        }}
        {...props}
      />
    );
  }
);

TextField.displayName = 'TextField';
