// apps/web/src/pages/CreateReportPage/index.tsx
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Container,
  Card,
  CardContent,
  useTheme,
  LinearProgress,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { Step1_BasicInfo } from './Step1_BasicInfo';
import Step2_Location from './Step2_Location';
import Step3_Category from './Step3_Category';
import Step4_Media from './Step4_Media';
import Step5_Preview from './Step5_Preview';
import { CustomStepIcon } from './CustomStepIcon';
import type { ReportFormData } from './types';
import { reportService } from '../../lib/api';
import {
  ModernStepConnector,
  getPageContainerStyles,
  getProgressBarStyles,
  getHeaderTitleStyles,
  getMainCardStyles,
  getFloatingElementStyles,
  getNavigationButtonStyles,
  getProgressDotStyles,
  getPageFloatingElementsStyles,
  keyframes,
} from './styles';

// CreateReportDto'ya göre validasyon şeması
const reportSchema = yup.object().shape({
  title: yup
    .string()
    .max(100, 'Başlık 100 karakterden uzun olamaz.')
    .required('Başlık zorunludur.'),
  description: yup.string().required('Açıklama zorunludur.'),
  location: yup
    .object()
    .shape({
      latitude: yup.number().required('Enlem bilgisi zorunludur.'),
      longitude: yup.number().required('Boylam bilgisi zorunludur.'),
      address: yup
        .string()
        .min(10, 'Adres en az 10 karakter olmalıdır.')
        .required('Adres bilgisi zorunludur.'),
    })
    .required(),
  departmentCode: yup.string().required('Departman seçimi zorunludur.'),
  categoryId: yup.string().required('Kategori seçimi zorunludur.'),
  reportMedias: yup
    .array()
    .of(
      yup.object().shape({
        url: yup.string().required('Medya URL bilgisi zorunludur.'),
        type: yup.string().required('Medya tip bilgisi zorunludur.'),
      })
    )
    .default([]),
}) satisfies yup.ObjectSchema<ReportFormData>;

const steps = [
  { label: 'Temel Bilgiler' },
  { label: 'Konum Seçimi' },
  { label: 'Kategori Belirleme' },
  { label: 'Medya Ekleme' },
  { label: 'Önizleme & Onay' },
];

export function CreateReportPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>(
    'success'
  );

  const methods = useForm<ReportFormData>({
    resolver: yupResolver(reportSchema),
    mode: 'onChange', // Her değişiklikte validasyon yapar
    defaultValues: {
      title: '',
      description: '',
      location: {
        latitude: 37.025638, // İslahiye/Gaziantep merkez
        longitude: 36.631124,
        address: '',
      },
      departmentCode: '',
      categoryId: '',
      reportMedias: [],
    },
  });

  const progress = ((activeStep + 1) / steps.length) * 100;
  const handleNext = async () => {
    let isStepValid = false;

    // Her adım için farklı validasyon alanları
    switch (activeStep) {
      case 0: // Basic Info
        isStepValid = await methods.trigger(['title', 'description']);
        break;
      case 1: // Location
        isStepValid = await methods.trigger([
          'location.latitude',
          'location.longitude',
          'location.address',
        ]);
        break;
      case 2: // Category
        isStepValid = await methods.trigger(['departmentCode', 'categoryId']);
        break;
      case 3: // Media - isteğe bağlı, validasyon gerektirmez
        isStepValid = true;
        break;
      default:
        isStepValid = true; // Diğer adımlar için şimdilik true
        break;
    }

    if (isStepValid) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };
  const onSubmit = async (data: ReportFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Formdan gelen verileri API'nin beklediği formata dönüştür
      const requestData = {
        title: data.title,
        description: data.description,
        address: data.location.address,
        location: {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        },
        departmentCode: data.departmentCode,
        categoryId: parseInt(data.categoryId), // String'den number'a çevir
        reportMedias: data.reportMedias,
      };

      await reportService.createReport(requestData);

      // Cache'i invalidate et ki dashboard güncellensin
      queryClient.invalidateQueries({ queryKey: ['myReports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });

      setSnackbarSeverity('success');
      setSnackbarMessage(
        'Rapor başarıyla oluşturuldu! Yönlendiriliyorsunuz...'
      );
      setSnackbarOpen(true);

      // 2 saniye sonra dashboard'a yönlendir
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: unknown) {
      console.error('Rapor oluşturma hatası:', error);
      setSnackbarSeverity('error');

      // Error handling with proper type checking
      let errorMessage =
        'Rapor oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }

      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <Step1_BasicInfo />;
      case 1:
        return <Step2_Location />;
      case 2:
        return <Step3_Category />;
      case 3:
        return <Step4_Media />;
      case 4:
        return <Step5_Preview />;
      default:
        return 'Bilinmeyen Adım';
    }
  };
  return (
    <Box sx={getPageContainerStyles()}>
      {/* Progress Bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6 }}
        style={{ transformOrigin: 'left' }}
      >
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={getProgressBarStyles(theme)}
        />
      </motion.div>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box textAlign="center" mb={5}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={getHeaderTitleStyles(theme)}
            >
              Yeni Rapor Oluştur
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto', mb: 2 }}
            >
              Şehrimizdeki sorunları bildirin ve çözüm sürecinin bir parçası
              olun
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Adım {activeStep + 1} / {steps.length} - {steps[activeStep].label}
            </Typography>
          </Box>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card elevation={0} sx={getMainCardStyles(theme)}>
            <CardContent
              sx={{ p: { xs: 3, sm: 4, md: 5 }, position: 'relative' }}
            >
              {/* Floating decoration elements */}
              <Box sx={getFloatingElementStyles(theme).topRight} />
              <Box sx={getFloatingElementStyles(theme).bottomLeft} />

              {/* Custom Stepper */}
              <Box mb={5}>
                <Stepper
                  activeStep={activeStep}
                  alternativeLabel
                  connector={<ModernStepConnector />}
                >
                  {steps.map((step, index) => (
                    <Step key={step.label}>
                      <StepLabel StepIconComponent={CustomStepIcon}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: activeStep === index ? 600 : 400,
                            color:
                              activeStep === index
                                ? 'primary.main'
                                : 'text.secondary',
                          }}
                        >
                          {step.label}
                        </Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              <FormProvider {...methods}>
                <form onSubmit={e => e.preventDefault()}>
                  {/* Step Content with Animation */}
                  <Box sx={{ minHeight: 300 }}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {getStepContent(activeStep)}
                      </motion.div>
                    </AnimatePresence>
                  </Box>

                  {/* Navigation Buttons */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 5,
                      pt: 3,
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05, x: -5 }}
                      whileTap={{ scale: 0.95 }}
                      animate={{ opacity: activeStep === 0 ? 0.5 : 1 }}
                    >
                      <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        size="large"
                        startIcon={<ArrowBackIcon />}
                        sx={getNavigationButtonStyles(theme).back}
                      >
                        Geri
                      </Button>
                    </motion.div>

                    {/* Progress indicator */}
                    <Box textAlign="center">
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mb: 1, display: 'block' }}
                      >
                        {progress.toFixed(0)}% tamamlandı
                      </Typography>
                      <Box display="flex" gap={1} justifyContent="center">
                        {steps.map((_, index) => (
                          <motion.div
                            key={index}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Box
                              sx={getProgressDotStyles(
                                theme,
                                index <= activeStep
                              )}
                            />
                          </motion.div>
                        ))}
                      </Box>
                    </Box>

                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {activeStep === steps.length - 1 ? (
                        <Button
                          variant="contained"
                          size="large"
                          onClick={() => void methods.handleSubmit(onSubmit)()}
                          disabled={isSubmitting}
                          endIcon={
                            isSubmitting ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <CheckIcon />
                            )
                          }
                          sx={getNavigationButtonStyles(theme).submit}
                        >
                          {isSubmitting ? 'Oluşturuluyor...' : 'Raporu Oluştur'}
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          size="large"
                          onClick={() => void handleNext()}
                          endIcon={<TrendingUpIcon />}
                          sx={getNavigationButtonStyles(theme).next}
                        >
                          İleri
                        </Button>
                      )}
                    </motion.div>
                  </Box>
                </form>
              </FormProvider>
            </CardContent>
          </Card>
        </motion.div>

        {/* Floating Elements */}
        {getPageFloatingElementsStyles().map((style, index) => (
          <Box key={index} sx={style} />
        ))}
      </Container>

      {/* CSS Keyframes for animations */}
      <style>{keyframes}</style>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
