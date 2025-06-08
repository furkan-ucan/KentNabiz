// apps/web/src/pages/CreateReportPage/Step4_Media.tsx

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  Card,
  CardContent,
  CardActions,
  Fade,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { api } from '../../lib/api';
import { stepBoxStyle } from './styles';
import { ReportFormData } from './types';

// API'den dönen media response tipi
interface MediaUploadItem {
  filename: string;
  originalname: string;
  url: string;
  mimetype: string;
  type: string;
  size: number;
  metadata: {
    size: number;
    mimetype: string;
    originalname: string;
    width?: number;
    height?: number;
    format?: string;
  };
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  bucketName: string;
  id: number;
  createdAt: string;
  updatedAt: string;
}

interface MediaUploadResponse {
  data: MediaUploadItem[];
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const DropZone = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  background:
    'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.1) 100%)',
  backdropFilter: 'blur(10px)',
  '&:hover': {
    borderColor: theme.palette.primary.light,
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
    transform: 'translateY(-2px)',
  },
}));

// Dosya tipine göre ikon döndüren helper
const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <ImageIcon />;
  if (fileType.startsWith('video/')) return <VideoIcon />;
  return <FileIcon />;
};

// Dosya boyutunu formatla
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const Step4_Media: React.FC = () => {
  const { setValue, watch } = useFormContext<ReportFormData>();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const existingMedias = watch('reportMedias') || [];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const totalFiles =
        selectedFiles.length + existingMedias.length + newFiles.length;

      if (totalFiles > 5) {
        setError('En fazla 5 dosya yükleyebilirsiniz.');
        return;
      }

      // Dosya boyutu kontrolü (10MB)
      const oversizedFiles = newFiles.filter(
        file => file.size > 10 * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        setError("Dosya boyutu 10MB'dan büyük olamaz.");
        return;
      }

      setSelectedFiles(prev => [...prev, ...newFiles]);
      setError(null);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveUploadedMedia = (index: number) => {
    const updatedMedias = existingMedias.filter((_, i) => i !== index);
    setValue('reportMedias', updatedMedias);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      // Simulated progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await api.post('/media/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      clearInterval(progressInterval);
      setUploadProgress(100); // API'den dönen Media[] objelerini formun beklediği formata dönüştür
      const apiResponse = response.data as MediaUploadResponse;
      const newMedias = apiResponse.data.map((mediaItem: MediaUploadItem) => ({
        url: mediaItem.url,
        type: mediaItem.type,
      }));

      // Mevcut medyaları koruyarak yenileri ekle
      setValue('reportMedias', [...existingMedias, ...newMedias]);

      setSelectedFiles([]); // Yüklenen dosyaları temizle

      setTimeout(() => setUploadProgress(0), 1000);
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : 'Dosya yüklenirken bir hata oluştu.';
      setError(errorMessage || 'Dosya yüklenirken bir hata oluştu.');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

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
        Görsel Kanıt Ekleyin
      </Typography>

      <Typography
        variant="body1"
        sx={{
          mb: 4,
          color: 'text.secondary',
          lineHeight: 1.6,
        }}
      >
        Raporunuzu destekleyecek fotoğraf, video veya diğer belgeleri
        yükleyebilirsiniz. En fazla 5 dosya, her biri maksimum 10MB olabilir.
      </Typography>

      <Stack spacing={3}>
        {/* Dosya Yükleme Alanı */}
        <DropZone as="label">
          <CloudUploadIcon
            sx={{ fontSize: 48, color: 'primary.main', mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            Dosya Seçin veya Sürükleyin
          </Typography>
          <Typography variant="body2" color="text.secondary">
            JPG, PNG, MP4, PDF dosyaları desteklenir
          </Typography>
          <VisuallyHiddenInput
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
          />
        </DropZone>

        {/* Hata Mesajı */}
        {error && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Seçilen Dosyalar */}
        {selectedFiles.length > 0 && (
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
              <Typography variant="h6" gutterBottom>
                Yüklenecek Dosyalar ({selectedFiles.length})
              </Typography>

              <List dense>
                {selectedFiles.map((file, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 1,
                      mb: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      {getFileIcon(file.type)}
                    </Box>
                    <ListItemText
                      primary={file.name}
                      secondary={formatFileSize(file.size)}
                      primaryTypographyProps={{ noWrap: true }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveFile(index)}
                        size="small"
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>

            <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button
                variant="contained"
                startIcon={
                  isUploading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <CloudUploadIcon />
                  )
                }
                onClick={() => void handleUpload()}
                disabled={isUploading}
                sx={{ minWidth: 200 }}
              >
                {isUploading
                  ? 'Yükleniyor...'
                  : `${selectedFiles.length} Dosyayı Yükle`}
              </Button>
            </CardActions>

            {/* Upload Progress */}
            {isUploading && uploadProgress > 0 && (
              <Box sx={{ px: 2, pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <Box
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          backgroundColor: 'primary.main',
                          borderRadius: 4,
                          width: `${uploadProgress}%`,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minWidth: 40 }}
                  >
                    {uploadProgress}%
                  </Typography>
                </Box>
              </Box>
            )}
          </Card>
        )}

        {/* Yüklenmiş Medyalar */}
        {existingMedias.length > 0 && (
          <Fade in={true}>
            <Card
              sx={{
                background:
                  'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(76, 175, 80, 0.2)',
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="h6" color="success.main">
                    Yüklenmiş Dosyalar ({existingMedias.length})
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {existingMedias.map((_, index) => (
                    <Chip
                      key={index}
                      label={`Dosya ${index + 1}`}
                      onDelete={() => handleRemoveUploadedMedia(index)}
                      deleteIcon={<DeleteIcon />}
                      color="success"
                      variant="outlined"
                      sx={{
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        '& .MuiChip-deleteIcon': {
                          color: 'success.main',
                        },
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Dosya Limiti Bilgisi */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            Toplam dosya sayısı: {existingMedias.length + selectedFiles.length}{' '}
            / 5
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default Step4_Media;
