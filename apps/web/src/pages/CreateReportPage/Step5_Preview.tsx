// apps/web/src/pages/CreateReportPage/Step5_Preview.tsx

import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  Stack,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Title as TitleIcon,
  Category as CategoryIcon,
  Photo as PhotoIcon,
} from '@mui/icons-material';
import { stepBoxStyle } from './styles';
import { ReportFormData } from './types';

const Step5_Preview: React.FC = () => {
  const { getValues } = useFormContext<ReportFormData>();
  const formData = getValues();

  return (
    <Box sx={stepBoxStyle}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 600,
          color: 'primary.main',
          mb: 3,
        }}
      >
        Rapor Önizlemesi
      </Typography>

      <Typography
        variant="body1"
        sx={{
          mb: 4,
          color: 'text.secondary',
          lineHeight: 1.6,
        }}
      >
        Aşağıda raporunuzun özeti bulunmaktadır. Bilgileri kontrol ettikten
        sonra &quot;Raporu Oluştur&quot; butonuna tıklayarak gönderin.
      </Typography>

      <Stack spacing={3}>
        {/* Temel Bilgiler */}
        <Card
          sx={{
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TitleIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Temel Bilgiler
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Başlık:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formData.title || 'Belirtilmemiş'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Açıklama:
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 400,
                  maxHeight: 150,
                  overflow: 'auto',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {formData.description || 'Belirtilmemiş'}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Konum Bilgileri */}
        <Card
          sx={{
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Konum Bilgileri
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Adres:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 400 }}>
                {formData.location?.address || 'Belirtilmemiş'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Enlem:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 400, fontFamily: 'monospace' }}
                >
                  {formData.location?.latitude?.toFixed(6) || 'Belirtilmemiş'}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Boylam:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 400, fontFamily: 'monospace' }}
                >
                  {formData.location?.longitude?.toFixed(6) || 'Belirtilmemiş'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Kategori Bilgileri */}
        <Card
          sx={{
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CategoryIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Kategori Bilgileri
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Departman Kodu:
              </Typography>
              <Chip
                label={formData.departmentCode || 'Belirtilmemiş'}
                color="primary"
                variant="outlined"
                size="small"
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Kategori ID:
              </Typography>
              <Chip
                label={formData.categoryId || 'Belirtilmemiş'}
                color="secondary"
                variant="outlined"
                size="small"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Medya Bilgileri */}
        <Card
          sx={{
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PhotoIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Yüklenen Medyalar
              </Typography>
            </Box>

            {!formData.reportMedias || formData.reportMedias.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="body2">
                  Henüz medya dosyası yüklenmemiş.
                </Typography>
              </Alert>
            ) : (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Toplam {formData.reportMedias.length} dosya yüklendi:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {formData.reportMedias.map((media, index) => (
                    <Chip
                      key={index}
                      label={`Dosya ${index + 1} (${media.type})`}
                      color="success"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Uyarı Mesajı */}
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>Dikkat:</strong> Raporu gönderdikten sonra bilgileri
            değiştiremezsiniz. Lütfen tüm bilgilerin doğruluğunu kontrol edin.
          </Typography>
        </Alert>
      </Stack>
    </Box>
  );
};

export default Step5_Preview;
