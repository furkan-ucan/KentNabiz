// apps/web/src/layouts/RootLayout.tsx
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Button,
  useTheme,
  alpha,
  Container,
  Snackbar,
  Alert,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { SnackbarProvider } from '../providers/SnackbarProvider';
import { LoadingProvider } from '../providers/LoadingProvider';

interface RootLayoutProps {
  children?: React.ReactNode;
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    'success' | 'error' | 'warning' | 'info'
  >('info');

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('rememberMe');
    setSnackbarMessage('Başarıyla çıkış yapıldı');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  const handleNewReport = () => {
    navigate('/reports/new');
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  const renderProfileMenu = (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleProfileMenuClose}
      slotProps={{
        paper: {
          sx: {
            mt: 1.5,
            minWidth: 200,
            backgroundColor: 'background.paper', // Mat dark arka plan
            border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
            borderRadius: 2,
          },
        },
      }}
    >
      <MenuItem
        onClick={() => {
          navigate('/profile');
        }}
      >
        <AccountIcon sx={{ mr: 2, color: 'primary.main' }} />
        Profil
      </MenuItem>
      <MenuItem
        onClick={() => {
          navigate('/settings');
        }}
      >
        <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
        Ayarlar
      </MenuItem>
      <Divider
        sx={{ my: 1, borderColor: alpha(theme.palette.text.primary, 0.1) }}
      />
      <MenuItem onClick={handleLogout}>
        <LogoutIcon sx={{ mr: 2, color: 'error.main' }} />
        Çıkış Yap
      </MenuItem>
    </Menu>
  );

  const renderNotificationMenu = (
    <Menu
      anchorEl={notificationAnchorEl}
      open={Boolean(notificationAnchorEl)}
      onClose={handleNotificationMenuClose}
      slotProps={{
        paper: {
          sx: {
            mt: 1.5,
            minWidth: 300,
            maxHeight: 400,
            backgroundColor: 'background.paper',
            border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
            borderRadius: 2,
          },
        },
      }}
    >
      <MenuItem disabled>
        <Typography variant="subtitle2" color="text.secondary">
          Bildirimler
        </Typography>
      </MenuItem>
      <Divider sx={{ borderColor: alpha(theme.palette.text.primary, 0.1) }} />
      <MenuItem>
        <Typography variant="body2" color="text.secondary">
          Henüz bildirim yok
        </Typography>
      </MenuItem>
    </Menu>
  );
  return (
    <ErrorBoundary>
      <SnackbarProvider>
        <LoadingProvider>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
            }}
          >
            {/* AppBar - Mat + Modern Tasarım */}
            <AppBar
              position="static"
              sx={{
                backgroundColor: 'background.paper', // Mat dark arka plan
                border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                boxShadow: `2px 2px 6px ${alpha('#000', 0.5)}`, // Mat + Modern gölge
                borderRadius: 0, // AppBar için köşeleri keskin tutuyoruz
              }}
            >
              <Toolbar sx={{ py: 1 }}>
                {/* Logo/Marka */}
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    flexGrow: 1,
                    fontWeight: 700,
                    color: 'text.primary', // Mat dark tema için basit metin
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    cursor: 'pointer',
                    transition: 'color 0.2s ease',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                  onClick={() => {
                    navigate('/');
                  }}
                >
                  KentNabız
                </Typography>

                {/* Arama (Placeholder - gelecekte eklenebilir) */}
                <IconButton
                  size="medium"
                  sx={{
                    mr: 1,
                    color: 'text.secondary',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: 'primary.main',
                      transform: 'translateY(-2px)',
                    },
                  }}
                  aria-label="search"
                >
                  <SearchIcon />
                </IconButton>

                {/* Bildirimler */}
                <IconButton
                  size="medium"
                  onClick={handleNotificationMenuOpen}
                  sx={{
                    mr: 1,
                    color: 'text.secondary',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: 'primary.main',
                      transform: 'translateY(-2px)',
                    },
                  }}
                  aria-label="notifications"
                >
                  <NotificationsIcon />{' '}
                </IconButton>

                {/* Tema Toggle */}
                <IconButton
                  size="medium"
                  onClick={() => {
                    // Tema toggle fonksiyonunu burada çağıracağız
                    console.log('Theme toggle clicked');
                  }}
                  sx={{
                    mr: 1,
                    color: 'text.secondary',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: 'primary.main',
                      transform: 'translateY(-2px)',
                    },
                  }}
                  aria-label="tema değiştir"
                >
                  <DarkModeIcon />
                </IconButton>

                {/* Yeni Rapor CTA Button */}
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleNewReport}
                  sx={{
                    mr: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.7)})`,
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `2px 2px 6px ${alpha('#000', 0.6)}`,
                    },
                  }}
                >
                  Yeni Rapor
                </Button>

                {/* Profil Avatar */}
                <IconButton
                  size="large"
                  onClick={handleProfileMenuOpen}
                  sx={{
                    p: 0,
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.7)})`,
                      border: `2px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                    }}
                  >
                    U
                  </Avatar>
                </IconButton>
              </Toolbar>
            </AppBar>
            {/* Main Content Container */}
            <Container
              maxWidth="xl"
              component="main"
              sx={{
                flexGrow: 1,
                py: { xs: 3, md: 4 },
                px: { xs: 2, md: 3 },
                backgroundColor: 'background.default',
                minHeight: 'calc(100vh - 80px)', // AppBar yüksekliğini çıkar
              }}
            >
              {children || <Outlet />}
            </Container>
            {/* Footer (Opsiyonel - basit tutalım) */}
            <Box
              component="footer"
              sx={{
                py: 2,
                px: 3,
                mt: 'auto',
                backgroundColor: alpha(theme.palette.background.paper, 0.5),
                borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
              }}
            >
              <Typography variant="body2" color="text.secondary" align="center">
                © 2025 KentNabız. Tüm hakları saklıdır.
              </Typography>
            </Box>
            {/* Global Snackbar */}
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={4000}
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert
                onClose={handleSnackbarClose}
                severity={snackbarSeverity}
                sx={{
                  backgroundColor: 'background.paper',
                  color: 'text.primary',
                  border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                  borderRadius: 2,
                  boxShadow: `4px 4px 12px ${alpha('#000', 0.7)}`,
                }}
              >
                {snackbarMessage}
              </Alert>
            </Snackbar>{' '}
            {/* Menüler */}
            {renderProfileMenu}
            {renderNotificationMenu}
          </Box>
        </LoadingProvider>
      </SnackbarProvider>
    </ErrorBoundary>
  );
};

export default RootLayout;
