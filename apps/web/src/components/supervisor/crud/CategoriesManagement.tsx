import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  ColorLens as ColorIcon,
} from '@mui/icons-material';

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  parentId?: string;
  isActive: boolean;
  reportCount: number;
  createdAt: string;
}

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Altyapı Sorunları',
    description: 'Su, elektrik, doğalgaz ve kanalizasyon sorunları',
    color: '#1976d2',
    icon: '🔧',
    isActive: true,
    reportCount: 45,
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    name: 'Temizlik',
    description: 'Çöp toplama, sokak temizliği ve hijyen sorunları',
    color: '#2e7d32',
    icon: '🧹',
    isActive: true,
    reportCount: 32,
    createdAt: '2024-01-15',
  },
  {
    id: '3',
    name: 'Ulaşım',
    description: 'Yol, kaldırım, trafik işaretleri ve park sorunları',
    color: '#ed6c02',
    icon: '🚗',
    isActive: true,
    reportCount: 28,
    createdAt: '2024-01-20',
  },
  {
    id: '4',
    name: 'Çevre ve Yeşil Alan',
    description: 'Park, bahçe ve çevre düzenlemesi',
    color: '#388e3c',
    icon: '🌳',
    isActive: true,
    reportCount: 15,
    createdAt: '2024-02-01',
  },
  {
    id: '5',
    name: 'Güvenlik',
    description: 'Aydınlatma, güvenlik ve asayiş sorunları',
    color: '#d32f2f',
    icon: '🛡️',
    isActive: true,
    reportCount: 22,
    createdAt: '2024-02-05',
  },
];

const colorOptions = [
  { value: '#1976d2', label: 'Mavi' },
  { value: '#2e7d32', label: 'Yeşil' },
  { value: '#ed6c02', label: 'Turuncu' },
  { value: '#d32f2f', label: 'Kırmızı' },
  { value: '#7b1fa2', label: 'Mor' },
  { value: '#388e3c', label: 'Koyu Yeşil' },
  { value: '#1565c0', label: 'Koyu Mavi' },
  { value: '#5d4037', label: 'Kahverengi' },
];

const iconOptions = [
  '🔧',
  '🧹',
  '🚗',
  '🌳',
  '🛡️',
  '🏠',
  '⚡',
  '💧',
  '🚶',
  '🏥',
  '🎯',
  '📋',
];

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  parentId?: string;
  isActive: boolean;
}

export const CategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    color: '#1976d2',
    icon: '📋',
    isActive: true,
  });

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        color: category.color,
        icon: category.icon,
        parentId: category.parentId,
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        color: '#1976d2',
        icon: '📋',
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
  };

  const handleSave = () => {
    const newCategory: Category = {
      id: editingCategory?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      color: formData.color,
      icon: formData.icon,
      parentId: formData.parentId,
      isActive: formData.isActive,
      reportCount: editingCategory?.reportCount || 0,
      createdAt:
        editingCategory?.createdAt || new Date().toISOString().split('T')[0],
    };

    if (editingCategory) {
      setCategories(
        categories.map(c => (c.id === editingCategory.id ? newCategory : c))
      );
    } else {
      setCategories([...categories, newCategory]);
    }

    handleCloseDialog();
  };

  const handleDelete = (categoryId: string) => {
    if (window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      setCategories(categories.filter(c => c.id !== categoryId));
    }
  };

  const toggleStatus = (categoryId: string) => {
    setCategories(
      categories.map(c =>
        c.id === categoryId ? { ...c, isActive: !c.isActive } : c
      )
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CategoryIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Kategori Yönetimi
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          Yeni Kategori Ekle
        </Button>
      </Box>{' '}
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <CategoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {categories.filter(c => c.isActive).length}
                  </Typography>
                  <Typography color="text.secondary">Aktif Kategori</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <ColorIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {categories.reduce((acc, cat) => acc + cat.reportCount, 0)}
                  </Typography>
                  <Typography color="text.secondary">Toplam Rapor</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Categories Table */}
      <Card>
        <CardHeader title="Kategoriler" />
        <Divider />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Açıklama</TableCell>
                  <TableCell>Renk</TableCell>
                  <TableCell>Rapor Sayısı</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Oluşturulma</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map(category => (
                  <TableRow key={category.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            backgroundColor: category.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                          }}
                        >
                          {category.icon}
                        </Box>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {category.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {category.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: category.color,
                          border: '2px solid',
                          borderColor: 'divider',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${category.reportCount} rapor`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={category.isActive ? 'Aktif' : 'Pasif'}
                        color={category.isActive ? 'success' : 'default'}
                        size="small"
                        onClick={() => toggleStatus(category.id)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(category.createdAt).toLocaleDateString(
                          'tr-TR'
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleOpenDialog(category)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(category.id)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {' '}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Kategori Adı"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Açıklama"
                multiline
                rows={3}
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Grid>{' '}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Renk</InputLabel>
                <Select
                  value={formData.color}
                  label="Renk"
                  onChange={e =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                >
                  {colorOptions.map(color => (
                    <MenuItem key={color.value} value={color.value}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: color.value,
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        />
                        <span>{color.label}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>İcon</InputLabel>
                <Select
                  value={formData.icon}
                  label="İcon"
                  onChange={e =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                >
                  {iconOptions.map(icon => (
                    <MenuItem key={icon} value={icon}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                        <span>{icon}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSave} variant="contained">
            {editingCategory ? 'Güncelleştir' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
