// apps/web/src/layouts/RootLayout.tsx
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
  Dashboard,
  Group,
  Category,
  Work,
  School,
  Business,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { clearAuth, getCurrentUser, hasRole } from '../utils/auth';
import { SnackbarProvider } from '../providers/SnackbarProvider';
import { LoadingProvider } from '../providers/LoadingProvider';
import { UserRole } from '@kentnabiz/shared';

interface RootLayoutProps {
  children?: React.ReactNode;
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser(); // Auth utils'den kullanıcı bilgisini al

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    'success' | 'error' | 'warning' | 'info'
  >('info');

  // Kullanıcının rolüne göre "Yeni Rapor" butonunu göster/gizle
  const canCreateReport = hasRole(UserRole.CITIZEN);
  const isSupervisor =
    hasRole(UserRole.DEPARTMENT_SUPERVISOR) || hasRole(UserRole.SYSTEM_ADMIN);

  // Supervisor sayfasında mıyız kontrol et
  const isOnSupervisorPage = location.pathname.startsWith('/supervisor');

  // Supervisor tab değeri
  const getSupervisorTabValue = () => {
    const path = location.pathname;
    if (path === '/supervisor' || path === '/supervisor/dashboard') return 0; // Ana Sayfa
    if (path === '/supervisor/teams') return 1;
    if (path === '/supervisor/categories') return 2;
    if (path === '/supervisor/employees') return 3;
    if (path === '/supervisor/expertise') return 4;
    if (path === '/supervisor/departments') return 5;
    if (path === '/supervisor/analytics') return 6;
    if (path === '/supervisor/settings') return 7;
    return 0; // Varsayılan olarak Ana Sayfa
  };

  const supervisorTabs = [
    { label: 'Ana Sayfa', path: '/supervisor', icon: <Dashboard /> },
    { label: 'Takımlar', path: '/supervisor/teams', icon: <Group /> },
    {
      label: 'Kategoriler',
      path: '/supervisor/categories',
      icon: <Category />,
    },
    { label: 'Çalışanlar', path: '/supervisor/employees', icon: <Work /> },
    { label: 'Uzmanlık', path: '/supervisor/expertise', icon: <School /> },
    {
      label: 'Departmanlar',
      path: '/supervisor/departments',
      icon: <Business />,
    },
    {
      label: 'Analitik Panel',
      path: '/supervisor/analytics',
      icon: <AnalyticsIcon />,
    },
    { label: 'Ayarlar', path: '/supervisor/settings', icon: <SettingsIcon /> },
  ];

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
    clearAuth();
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
            minWidth: 250,
            backgroundColor: 'background.paper', // Mat dark arka plan
            border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
            borderRadius: 2,
          },
        },
      }}
    >
      {/* Kullanıcı Bilgileri */}
      <MenuItem disabled>
        <Box>
          <Typography variant="subtitle2" color="text.primary">
            {user?.email}
          </Typography>
          <Typography variant="caption" color="primary.main">
            {hasRole(UserRole.CITIZEN) && 'Vatandaş'}
            {hasRole(UserRole.TEAM_MEMBER) && 'Ekip Üyesi'}
            {hasRole(UserRole.DEPARTMENT_SUPERVISOR) && 'Departman Sorumlusu'}
            {hasRole(UserRole.SYSTEM_ADMIN) && 'Sistem Yöneticisi'}
          </Typography>
        </Box>
      </MenuItem>
      <Divider
        sx={{ my: 1, borderColor: alpha(theme.palette.text.primary, 0.1) }}
      />

      <MenuItem
        onClick={() => {
          navigate('/profile');
          handleProfileMenuClose();
        }}
      >
        <AccountIcon sx={{ mr: 2, color: 'primary.main' }} />
        Profil
      </MenuItem>

      {/* Ayarlar - Sadece SYSTEM_ADMIN için */}
      {hasRole(UserRole.SYSTEM_ADMIN) && (
        <MenuItem
          onClick={() => {
            navigate('/settings');
            handleProfileMenuClose();
          }}
        >
          <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
          Sistem Ayarları
        </MenuItem>
      )}

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
                    fontWeight: 700,
                    color: 'text.primary', // Mat dark tema için basit metin
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    cursor: 'pointer',
                    transition: 'color 0.2s ease',
                    mr: 3,
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

                {/* Supervisor Navigation Tabs - Sol tarafta */}
                {isSupervisor && isOnSupervisorPage && (
                  <Box
                    sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}
                  >
                    <Tabs
                      value={getSupervisorTabValue()}
                      onChange={(_, newValue) => {
                        navigate(supervisorTabs[newValue].path);
                      }}
                      aria-label="supervisor tabs"
                      variant="scrollable"
                      scrollButtons="auto"
                      sx={{
                        minHeight: 'auto',
                        '& .MuiTabs-indicator': {
                          backgroundColor: 'primary.main',
                          height: 3,
                        },
                        '& .MuiTab-root': {
                          minHeight: 48,
                          minWidth: 'auto',
                          textTransform: 'none',
                          fontWeight: 500,
                          color: 'text.secondary',
                          px: 2,
                          '&.Mui-selected': {
                            color: 'primary.main',
                            fontWeight: 600,
                          },
                          '&:hover': {
                            color: 'primary.main',
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1
                            ),
                          },
                        },
                      }}
                    >
                      {supervisorTabs.map((tab, index) => (
                        <Tab
                          key={index}
                          icon={tab.icon}
                          label={tab.label}
                          iconPosition="start"
                          id={`supervisor-tab-${index}`}
                          aria-controls={`supervisor-tabpanel-${index}`}
                        />
                      ))}
                    </Tabs>
                  </Box>
                )}

                {/* Sağ taraf boşluk - supervisor tab'ları yoksa */}
                {!isSupervisor || !isOnSupervisorPage ? (
                  <Box sx={{ flexGrow: 1 }} />
                ) : null}

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

                {/* Yeni Rapor CTA Button - Sadece CITIZEN için */}
                {canCreateReport && (
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
                )}

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
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
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
