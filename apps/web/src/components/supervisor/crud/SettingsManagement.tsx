import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Stack,
  Avatar,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Speed as PerformanceIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

interface SystemSettings {
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    urgentReportsOnly: boolean;
  };
  performance: {
    cacheEnabled: boolean;
    autoRefresh: boolean;
    refreshInterval: number;
    maxReportsPerPage: number;
  };
  security: {
    sessionTimeout: number;
    requireStrongPassword: boolean;
    twoFactorAuth: boolean;
    auditLogging: boolean;
  };
  general: {
    systemName: string;
    timezone: string;
    language: string;
    dateFormat: string;
  };
}

const defaultSettings: SystemSettings = {
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    urgentReportsOnly: false,
  },
  performance: {
    cacheEnabled: true,
    autoRefresh: true,
    refreshInterval: 30,
    maxReportsPerPage: 25,
  },
  security: {
    sessionTimeout: 60,
    requireStrongPassword: true,
    twoFactorAuth: false,
    auditLogging: true,
  },
  general: {
    systemName: 'KentNabız Yönetim Sistemi',
    timezone: 'Europe/Istanbul',
    language: 'tr-TR',
    dateFormat: 'DD/MM/YYYY',
  },
};

export const SettingsManagement: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info',
  });

  const handleSettingChange = (
    section: keyof SystemSettings,
    key: string,
    value: string | number | boolean
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    // Burada API çağrısı yapılacak
    console.log('Ayarlar kaydediliyor:', settings);

    setNotification({
      open: true,
      message: 'Ayarlar başarıyla kaydedildi!',
      severity: 'success',
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
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
          <SettingsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Sistem Ayarları
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          size="large"
        >
          Ayarları Kaydet
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Genel Ayarlar */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <SettingsIcon />
                </Avatar>
              }
              title="Genel Ayarlar"
              subheader="Sistem genel yapılandırması"
            />
            <Divider />
            <CardContent>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Sistem Adı"
                  value={settings.general.systemName}
                  onChange={e =>
                    handleSettingChange('general', 'systemName', e.target.value)
                  }
                />
                <TextField
                  fullWidth
                  label="Zaman Dilimi"
                  value={settings.general.timezone}
                  onChange={e =>
                    handleSettingChange('general', 'timezone', e.target.value)
                  }
                />
                <TextField
                  fullWidth
                  label="Dil"
                  value={settings.general.language}
                  onChange={e =>
                    handleSettingChange('general', 'language', e.target.value)
                  }
                />
                <TextField
                  fullWidth
                  label="Tarih Formatı"
                  value={settings.general.dateFormat}
                  onChange={e =>
                    handleSettingChange('general', 'dateFormat', e.target.value)
                  }
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Bildirim Ayarları */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <NotificationsIcon />
                </Avatar>
              }
              title="Bildirim Ayarları"
              subheader="Kullanıcı bildirimleri yapılandırması"
            />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.emailEnabled}
                      onChange={e =>
                        handleSettingChange(
                          'notifications',
                          'emailEnabled',
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="E-posta Bildirimleri"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.smsEnabled}
                      onChange={e =>
                        handleSettingChange(
                          'notifications',
                          'smsEnabled',
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="SMS Bildirimleri"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.pushEnabled}
                      onChange={e =>
                        handleSettingChange(
                          'notifications',
                          'pushEnabled',
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Push Bildirimleri"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.urgentReportsOnly}
                      onChange={e =>
                        handleSettingChange(
                          'notifications',
                          'urgentReportsOnly',
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Sadece Acil Raporlar"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Performans Ayarları */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <PerformanceIcon />
                </Avatar>
              }
              title="Performans Ayarları"
              subheader="Sistem performans optimizasyonları"
            />
            <Divider />
            <CardContent>
              <Stack spacing={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.performance.cacheEnabled}
                      onChange={e =>
                        handleSettingChange(
                          'performance',
                          'cacheEnabled',
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Cache Etkin"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.performance.autoRefresh}
                      onChange={e =>
                        handleSettingChange(
                          'performance',
                          'autoRefresh',
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Otomatik Yenileme"
                />
                <TextField
                  fullWidth
                  label="Yenileme Aralığı (saniye)"
                  type="number"
                  value={settings.performance.refreshInterval}
                  onChange={e =>
                    handleSettingChange(
                      'performance',
                      'refreshInterval',
                      Number(e.target.value)
                    )
                  }
                />
                <TextField
                  fullWidth
                  label="Sayfa Başına Max Rapor"
                  type="number"
                  value={settings.performance.maxReportsPerPage}
                  onChange={e =>
                    handleSettingChange(
                      'performance',
                      'maxReportsPerPage',
                      Number(e.target.value)
                    )
                  }
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Güvenlik Ayarları */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <SecurityIcon />
                </Avatar>
              }
              title="Güvenlik Ayarları"
              subheader="Sistem güvenlik yapılandırması"
            />
            <Divider />
            <CardContent>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Oturum Zaman Aşımı (dakika)"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={e =>
                    handleSettingChange(
                      'security',
                      'sessionTimeout',
                      Number(e.target.value)
                    )
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.requireStrongPassword}
                      onChange={e =>
                        handleSettingChange(
                          'security',
                          'requireStrongPassword',
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Güçlü Şifre Zorunlu"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.twoFactorAuth}
                      onChange={e =>
                        handleSettingChange(
                          'security',
                          'twoFactorAuth',
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="İki Faktörlü Kimlik Doğrulama"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.auditLogging}
                      onChange={e =>
                        handleSettingChange(
                          'security',
                          'auditLogging',
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Denetim Günlüğü"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
