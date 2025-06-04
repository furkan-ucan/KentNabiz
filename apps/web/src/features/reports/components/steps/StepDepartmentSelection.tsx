/**
 * Step 1: Department Selection Component (NEW - CIMER-like flow)
 * First step of the create report stepper form - user selects main department
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
import { AlertTriangle, Building2, CheckCircle } from 'lucide-react';
import { CreateReportFormData } from '../../types/createReportForm.types';
import { useDepartments } from '../../hooks/departmentQueries';
import {
  MunicipalityDepartmentLabel,
  type MunicipalityDepartment,
} from '@kentnabiz/shared';

export const StepDepartmentSelection: React.FC = () => {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateReportFormData>();

  const selectedDepartmentCode = watch('departmentCode');

  // Fetch active departments
  const { data: departments, isLoading, error } = useDepartments();

  const handleDepartmentSelect = (departmentCode: MunicipalityDepartment) => {
    setValue('departmentCode', departmentCode, { shouldValidate: true });
    // Reset category selection when department changes
    setValue('categoryId', 0, { shouldValidate: false });
  };

  // Loading state
  if (isLoading) {
    return (
      <VStack gap={4} py={8}>
        <Spinner size="lg" color="blue.500" />
        <Text color="gray.600">Departmanlar yükleniyor...</Text>
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
          <Alert.Title>Departmanlar yüklenemedi</Alert.Title>
          <Alert.Description>
            Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

  // No departments available
  if (!departments || departments.length === 0) {
    return (
      <VStack gap={6} align="stretch">
        <VStack gap={2} textAlign="center">
          <Heading size="lg" color="gray.800">
            Ana Departman Seçin
          </Heading>
          <Text color="gray.600" fontSize="md">
            Sorunuzun ilgili olduğu ana departmanı seçin
          </Text>
        </VStack>

        <Alert.Root status="info">
          <Alert.Indicator>
            <Icon as={AlertTriangle} />
          </Alert.Indicator>
          <Alert.Content>
            <Alert.Title>Departman bulunamadı</Alert.Title>
            <Alert.Description>
              Henüz aktif departman tanımlanmamış. Sistem yöneticisi ile
              iletişime geçebilirsiniz.
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
          Ana Departman Seçin
        </Heading>
        <Text color="gray.600" fontSize="md">
          Sorunuzun hangi departmanla ilgili olduğunu seçin. Daha sonra bu
          departmana özel kategorileri göreceksiniz.
        </Text>
      </VStack>

      {/* Department Grid */}
      <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={4}>
        {departments.map(department => (
          <Card.Root
            key={department.id}
            cursor="pointer"
            onClick={() => handleDepartmentSelect(department.code)}
            borderWidth="2px"
            borderColor={
              selectedDepartmentCode === department.code
                ? 'blue.500'
                : 'gray.200'
            }
            bg={
              selectedDepartmentCode === department.code ? 'blue.50' : 'white'
            }
            _hover={{
              borderColor: 'blue.300',
              bg:
                selectedDepartmentCode === department.code
                  ? 'blue.50'
                  : 'gray.50',
              transform: 'translateY(-2px)',
              shadow: 'md',
            }}
            transition="all 0.2s"
          >
            <Card.Body p={6}>
              <VStack gap={4} align="center" textAlign="center">
                {/* Icon */}
                <Box
                  p={3}
                  borderRadius="full"
                  bg={
                    selectedDepartmentCode === department.code
                      ? 'blue.100'
                      : 'gray.100'
                  }
                >
                  {selectedDepartmentCode === department.code ? (
                    <Icon as={CheckCircle} w={6} h={6} color="blue.600" />
                  ) : (
                    <Icon as={Building2} w={6} h={6} color="gray.600" />
                  )}
                </Box>

                {/* Department Name */}
                <VStack gap={2}>
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    color={
                      selectedDepartmentCode === department.code
                        ? 'blue.700'
                        : 'gray.800'
                    }
                    lineHeight="1.2"
                  >
                    {MunicipalityDepartmentLabel[department.code]}
                  </Text>
                  {department.description && (
                    <Text fontSize="sm" color="gray.600" lineHeight="1.4">
                      {department.description}
                    </Text>
                  )}
                </VStack>

                {/* Selected Indicator */}
                {selectedDepartmentCode === department.code && (
                  <Box
                    px={3}
                    py={1}
                    borderRadius="full"
                    bg="blue.100"
                    color="blue.700"
                    fontSize="xs"
                    fontWeight="semibold"
                  >
                    Seçildi
                  </Box>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>
        ))}
      </Grid>

      {/* Error Display */}
      {errors.departmentCode && (
        <Alert.Root status="error">
          <Alert.Indicator>
            <Icon as={AlertTriangle} />
          </Alert.Indicator>
          <Alert.Content>
            <Alert.Title>Departman seçimi gerekli</Alert.Title>
            <Alert.Description>
              Devam etmek için lütfen bir departman seçin.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
    </VStack>
  );
};
