// apps/web/src/pages/RegisterPage/RegisterForm.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  InputLabel,
  Alert,
  Snackbar,
  Portal,
} from '@mui/material';
import { authAPI } from '../../lib/api';
import { setAuthTokens } from '../../utils/auth';
import {
  formStyles,
  errorAlertStyles,
  formLabelStyles,
  textFieldStyles,
  submitButtonStyles,
} from './RegisterForm.styles';

// Backend RegisterDto ile uyumlu basit form şeması
const registerSchema = yup.object({
  email: yup
    .string()
    .required('E-posta alanı zorunludur')
    .email('Geçerli bir e-posta adresi giriniz'),
  password: yup
    .string()
    .required('Şifre alanı zorunludur')
    .min(6, 'Şifre en az 6 karakter olmalıdır'),
  confirmPassword: yup
    .string()
    .required('Şifre tekrarı zorunludur')
    .oneOf([yup.ref('password')], 'Şifreler eşleşmiyor'),
  fullName: yup
    .string()
    .default('')
    .min(0, 'Ad Soyad en az 2 karakter olmalıdır'),
});

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string; // Opsiyonel değil, boş string olabilir
}

export function RegisterForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    },
  });
  const onSubmit = async (data: RegisterFormData) => {
    console.log('Register form submitted with data:', data); // Debug için
    console.log('onSubmit function called'); // Debug için
    setIsLoading(true);
    setError(null);

    try {
      // API'ye gönderilecek format (confirmPassword hariç)
      const registerData = {
        email: data.email,
        password: data.password,
        fullName: data.fullName.trim() || undefined, // Boşsa undefined gönder
      };

      console.log('Making register API call with:', registerData); // Debug için
      await authAPI.register(registerData);
      console.log('Register API call successful'); // Debug için

      // Başarılı kayıt sonrası bildirim
      setSnackbar({
        open: true,
        message: 'Hesabınız başarıyla oluşturuldu! Giriş yapılıyor...',
        severity: 'success',
      });

      // Otomatik giriş yapmaya çalış
      try {
        console.log('Attempting auto-login'); // Debug için
        const loginResponse = await authAPI.login({
          email: data.email,
          password: data.password,
        });
        console.log('Auto-login successful'); // Debug için

        // Token'ları localStorage'a kaydet ve auth event'i tetikle
        const responseData = loginResponse.data as unknown as Record<
          string,
          unknown
        >;
        const tokenData =
          (responseData.data as Record<string, unknown>) || responseData;
        const accessToken = tokenData?.accessToken as string;
        const refreshToken = tokenData?.refreshToken as string;

        if (accessToken && refreshToken) {
          setAuthTokens(accessToken, refreshToken);
        }

        // Başarılı login sonrası dashboard'a yönlendir
        setTimeout(() => {
          console.log('Navigating to dashboard'); // Debug için
          navigate('/dashboard', { replace: true });
        }, 1500);
      } catch {
        console.log('Auto-login failed, redirecting to login page'); // Debug için
        // Otomatik giriş başarısız olursa login sayfasına yönlendir
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1500);
      }
    } catch (err: unknown) {
      console.error('Register error:', err);

      // Backend hatalarını işle
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as {
          response?: {
            data?: { message?: string | string[] };
            status?: number;
          };
        };
        const status = axiosError.response?.status;

        // HTTP status koduna göre özel mesajlar
        if (status === 409) {
          setError('Bu e-posta adresi ile zaten kayıtlı bir hesap bulunuyor.');
        } else if (status === 422) {
          setError(
            'Girdiğiniz bilgiler geçersiz. Lütfen formu kontrol edip tekrar deneyin.'
          );
        } else if (status === 429) {
          setError(
            'Çok fazla kayıt denemesi yapıldı. Lütfen bir süre sonra tekrar deneyin.'
          );
        } else if (status && status >= 500) {
          setError('Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.');
        } else if (axiosError.response?.data?.message) {
          if (typeof axiosError.response.data.message === 'string') {
            setError(axiosError.response.data.message);
          } else if (Array.isArray(axiosError.response.data.message)) {
            // Validation hatalarını form alanlarına ata
            axiosError.response.data.message.forEach((errorMsg: string) => {
              if (errorMsg.toLowerCase().includes('email')) {
                setFormError('email', { message: errorMsg });
              } else if (errorMsg.toLowerCase().includes('password')) {
                setFormError('password', { message: errorMsg });
              } else {
                setError(errorMsg);
              }
            });
          }
        } else {
          setError('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyiniz.');
        }
      } else {
        setError('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyiniz.');
      }

      setSnackbar({
        open: true,
        message: 'Kayıt işlemi başarısız oldu.',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      {' '}
      <Box
        component="form"
        sx={formStyles}
        noValidate
        autoComplete="off"
        onSubmit={e => {
          console.log('Register form onSubmit triggered'); // Debug için
          e.preventDefault();
          e.stopPropagation();
          console.log('preventDefault called'); // Debug için
          return false; // Ekstra güvenlik
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' && !isLoading) {
            console.log('Enter key pressed'); // Debug için
            e.preventDefault();
            handleSubmit(onSubmit)();
          }
        }}
      >
        {error && (
          <Alert severity="error" sx={errorAlertStyles}>
            {error}
          </Alert>
        )}
        {/* Ad Soyad (Opsiyonel) */}
        <Box>
          <InputLabel sx={formLabelStyles}>Ad Soyad </InputLabel>
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Adınız ve soyadınız"
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
                sx={textFieldStyles}
              />
            )}
          />
        </Box>
        {/* E-posta */}
        <Box>
          <InputLabel sx={formLabelStyles}>E-posta</InputLabel>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="email"
                fullWidth
                placeholder="ornek@email.com"
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={textFieldStyles}
              />
            )}
          />
        </Box>
        {/* Şifre */}
        <Box>
          <InputLabel sx={formLabelStyles}>Şifre</InputLabel>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="password"
                fullWidth
                placeholder="En az 6 karakter"
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={textFieldStyles}
              />
            )}
          />
        </Box>
        {/* Şifre Tekrarı */}
        <Box>
          <InputLabel sx={formLabelStyles}>Şifre Tekrarı</InputLabel>
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="password"
                fullWidth
                placeholder="Şifrenizi tekrar giriniz"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                sx={textFieldStyles}
              />
            )}
          />
        </Box>{' '}
        <Button
          type="button" // submit yerine button yap
          fullWidth
          variant="contained"
          disabled={isLoading}
          sx={submitButtonStyles}
          onClick={e => {
            e.preventDefault();
            void handleSubmit(onSubmit)(e);
          }} // Click event ile handle et
        >
          {isLoading ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur'}{' '}
        </Button>
      </Box>
      {/* Snackbar'ı Portal ile global seviyede göster */}
      <Portal>
        <Snackbar
          open={snackbar.open}
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
            severity={snackbar.severity}
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
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Portal>
    </Box>
  );
}
