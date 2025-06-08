import Lottie from 'lottie-react';
import { Box } from '@mui/material';
import animationData from '@/assets/lottie/city-animation.json';

export function AnimatedIllustration() {
  // Geçici olarak placeholder gösteriyoruz
  // Lottie animasyon dosyası eklendikten sonra uncomment yapılacak

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: { xs: 300, md: 400, lg: 500 },
        mx: 'auto',
      }}
    >
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '500px',
          maxHeight: '500px',
        }}
      />
    </Box>
  );
}
