// apps/web/src/pages/CreateReportPage/Step1_BasicInfo.tsx
import { useFormContext } from 'react-hook-form';
import {
  TextField,
  Stack,
  Typography,
  Box,
  InputAdornment,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Edit as EditIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

export const Step1_BasicInfo = () => {
  const theme = useTheme();
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();

  const titleValue = watch('title') || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Stack spacing={4}>
        {/* Header Section */}
        <Box textAlign="center" mb={2}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <EditIcon sx={{ fontSize: 36, color: 'white' }} />
            </Box>
          </motion.div>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 1,
            }}
          >
            Sorunu Tanımlayın
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 500, mx: 'auto' }}
          >
            Şehrinizdeki problemi kısa ve net bir şekilde özetleyin. Detaylı
            açıklama yapmak çözüm sürecini hızlandırır.
          </Typography>
        </Box>

        {/* Form Fields */}
        <Stack spacing={3}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <TextField
              autoFocus
              required
              fullWidth
              label="Rapor Başlığı"
              placeholder="Örn: Kırık kaldırım taşı, Çalışmayan sokak lambası..."
              {...register('title')}
              error={!!errors.title}
              helperText={errors.title?.message as string}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EditIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Chip
                      label={`${titleValue.length}/100`}
                      size="small"
                      color={titleValue.length > 80 ? 'warning' : 'default'}
                      variant="outlined"
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderWidth: 2,
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <TextField
              required
              fullWidth
              label="Detaylı Açıklama"
              placeholder="Sorunu ayrıntılı olarak anlatın:&#10;• Sorunun konumu (sokak, mahalle)&#10;• Ne kadar süredir var olduğu&#10;• Tehlike durumu veya aciliyet seviyesi&#10;• Ek bilgiler"
              multiline
              rows={6}
              {...register('description')}
              error={!!errors.description}
              helperText={errors.description?.message as string}
              InputProps={{
                startAdornment: (
                  <InputAdornment
                    position="start"
                    sx={{ alignSelf: 'flex-start', mt: 1 }}
                  >
                    <DescriptionIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderWidth: 2,
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />
          </motion.div>

          {/* Character count and tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              }}
            >
              <Typography
                variant="caption"
                color="info.main"
                sx={{ fontWeight: 500 }}
              >
                💡 İpucu: Ne kadar detaylı bilgi verirseniz, sorunun çözümü o
                kadar hızlı olur!
              </Typography>
            </Box>
          </motion.div>
        </Stack>
      </Stack>
    </motion.div>
  );
};
