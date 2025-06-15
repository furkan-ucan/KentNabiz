// apps/web/src/components/analytics/AnalyticsFilterBar.tsx
import {
  Box,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Chip,
  Typography,
  Grid,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { AnalyticsFilters } from '@/hooks/analytics/useAnalyticsFilters';
import { useCategories } from '@/hooks/analytics/useCategories';
import { useDepartments } from '@/hooks/analytics/useDepartments';
import { hasRole, getCurrentUser } from '@/utils/auth';
import { UserRole } from '@kentnabiz/shared';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { format, subDays } from 'date-fns';

interface AnalyticsFilterBarProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  onResetFilters: () => void;
}

// Durum filtreleri (Backend ReportStatus enum'ına uygun)
const statusOptions = [
  { value: '', label: 'Tümü' },
  { value: 'OPEN', label: 'Açık' },
  { value: 'IN_REVIEW', label: 'İncelemede' },
  { value: 'IN_PROGRESS', label: 'İşlemde' },
  { value: 'DONE', label: 'Tamamlandı' },
  { value: 'REJECTED', label: 'Reddedildi' },
  { value: 'CANCELLED', label: 'İptal Edildi' },
];

export const AnalyticsFilterBar = ({
  filters,
  onFiltersChange,
  onResetFilters,
}: AnalyticsFilterBarProps) => {
  // Hover state için
  const [isHovered, setIsHovered] = useState(false);

  // Scroll direction hook - auto-hiding için
  const scrollDirection = useScrollDirection({
    threshold: 10,
    debounceMs: 100,
  });

  // Kullanıcı rollerini kontrol et
  const isSystemAdmin = hasRole(UserRole.SYSTEM_ADMIN);
  const isDepartmentSupervisor = hasRole(UserRole.DEPARTMENT_SUPERVISOR);

  // Departmanları backend'den çek (sadece sistem yöneticisi için)
  const { departments, loading: departmentsLoading } = useDepartments();
  // Kategorileri seçili departmana göre çek
  // Supervisor ise kendi departmanı, sistem admin ise seçili departman
  let selectedDepartmentId = null;
  if (isDepartmentSupervisor) {
    // Supervisor: JWT token'dan kullanıcı bilgisini al ve departmanını kullan
    const currentUser = getCurrentUser();

    if (currentUser?.departmentId) {
      selectedDepartmentId = currentUser.departmentId;
    }
  } else if (isSystemAdmin && filters.departmentId) {
    selectedDepartmentId = parseInt(filters.departmentId, 10);
  }

  const { categories, loading: categoriesLoading } = useCategories({
    departmentId: selectedDepartmentId,
  });

  // Aktif filtre sayısını hesapla
  const activeFilterCount = Object.values(filters).filter(
    value => value !== null && value !== undefined && value !== ''
  ).length;

  const handleFilterChange = (
    key: keyof AnalyticsFilters,
    value: string | null
  ) => {
    // Departman değiştiğinde kategoriyi sıfırla
    if (key === 'departmentId') {
      onFiltersChange({
        ...filters,
        [key]: value || null,
        categoryId: null, // Kategoriyi sıfırla
      });
    } else {
      onFiltersChange({
        ...filters,
        [key]: value || null,
      });
    }
  };

  // Default tarih değerlerini ayarla (eğer boşsa)
  const getDefaultStartDate = () => {
    return filters.startDate || format(subDays(new Date(), 30), 'yyyy-MM-dd');
  };

  const getDefaultEndDate = () => {
    return filters.endDate || format(new Date(), 'yyyy-MM-dd');
  };

  // Bar'ın görünür olup olmayacağını belirle
  // Hover durumunda veya yukarı scroll'da görünür olacak
  const shouldShowBar = isHovered || scrollDirection !== 'down';

  return (
    <Card
      elevation={2}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: 'sticky',
        top: shouldShowBar ? 0 : -100, // Hover veya yukarı scroll'da göster
        zIndex: 1000,
        transition: 'top 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)', // Smooth transition
        backgroundColor: 'background.paper',
        borderRadius: 2,
        mb: 2,
      }}
    >
      <CardContent>
        <Box
          sx={{
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FilterIcon color="primary" />
            <Typography variant="h6" component="h2">
              Filtreler
            </Typography>
            {activeFilterCount > 0 && (
              <Chip
                label={`${activeFilterCount} filtre aktif`}
                color="primary"
                size="small"
              />
            )}
          </Box>

          {/* Filtreleri Temizle Butonu - Sağ üstte */}
          {activeFilterCount > 0 && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ClearIcon />}
              onClick={onResetFilters}
              size="small"
            >
              Filtreleri Temizle
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Başlangıç Tarihi */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              type="date"
              fullWidth
              size="small"
              label="Başlangıç Tarihi"
              value={getDefaultStartDate()}
              onChange={e => handleFilterChange('startDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          {/* Bitiş Tarihi */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              type="date"
              fullWidth
              size="small"
              label="Bitiş Tarihi"
              value={getDefaultEndDate()}
              onChange={e => handleFilterChange('endDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          {/* Departman Filtresi - Sadece Sistem Yöneticisi için */}
          {isSystemAdmin && (
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              {' '}
              <TextField
                select
                fullWidth
                size="small"
                label="Departman"
                value={filters.departmentId || ''}
                onChange={e =>
                  handleFilterChange('departmentId', e.target.value)
                }
                disabled={departmentsLoading}
              >
                <MenuItem value="">Tümü</MenuItem>
                {departments.map(department => (
                  <MenuItem
                    key={department.id}
                    value={department.id.toString()}
                  >
                    {department.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}{' '}
          {/* Kategori Filtresi */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Kategori"
              value={
                categoriesLoading ||
                !Array.isArray(categories) ||
                !categories.find(c => c.id.toString() === filters.categoryId)
                  ? ''
                  : filters.categoryId || ''
              }
              onChange={e => handleFilterChange('categoryId', e.target.value)}
              disabled={categoriesLoading}
            >
              <MenuItem value="">Tümü</MenuItem>
              {Array.isArray(categories) &&
                categories.map(category => (
                  <MenuItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
          {/* Durum Filtresi */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Durum"
              value={filters.status || ''}
              onChange={e => handleFilterChange('status', e.target.value)}
            >
              {statusOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
