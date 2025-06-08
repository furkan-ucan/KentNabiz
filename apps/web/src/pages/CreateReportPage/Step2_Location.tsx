import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Stack,
  FormHelperText,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  EditLocation as EditLocationIcon,
} from '@mui/icons-material';
import { LocationMap } from './LocationMap';
import type { ReportFormData } from './types';

const Step2_Location: React.FC = () => {
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ReportFormData>();

  // Watch location values
  const latitude = watch('location.latitude');
  const longitude = watch('location.longitude');
  const address = watch('location.address');

  // Handle location change from map
  const handleLocationChange = (lat: number, lng: number) => {
    setValue('location.latitude', lat);
    setValue('location.longitude', lng);

    // Optional: Reverse geocoding could be added here to auto-fill address
    // For now, we'll just clear the address when location changes manually
    if (!address) {
      setValue('location.address', `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  // Default coordinates (Istanbul city center)
  const defaultLat = latitude || 41.0082;
  const defaultLng = longitude || 28.9784;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <LocationIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
          Konum Bilgileri
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Raporunuzun konumunu belirleyin
        </Typography>
      </Box>{' '}
      <Stack
        spacing={3}
        direction={{ xs: 'column', md: 'row' }}
        alignItems="stretch"
      >
        {/* Map Section */}
        <Box sx={{ flex: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              height: 'fit-content',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EditLocationIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Harita Üzerinden Seçim
              </Typography>
            </Box>

            <LocationMap
              latitude={defaultLat}
              longitude={defaultLng}
              onLocationChange={handleLocationChange}
            />

            {/* Location validation error */}
            {(errors.location?.latitude || errors.location?.longitude) && (
              <FormHelperText error sx={{ mt: 1 }}>
                Lütfen harita üzerinden bir konum seçin
              </FormHelperText>
            )}
          </Paper>
        </Box>

        {/* Address Section */}
        <Box sx={{ flex: 1 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              height: 'fit-content',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Adres Bilgisi
              </Typography>
            </Box>

            <Controller
              name="location.address"
              control={control}
              rules={{
                required: 'Adres bilgisi gereklidir',
                minLength: {
                  value: 10,
                  message: 'Adres en az 10 karakter olmalıdır',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={4}
                  label="Adres"
                  placeholder="Detaylı adres bilgisini girin..."
                  error={!!errors.location?.address}
                  helperText={errors.location?.address?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'rgba(255, 255, 255, 0.9)',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.5)',
                        opacity: 1,
                      },
                    },
                  }}
                />
              )}
            />

            {/* Coordinates Display */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, color: 'primary.main' }}
              >
                Seçilen Koordinatlar:
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}
              >
                <strong>Enlem:</strong> {defaultLat.toFixed(6)}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}
              >
                <strong>Boylam:</strong> {defaultLng.toFixed(6)}{' '}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Stack>
      {/* Additional Info */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderRadius: 2,
          border: '1px solid rgba(33, 150, 243, 0.2)',
        }}
      >
        {' '}
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          <strong>💡 İpucu:</strong> Mevcut konumunuzu otomatik olarak yüklemek
          için &ldquo;Mevcut Konumu Yükle&rdquo; butonunu kullanabilir, veya
          harita üzerinde istediğiniz konuma tıklayarak manuel olarak seçim
          yapabilirsiniz.
        </Typography>
      </Box>
    </Box>
  );
};

export default Step2_Location;
