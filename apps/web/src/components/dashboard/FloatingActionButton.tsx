// apps/web/src/components/dashboard/FloatingActionButton.tsx
import { Fab, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { Plus as AddIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FloatingActionButton = () => {
  const navigate = useNavigate();

  const handleNewReportClick = () => {
    navigate('/reports/new');
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        duration: 0.6,
        delay: 1.5,
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Fab
        color="primary"
        aria-label="Yeni Rapor Oluştur"
        onClick={handleNewReportClick}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, md: 24 },
          right: { xs: 16, md: 24 },
          zIndex: 1000,
          boxShadow: `4px 4px 12px ${alpha('#000', 0.7)}`,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `6px 6px 16px ${alpha('#000', 0.8)}`,
          },
        }}
      >
        <AddIcon />
      </Fab>
    </motion.div>
  );
};
