// apps/web/src/pages/CreateReportPage/Step3_Category.tsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Fade,
  Card,
  CardContent,
  CardActionArea,
  Skeleton,
  IconButton,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Engineering as EngineeringIcon,
  LocalHospital as HealthIcon,
  School as EducationIcon,
  Traffic as TrafficIcon,
  Park as ParkIcon,
  Security as SecurityIcon,
  Build as MaintenanceIcon,
  WaterDrop as WaterIcon,
  ElectricBolt as ElectricIcon,
  Category as DefaultIcon,
  CheckCircle as CheckIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { departmentService } from '../../lib/api';
import { stepBoxStyle } from './styles';
import type { Department, Category } from '@/lib/api';
import { ReportFormData } from './types';

// Departman ikonlarını döndüren helper fonksiyon
const getDepartmentIcon = (departmentCode: string) => {
  const iconMap: Record<string, React.ComponentType> = {
    GENERAL_AFFAIRS: BusinessIcon,
    ROADS_AND_INFRASTRUCTURE: EngineeringIcon,
    PLANNING_URBANIZATION: EngineeringIcon,
    WATER_AND_SEWERAGE: WaterIcon,
    STREET_LIGHTING: ElectricIcon,
    PARKS_AND_GARDENS: ParkIcon,
    ENVIRONMENTAL_PROTECTION: ParkIcon,
    CLEANING_SERVICES: MaintenanceIcon,
    TRANSPORTATION_SERVICES: TrafficIcon,
    TRAFFIC_SERVICES: TrafficIcon,
    MUNICIPAL_POLICE: SecurityIcon,
    FIRE_DEPARTMENT: SecurityIcon,
    HEALTH_AFFAIRS: HealthIcon,
    VETERINARY_SERVICES: HealthIcon,
    SOCIAL_ASSISTANCE: EducationIcon,
    CULTURE_AND_SOCIAL_AFFAIRS: EducationIcon,
  };

  const IconComponent = iconMap[departmentCode] || DefaultIcon;
  return <IconComponent />;
};

const Step3_Category: React.FC = () => {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ReportFormData>();

  const selectedDepartmentCode = watch('departmentCode');
  const selectedCategoryId = watch('categoryId');
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [showCategories, setShowCategories] = useState(false);

  // Departmanları yükle
  const {
    data: departments = [],
    isLoading: departmentsLoading,
    isError: departmentsError,
    error: departmentsErrorDetails,
  } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: departmentService.getDepartments,
  });

  // Seçilen departmana göre kategorileri yükle
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: categoriesErrorDetails,
  } = useQuery<Category[]>({
    queryKey: ['categories', selectedDepartmentCode],
    queryFn: () =>
      departmentService.getCategoriesByDepartment(selectedDepartmentCode),
    enabled: !!selectedDepartmentCode,
  });

  // Departman değiştiğinde kategori seçimini temizle
  useEffect(() => {
    if (selectedDepartmentCode) {
      const dept = departments.find(d => d.code === selectedDepartmentCode);
      setSelectedDepartment(dept || null);
      setShowCategories(true);

      // Kategori seçimini temizle
      setValue('categoryId', '');
      setSelectedCategory(null);
    }
  }, [selectedDepartmentCode, departments, setValue]);

  // Kategori seçildiğinde state'i güncelle
  useEffect(() => {
    if (selectedCategoryId) {
      const cat = categories.find(c => c.id.toString() === selectedCategoryId);
      setSelectedCategory(cat || null);
    }
  }, [selectedCategoryId, categories]);

  const handleDepartmentChange = (departmentCode: string) => {
    setValue('departmentCode', departmentCode);
  };

  const handleCategoryChange = (categoryId: string) => {
    setValue('categoryId', categoryId);
  };

  const handleBackToDepartments = () => {
    setShowCategories(false);
    setValue('departmentCode', '');
    setValue('categoryId', '');
    setSelectedDepartment(null);
    setSelectedCategory(null);
  };

  return (
    <Box sx={stepBoxStyle}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 600,
          color: 'primary.main',
          mb: 3,
        }}
      >
        Kategori & Departman Seçimi
      </Typography>
      <Typography
        variant="body1"
        sx={{
          mb: 4,
          color: 'text.secondary',
          lineHeight: 1.6,
        }}
      >
        {!showCategories
          ? 'Raporunuzun doğru departmana iletilmesi için önce ilgili departmanı seçin.'
          : 'Şimdi uygun kategoriyi seçin.'}
      </Typography>
      {/* Departman Seçimi */}
      {!showCategories && (
        <Fade in={true}>
          <Box>
            {' '}
            {departmentsLoading ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                  },
                  gap: 2,
                }}
              >
                {[...Array(6)].map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="rectangular"
                    height={120}
                    sx={{ borderRadius: 2 }}
                  />
                ))}
              </Box>
            ) : departmentsError ? (
              <Alert severity="error" sx={{ borderRadius: 2, mb: 3 }}>
                <Typography variant="body2">
                  Departmanlar yüklenirken hata oluştu:{' '}
                  {departmentsErrorDetails?.message || 'Bilinmeyen hata'}
                </Typography>
              </Alert>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                  },
                  gap: 2,
                }}
              >
                {departments.map((dept: Department) => (
                  <Box key={dept.code}>
                    <Card
                      sx={{
                        height: '100%',
                        background:
                          'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(25, 118, 210, 0.3)',
                        },
                      }}
                    >
                      <CardActionArea
                        onClick={() => handleDepartmentChange(dept.code)}
                        sx={{ height: '100%', p: 2 }}
                      >
                        <CardContent sx={{ textAlign: 'center', p: 0 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              mb: 2,
                              '& > svg': {
                                fontSize: 48,
                                color: 'primary.main',
                              },
                            }}
                          >
                            {getDepartmentIcon(dept.code)}
                          </Box>{' '}
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{
                              fontWeight: 600,
                              color: 'text.primary',
                              mb: 2,
                            }}
                          >
                            {dept.name}
                          </Typography>
                          {dept.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                fontSize: '0.8rem',
                                lineHeight: 1.4,
                              }}
                            >
                              {dept.description}
                            </Typography>
                          )}
                        </CardContent>
                      </CardActionArea>{' '}
                    </Card>
                  </Box>
                ))}
              </Box>
            )}
            {/* Validation Error */}
            {errors.departmentCode && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                <Typography variant="body2">
                  {errors.departmentCode.message}
                </Typography>
              </Alert>
            )}
          </Box>
        </Fade>
      )}{' '}
      {/* Kategori Seçimi */}
      {showCategories && selectedDepartment && (
        <Fade in={true}>
          <Box>
            {/* Seçilen Departman ve Geri Butonu */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                p: 2,
                borderRadius: 2,
                background:
                  'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%)',
                border: '1px solid rgba(25, 118, 210, 0.2)',
              }}
            >
              <IconButton
                onClick={handleBackToDepartments}
                sx={{ mr: 2, color: 'primary.main' }}
              >
                <ArrowBackIcon />
              </IconButton>

              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="body1"
                  color="primary.main"
                  sx={{ fontWeight: 600 }}
                >
                  {selectedDepartment.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Kategori seçin veya farklı departman için geri dönün
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  '& > svg': { fontSize: 32, color: 'primary.main' },
                }}
              >
                {getDepartmentIcon(selectedDepartment.code)}
              </Box>
            </Box>
            {/* Kategoriler */}{' '}
            {categoriesLoading ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 2,
                }}
              >
                {[...Array(4)].map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="rectangular"
                    height={100}
                    sx={{ borderRadius: 2 }}
                  />
                ))}
              </Box>
            ) : categoriesError ? (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                <Typography variant="body2">
                  Kategoriler yüklenirken hata oluştu:{' '}
                  {categoriesErrorDetails?.message || 'Bilinmeyen hata'}
                </Typography>
              </Alert>
            ) : categories.length === 0 ? (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                <Typography variant="body2">
                  Bu departman için kategori bulunamadı
                </Typography>
              </Alert>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 2,
                }}
              >
                {categories.map((cat: Category) => {
                  const isSelected = selectedCategoryId === cat.id.toString();

                  return (
                    <Box key={cat.id}>
                      <Card
                        sx={{
                          height: '100%',
                          background: isSelected
                            ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.1) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                          backdropFilter: 'blur(10px)',
                          border: isSelected
                            ? '2px solid rgba(76, 175, 80, 0.5)'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                            border: isSelected
                              ? '2px solid rgba(76, 175, 80, 0.7)'
                              : '1px solid rgba(25, 118, 210, 0.3)',
                          },
                        }}
                      >
                        <CardActionArea
                          onClick={() =>
                            handleCategoryChange(cat.id.toString())
                          }
                          sx={{ height: '100%', p: 2 }}
                        >
                          <CardContent sx={{ p: 0, position: 'relative' }}>
                            {isSelected && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  color: 'success.main',
                                }}
                              >
                                <CheckIcon fontSize="small" />
                              </Box>
                            )}

                            <Typography
                              variant="h6"
                              gutterBottom
                              sx={{
                                fontWeight: 600,
                                color: isSelected
                                  ? 'success.main'
                                  : 'text.primary',
                                pr: isSelected ? 4 : 0,
                              }}
                            >
                              {cat.name}
                            </Typography>

                            {cat.description && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  lineHeight: 1.5,
                                }}
                              >
                                {cat.description}
                              </Typography>
                            )}
                          </CardContent>
                        </CardActionArea>{' '}
                      </Card>
                    </Box>
                  );
                })}
              </Box>
            )}
            {/* Validation Error */}
            {errors.categoryId && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                <Typography variant="body2">
                  {errors.categoryId.message}
                </Typography>
              </Alert>
            )}
            {/* Seçilen Kategori Bilgisi */}
            {selectedCategory && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 2,
                  background:
                    'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                  border: '1px solid rgba(76, 175, 80, 0.2)',
                }}
              >
                <Typography
                  variant="body2"
                  color="success.main"
                  sx={{ fontWeight: 600 }}
                >
                  ✓ Seçilen Kategori: {selectedCategory.name}
                </Typography>
                {selectedCategory.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {selectedCategory.description}
                  </Typography>
                )}{' '}
              </Box>
            )}
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default Step3_Category;
