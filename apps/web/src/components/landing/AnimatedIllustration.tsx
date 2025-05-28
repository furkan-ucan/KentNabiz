import Lottie from 'lottie-react';
import { Box, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import cityAnimation from '@/assets/lottie/Animation - 1748396673719.json';

interface LottieAnimationData {
  v?: string;
  fr?: number;
  ip?: number;
  op?: number;
  w?: number;
  h?: number;
  nm?: string;
  ddd?: number;
  assets?: unknown[];
  layers?: unknown[];
}

interface AnimatedIllustrationProps {
  animationData?: LottieAnimationData;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
  height?: string | number | Record<string, string | number>;
  width?: string | number | Record<string, string | number>;
  className?: string;
}

// Custom hook for prefers-reduced-motion
const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

export const AnimatedIllustration = ({
  animationData = cityAnimation,
  loop = true,
  autoplay = true,
  style,
  height = { base: '250px', md: '300px', lg: '400px' },
  width = '100%',
  className,
}: AnimatedIllustrationProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  const illustrationStyle = {
    height: '100%',
    width: '100%',
    ...style,
  };

  if (prefersReducedMotion) {
    return (
      <Box
        height={height}
        width={width}
        bg="gray.100"
        borderRadius="lg"
        display="flex"
        alignItems="center"
        justifyContent="center"
        className={className}
        p={4}
      >
        <Box textAlign="center">
          <Text fontSize="4xl" mb={2}>
            🏙️
          </Text>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            KentNabız Şehir Animasyonu
          </Text>
          <Text fontSize="xs" color="gray.400" mt={1}>
            (Hareket Azaltıldı)
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      height={height}
      width={width}
      className={className}
      borderRadius="lg"
      overflow="hidden"
    >
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={illustrationStyle}
        aria-label="KentNabız şehir gelişimi animasyonu"
      />
    </Box>
  );
};
