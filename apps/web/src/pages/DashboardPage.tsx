import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  useTheme,
  alpha,
  Fade,
  Skeleton,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  StatsGrid,
  ActiveReports,
  NearbyReports,
  Announcements,
  FloatingActionButton,
} from '../components/dashboard';
import { useDashboardStats } from '../hooks/useDashboardStats';

interface Announcement {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'info' | 'success';
  date: string;
}

// Mock announcements data
const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Sistem Bakımı',
    description:
      'Yarın 02:00-06:00 saatleri arasında sistem bakımı yapılacaktır.',
    type: 'info',
    date: '2024-01-16T10:00:00Z',
  },
  {
    id: '2',
    title: 'Yeni Özellik',
    description: 'Artık raporlarınızı fotoğraf ile destekleyebilirsiniz!',
    type: 'success',
    date: '2024-01-15T16:30:00Z',
  },
];

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const { stats, isLoading } = useDashboardStats();
  const [announcements] = useState(mockAnnouncements);

  // Loading state
  const loading = isLoading;

  // Debug stats
  console.log('🎯 DashboardPage stats:', stats, 'loading:', loading);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg,
          ${alpha(theme.palette.primary.dark, 0.1)} 0%,
          ${alpha(theme.palette.background.default, 0.95)} 50%,
          ${alpha(theme.palette.secondary.dark, 0.1)} 100%)`,
        pt: { xs: 2, md: 3 },
        pb: { xs: 10, md: 4 }, // Extra bottom padding for mobile FAB
      }}
    >
      <Container maxWidth="xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <Box sx={{ mb: { xs: 3, md: 4 } }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontDisplay: 'swap',
                }}
              >
                Kent Nabız
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: alpha(theme.palette.text.primary, 0.7),
                  fontWeight: 400,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                }}
              >
                Şehrinizin nabzını tutun, değişimin parçası olun
              </Typography>
            </Box>
          </motion.div>
          {/* Stats Grid */}
          <motion.div variants={itemVariants}>
            {stats ? (
              <StatsGrid stats={stats} loading={loading} />
            ) : (
              <StatsGrid
                stats={{
                  totalReports: 0,
                  pendingReports: 0,
                  resolvedReports: 0,
                  myReports: 0,
                  averageResolutionTime: 0,
                }}
                loading={loading}
              />
            )}
          </motion.div>{' '}
          {/* Main Content Grid */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 3, md: 4 },
              mb: 4,
            }}
          >
            {/* Reports Row - Active Reports & Nearby Reports side by side */}
            <Box
              sx={{
                display: 'grid',
                gap: { xs: 3, md: 4 },
                gridTemplateColumns: {
                  xs: '1fr',
                  md: '1fr 1fr',
                },
              }}
            >
              {/* Active Reports */}
              <motion.div variants={itemVariants}>
                <Fade in={!loading} timeout={1000}>
                  <Paper
                    elevation={0}
                    sx={{
                      background: alpha(theme.palette.background.paper, 0.6),
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    {loading ? (
                      <Box sx={{ p: 3 }}>
                        <Skeleton
                          variant="text"
                          width="40%"
                          height={32}
                          sx={{ mb: 2 }}
                        />
                        <Skeleton
                          variant="rectangular"
                          height={200}
                          sx={{ borderRadius: 2 }}
                        />
                      </Box>
                    ) : (
                      <ActiveReports loading={loading} />
                    )}
                  </Paper>
                </Fade>
              </motion.div>

              {/* Nearby Reports */}
              <motion.div variants={itemVariants}>
                <Fade in={!loading} timeout={1200}>
                  <Paper
                    elevation={0}
                    sx={{
                      background: alpha(theme.palette.background.paper, 0.6),
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    {loading ? (
                      <Box sx={{ p: 3 }}>
                        <Skeleton
                          variant="text"
                          width="40%"
                          height={32}
                          sx={{ mb: 2 }}
                        />
                        <Skeleton
                          variant="rectangular"
                          height={200}
                          sx={{ borderRadius: 2 }}
                        />
                      </Box>
                    ) : (
                      <NearbyReports loading={loading} />
                    )}
                  </Paper>
                </Fade>
              </motion.div>
            </Box>

            {/* Announcements - Full width at bottom */}
            <motion.div variants={itemVariants}>
              <Fade in={!loading} timeout={1400}>
                <Paper
                  elevation={0}
                  sx={{
                    background: alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  {loading ? (
                    <Box sx={{ p: 3 }}>
                      <Skeleton
                        variant="text"
                        width="60%"
                        height={32}
                        sx={{ mb: 2 }}
                      />
                      {Array.from(new Array(3)).map((_, index) => (
                        <Skeleton
                          key={index}
                          variant="rectangular"
                          height={80}
                          sx={{ mb: 2, borderRadius: 2 }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Announcements
                      announcements={announcements}
                      loading={loading}
                    />
                  )}
                </Paper>
              </Fade>
            </motion.div>
          </Box>
        </motion.div>
      </Container>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </Box>
  );
};

export default DashboardPage;
