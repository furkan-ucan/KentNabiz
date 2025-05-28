import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Input,
  Button,
  Link,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const LoginPage: React.FC = () => {
  return (
    <Box
      minH="80vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
    >
      <Box
        maxW="md"
        w="full"
        p={8}
        borderWidth="1px"
        borderRadius="lg"
        bg="white"
        shadow="lg"
      >
        <VStack gap={6} align="stretch">
          <Box textAlign="center">
            <Heading as="h1" size="xl" color="brand.500" mb={2}>
              KentNabız&apos;a Giriş Yap
            </Heading>
            <Text color="gray.600">
              Hesabınızla giriş yaparak raporlarınızı yönetin
            </Text>
          </Box>

          <VStack gap={4} align="stretch">
            <Box>
              <Text mb={2} fontWeight="medium" color="gray.700">
                E-posta
              </Text>
              <Input type="email" placeholder="ornek@email.com" size="lg" />
            </Box>

            <Box>
              <Text mb={2} fontWeight="medium" color="gray.700">
                Şifre
              </Text>
              <Input type="password" placeholder="Şifrenizi girin" size="lg" />
            </Box>

            <Button colorPalette="brand" size="lg" w="full" mt={4}>
              Giriş Yap
            </Button>
          </VStack>

          <Box textAlign="center">
            <Text color="gray.600">
              Hesabınız yok mu?{' '}
              <Link asChild color="brand.500" fontWeight="medium">
                <RouterLink to="/register">Kayıt olun</RouterLink>
              </Link>
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default LoginPage;
