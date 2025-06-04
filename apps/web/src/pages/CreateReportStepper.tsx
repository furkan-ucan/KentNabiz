/**
 * Create Report Stepper - Main Form Component
 * Manages multi-step form with react-hook-form and Yup validation
 */

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Heading,
  VStack,
  Button,
  HStack,
  Container,
  Card,
  Text,
  Icon,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { Progress } from '@chakra-ui/progress';
import { useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { toaster } from '@/components/ui/toasterInstance';

// Components - Updated for new CIMER-like flow
import { StepDepartmentSelection } from '../features/reports/components/steps/StepDepartmentSelection';
import { StepCategory } from '../features/reports/components/steps/StepCategory';
import { StepTitleDesc } from '../features/reports/components/steps/StepTitleDesc';
import { StepLocation } from '../features/reports/components/steps/StepLocation';
import { StepMedia } from '../features/reports/components/steps/StepMedia';

// Types and validation
import {
  CreateReportFormData,
  defaultFormValues,
  stepTitles,
  TOTAL_STEPS,
} from '../features/reports/types/createReportForm.types';
import {
  createReportFormSchema,
  getStepFields,
} from '../features/reports/utils/createReportValidationSchema';
import { createReport } from '../features/reports/services/reportService';

export const CreateReportStepper: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Initialize react-hook-form with complete schema
  const methods = useForm<CreateReportFormData>({
    defaultValues: defaultFormValues,
    resolver: yupResolver(createReportFormSchema),
    mode: 'onChange', // Show validation errors as user types
  });

  const {
    handleSubmit,
    trigger,
    formState: { isSubmitting },
  } = methods;

  // Handle next step navigation with validation
  const handleNext = async () => {
    const fieldsToValidate = getStepFields(currentStep);
    const isValid = await trigger(fieldsToValidate);
    if (isValid && currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Handle previous step navigation
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Handle form submission (final step)
  const onSubmit = async (data: CreateReportFormData) => {
    try {
      const newReport = await createReport(data);
      console.log('YENI_RAPOR_OLUSTURULDU:', newReport);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['reports'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboardActiveReports'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboardSolvedReports'] }),
        queryClient.invalidateQueries({ queryKey: ['myActiveReports'] }),
        queryClient.invalidateQueries({ queryKey: ['myResolvedReports'] }),
      ]);
      await queryClient.refetchQueries({ queryKey: ['reports'] });
      await queryClient.refetchQueries({
        queryKey: ['dashboardActiveReports'],
      });
      toaster.create({
        title: 'Rapor Başarıyla Oluşturuldu',
        description:
          'Şehrimize katkınız için teşekkür ederiz. Raporunuz incelenmek üzere yetkililere iletilmiştir.',
        type: 'success',
        duration: 7000,
        closable: true,
      });
      methods.reset(defaultFormValues);
      setCurrentStep(1);
      navigate('/app/reports');
    } catch (error: unknown) {
      let apiErrorMessage = '';
      if (
        typeof error === 'object' &&
        error !== null &&
        'isAxiosError' in error &&
        (error as AxiosError).isAxiosError
      ) {
        apiErrorMessage =
          (error as AxiosError<{ message?: string }>).response?.data?.message ||
          '';
      } else if (error instanceof Error) {
        apiErrorMessage = error.message;
      }
      toaster.create({
        title: 'Rapor Oluşturma Başarısız',
        description:
          apiErrorMessage ||
          'Bir sorun oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyin.',
        type: 'error',
        duration: 9000,
        closable: true,
      });
      console.error(
        'Rapor oluşturma hatası (Toast):',
        apiErrorMessage || error
      );
    }
  };

  // Calculate progress percentage
  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  // Render current step component - Updated for CIMER-like flow
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <StepDepartmentSelection />; // NEW: Department selection first
      case 2:
        return <StepCategory />; // Department-filtered categories
      case 3:
        return <StepTitleDesc />; // Title and description
      case 4:
        return (
          <StepLocation
            onNext={() => void handleNext()}
            onBack={() => void handlePrevious()}
          />
        );
      case 5:
        return (
          <StepMedia
            onNext={() => void handleNext()}
            onBack={() => void handlePrevious()}
          />
        );
      default:
        return <StepDepartmentSelection />;
    }
  };

  return (
    <Container maxW="4xl" py={8}>
      <FormProvider {...methods}>
        <VStack gap={8} align="stretch">
          {/* Header */}
          <VStack gap={4} textAlign="center">
            <Heading size="xl" color="gray.800">
              Yeni Sorun Bildir
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Adım {currentStep} / {TOTAL_STEPS}:{' '}
              {stepTitles[currentStep as keyof typeof stepTitles]}
            </Text>
          </VStack>

          {/* Progress Bar */}
          <Box w="full">
            <Progress
              value={progressPercentage}
              size="lg"
              borderRadius="full"
              colorScheme="blue"
            />
            <HStack justify="space-between" mt={2}>
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <Text
                  key={i + 1}
                  fontSize="sm"
                  fontWeight={currentStep === i + 1 ? 'bold' : 'normal'}
                  color={currentStep >= i + 1 ? 'blue.600' : 'gray.400'}
                >
                  {i + 1}
                </Text>
              ))}
            </HStack>
          </Box>

          {/* Main Form Card */}
          <Card.Root>
            <Card.Body p={8}>
              <form onSubmit={e => void handleSubmit(onSubmit)(e)}>
                <VStack gap={8} align="stretch">
                  {/* Current Step Content */}
                  {renderCurrentStep()}

                  {/* Navigation Buttons */}
                  <HStack
                    justify={currentStep === 1 ? 'flex-end' : 'space-between'}
                    mt={8}
                    pt={6}
                    borderTop="1px solid"
                    borderColor="gray.100"
                  >
                    {currentStep > 1 && (
                      <Button
                        onClick={() => void handlePrevious()}
                        variant="outline"
                        size="lg"
                      >
                        <Icon as={ChevronLeft} w={5} h={5} />
                        Geri
                      </Button>
                    )}
                    {currentStep < TOTAL_STEPS ? (
                      <Button
                        onClick={() => void handleNext()}
                        colorScheme="blue"
                        size="lg"
                      >
                        İleri
                        <Icon as={ChevronRight} w={5} h={5} />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        colorScheme="green"
                        size="lg"
                        loading={isSubmitting}
                      >
                        Raporu Gönder
                        <Icon as={Send} w={5} h={5} />
                      </Button>
                    )}
                  </HStack>
                </VStack>
              </form>
            </Card.Body>
          </Card.Root>
        </VStack>
      </FormProvider>
    </Container>
  );
};
