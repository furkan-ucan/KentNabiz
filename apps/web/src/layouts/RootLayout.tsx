import {
  Box,
  Flex,
  Text,
  Container,
  HStack,
  Button,
  Spacer,
} from '@chakra-ui/react';
import { Outlet, Link as RouterLink } from 'react-router-dom';

export const RootLayout = () => {
  return (
    <Flex direction="column" minH="100vh">
      {/* Header */}
      <Box as="header" bg="brand.500" color="white" py={4} shadow="md">
        <Container maxW="container.xl">
          <HStack gap={8}>
            <Text fontSize="2xl" fontWeight="bold" asChild>
              <RouterLink to="/">KentNabız</RouterLink>
            </Text>
            <HStack gap={4}>
              <Button
                asChild
                variant="ghost"
                color="white"
                _hover={{ bg: 'brand.600' }}
              >
                <RouterLink to="/reports">Raporlar</RouterLink>
              </Button>
              <Button
                asChild
                variant="ghost"
                color="white"
                _hover={{ bg: 'brand.600' }}
              >
                <RouterLink to="/map">Harita</RouterLink>
              </Button>
            </HStack>
            <Spacer />
            <HStack gap={2}>
              <Button
                asChild
                variant="outline"
                color="white"
                borderColor="white"
                _hover={{ bg: 'white', color: 'brand.500' }}
                size="sm"
              >
                <RouterLink to="/login">Giriş Yap</RouterLink>
              </Button>
              <Button
                asChild
                variant="solid"
                bg="white"
                color="brand.500"
                _hover={{ bg: 'gray.100' }}
                size="sm"
              >
                <RouterLink to="/register">Kayıt Ol</RouterLink>
              </Button>
            </HStack>
          </HStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Box as="main" flex="1" py={8}>
        <Container maxW="container.xl">
          <Outlet />
        </Container>
      </Box>

      {/* Footer */}
      <Box as="footer" bg="gray.100" py={6} mt="auto">
        <Container maxW="container.xl">
          <Text textAlign="center" color="gray.600">
            © {new Date().getFullYear()} KentNabız - Şehrinizi Daha İyi Hale
            Getirin
          </Text>
        </Container>
      </Box>
    </Flex>
  );
};
