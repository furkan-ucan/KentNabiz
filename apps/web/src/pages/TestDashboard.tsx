import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const TestDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Typography variant="h3" component="h1" gutterBottom>
        Dashboard Test Sayfası
      </Typography>

      <Typography variant="h6" color="success.main" gutterBottom>
        ✅ Giriş başarılı! Token mevcut.
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Bu test sayfası, routing ve authentication&apos;ın düzgün çalıştığını
        gösteriyor.
      </Typography>

      <Button variant="contained" onClick={handleLogout} sx={{ mt: 2 }}>
        Çıkış Yap
      </Button>
    </Box>
  );
};
