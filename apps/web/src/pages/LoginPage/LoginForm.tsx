// apps/web/src/pages/LoginPage/LoginForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  Portal,
} from '@mui/material';
import * as S from './LoginForm.styles';
import { authAPI, type LoginDto } from '../../lib/api';
import { parseJwtPayload } from '../../utils/auth';
import { UserRole } from '@kentnabiz/shared';

// --- Form Tipleri ve Validasyon Şeması ---
const loginSchema = yup.object({
  email: yup
    .string()
    .email('Geçerli bir e-posta adresi girin.')
    .required('E-posta alanı zorunludur.'),
  password: yup
    .string()
    .min(6, 'Şifre en az 6 karakter olmalıdır.')
    .required('Şifre alanı zorunludur.'),
  rememberMe: yup.boolean().required(),
});
type LoginFormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export const LoginForm = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<{
    type: 'error' | 'success';
    message: string;
  } | null>(null);

  // Debug için feedback state değişimini izle
  useEffect(() => {
    console.log('Feedback state changed:', feedback);
  }, [feedback]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });
  const onSubmit = async (data: LoginFormData) => {
    console.log('Form submitted with data:', data); // Debug için
    console.log('onSubmit function called'); // Debug için
    setFeedback(null);

    try {
      const loginData: LoginDto = {
        email: data.email,
        password: data.password,
      };
      console.log('Making API call with:', loginData); // Debug için
      const response = await authAPI.login(loginData);
      console.log('API response received:', response); // Debug için
      console.log('Response data:', response.data); // Debug için
      console.log(
        'Response data structure:',
        JSON.stringify(response.data, null, 2)
      ); // Debug için

      // API response yapısını kontrol edelim - büyük ihtimalle response.data.data yapısında
      const responseData = response.data as unknown as Record<string, unknown>;
      const tokenData =
        (responseData.data as Record<string, unknown>) || responseData;
      console.log('Token data:', tokenData); // Debug için
      console.log('Access token:', tokenData?.accessToken); // Debug için
      console.log('Refresh token:', tokenData?.refreshToken); // Debug için

      // Token'ları localStorage'a kaydet - tip güvenliği için kontrol edelim
      const accessToken = tokenData?.accessToken as string;
      const refreshToken = tokenData?.refreshToken as string;

      if (accessToken && refreshToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      }
      console.log('Tokens saved to localStorage'); // Debug için

      // Verify localStorage
      console.log(
        'Verification - accessToken from localStorage:',
        localStorage.getItem('accessToken')
      ); // Debug için
      console.log(
        'Verification - refreshToken from localStorage:',
        localStorage.getItem('refreshToken')
      ); // Debug için

      if (data.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      setFeedback({
        type: 'success',
        message: 'Başarıyla giriş yapıldı. Yönlendiriliyorsunuz...',
      }); // Kullanıcının rolüne göre uygun dashboard'a yönlendir
      console.log('Login successful, redirecting...'); // Debug için

      // JWT'den kullanıcı bilgilerini al
      const payload = parseJwtPayload(accessToken);

      if (payload?.roles?.includes(UserRole.DEPARTMENT_SUPERVISOR)) {
        navigate('/dashboard/supervisor', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      let errorMessage =
        'Giriş bilgileri hatalı veya bir sunucu sorunu oluştu.';

      console.log('Login error:', err); // Debug için

      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as {
          response?: { data?: { message?: string }; status?: number };
        };
        const status = axiosError.response?.status;

        console.log('Error status:', status); // Debug için

        // HTTP status koduna göre özel mesajlar
        if (status === 401) {
          errorMessage =
            'E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.';
        } else if (status === 404) {
          errorMessage = 'Bu e-posta adresi ile kayıtlı bir hesap bulunamadı.';
        } else if (status === 429) {
          errorMessage =
            'Çok fazla deneme yapıldı. Lütfen bir süre sonra tekrar deneyin.';
        } else if (status && status >= 500) {
          errorMessage =
            'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
        } else {
          // Sunucudan gelen özel mesajı kullan
          errorMessage = axiosError.response?.data?.message || errorMessage;
        }
      }

      console.log('Setting feedback with message:', errorMessage); // Debug için
      setFeedback({ type: 'error', message: errorMessage });
    }
  };

  const handleCloseSnackbar = () => {
    setFeedback(null);
  };

  return (
    <>
      {' '}
      <Box
        component="form"
        onSubmit={e => {
          e.preventDefault();
          void handleSubmit(onSubmit)(e);
        }}
        noValidate
        autoComplete="off"
        sx={S.formStyles}
      >
        <TextField
          label="E-posta Adresi"
          type="email"
          sx={S.textFieldStyles}
          error={!!errors.email}
          helperText={errors.email?.message}
          disabled={isSubmitting}
          {...register('email')}
        />
        <TextField
          label="Şifre"
          type="password"
          sx={S.textFieldStyles}
          error={!!errors.password}
          helperText={errors.password?.message}
          disabled={isSubmitting}
          {...register('password')}
        />
        <FormControlLabel
          control={
            <Checkbox
              {...register('rememberMe')}
              color="primary"
              sx={S.checkboxStyles}
            />
          }
          label={
            <Typography sx={S.rememberMeLabelStyles}>Beni hatırla</Typography>
          }
          sx={S.rememberMeControlStyles}
        />{' '}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isSubmitting}
          sx={S.submitButtonStyles(isSubmitting)}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Giriş Yap'
          )}
        </Button>
      </Box>
      {/* Snackbar'ı Portal ile global seviyede göster */}
      <Portal>
        <Snackbar
          open={!!feedback}
          autoHideDuration={8000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            '& .MuiSnackbarContent-root': {
              minWidth: '350px',
            },
          }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={feedback?.type || 'info'}
            variant="filled"
            sx={{
              width: '100%',
              minWidth: '350px',
              fontSize: '0.95rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              '& .MuiAlert-message': {
                display: 'flex',
                alignItems: 'center',
                lineHeight: 1.5,
              },
            }}
          >
            {feedback?.message}
          </Alert>
        </Snackbar>
      </Portal>
    </>
  );
};
