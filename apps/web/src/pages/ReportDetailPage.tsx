// apps/web/src/pages/ReportDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Chip,
  Button,
  Skeleton,
  Alert,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import { ArrowLeft, MapPin, Calendar, User, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ReportStatus } from '@kentnabiz/shared';
import { isAuthenticated } from '@/utils/auth';

interface ReportDetail {
  id: number;
  title: string;
  description: string;
  status: ReportStatus;
  address: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  resolutionNotes?: string | null;
  rejectionReason?: string | null;
  supportCount: number;
  isSupportedByCurrentUser: boolean;
  location: {
    type: string;
    coordinates: [number, number];
  };
  user: {
    id: number;
    fullName: string;
    email: string;
  };
  category: {
    id: number;
    name: string;
    code: string;
  };
  currentDepartment: {
    id: number;
    name: string;
    code: string;
  };
  reportMedias: Array<{
    id: number;
    url: string;
    type: string;
    mediaContext: string;
    createdAt: string;
  }>;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const ReportDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) {
        setError('Rapor ID belirtilmemiş');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (!isAuthenticated()) {
          setError('Bu sayfayı görüntülemek için giriş yapmalısınız');
          setLoading(false);
          return;
        }
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_BASE_URL}/reports/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setReport(response.data.data || response.data);
      } catch (err: unknown) {
        console.error('Report fetch error:', err);
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosErr = err as { response?: { status?: number } };
          if (axiosErr.response?.status === 404) {
            setError('Rapor bulunamadı');
          } else if (axiosErr.response?.status === 403) {
            setError('Bu raporu görüntüleme yetkiniz yok');
          } else {
            setError('Rapor yüklenirken hata oluştu');
          }
        } else {
          setError('Rapor yüklenirken hata oluştu');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const getStatusColor = (
    status: ReportStatus
  ): 'info' | 'warning' | 'primary' | 'success' | 'error' | 'default' => {
    switch (status) {
      case ReportStatus.OPEN:
        return 'info';
      case ReportStatus.IN_REVIEW:
        return 'warning';
      case ReportStatus.IN_PROGRESS:
        return 'primary';
      case ReportStatus.DONE:
        return 'success';
      case ReportStatus.REJECTED:
      case ReportStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.OPEN:
        return 'Açık';
      case ReportStatus.IN_REVIEW:
        return 'İnceleniyor';
      case ReportStatus.IN_PROGRESS:
        return 'İşleniyor';
      case ReportStatus.DONE:
        return 'Tamamlandı';
      case ReportStatus.REJECTED:
        return 'Reddedildi';
      case ReportStatus.CANCELLED:
        return 'İptal Edildi';
      default:
        return 'Bilinmiyor';
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="rectangular" height={40} width={120} />
        </Box>
        <Paper sx={{ p: 4 }}>
          <Skeleton variant="text" height={40} width="60%" />
          <Skeleton variant="text" height={20} width="30%" sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" height={100} />
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => void navigate(-1)}
          sx={{ mb: 3 }}
        >
          Geri Dön
        </Button>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!report) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => void navigate(-1)}
          sx={{ mb: 3 }}
        >
          Geri Dön
        </Button>
        <Alert severity="warning">Rapor bulunamadı</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => void navigate(-1)}
          sx={{ mb: 3 }}
        >
          Geri Dön
        </Button>

        <Paper
          sx={{
            p: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                {report.title}
              </Typography>{' '}
              <Chip
                label={getStatusText(report.status)}
                color={getStatusColor(report.status)}
                variant="filled"
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3,
                color: 'text.secondary',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AlertTriangle size={16} />
                <Typography variant="body2">{report.category.name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MapPin size={16} />
                <Typography variant="body2">{report.address}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Calendar size={16} />
                <Typography variant="body2">
                  {formatDate(report.createdAt)}
                </Typography>
              </Box>{' '}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <User size={16} />
                <Typography variant="body2">{report.user.fullName}</Typography>
              </Box>
            </Box>
          </Box>
          <Divider sx={{ mb: 4 }} />
          {/* Description */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Açıklama
            </Typography>
            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                p: 3,
                backgroundColor: alpha(theme.palette.background.default, 0.5),
                borderRadius: 2,
              }}
            >
              {report.description}
            </Typography>
          </Box>{' '}
          {/* Current Department */}
          {report.currentDepartment && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Sorumlu Departman
              </Typography>
              <Chip
                label={report.currentDepartment.name}
                variant="outlined"
                color="primary"
              />
            </Box>
          )}{' '}
          {/* Report Media */}
          {report.reportMedias && report.reportMedias.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Fotoğraflar
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {report.reportMedias.map(media => (
                  <Box
                    key={media.id}
                    sx={{
                      width: 200,
                      height: 150,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    }}
                  >
                    <img
                      src={media.url}
                      alt="Rapor fotoğrafı"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
          {/* Support Count */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Destek
            </Typography>
            <Typography variant="body1">
              Bu raporu {report.supportCount} kişi destekledi
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};
