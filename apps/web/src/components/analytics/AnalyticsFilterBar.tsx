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
              value={filters.startDate || ''}
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
              value={filters.endDate || ''}
              onChange={e => handleFilterChange('endDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>{' '}
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
              value={filters.categoryId || ''}
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
