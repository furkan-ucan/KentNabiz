import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, Typography, Stack, Link } from '@mui/material';
import { FeaturesColumn } from './LoginPage/FeaturesColumn';
import { LoginForm } from './LoginPage/LoginForm';

export function LoginPage() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        px: { xs: 2, md: 8 },
        py: { xs: 4, md: 8 },
        backgroundColor: 'background.default',
      }}
    >
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={{ xs: 4, md: 6, lg: 8 }}
        alignItems="center"
        justifyContent="center"
        sx={{
          minHeight: '85vh',
          maxWidth: '1400px',
          mx: 'auto',
          width: '100%',
        }}
      >
        {/* Soldaki özellikler */}
        <Box
          sx={{
            flex: { xs: 'none', lg: '1 1 60%' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: { xs: '100%', lg: 'auto' },
          }}
        >
          <FeaturesColumn />
        </Box>

        {/* Sağdaki form */}
        <Box
          sx={{
            flex: { xs: 'none', lg: '0 1 40%' },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: { xs: '100%', lg: 'auto' },
          }}
        >
          <Card
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              width: '100%',
              maxWidth: { xs: 400, sm: 420, md: 450 },
              backdropFilter: 'blur(16px)',
              backgroundColor: theme => `${theme.palette.background.paper}e6`, // 90% opacity
              border: theme => `1px solid ${theme.palette.divider}80`, // 50% opacity
              borderRadius: 3,
              boxShadow: theme => `0 8px 32px ${theme.palette.common.black}1a`, // 10% opacity
            }}
          >
            {/* Mobil Logo */}
            <Box
              sx={{
                display: { xs: 'flex', md: 'none' },
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  textAlign: 'center',
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

            <Stack spacing={3}>
              <Typography
                variant="h5"
                align="center"
                sx={{
                  fontWeight: 600,
                  color: theme => theme.palette.text.primary,
                }}
              >
                Giriş Yap
              </Typography>

              <LoginForm />
            </Stack>

            <Stack mt={3} spacing={1} alignItems="center">
              <Typography
                variant="body2"
                sx={{
                  color: theme => theme.palette.text.secondary,
                  fontSize: '0.875rem',
                }}
              >
                Hesabınız yok mu?{' '}
                <Link
                  component={RouterLink}
                  to="/register"
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
                  Kayıt olun
                </Link>
              </Typography>
            </Stack>
          </Card>
        </Box>
      </Stack>
    </Box>
  );
}
