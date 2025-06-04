/**
 * Step Main Category - CIMER-like main category selection
 * First step in the report creation process
 */

import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  VStack,
  Text,
  Alert,
  Spinner,
  Grid,
  Box,
  Card,
  Icon,
  Heading,
} from '@chakra-ui/react';
import { AlertTriangle, Folder, CheckCircle } from 'lucide-react';
import { useMainCategories } from '../../hooks/categoryQueries';
import type { CreateReportFormData } from '../../types/createReportForm.types';

// Import enums separately to avoid caching issues
import {
  ReportType,
  SharedReportCategory,
  MunicipalityDepartment,
} from '@kentnabiz/shared';

// Category code to MunicipalityDepartment mapping
const getCategoryDepartmentCode = (
  categoryCode: string
): MunicipalityDepartment => {
  const code = categoryCode.toUpperCase();

  // Direct mapping based on seed data and updated department enum
  switch (code) {
    case 'INFRASTRUCTURE':
      return MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE; // Altyapı -> Fen İşleri
    case 'TRANSPORT':
      return MunicipalityDepartment.TRANSPORTATION_SERVICES; // Ulaşım -> Ulaşım Hizmetleri
    case 'ENVIRONMENT':
      return MunicipalityDepartment.ENVIRONMENTAL_PROTECTION; // Çevre -> Çevre Koruma
    case 'PARKS':
      return MunicipalityDepartment.PARKS_AND_GARDENS; // Park -> Park ve Bahçeler
    case 'SECURITY':
      return MunicipalityDepartment.MUNICIPAL_POLICE; // Güvenlik -> Zabıta
    case 'OTHER':
      return MunicipalityDepartment.GENERAL_AFFAIRS; // Diğer -> Genel Konular
    default:
      return MunicipalityDepartment.GENERAL_AFFAIRS; // Fallback
  }
};

// Category code to ReportType mapping based on main categories
const getCategoryReportType = (categoryCode: string): ReportType => {
  const code = categoryCode.toUpperCase();

  // Direct mapping for main category codes to most appropriate ReportType
  switch (code) {
    case 'TRANSPORT':
      return ReportType.PUBLIC_TRANSPORT; // Ulaşım -> Toplu Taşıma
    case 'INFRASTRUCTURE':
      return ReportType.ROAD_DAMAGE; // Altyapı -> Yol Hasarı (en yaygın)
    case 'ENVIRONMENT':
      return ReportType.LITTER; // Çevre -> Çevre Kirliliği (en yaygın)
    case 'PARKS':
      return ReportType.PARK_DAMAGE; // Park ve Bahçeler -> Park Hasarı
    case 'SECURITY':
      return ReportType.OTHER; // Güvenlik -> Diğer (ReportType'da spesifik güvenlik yok)
    case 'OTHER':
      return ReportType.OTHER;
    default: {
      // Fallback semantic matching for flexibility
      const lowerCode = code.toLowerCase();

      // Infrastructure and Roads
      if (
        lowerCode.includes('yol') ||
        lowerCode.includes('road') ||
        lowerCode.includes('çukur')
      )
        return ReportType.POTHOLE;
      if (lowerCode.includes('trafik') || lowerCode.includes('traffic'))
        return ReportType.TRAFFIC_LIGHT;
      if (lowerCode.includes('ulaşım') || lowerCode.includes('transport'))
        return ReportType.PUBLIC_TRANSPORT;

      // Utilities
      if (lowerCode.includes('elektrik') || lowerCode.includes('electric'))
        return ReportType.ELECTRICITY_OUTAGE;
      if (lowerCode.includes('su') || lowerCode.includes('water'))
        return ReportType.WATER_LEAKAGE;
      if (lowerCode.includes('aydınlatma') || lowerCode.includes('light'))
        return ReportType.STREET_LIGHT;

      // Environment and Parks
      if (lowerCode.includes('park') || lowerCode.includes('yeşil'))
        return ReportType.PARK_DAMAGE;
      if (lowerCode.includes('çöp') || lowerCode.includes('litter'))
        return ReportType.LITTER;
      if (lowerCode.includes('grafiti') || lowerCode.includes('graffiti'))
        return ReportType.GRAFFITI;

      // Default fallback
      return ReportType.OTHER;
    }
  }
};

export const StepMainCategory: React.FC = () => {
  console.log('--- StepMainCategory MOUNTED ---');

  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateReportFormData>();

  const selectedMainCategoryId = watch('mainCategoryId');
  const { data: mainCategories, isLoading, error } = useMainCategories();
  console.log('StepMainCategory - useMainCategories:', {
    mainCategories,
    isLoading,
    error,
    isArray: Array.isArray(mainCategories),
    type: typeof mainCategories,
  });
  const handleCategorySelect = (category: SharedReportCategory) => {
    setValue('mainCategoryId', category.id, { shouldValidate: true });

    // Map category code to ReportType
    const reportType = getCategoryReportType(
      category.code || category.name || ''
    );
    setValue('reportType', reportType, { shouldValidate: true });

    // Map category code to MunicipalityDepartment
    const departmentCode = getCategoryDepartmentCode(
      category.code || category.name || ''
    );
    setValue('departmentCode', departmentCode, { shouldValidate: true });

    // Reset sub-category when main category changes
    setValue('categoryId', 0);

    console.log('Category selected:', {
      categoryId: category.id,
      categoryCode: category.code,
      categoryName: category.name,
      reportType,
      departmentCode,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <VStack gap={4} py={8}>
        <Spinner size="lg" color="blue.500" />
        <Text color="gray.600">Kategoriler yükleniyor...</Text>
      </VStack>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator>
          <Icon as={AlertTriangle} />
        </Alert.Indicator>
        <Alert.Content>
          <Alert.Title>Kategoriler yüklenemedi</Alert.Title>
          <Alert.Description>
            Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      {/* Header */}
      <VStack gap={2} textAlign="center">
        <Heading size="lg" color="gray.800">
          Ana Kategori Seçin
        </Heading>
        <Text color="gray.600" fontSize="md">
          Bildirmek istediğiniz sorunla ilgili ana kategoriyi seçin
        </Text>
      </VStack>{' '}
      {/* Category Grid */}
      <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={4}>
        {' '}
        {Array.isArray(mainCategories) &&
          mainCategories.map(category => (
            <Card.Root
              key={category.id}
              cursor="pointer"
              onClick={() => handleCategorySelect(category)}
              borderWidth="2px"
              borderColor={
                selectedMainCategoryId === category.id ? 'blue.500' : 'gray.200'
              }
              bg={selectedMainCategoryId === category.id ? 'blue.50' : 'white'}
              _hover={{
                borderColor: 'blue.300',
                bg:
                  selectedMainCategoryId === category.id
                    ? 'blue.50'
                    : 'gray.50',
                transform: 'translateY(-2px)',
                shadow: 'md',
              }}
              transition="all 0.2s"
            >
              <Card.Body p={6}>
                <VStack gap={3} align="center" textAlign="center">
                  {/* Icon */}
                  <Box
                    p={3}
                    borderRadius="full"
                    bg={
                      selectedMainCategoryId === category.id
                        ? 'blue.100'
                        : 'gray.100'
                    }
                  >
                    {selectedMainCategoryId === category.id ? (
                      <Icon as={CheckCircle} w={6} h={6} color="blue.600" />
                    ) : (
                      <Icon as={Folder} w={6} h={6} color="gray.600" />
                    )}
                  </Box>

                  {/* Category Name */}
                  <VStack gap={1}>
                    <Text
                      fontWeight="semibold"
                      fontSize="lg"
                      color={
                        selectedMainCategoryId === category.id
                          ? 'blue.700'
                          : 'gray.800'
                      }
                    >
                      {category.name}
                    </Text>
                    {category.description && (
                      <Text fontSize="sm" color="gray.600" lineHeight="1.4">
                        {category.description}
                      </Text>
                    )}
                  </VStack>

                  {/* Selected Indicator */}
                  {selectedMainCategoryId === category.id && (
                    <Box
                      px={3}
                      py={1}
                      bg="blue.100"
                      borderRadius="full"
                      border="1px solid"
                      borderColor="blue.200"
                    >
                      <Text fontSize="xs" color="blue.700" fontWeight="medium">
                        Seçili
                      </Text>
                    </Box>
                  )}
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
      </Grid>
      {/* Validation Error */}
      {errors.mainCategoryId && (
        <Alert.Root status="error" size="sm">
          <Alert.Indicator>
            <Icon as={AlertTriangle} />
          </Alert.Indicator>
          <Alert.Content>
            <Alert.Description>
              {errors.mainCategoryId.message}
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      {/* Help Text */}
      <Box
        p={4}
        bg="blue.50"
        borderRadius="lg"
        border="1px solid"
        borderColor="blue.200"
      >
        <Text fontSize="sm" color="blue.700">
          💡 <strong>İpucu:</strong> Ana kategoriyi seçtikten sonra bir sonraki
          adımda daha spesifik alt kategoriler arasından seçim yapabileceksiniz.
        </Text>
      </Box>
    </VStack>
  );
};
