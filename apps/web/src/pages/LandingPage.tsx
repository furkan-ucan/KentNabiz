import { Box } from '@mui/material';
import { HeroSection } from '@/components/landing/HeroSection';

export function LandingPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 30%, #2d2d44 70%, #404040 100%)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(circle at 30% 40%, rgba(100, 100, 120, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(80, 80, 100, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      <HeroSection />{' '}
    </Box>
  );
}
