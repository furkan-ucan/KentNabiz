// apps/web/src/pages/CreateReportPage/StepPlaceholders.tsx
import { Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import {
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  PhotoCamera as PhotoIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import {
  getStepIconStyles,
  getSuccessStepIconStyles,
  getComingSoonBadgeStyles,
} from './styles';

export const LocationStepPlaceholder = () => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Box textAlign="center" py={6}>
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          <Box sx={getStepIconStyles(theme)}>
            <LocationIcon sx={{ fontSize: 48, color: 'white' }} />
          </Box>
        </motion.div>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Konum Seçimi
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
          Harita üzerinde sorununuzun bulunduğu konumu işaretleyebileceksiniz
        </Typography>
        <Box mt={3}>
          <Typography
            variant="caption"
            color="primary"
            sx={getComingSoonBadgeStyles(theme)}
          >
            🚀 Yakında gelecek...
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
};

export const CategoryStepPlaceholder = () => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Box textAlign="center" py={6}>
        <motion.div
          animate={{
            rotate: [0, -5, 5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          <Box sx={getStepIconStyles(theme)}>
            <CategoryIcon sx={{ fontSize: 48, color: 'white' }} />
          </Box>
        </motion.div>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Kategori Belirleme
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
          Sorununuzu en uygun kategoriye yerleştirerek doğru departmana
          yönlendirebiliriz
        </Typography>
        <Box mt={3}>
          <Typography
            variant="caption"
            color="primary"
            sx={getComingSoonBadgeStyles(theme)}
          >
            🚀 Yakında gelecek...
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
};

export const MediaStepPlaceholder = () => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Box textAlign="center" py={6}>
        <motion.div
          animate={{
            rotate: [0, 3, -3, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            repeatDelay: 4,
          }}
        >
          <Box sx={getStepIconStyles(theme)}>
            <PhotoIcon sx={{ fontSize: 48, color: 'white' }} />
          </Box>
        </motion.div>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Medya Ekleme
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
          Fotoğraf ve videolar ekleyerek sorununuzu daha net gösterebilirsiniz
        </Typography>
        <Box mt={3}>
          <Typography
            variant="caption"
            color="primary"
            sx={getComingSoonBadgeStyles(theme)}
          >
            📸 Yakında gelecek...
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
};

export const PreviewStepPlaceholder = () => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Box textAlign="center" py={6}>
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        >
          <Box sx={getSuccessStepIconStyles(theme)}>
            <PreviewIcon sx={{ fontSize: 48, color: 'white' }} />
          </Box>
        </motion.div>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Önizleme & Onay
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
          Raporunuzu gözden geçirin ve göndermeye hazır olduğunuzda onaylayın
        </Typography>
        <Box mt={3}>
          <Typography
            variant="caption"
            color="success.main"
            sx={getComingSoonBadgeStyles(theme, 'success')}
          >
            ✅ Yakında gelecek...
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
};
