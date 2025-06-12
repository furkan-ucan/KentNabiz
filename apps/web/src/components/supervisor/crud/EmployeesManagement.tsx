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
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Work as WorkIcon,
} from '@mui/icons-material';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  teamId?: string;
  teamName?: string;
  skills: string[];
  isActive: boolean;
  hireDate: string;
  salary?: number;
  avatar?: string;
}

const mockEmployees: Employee[] = [
  {
    id: '101',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    email: 'ahmet.yilmaz@kentnabiz.com',
    phone: '+90 532 123 4567',
    position: 'Takım Lideri',
    department: 'Altyapı',
    teamId: '1',
    teamName: 'Altyapı Ekibi',
    skills: ['Su Tesisatı', 'Elektrik', 'Yönetim'],
    isActive: true,
    hireDate: '2023-06-15',
    salary: 15000,
  },
  {
    id: '102',
    firstName: 'Fatma',
    lastName: 'Demir',
    email: 'fatma.demir@kentnabiz.com',
    phone: '+90 533 234 5678',
    position: 'Takım Lideri',
    department: 'Temizlik',
    teamId: '2',
    teamName: 'Temizlik Ekibi',
    skills: ['Temizlik', 'Atık Yönetimi', 'Ekip Yönetimi'],
    isActive: true,
    hireDate: '2023-07-01',
    salary: 14000,
  },
  {
    id: '103',
    firstName: 'Mehmet',
    lastName: 'Kaya',
    email: 'mehmet.kaya@kentnabiz.com',
    phone: '+90 534 345 6789',
    position: 'Takım Lideri',
    department: 'Ulaşım',
    teamId: '3',
    teamName: 'Ulaşım Ekibi',
    skills: ['Yol Onarımı', 'Trafik', 'Makine Kullanımı'],
    isActive: true,
    hireDate: '2023-08-15',
    salary: 13500,
  },
  {
    id: '104',
    firstName: 'Ayşe',
    lastName: 'Özkan',
    email: 'ayse.ozkan@kentnabiz.com',
    phone: '+90 535 456 7890',
    position: 'Saha Çalışanı',
    department: 'Temizlik',
    teamId: '2',
    teamName: 'Temizlik Ekibi',
    skills: ['Sokak Temizliği', 'Çöp Toplama'],
    isActive: true,
    hireDate: '2024-01-10',
    salary: 8500,
  },
  {
    id: '105',
    firstName: 'Ali',
    lastName: 'Çelik',
    email: 'ali.celik@kentnabiz.com',
    phone: '+90 536 567 8901',
    position: 'Teknisyen',
    department: 'Altyapı',
    teamId: '1',
    teamName: 'Altyapı Ekibi',
    skills: ['Elektrik', 'Elektronik'],
    isActive: true,
    hireDate: '2024-02-20',
    salary: 10000,
  },
];

const positions = [
  'Takım Lideri',
  'Saha Çalışanı',
  'Teknisyen',
  'Uzman',
  'Koordinatör',
  'Müfettiş',
];

const departments = [
  'Altyapı',
  'Temizlik',
  'Ulaşım',
  'Çevre',
  'Güvenlik',
  'İdari İşler',
];

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  teamId?: string;
  skills: string[];
  isActive: boolean;
  hireDate: string;
  salary?: number;
}

export const EmployeesManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    skills: [],
    isActive: true,
    hireDate: new Date().toISOString().split('T')[0],
  });

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        position: employee.position,
        department: employee.department,
        teamId: employee.teamId,
        skills: employee.skills,
        isActive: employee.isActive,
        hireDate: employee.hireDate,
        salary: employee.salary,
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        skills: [],
        isActive: true,
        hireDate: new Date().toISOString().split('T')[0],
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEmployee(null);
  };

  const handleSave = () => {
    const newEmployee: Employee = {
      id: editingEmployee?.id || Date.now().toString(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      position: formData.position,
      department: formData.department,
      teamId: formData.teamId,
      teamName: editingEmployee?.teamName || undefined,
      skills: formData.skills,
      isActive: formData.isActive,
      hireDate: formData.hireDate,
      salary: formData.salary,
    };

    if (editingEmployee) {
      setEmployees(
        employees.map(e => (e.id === editingEmployee.id ? newEmployee : e))
      );
    } else {
      setEmployees([...employees, newEmployee]);
    }

    handleCloseDialog();
  };

  const handleDelete = (employeeId: string) => {
    if (window.confirm('Bu çalışanı silmek istediğinizden emin misiniz?')) {
      setEmployees(employees.filter(e => e.id !== employeeId));
    }
  };

  const toggleStatus = (employeeId: string) => {
    setEmployees(
      employees.map(e =>
        e.id === employeeId ? { ...e, isActive: !e.isActive } : e
      )
    );
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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
          <PersonIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Çalışan Yönetimi
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          Yeni Çalışan Ekle
        </Button>
      </Box>{' '}
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {employees.filter(e => e.isActive).length}
                  </Typography>
                  <Typography color="text.secondary">Aktif Çalışan</Typography>
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
                  <WorkIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {new Set(employees.map(e => e.department)).size}
                  </Typography>
                  <Typography color="text.secondary">Departman</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Employees Table */}
      <Card>
        <CardHeader title="Çalışanlar" />
        <Divider />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Çalışan</TableCell>
                  <TableCell>İletişim</TableCell>
                  <TableCell>Pozisyon</TableCell>
                  <TableCell>Departman</TableCell>
                  <TableCell>Yetenekler</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İşe Giriş</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map(employee => (
                  <TableRow key={employee.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getInitials(employee.firstName, employee.lastName)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {employee.firstName} {employee.lastName}
                          </Typography>
                          {employee.teamName && (
                            <Typography variant="body2" color="text.secondary">
                              {employee.teamName}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <EmailIcon
                            sx={{ fontSize: 16, color: 'text.secondary' }}
                          />
                          <Typography variant="body2">
                            {employee.email}
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <PhoneIcon
                            sx={{ fontSize: 16, color: 'text.secondary' }}
                          />
                          <Typography variant="body2">
                            {employee.phone}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {employee.position}
                      </Typography>
                      {employee.salary && (
                        <Typography variant="body2" color="text.secondary">
                          {employee.salary.toLocaleString('tr-TR')} ₺
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={employee.department}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {employee.skills.slice(0, 2).map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            size="small"
                            variant="outlined"
                            sx={{ mb: 0.5 }}
                          />
                        ))}
                        {employee.skills.length > 2 && (
                          <Chip
                            label={`+${employee.skills.length - 2}`}
                            size="small"
                            variant="outlined"
                            sx={{ mb: 0.5 }}
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={employee.isActive ? 'Aktif' : 'Pasif'}
                        color={employee.isActive ? 'success' : 'default'}
                        size="small"
                        onClick={() => toggleStatus(employee.id)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(employee.hireDate).toLocaleDateString(
                          'tr-TR'
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleOpenDialog(employee)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(employee.id)}
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
          {editingEmployee ? 'Çalışanı Düzenle' : 'Yeni Çalışan Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Ad"
                value={formData.firstName}
                onChange={e =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Soyad"
                value={formData.lastName}
                onChange={e =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="E-posta"
                type="email"
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Telefon"
                value={formData.phone}
                onChange={e =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Pozisyon</InputLabel>
                <Select
                  value={formData.position}
                  label="Pozisyon"
                  onChange={e =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                >
                  {positions.map(position => (
                    <MenuItem key={position} value={position}>
                      {position}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Departman</InputLabel>
                <Select
                  value={formData.department}
                  label="Departman"
                  onChange={e =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                >
                  {departments.map(department => (
                    <MenuItem key={department} value={department}>
                      {department}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="İşe Giriş Tarihi"
                type="date"
                value={formData.hireDate}
                onChange={e =>
                  setFormData({ ...formData, hireDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Maaş (₺)"
                type="number"
                value={formData.salary || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    salary: Number(e.target.value) || undefined,
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Yetenekler (virgülle ayırın)"
                value={formData.skills.join(', ')}
                onChange={e =>
                  setFormData({
                    ...formData,
                    skills: e.target.value
                      .split(',')
                      .map(s => s.trim())
                      .filter(s => s),
                  })
                }
                helperText="Örnek: Su Tesisatı, Elektrik, Yol Onarımı"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={e =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                }
                label="Aktif Durum"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSave} variant="contained">
            {editingEmployee ? 'Güncelleştir' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
