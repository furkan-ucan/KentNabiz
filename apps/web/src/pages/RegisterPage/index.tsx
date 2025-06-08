// apps/web/src/pages/RegisterPage/index.tsx
import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, Typography, Stack, Link } from '@mui/material';
import { RegisterForm } from './RegisterForm';

export function RegisterPage() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 1.5, md: 2 },
        py: { xs: 2, md: 3 },
        backgroundColor: 'background.default',
      }}
    >
      <Card
        elevation={0}
        sx={{
          px: { xs: 2.5, sm: 3.5, md: 4 },
          py: { xs: 1.5, sm: 2, md: 2.5 },
          width: '100%',
          maxWidth: { xs: 340, sm: 370, md: 390 },
          backdropFilter: 'blur(16px)',
          backgroundColor: theme => `${theme.palette.background.paper}e6`, // 90% opacity
          border: theme => `1px solid ${theme.palette.divider}80`, // 50% opacity
          borderRadius: 3,
          boxShadow: theme => `0 8px 32px ${theme.palette.common.black}1a`, // 10% opacity
        }}
      >
        <Stack spacing={2}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 0.5 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: theme => theme.palette.text.primary,
              }}
            >
              Kent
              <Box
                component="span"
                sx={{
                  background: theme =>
                    `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 'inherit',
                }}
              >
                Nabız
              </Box>
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography
              component="h1"
              variant="h5"
              sx={{
                fontWeight: 600,
                color: theme => theme.palette.text.primary,
                mb: 0.5,
              }}
            >
              Hesap Oluştur
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme => theme.palette.text.secondary,
                fontSize: '0.875rem',
              }}
            >
              KentNabız platformuna katıl ve şehrindeki gelişmeleri takip et
            </Typography>
          </Box>

          <RegisterForm />

          <Stack mt={1.5} spacing={1} alignItems="center">
            <Typography
              variant="body2"
              sx={{
                color: theme => theme.palette.text.secondary,
                fontSize: '0.875rem',
              }}
            >
              Zaten hesabınız var mı?{' '}
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  color: theme => theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    color: theme => theme.palette.primary.light,
                    textDecoration: 'underline',
                  },
                }}
              >
                Giriş yapın
              </Link>
            </Typography>
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
}
