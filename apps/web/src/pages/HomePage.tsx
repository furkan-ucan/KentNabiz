import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Heading,
  Text,
  VStack,
  Grid,
  GridItem,
  Badge,
  HStack,
} from '@chakra-ui/react';
import { RootState } from '@/store';
// Örnek paylaşılan enum importu (path alias testi için)
import { UserRole } from '@KentNabiz/shared';
// Örnek paylaşılan UI component importu (path alias ve workspace testi için)
import { Button } from '@KentNabiz/ui';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  console.log('UserRole from shared:', UserRole.CITIZEN);

  return (
    <VStack gap={8} align="stretch">
      {/* Hero Section */}
      <Box textAlign="center" py={8}>
        <Heading as="h1" size="2xl" mb={4} color="gray.900">
          KentNabız: Şehrindeki Sorunları Bildir, Çözümün Parçası Ol!
        </Heading>
        <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto">
          Şehir yönetimi ve vatandaş hizmetleri için modern, güvenli ve
          kullanıcı dostu platform
        </Text>
      </Box>

      {/* User Status */}
      {isAuthenticated && user && (
        <Box
          maxW="2xl"
          mx="auto"
          p={6}
          borderWidth="1px"
          borderRadius="lg"
          bg="white"
          shadow="sm"
        >
          <Heading size="lg" mb={4}>
            Kullanıcı Bilgileri
          </Heading>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
            <GridItem>
              <Text fontSize="sm" color="gray.600">
                Ad Soyad
              </Text>
              <Text fontWeight="medium">{user.fullName}</Text>
            </GridItem>
            <GridItem>
              <Text fontSize="sm" color="gray.600">
                E-posta
              </Text>
              <Text fontWeight="medium">{user.email}</Text>
            </GridItem>
            <GridItem>
              <Text fontSize="sm" color="gray.600">
                Rol
              </Text>
              <Text fontWeight="medium">
                {user.roles?.join(', ') || 'Belirtilmemiş'}
              </Text>
            </GridItem>
            <GridItem>
              <Text fontSize="sm" color="gray.600">
                Durum
              </Text>
              <Badge colorPalette="green" variant="subtle">
                Aktif
              </Badge>
            </GridItem>
          </Grid>
        </Box>
      )}

      {/* Features Grid */}
      <Grid
        templateColumns={{
          base: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        }}
        gap={6}
      >
        <Box p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
          <VStack align="start" gap={4}>
            <Box
              w={12}
              h={12}
              bg="blue.100"
              rounded="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="2xl"
            >
              📋
            </Box>
            <Box>
              <Heading size="md" mb={2}>
                Rapor Yönetimi
              </Heading>
              <Text color="gray.600">
                Şehir sorunlarını raporlayın ve takip edin
              </Text>
            </Box>
          </VStack>
        </Box>

        <Box p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
          <VStack align="start" gap={4}>
            <Box
              w={12}
              h={12}
              bg="green.100"
              rounded="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="2xl"
            >
              👥
            </Box>
            <Box>
              <Heading size="md" mb={2}>
                Takım Yönetimi
              </Heading>
              <Text color="gray.600">
                Ekip üyelerini yönetin ve koordine edin
              </Text>
            </Box>
          </VStack>
        </Box>

        <Box p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
          <VStack align="start" gap={4}>
            <Box
              w={12}
              h={12}
              bg="purple.100"
              rounded="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="2xl"
            >
              📊
            </Box>
            <Box>
              <Heading size="md" mb={2}>
                İstatistikler
              </Heading>
              <Text color="gray.600">Detaylı raporlar ve analitik veriler</Text>
            </Box>
          </VStack>
        </Box>
      </Grid>

      {/* System Status */}
      <Box
        maxW="4xl"
        mx="auto"
        p={6}
        borderWidth="1px"
        borderRadius="lg"
        bg="white"
        shadow="sm"
      >
        <Heading size="lg" mb={6}>
          Sistem Durumu
        </Heading>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
          <GridItem>
            <VStack gap={4} align="stretch">
              <Box
                p={4}
                bg="green.50"
                borderWidth="1px"
                borderColor="green.200"
                borderRadius="md"
              >
                <HStack justify="space-between">
                  <Text fontWeight="medium" color="green.800">
                    API Servisi
                  </Text>
                  <Badge colorPalette="green" variant="subtle">
                    ✅ Çalışıyor
                  </Badge>
                </HStack>
                <Text fontSize="sm" color="green.600" mt={2}>
                  Tüm API endpoint&apos;leri normal çalışıyor
                </Text>
              </Box>

              <Box
                p={4}
                bg="green.50"
                borderWidth="1px"
                borderColor="green.200"
                borderRadius="md"
              >
                <HStack justify="space-between">
                  <Text fontWeight="medium" color="green.800">
                    Veritabanı
                  </Text>
                  <Badge colorPalette="green" variant="subtle">
                    ✅ Çalışıyor
                  </Badge>
                </HStack>
                <Text fontSize="sm" color="green.600" mt={2}>
                  PostgreSQL bağlantısı aktif
                </Text>
              </Box>
            </VStack>
          </GridItem>

          <GridItem>
            <VStack gap={4} align="stretch">
              <Box
                p={4}
                bg="blue.50"
                borderWidth="1px"
                borderColor="blue.200"
                borderRadius="md"
              >
                <HStack justify="space-between">
                  <Text fontWeight="medium" color="blue.800">
                    Aktif Kullanıcılar
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="blue.600">
                    24
                  </Text>
                </HStack>
                <Text fontSize="sm" color="blue.600" mt={2}>
                  Son 24 saatte giriş yapan
                </Text>
              </Box>

              <Box
                p={4}
                bg="purple.50"
                borderWidth="1px"
                borderColor="purple.200"
                borderRadius="md"
              >
                <HStack justify="space-between">
                  <Text fontWeight="medium" color="purple.800">
                    Toplam Rapor
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="purple.600">
                    156
                  </Text>
                </HStack>
                <Text fontSize="sm" color="purple.600" mt={2}>
                  Bu ay oluşturulan rapor sayısı
                </Text>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </Box>

      {/* Quick Actions */}
      <Box textAlign="center" py={8}>
        <Heading size="lg" mb={6}>
          Hızlı İşlemler
        </Heading>
        <HStack justify="center" gap={4} wrap="wrap">
          <Button variant="primary" size="lg">
            Yeni Rapor Oluştur
          </Button>
          <Button variant="outline" size="lg">
            Raporları Görüntüle
          </Button>
          <Button variant="secondary" size="lg">
            Yardım & Destek
          </Button>
        </HStack>
      </Box>

      {/* Development Info */}
      <Box
        maxW="2xl"
        mx="auto"
        p={4}
        bg="gray.50"
        borderRadius="md"
        textAlign="center"
      >
        <Text fontSize="sm" color="gray.600">
          🚀 <strong>Geliştirme Modu:</strong> Bu sayfa Chakra UI v3, React
          Router ve Redux Toolkit ile geliştirilmiştir.
        </Text>
        <Text fontSize="xs" color="gray.500" mt={2}>
          Workspace test: {UserRole.CITIZEN} | Shared package çalışıyor ✅
        </Text>
      </Box>
    </VStack>
  );
};

export default HomePage;
