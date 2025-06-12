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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as DepartmentIcon,
  People as PeopleIcon,
} from '@mui/icons-material';

interface Department {
  id: string;
  name: string;
  description: string;
  managerName: string;
  managerId: string;
  employeeCount: number;
  budget: number;
  isActive: boolean;
  createdAt: string;
}

const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Altyapı Hizmetleri',
    description: 'Su, elektrik, doğalgaz ve telekomünikasyon altyapısı',
    managerName: 'Ali Vural',
    managerId: 'M001',
    employeeCount: 25,
    budget: 500000,
    isActive: true,
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    name: 'Çevre ve Temizlik',
    description: 'Şehir temizliği, atık yönetimi ve çevre düzenlemesi',
    managerName: 'Ayşe Kaya',
    managerId: 'M002',
    employeeCount: 40,
    budget: 350000,
    isActive: true,
    createdAt: '2024-01-15',
  },
  {
    id: '3',
    name: 'Ulaşım ve Trafik',
    description: 'Yol bakımı, trafik düzenlemesi ve ulaşım koordinasyonu',
    managerName: 'Mehmet Özkan',
    managerId: 'M003',
    employeeCount: 18,
    budget: 450000,
    isActive: true,
    createdAt: '2024-01-20',
  },
];

interface DepartmentFormData {
  name: string;
  description: string;
  managerName: string;
  managerId: string;
  budget: number;
  isActive: boolean;
}

export const DepartmentsManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    description: '',
    managerName: '',
    managerId: '',
    budget: 0,
    isActive: true,
  });

  const handleOpenDialog = (department?: Department) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        name: department.name,
        description: department.description,
        managerName: department.managerName,
        managerId: department.managerId,
        budget: department.budget,
        isActive: department.isActive,
      });
    } else {
      setEditingDepartment(null);
      setFormData({
        name: '',
        description: '',
        managerName: '',
        managerId: '',
        budget: 0,
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingDepartment(null);
  };

  const handleSave = () => {
    const newDepartment: Department = {
      id: editingDepartment?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      managerName: formData.managerName,
      managerId: formData.managerId,
      employeeCount: editingDepartment?.employeeCount || 0,
      budget: formData.budget,
      isActive: formData.isActive,
      createdAt:
        editingDepartment?.createdAt || new Date().toISOString().split('T')[0],
    };

    if (editingDepartment) {
      setDepartments(
        departments.map(d =>
          d.id === editingDepartment.id ? newDepartment : d
        )
      );
    } else {
      setDepartments([...departments, newDepartment]);
    }

    handleCloseDialog();
  };

  const handleDelete = (departmentId: string) => {
    if (window.confirm('Bu departmanı silmek istediğinizden emin misiniz?')) {
      setDepartments(departments.filter(d => d.id !== departmentId));
    }
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
          <DepartmentIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Departman Yönetimi
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          Yeni Departman Ekle
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <DepartmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {departments.filter(d => d.isActive).length}
                  </Typography>
                  <Typography color="text.secondary">
                    Aktif Departman
                  </Typography>
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
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {departments.reduce(
                      (acc, dept) => acc + dept.employeeCount,
                      0
                    )}
                  </Typography>
                  <Typography color="text.secondary">Toplam Çalışan</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>₺</Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {(
                      departments.reduce((acc, dept) => acc + dept.budget, 0) /
                      1000000
                    ).toFixed(1)}
                    M
                  </Typography>
                  <Typography color="text.secondary">
                    Toplam Bütçe (₺)
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Departments Table */}
      <Card>
        <CardHeader title="Departmanlar" />
        <Divider />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Departman Adı</TableCell>
                  <TableCell>Açıklama</TableCell>
                  <TableCell>Müdür</TableCell>
                  <TableCell>Çalışan Sayısı</TableCell>
                  <TableCell>Bütçe</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Oluşturulma</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.map(department => (
                  <TableRow key={department.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {department.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {department.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {department.managerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {department.managerId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${department.employeeCount} kişi`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {department.budget.toLocaleString('tr-TR')} ₺
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={department.isActive ? 'Aktif' : 'Pasif'}
                        color={department.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(department.createdAt).toLocaleDateString(
                          'tr-TR'
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleOpenDialog(department)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(department.id)}
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
          {editingDepartment ? 'Departmanı Düzenle' : 'Yeni Departman Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Departman Adı"
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
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Müdür Adı"
                value={formData.managerName}
                onChange={e =>
                  setFormData({ ...formData, managerName: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Müdür ID"
                value={formData.managerId}
                onChange={e =>
                  setFormData({ ...formData, managerId: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Bütçe (₺)"
                type="number"
                value={formData.budget}
                onChange={e =>
                  setFormData({ ...formData, budget: Number(e.target.value) })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSave} variant="contained">
            {editingDepartment ? 'Güncelleştir' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
