import React, { ReactNode, useState } from 'react';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Logout,
  Settings,
  Person,
  Dashboard,
  Group,
  Category,
  Work,
  School,
  Business,
} from '@mui/icons-material';
import { getCurrentUser, clearAuth } from '@/utils/auth';

interface SupervisorLayoutProps {
  dashboardContent: ReactNode;
  teamsContent: ReactNode;
  categoriesContent: ReactNode;
  employeesContent: ReactNode;
  expertiseContent: ReactNode;
  departmentsContent: ReactNode;
  settingsContent: ReactNode;
}

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`supervisor-tabpanel-${index}`}
      aria-labelledby={`supervisor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `supervisor-tab-${index}`,
    'aria-controls': `supervisor-tabpanel-${index}`,
  };
}

export const SupervisorLayout: React.FC<SupervisorLayoutProps> = ({
  dashboardContent,
  teamsContent,
  categoriesContent,
  employeesContent,
  expertiseContent,
  departmentsContent,
  settingsContent,
}) => {
  const user = getCurrentUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [value, setValue] = useState(0);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    clearAuth();
    // Sayfayı yenile veya login sayfasına yönlendir
    window.location.href = '/login';
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const tabs = [
    { label: 'Dashboard', icon: <Dashboard />, content: dashboardContent },
    { label: 'Takımlar', icon: <Group />, content: teamsContent },
    { label: 'Kategoriler', icon: <Category />, content: categoriesContent },
    { label: 'Çalışanlar', icon: <Work />, content: employeesContent },
    { label: 'Uzmanlık', icon: <School />, content: expertiseContent },
    { label: 'Departmanlar', icon: <Business />, content: departmentsContent },
    { label: 'Ayarlar', icon: <Settings />, content: settingsContent },
  ];

  return (
    <Box
      sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}
    >
      {/* Top Navigation Bar */}
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              color: 'white',
            }}
          >
            Supervisor Panel
          </Typography>{' '}
          {/* User Profile Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'white', mr: 1 }}>
              {user?.email || 'Supervisor'}
            </Typography>

            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'secondary.main',
                }}
              >
                <Person />
              </Avatar>
            </IconButton>

            {/* Profile Menu */}
            <Menu
              id="profile-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleProfileMenuClose}>
                <Settings sx={{ mr: 1 }} fontSize="small" />
                Profil Ayarları
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} fontSize="small" />
                Çıkış Yap
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Container maxWidth="xl" sx={{ py: 2 }}>
        {/* Tabs Navigation */}
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={value}
            onChange={handleTabChange}
            aria-label="supervisor tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontWeight: 500,
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                label={tab.label}
                iconPosition="start"
                {...a11yProps(index)}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={value} index={index}>
            {tab.content}
          </TabPanel>
        ))}
      </Container>
    </Box>
  );
};
