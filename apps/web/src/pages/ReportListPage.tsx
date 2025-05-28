import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Grid,
  GridItem,
  Input,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const ReportListPage: React.FC = () => {
  // Mock data for demonstration
  const mockReports = [
    {
      id: 1,
      title: 'Kırık Kaldırım',
      description: 'Ana cadde üzerindeki kaldırım kırık durumda',
      status: 'OPEN',
      createdAt: '2024-01-15',
      location: 'Merkez Mahallesi',
    },
    {
      id: 2,
      title: 'Sokak Lambası Arızası',
      description: 'Park sokağındaki lambalar çalışmıyor',
      status: 'IN_PROGRESS',
      createdAt: '2024-01-14',
      location: 'Park Mahallesi',
    },
    {
      id: 3,
      title: 'Çöp Toplama Sorunu',
      description: 'Çöpler 3 gündür toplanmıyor',
      status: 'DONE',
      createdAt: '2024-01-13',
      location: 'Yeni Mahalle',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'gray';
      case 'IN_REVIEW':
        return 'yellow';
      case 'IN_PROGRESS':
        return 'orange';
      case 'DONE':
        return 'green';
      case 'REJECTED':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'Açık';
      case 'IN_REVIEW':
        return 'İnceleniyor';
      case 'IN_PROGRESS':
        return 'Devam Ediyor';
      case 'DONE':
        return 'Tamamlandı';
      case 'REJECTED':
        return 'Reddedildi';
      default:
        return status;
    }
  };

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Box>
            <Heading as="h1" size="xl" color="brand.500">
              Raporlar
            </Heading>
            <Text color="gray.600" mt={2}>
              Tüm raporları görüntüleyin ve yönetin
            </Text>
          </Box>
          <Button asChild colorPalette="brand" size="lg">
            <RouterLink to="/reports/new">Yeni Rapor</RouterLink>
          </Button>
        </HStack>

        {/* Filters */}
        <Box p={4} borderWidth="1px" borderRadius="lg" bg="gray.50">
          <HStack gap={4} wrap="wrap">
            <Box flex="1" minW="200px">
              <Text mb={2} fontWeight="medium" color="gray.700">
                Arama
              </Text>
              <Input placeholder="Rapor başlığı veya açıklama..." bg="white" />
            </Box>
            <Box minW="150px">
              <Text mb={2} fontWeight="medium" color="gray.700">
                Durum
              </Text>
              <Box
                as="select"
                bg="white"
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="md"
                px={3}
                py={2}
                fontSize="sm"
                _focus={{ borderColor: 'brand.500', outline: 'none' }}
              >
                <option value="">Tüm durumlar</option>
                <option value="OPEN">Açık</option>
                <option value="IN_REVIEW">İnceleniyor</option>
                <option value="IN_PROGRESS">Devam Ediyor</option>
                <option value="DONE">Tamamlandı</option>
                <option value="REJECTED">Reddedildi</option>
              </Box>
            </Box>
            <Box minW="150px">
              <Text mb={2} fontWeight="medium" color="gray.700">
                Konum
              </Text>
              <Input placeholder="Mahalle..." bg="white" />
            </Box>
          </HStack>
        </Box>

        {/* Reports Grid */}
        <Grid templateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={6}>
          {mockReports.map(report => (
            <GridItem key={report.id}>
              <Box
                p={6}
                borderWidth="1px"
                borderRadius="lg"
                bg="white"
                shadow="sm"
                _hover={{ shadow: 'md' }}
                transition="shadow 0.2s"
              >
                <VStack align="stretch" gap={4}>
                  <HStack justify="space-between" align="start">
                    <Heading as="h3" size="md" color="gray.800">
                      {report.title}
                    </Heading>
                    <Badge colorPalette={getStatusColor(report.status)}>
                      {getStatusText(report.status)}
                    </Badge>
                  </HStack>

                  <Text color="gray.600" fontSize="sm">
                    {report.description}
                  </Text>

                  <HStack
                    justify="space-between"
                    fontSize="sm"
                    color="gray.500"
                  >
                    <Text>{report.location}</Text>
                    <Text>{report.createdAt}</Text>
                  </HStack>

                  <HStack gap={2}>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      colorPalette="brand"
                      flex="1"
                    >
                      <RouterLink to={`/reports/${report.id}`}>
                        Detaylar
                      </RouterLink>
                    </Button>
                    <Button size="sm" variant="ghost" colorPalette="gray">
                      Düzenle
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </GridItem>
          ))}
        </Grid>

        {/* Empty State (if no reports) */}
        {mockReports.length === 0 && (
          <Box
            textAlign="center"
            py={12}
            borderWidth="2px"
            borderStyle="dashed"
            borderColor="gray.300"
            borderRadius="lg"
          >
            <Text fontSize="lg" color="gray.500" mb={4}>
              Henüz rapor bulunmuyor
            </Text>
            <Button asChild colorPalette="brand">
              <RouterLink to="/reports/new">
                İlk Raporunuzu Oluşturun
              </RouterLink>
            </Button>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default ReportListPage;
