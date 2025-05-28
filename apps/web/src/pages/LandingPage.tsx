import React from 'react';
import { Box, Container } from '@chakra-ui/react';
import { HeroSection } from '@/components/landing/HeroSection';

export const LandingPage: React.FC = () => {
  return (
    <Box minH="100vh" bg="gray.50">
      {/* Hero Section */}
      <Container maxW="container.xl" py={{ base: 8, md: 16 }}>
        <HeroSection />
      </Container>

      {/* Gelecekte eklenecek diğer bölümler */}
      {/* Features Section */}
      {/* Statistics Section */}
      {/* Testimonials Section */}
      {/* CTA Section */}
    </Box>
  );
};
