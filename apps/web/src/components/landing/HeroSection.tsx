import { Box, Container, Typography, Button, Stack } from '@mui/material';
import {
  PersonAdd,
  Login,
  Rocket,
  PhoneIphone,
  NotificationsActive,
  Map,
} from '@mui/icons-material';
import { AnimatedIllustration } from '@/components/AnimatedIllustration';
import { useNavigate } from 'react-router-dom';

export function HeroSection() {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };
  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 4, md: 8 },
        flex: 1,
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: { xs: 4, lg: 8 },
          alignItems: 'center',
          minHeight: { xs: 'auto', lg: '80vh' },
        }}
      >
        {/* Sol Taraf - Hero Content */}
        <Box sx={{ order: { xs: 2, lg: 1 } }}>
          {' '}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
              mb: 3,
              fontWeight: 700,
              color: '#f8f9fa',
              textShadow: '0 4px 8px rgba(0,0,0,0.5)',
              letterSpacing: '-0.02em',
              fontDisplay: 'swap', // Font loading optimization
              willChange: 'auto', // Prevent unnecessary GPU acceleration
            }}
          >
            Kent
            <Box
              component="span"
              sx={{
                background:
                  'linear-gradient(135deg, #64b5f6 0%, #42a5f5 50%, #2196f3 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Nabız
            </Box>
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              lineHeight: 1.6,
              color: '#e0e0e0',
              fontWeight: 300,
              mb: 3,
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            Şehrinizin nabzını tutun. Anlık hizmet durumları, bildirimleri ve
            kent yaşamınızı kolaylaştıran akıllı çözümler.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              lineHeight: 1.7,
              color: '#b0b0b0',
              maxWidth: '600px',
              mb: 5,
            }}
          >
            Belediye hizmetlerini takip edin, sorunları bildirin ve şehrinizin
            gelişimine katkıda bulunun. Modern, hızlı ve kullanıcı dostu
            arayüzümüzle kent yaşamınız artık avucunuzda.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
          >
            {' '}
            <Button
              variant="contained"
              size="large"
              startIcon={<PersonAdd />}
              onClick={handleRegister}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                background:
                  'linear-gradient(135deg, #424242 0%, #616161 50%, #757575 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 20px rgba(66, 66, 66, 0.4)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  background:
                    'linear-gradient(135deg, #616161 0%, #757575 50%, #9e9e9e 100%)',
                  boxShadow: '0 6px 30px rgba(66, 66, 66, 0.6)',
                  transform: 'translateY(-2px) scale(1.02)',
                },
              }}
            >
              Kayıt Ol
            </Button>{' '}
            <Button
              variant="outlined"
              size="large"
              startIcon={<Login />}
              onClick={handleLogin}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 500,
                borderRadius: 2,
                textTransform: 'none',
                borderWidth: 2,
                borderColor: '#9e9e9e',
                color: '#e0e0e0',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderWidth: 2,
                  borderColor: '#bdbdbd',
                  backgroundColor: 'rgba(158, 158, 158, 0.1)',
                  transform: 'translateY(-2px) scale(1.02)',
                },
              }}
            >
              Giriş Yap
            </Button>
          </Stack>{' '}
          {/* Feature Pills - Çerçevesiz ve Belirgin */}
          <Box sx={{ mt: 6 }}>
            <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  color: '#e0e0e0',
                  fontSize: '1rem',
                  fontWeight: 500,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    color: '#ffffff',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                <Rocket sx={{ fontSize: '1.8rem', color: '#64b5f6' }} />
                <span>Hızlı</span>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  color: '#e0e0e0',
                  fontSize: '1rem',
                  fontWeight: 500,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    color: '#ffffff',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                <PhoneIphone sx={{ fontSize: '1.8rem', color: '#81c784' }} />
                <span>Mobil</span>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  color: '#e0e0e0',
                  fontSize: '1rem',
                  fontWeight: 500,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    color: '#ffffff',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                <NotificationsActive
                  sx={{ fontSize: '1.8rem', color: '#ffb74d' }}
                />
                <span>Anlık Bildirim</span>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  color: '#e0e0e0',
                  fontSize: '1rem',
                  fontWeight: 500,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    color: '#ffffff',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                <Map sx={{ fontSize: '1.8rem', color: '#f06292' }} />
                <span>Harita Entegrasyonu</span>
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* Sağ Taraf - Animated Illustration */}
        <Box
          sx={{
            order: { xs: 1, lg: 2 },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: { xs: 300, md: 400, lg: 500 },
          }}
        >
          <AnimatedIllustration />
        </Box>
      </Box>
    </Container>
  );
}
