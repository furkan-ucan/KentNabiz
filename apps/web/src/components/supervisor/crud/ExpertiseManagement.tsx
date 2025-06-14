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
  School as ExpertiseIcon,
  Star as StarIcon,
  Timeline as LevelIcon,
} from '@mui/icons-material';

interface Expertise {
  id: string;
  name: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  requiredCertificates: string[];
  relatedSkills: string[];
  employeeCount: number;
  isActive: boolean;
  createdAt: string;
}

const mockExpertise: Expertise[] = [
  {
    id: '1',
    name: 'Su Tesisatı',
    description: 'Su dağıtım sistemleri, borular ve vana onarımları',
    category: 'Altyapı',
    level: 'Advanced',
    requiredCertificates: ['Tesisatçı Belgesi', 'İş Güvenliği Sertifikası'],
    relatedSkills: ['Kaynak', 'Boru Döşeme', 'Kaçak Testi'],
    employeeCount: 12,
    isActive: true,
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    name: 'Elektrik Tesisatı',
    description: 'Elektrik dağıtım, aydınlatma ve güç sistemleri',
    category: 'Altyapı',
    level: 'Expert',
    requiredCertificates: ['Elektrikçi Belgesi', 'Yüksek Gerilim Sertifikası'],
    relatedSkills: ['Kablo Çekimi', 'Pano Montajı', 'Arıza Tespiti'],
    employeeCount: 8,
    isActive: true,
    createdAt: '2024-01-15',
  },
  {
    id: '3',
    name: 'Yol Onarımı',
    description: 'Asfalt döküm, yol işaretlemesi ve bakım işleri',
    category: 'Ulaşım',
    level: 'Intermediate',
    requiredCertificates: ['İş Makinesi Ehliyeti', 'Asfalt Uzmanlık Belgesi'],
    relatedSkills: ['Asfalt Döküm', 'Çizgi Çekimi', 'Makine Kullanımı'],
    employeeCount: 15,
    isActive: true,
    createdAt: '2024-01-20',
  },
  {
    id: '4',
    name: 'Atık Yönetimi',
    description: 'Çöp toplama, geri dönüşüm ve çevre temizliği',
    category: 'Temizlik',
    level: 'Beginner',
    requiredCertificates: ['Çevre Yönetimi Sertifikası'],
    relatedSkills: ['Atık Ayrıştırma', 'Temizlik Ekipmanları', 'Hijyen'],
    employeeCount: 20,
    isActive: true,
    createdAt: '2024-02-01',
  },
  {
    id: '5',
    name: 'Peyzaj Düzenlemesi',
    description: 'Park ve bahçe düzenlemesi, ağaçlandırma',
    category: 'Çevre',
    level: 'Intermediate',
    requiredCertificates: ['Peyzaj Mimarı Sertifikası', 'Bahçıvanlık Belgesi'],
    relatedSkills: ['Bitki Bakımı', 'Sulama Sistemleri', 'Ağaç Budama'],
    employeeCount: 10,
    isActive: true,
    createdAt: '2024-02-10',
  },
];

const categories = [
  'Altyapı',
  'Temizlik',
  'Ulaşım',
  'Çevre',
  'Güvenlik',
  'İdari İşler',
  'Teknoloji',
];

const levels: Array<{
  value: Expertise['level'];
  label: string;
  color: string;
}> = [
  { value: 'Beginner', label: 'Başlangıç', color: '#4caf50' },
  { value: 'Intermediate', label: 'Orta', color: '#ff9800' },
  { value: 'Advanced', label: 'İleri', color: '#2196f3' },
  { value: 'Expert', label: 'Uzman', color: '#9c27b0' },
];

interface ExpertiseFormData {
  name: string;
  description: string;
  category: string;
  level: Expertise['level'];
  requiredCertificates: string[];
  relatedSkills: string[];
  isActive: boolean;
}

export const ExpertiseManagement: React.FC = () => {
  const [expertise, setExpertise] = useState<Expertise[]>(mockExpertise);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpertise, setEditingExpertise] = useState<Expertise | null>(
    null
  );
  const [formData, setFormData] = useState<ExpertiseFormData>({
    name: '',
    description: '',
    category: '',
    level: 'Beginner',
    requiredCertificates: [],
    relatedSkills: [],
    isActive: true,
  });

  const handleOpenDialog = (exp?: Expertise) => {
    if (exp) {
      setEditingExpertise(exp);
      setFormData({
        name: exp.name,
        description: exp.description,
        category: exp.category,
        level: exp.level,
        requiredCertificates: exp.requiredCertificates,
        relatedSkills: exp.relatedSkills,
        isActive: exp.isActive,
      });
    } else {
      setEditingExpertise(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        level: 'Beginner',
        requiredCertificates: [],
        relatedSkills: [],
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingExpertise(null);
  };

  const handleSave = () => {
    const newExpertise: Expertise = {
      id: editingExpertise?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      category: formData.category,
      level: formData.level,
      requiredCertificates: formData.requiredCertificates,
      relatedSkills: formData.relatedSkills,
      employeeCount: editingExpertise?.employeeCount || 0,
      isActive: formData.isActive,
      createdAt:
        editingExpertise?.createdAt || new Date().toISOString().split('T')[0],
    };

    if (editingExpertise) {
      setExpertise(
        expertise.map(e => (e.id === editingExpertise.id ? newExpertise : e))
      );
    } else {
      setExpertise([...expertise, newExpertise]);
    }

    handleCloseDialog();
  };

  const handleDelete = (expertiseId: string) => {
    if (
      window.confirm('Bu uzmanlık alanını silmek istediğinizden emin misiniz?')
    ) {
      setExpertise(expertise.filter(e => e.id !== expertiseId));
    }
  };

  const toggleStatus = (expertiseId: string) => {
    setExpertise(
      expertise.map(e =>
        e.id === expertiseId ? { ...e, isActive: !e.isActive } : e
      )
    );
  };

  const getLevelConfig = (level: Expertise['level']) => {
    return levels.find(l => l.value === level) || levels[0];
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
          <ExpertiseIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Uzmanlık Alanları
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          Yeni Uzmanlık Ekle
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <ExpertiseIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {expertise.filter(e => e.isActive).length}
                  </Typography>
                  <Typography color="text.secondary">Aktif Uzmanlık</Typography>
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
                  <StarIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {expertise.reduce((acc, exp) => acc + exp.employeeCount, 0)}
                  </Typography>
                  <Typography color="text.secondary">Uzman Çalışan</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <LevelIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {new Set(expertise.map(e => e.category)).size}
                  </Typography>
                  <Typography color="text.secondary">Kategori</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Expertise Table */}
      <Card>
        <CardHeader title="Uzmanlık Alanları" />
        <Divider />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Uzmanlık Alanı</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Seviye</TableCell>
                  <TableCell>Gerekli Sertifikalar</TableCell>
                  <TableCell>İlgili Beceriler</TableCell>
                  <TableCell>Uzman Sayısı</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expertise.map(exp => {
                  const levelConfig = getLevelConfig(exp.level);
                  return (
                    <TableRow key={exp.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {exp.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {exp.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={exp.category}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={levelConfig.label}
                          size="small"
                          sx={{
                            backgroundColor: levelConfig.color,
                            color: 'white',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="column" spacing={0.5}>
                          {exp.requiredCertificates
                            .slice(0, 2)
                            .map((cert, index) => (
                              <Chip
                                key={index}
                                label={cert}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            ))}
                          {exp.requiredCertificates.length > 2 && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              +{exp.requiredCertificates.length - 2} daha
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {exp.relatedSkills.slice(0, 2).map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              size="small"
                              variant="outlined"
                              sx={{ mb: 0.5, fontSize: '0.75rem' }}
                            />
                          ))}
                          {exp.relatedSkills.length > 2 && (
                            <Chip
                              label={`+${exp.relatedSkills.length - 2}`}
                              size="small"
                              variant="outlined"
                              sx={{ mb: 0.5 }}
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${exp.employeeCount} kişi`}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={exp.isActive ? 'Aktif' : 'Pasif'}
                          color={exp.isActive ? 'success' : 'default'}
                          size="small"
                          onClick={() => toggleStatus(exp.id)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleOpenDialog(exp)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(exp.id)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
          {editingExpertise
            ? 'Uzmanlık Alanını Düzenle'
            : 'Yeni Uzmanlık Alanı Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Uzmanlık Alanı Adı"
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
              <FormControl fullWidth>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={formData.category}
                  label="Kategori"
                  onChange={e =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Seviye</InputLabel>
                <Select
                  value={formData.level}
                  label="Seviye"
                  onChange={e =>
                    setFormData({ ...formData, level: e.target.value })
                  }
                >
                  {levels.map(level => (
                    <MenuItem key={level.value} value={level.value}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: level.color,
                          }}
                        />
                        <span>{level.label}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Gerekli Sertifikalar (virgülle ayırın)"
                value={formData.requiredCertificates.join(', ')}
                onChange={e =>
                  setFormData({
                    ...formData,
                    requiredCertificates: e.target.value
                      .split(',')
                      .map(s => s.trim())
                      .filter(s => s),
                  })
                }
                helperText="Örnek: Tesisatçı Belgesi, İş Güvenliği Sertifikası"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="İlgili Beceriler (virgülle ayırın)"
                value={formData.relatedSkills.join(', ')}
                onChange={e =>
                  setFormData({
                    ...formData,
                    relatedSkills: e.target.value
                      .split(',')
                      .map(s => s.trim())
                      .filter(s => s),
                  })
                }
                helperText="Örnek: Kaynak, Boru Döşeme, Kaçak Testi"
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
            {editingExpertise ? 'Güncelleştir' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
