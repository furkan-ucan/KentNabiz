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
  Groups as TeamsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  leaderId: string;
  leaderName: string;
  specialties: string[];
  createdAt: string;
  status: 'active' | 'inactive';
}

const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Altyapı Ekibi',
    description: 'Su, kanalizasyon ve elektrik altyapısı sorunları',
    memberCount: 8,
    leaderId: '101',
    leaderName: 'Ahmet Yılmaz',
    specialties: ['Su Tesisatı', 'Elektrik', 'Kanalizasyon'],
    createdAt: '2024-01-15',
    status: 'active',
  },
  {
    id: '2',
    name: 'Temizlik Ekibi',
    description: 'Çevre temizliği ve atık yönetimi',
    memberCount: 12,
    leaderId: '102',
    leaderName: 'Fatma Demir',
    specialties: ['Temizlik', 'Atık Yönetimi', 'Çevre Düzenlemesi'],
    createdAt: '2024-01-20',
    status: 'active',
  },
  {
    id: '3',
    name: 'Ulaşım Ekibi',
    description: 'Yol, kaldırım ve trafik sorunları',
    memberCount: 6,
    leaderId: '103',
    leaderName: 'Mehmet Kaya',
    specialties: ['Yol Onarımı', 'Trafik', 'Kaldırım'],
    createdAt: '2024-02-01',
    status: 'active',
  },
];

interface TeamFormData {
  name: string;
  description: string;
  leaderId: string;
  leaderName: string;
  specialties: string[];
}

export const TeamsManagement: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    leaderId: '',
    leaderName: '',
    specialties: [],
  });

  const handleOpenDialog = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setFormData({
        name: team.name,
        description: team.description,
        leaderId: team.leaderId,
        leaderName: team.leaderName,
        specialties: team.specialties,
      });
    } else {
      setEditingTeam(null);
      setFormData({
        name: '',
        description: '',
        leaderId: '',
        leaderName: '',
        specialties: [],
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTeam(null);
  };

  const handleSave = () => {
    const newTeam: Team = {
      id: editingTeam?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      memberCount: editingTeam?.memberCount || 0,
      leaderId: formData.leaderId,
      leaderName: formData.leaderName,
      specialties: formData.specialties,
      createdAt:
        editingTeam?.createdAt || new Date().toISOString().split('T')[0],
      status: 'active',
    };

    if (editingTeam) {
      setTeams(teams.map(t => (t.id === editingTeam.id ? newTeam : t)));
    } else {
      setTeams([...teams, newTeam]);
    }

    handleCloseDialog();
  };

  const handleDelete = (teamId: string) => {
    if (window.confirm('Bu takımı silmek istediğinizden emin misiniz?')) {
      setTeams(teams.filter(t => t.id !== teamId));
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
          <TeamsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Takım Yönetimi
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          Yeni Takım Ekle
        </Button>
      </Box>{' '}
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <TeamsIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {teams.length}
                  </Typography>
                  <Typography color="text.secondary">Aktif Takım</Typography>
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
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {teams.reduce((acc, team) => acc + team.memberCount, 0)}
                  </Typography>
                  <Typography color="text.secondary">Toplam Çalışan</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Teams Table */}
      <Card>
        <CardHeader title="Takımlar" />
        <Divider />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Takım Adı</TableCell>
                  <TableCell>Açıklama</TableCell>
                  <TableCell>Takım Lideri</TableCell>
                  <TableCell>Üye Sayısı</TableCell>
                  <TableCell>Uzmanlık Alanları</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teams.map(team => (
                  <TableRow key={team.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {team.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {team.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{team.leaderName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${team.memberCount} kişi`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {team.specialties.map((specialty, index) => (
                          <Chip
                            key={index}
                            label={specialty}
                            size="small"
                            variant="outlined"
                            sx={{ mb: 0.5 }}
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={team.status === 'active' ? 'Aktif' : 'Pasif'}
                        color={team.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleOpenDialog(team)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(team.id)}
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
          {editingTeam ? 'Takımı Düzenle' : 'Yeni Takım Ekle'}
        </DialogTitle>
        <DialogContent>
          {' '}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Takım Adı"
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
              <TextField
                fullWidth
                label="Takım Lideri ID"
                value={formData.leaderId}
                onChange={e =>
                  setFormData({ ...formData, leaderId: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Takım Lideri Adı"
                value={formData.leaderName}
                onChange={e =>
                  setFormData({ ...formData, leaderName: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Uzmanlık Alanları (virgülle ayırın)"
                value={formData.specialties.join(', ')}
                onChange={e =>
                  setFormData({
                    ...formData,
                    specialties: e.target.value
                      .split(',')
                      .map(s => s.trim())
                      .filter(s => s),
                  })
                }
                helperText="Örnek: Su Tesisatı, Elektrik, Kanalizasyon"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSave} variant="contained">
            {editingTeam ? 'Güncelleştir' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
