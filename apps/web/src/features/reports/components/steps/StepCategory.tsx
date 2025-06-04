/**
 * Step 2: Category Selection Component (Updated - CIMER-like flow)
 * Second step of the create report stepper form - selects category based on selected department
 */

import React from 'react';
import {
  VStack,
  Heading,
  Text,
  Box,
  Icon,
  Grid,
  Spinner,
  Alert,
  Card,
} from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import { AlertTriangle, Tag, CheckCircle } from 'lucide-react';
import { CreateReportFormData } from '../../types/createReportForm.types';
import { useCategoriesByDepartment } from '../../hooks/categoryQueries';
import { MunicipalityDepartmentLabel } from '@kentnabiz/shared';

export const StepCategory: React.FC = () => {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateReportFormData>();

  const selectedDepartmentCode = watch('departmentCode');
  const selectedCategoryId = watch('categoryId');

  // Fetch categories based on selected department
  const {
    data: categories,
    isLoading,
    error,
  } = useCategoriesByDepartment(selectedDepartmentCode);

  const handleCategorySelect = (categoryId: number) => {
    setValue('categoryId', categoryId, { shouldValidate: true });
  };

  // If no department selected (shouldn't happen normally)
  if (!selectedDepartmentCode) {
    return (
      <Alert.Root status="warning">
        <Alert.Indicator>
          <Icon as={AlertTriangle} />
        </Alert.Indicator>
        <Alert.Content>
          <Alert.Title>Departman seçilmemiş</Alert.Title>
          <Alert.Description>
            Lütfen önce bir departman seçin.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

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

  // No categories available for this department
  if (!categories || categories.length === 0) {
    return (
      <VStack gap={6} align="stretch">
        <VStack gap={2} textAlign="center">
          <Heading size="lg" color="gray.800">
            Kategori Seçin
          </Heading>
          <Text color="gray.600" fontSize="md">
            <strong>
              {MunicipalityDepartmentLabel[selectedDepartmentCode]}
            </strong>{' '}
            departmanı için
          </Text>
        </VStack>

        <Alert.Root status="info">
          <Alert.Indicator>
            <Icon as={AlertTriangle} />
          </Alert.Indicator>
          <Alert.Content>
            <Alert.Title>Kategori bulunamadı</Alert.Title>
            <Alert.Description>
              Bu departman için henüz kategori tanımlanmamış. Sistem yöneticisi
              ile iletişime geçebilirsiniz.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      </VStack>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      {/* Header */}
      <VStack gap={2} textAlign="center">
        <Heading size="lg" color="gray.800">
          Kategori Seçin
        </Heading>
        <Text color="gray.600" fontSize="md">
          <strong>{MunicipalityDepartmentLabel[selectedDepartmentCode]}</strong>{' '}
          departmanı için detaylı kategori seçin
        </Text>
      </VStack>

      {/* Category Grid */}
      <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={4}>
        {categories.map(category => (
          <Card.Root
            key={category.id}
            cursor="pointer"
            onClick={() => handleCategorySelect(category.id)}
            borderWidth="2px"
            borderColor={
              selectedCategoryId === category.id ? 'blue.500' : 'gray.200'
            }
            bg={selectedCategoryId === category.id ? 'blue.50' : 'white'}
            _hover={{
              borderColor: 'blue.300',
              bg: selectedCategoryId === category.id ? 'blue.50' : 'gray.50',
              transform: 'translateY(-2px)',
              shadow: 'md',
            }}
            transition="all 0.2s"
          >
            <Card.Body p={5}>
              <VStack gap={3} align="center" textAlign="center">
                {/* Icon */}
                <Box
                  p={2}
                  borderRadius="full"
                  bg={
                    selectedCategoryId === category.id ? 'blue.100' : 'gray.100'
                  }
                >
                  {selectedCategoryId === category.id ? (
                    <Icon as={CheckCircle} w={5} h={5} color="blue.600" />
                  ) : (
                    <Icon as={Tag} w={5} h={5} color="gray.600" />
                  )}
                </Box>

                {/* Category Name */}
                <VStack gap={1}>
                  <Text
                    fontWeight="semibold"
                    fontSize="md"
                    color={
                      selectedCategoryId === category.id
                        ? 'blue.700'
                        : 'gray.800'
                    }
                  >
                    {category.name}
                  </Text>
                  {category.description && (
                    <Text fontSize="xs" color="gray.600" lineHeight="1.3">
                      {category.description}
                    </Text>
                  )}
                </VStack>

                {/* Selected Indicator */}
                {selectedCategoryId === category.id && (
                  <Box
                    px={2}
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
      {errors.categoryId && (
        <Alert.Root status="error" size="sm">
          <Alert.Indicator>
            <Icon as={AlertTriangle} />
          </Alert.Indicator>
          <Alert.Content>
            <Alert.Description>{errors.categoryId.message}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {/* Help Text */}
      <Box
        p={4}
        bg="green.50"
        borderRadius="lg"
        border="1px solid"
        borderColor="green.200"
      >
        <Text fontSize="sm" color="green.700">
          💡 <strong>İpucu:</strong> Size en uygun kategoriyi seçin. Bu,
          raporunuzun doğru ekibe iletilmesini sağlar ve daha hızlı çözüm
          almanıza yardımcı olur.
        </Text>
      </Box>
    </VStack>
  );
};
