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
import { useDispatch, useSelector } from 'react-redux';
import {
  selectIsAuthenticated,
  selectCurrentUser,
} from '../store/slices/authSlice';
import { logoutUser } from '../store/thunks/authThunks';
import type { AppDispatch } from '../store';

export const RootLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <Flex direction="column" minH="100vh">
      {/* Header */}
      <Box as="header" bg="brand.500" color="white" py={4} shadow="md">
        <Container maxW="container.xl">
          <HStack gap={8}>
            <Text fontSize="2xl" fontWeight="bold" asChild>
              <RouterLink to={isAuthenticated ? '/app' : '/'}>
                KentNabız
              </RouterLink>
            </Text>
            {isAuthenticated && (
              <HStack gap={4}>
                <Button
                  asChild
                  variant="ghost"
                  color="white"
                  _hover={{ bg: 'brand.600' }}
                >
                  <RouterLink to="/app">Ana Panel</RouterLink>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  color="white"
                  _hover={{ bg: 'brand.600' }}
                >
                  <RouterLink to="/app/reports">Raporlarım</RouterLink>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  color="white"
                  _hover={{ bg: 'brand.600' }}
                >
                  <RouterLink to="/app/reports/new">Yeni Rapor</RouterLink>
                </Button>
              </HStack>
            )}
            <Spacer />
            <HStack gap={2}>
              {isAuthenticated ? (
                <>
                  {currentUser && (
                    <Text fontSize="sm" color="white" opacity={0.9}>
                      Hoş geldin, {currentUser.email}
                    </Text>
                  )}
                  <Button
                    variant="outline"
                    color="white"
                    borderColor="white"
                    _hover={{ bg: 'white', color: 'brand.500' }}
                    size="sm"
                    onClick={handleLogout}
                  >
                    Çıkış Yap
                  </Button>
                </>
              ) : (
                <>
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
                </>
              )}
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
