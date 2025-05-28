import { Heading, Text, VStack, Flex } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AnimatedIllustration } from './AnimatedIllustration';

export const HeroSection = () => {
  return (
    <Flex
      direction={{ base: 'column-reverse', lg: 'row' }}
      align="center"
      justify={{ base: 'center', lg: 'space-between' }}
      gap={{ base: 10, md: 12, lg: 16 }}
      width="100%"
      py={{ base: 6, md: 10 }}
      px={{ base: 4, md: 6, lg: 8 }}
      maxW="1200px"
      mx="auto"
    >
      {/* Metin ve CTA Bölümü */}
      <VStack
        gap={{ base: 6, md: 8 }}
        align={{ base: 'center', lg: 'flex-start' }}
        textAlign={{ base: 'center', lg: 'left' }}
        flex={{ lg: '1' }}
        maxW={{ lg: '600px' }}
      >
        <Heading
          as="h1"
          fontSize={{ base: '3xl', sm: '4xl', md: '5xl', lg: '5xl' }}
          fontWeight="extrabold"
          lineHeight="shorter"
          letterSpacing="tight"
        >
          KentNabız:
          <Text
            as="span"
            color="brand.500"
            display={{ base: 'block', md: 'inline' }}
            ml={{ md: 2 }}
          >
            Şehrine Ses Ver!
          </Text>
        </Heading>

        <Text
          fontSize={{ base: 'lg', md: 'xl' }}
          color="gray.600"
          maxW={{ base: 'md', lg: 'xl' }}
          lineHeight="relaxed"
        >
          Yaşadığınız şehirdeki altyapı sorunlarını ve gördüğünüz aksaklıkları
          kolayca bildirin, çözümün aktif bir parçası olun.
        </Text>

        <VStack
          gap={{ base: 3, sm: 4 }}
          direction={{ base: 'column', sm: 'row' }}
          w={{ base: 'full', sm: 'auto' }}
          align="stretch"
        >
          <Button
            asChild
            colorPalette="brand"
            size="lg"
            px={8}
            py={6}
            w={{ base: 'full', sm: 'auto' }}
            _hover={{ bg: 'brand.600', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
          >
            <RouterLink to="/register">Hemen Kayıt Ol</RouterLink>
          </Button>

          <Button
            asChild
            variant="outline"
            colorPalette="brand"
            size="lg"
            px={8}
            py={6}
            w={{ base: 'full', sm: 'auto' }}
            _hover={{
              bg: 'brand.50',
              borderColor: 'brand.500',
              transform: 'translateY(-2px)',
            }}
            transition="all 0.2s"
          >
            <RouterLink to="/login">Giriş Yap</RouterLink>
          </Button>
        </VStack>
      </VStack>

      {/* Animasyon Bölümü */}
      <Flex
        justify="center"
        align="center"
        flex={{ base: 'none', lg: '1' }}
        w={{ base: '80%', sm: '70%', md: '60%', lg: 'auto' }}
        maxW={{ lg: '500px', xl: '550px' }}
        aspectRatio={1}
        mx="auto"
      >
        <AnimatedIllustration width="100%" height="100%" />
      </Flex>
    </Flex>
  );
};
