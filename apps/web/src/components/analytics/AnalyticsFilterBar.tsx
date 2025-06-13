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
  Stack,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { AnalyticsFilters } from '@/hooks/analytics/useAnalyticsFilters';
import { useCategories } from '@/hooks/analytics/useCategories';
import { useDepartments } from '@/hooks/analytics/useDepartments';
import { hasRole, getCurrentUser } from '@/utils/auth';
import { UserRole } from '@kentnabiz/shared';

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
  // Kullanıcı rollerini kontrol et
  const isSystemAdmin = hasRole(UserRole.SYSTEM_ADMIN);
  const isDepartmentSupervisor = hasRole(UserRole.DEPARTMENT_SUPERVISOR);

  // Default tarih değerleri
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1); // 1 yıl önce
    return date.toISOString().split('T')[0];
  };

  const getDefaultEndDate = () => {
    return new Date().toISOString().split('T')[0]; // Bugün
  };

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

  // Hızlı tarih seçim fonksiyonları
  const handleQuickDateFilter = (days: number) => {
    const endDate = new Date().toISOString().split('T')[0]; // Bugün
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]; // N gün önce

    onFiltersChange({
      ...filters,
      startDate,
      endDate,
    });
  };

  // Aktif tarih aralığını kontrol et
  const isQuickDateActive = (days: number) => {
    const currentEndDate = filters.endDate || getDefaultEndDate();
    const currentStartDate = filters.startDate || getDefaultStartDate();
    const expectedEndDate = new Date().toISOString().split('T')[0];
    const expectedStartDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    return (
      currentStartDate === expectedStartDate &&
      currentEndDate === expectedEndDate
    );
  };
  return (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
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

        <Grid container spacing={3}>
          {/* Başlangıç Tarihi */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              type="date"
              fullWidth
              size="small"
              label="Başlangıç Tarihi"
              value={filters.startDate || getDefaultStartDate()}
              onChange={e => handleFilterChange('startDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="1 yıl öncesinden başlayarak"
            />
          </Grid>
          {/* Bitiş Tarihi */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              type="date"
              fullWidth
              size="small"
              label="Bitiş Tarihi"
              value={filters.endDate || getDefaultEndDate()}
              onChange={e => handleFilterChange('endDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="Bugüne kadar"
            />
          </Grid>
          {/* Hızlı Tarih Seçim Butonları */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Hızlı Seçim:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                size="small"
                variant={isQuickDateActive(7) ? 'contained' : 'outlined'}
                color={isQuickDateActive(7) ? 'primary' : 'inherit'}
                onClick={() => handleQuickDateFilter(7)}
                sx={{ minWidth: 'auto' }}
              >
                Son 7 Gün
              </Button>
              <Button
                size="small"
                variant={isQuickDateActive(14) ? 'contained' : 'outlined'}
                color={isQuickDateActive(14) ? 'primary' : 'inherit'}
                onClick={() => handleQuickDateFilter(14)}
                sx={{ minWidth: 'auto' }}
              >
                Son 14 Gün
              </Button>
              <Button
                size="small"
                variant={isQuickDateActive(30) ? 'contained' : 'outlined'}
                color={isQuickDateActive(30) ? 'primary' : 'inherit'}
                onClick={() => handleQuickDateFilter(30)}
                sx={{ minWidth: 'auto' }}
              >
                Son 30 Gün
              </Button>
              <Button
                size="small"
                variant={isQuickDateActive(90) ? 'contained' : 'outlined'}
                color={isQuickDateActive(90) ? 'primary' : 'inherit'}
                onClick={() => handleQuickDateFilter(90)}
                sx={{ minWidth: 'auto' }}
              >
                Son 3 Ay
              </Button>
              <Button
                size="small"
                variant={isQuickDateActive(365) ? 'contained' : 'outlined'}
                color={isQuickDateActive(365) ? 'primary' : 'inherit'}
                onClick={() => handleQuickDateFilter(365)}
                sx={{ minWidth: 'auto' }}
              >
                Son 1 Yıl
              </Button>
            </Stack>
          </Grid>{' '}
          {/* Departman Filtresi - Sadece Sistem Yöneticisi için */}
          {isSystemAdmin && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Kategori"
              value={filters.categoryId || ''}
              onChange={e => handleFilterChange('categoryId', e.target.value)}
              disabled={categoriesLoading}
            >
              <MenuItem value="">Tümü</MenuItem>
              {Array.isArray(categories) &&
                categories.map(category => (
                  <MenuItem key={category.id} value={category.code}>
                    {category.name}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
          {/* Durum Filtresi */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

        {/* Filtre Sıfırlama */}
        {activeFilterCount > 0 && (
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ClearIcon />}
              onClick={onResetFilters}
              size="small"
            >
              Filtreleri Temizle
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};
