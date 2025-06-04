/**
 * Step 4: Media Upload Component
 * CreateReport formunun dördüncü adımı (medya yükleme)
 */

import React, { useState, useRef } from 'react';
import {
  VStack,
  Heading,
  Text,
  Box,
  Icon,
  Button,
  SimpleGrid,
  Image,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { FormControl, FormErrorMessage } from '@chakra-ui/form-control';
import { Alert, AlertIcon } from '@chakra-ui/alert';
import { Progress } from '@chakra-ui/progress';
import { useFormContext } from 'react-hook-form';
import {
  Camera,
  Upload,
  X,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CreateReportFormData } from '../../types/createReportForm.types';

interface ImageFile {
  file: File;
  preview: string;
  name: string;
  size: number;
}

export const StepMedia: React.FC<{
  onNext: () => void;
  onBack: () => void;
}> = ({ onNext, onBack }) => {
  const {
    setValue,
    formState: { errors },
    trigger,
  } = useFormContext<CreateReportFormData>();

  const [uploadedImages, setUploadedImages] = useState<ImageFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Kullanıcı dosya seçtiğinde
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    processFiles(files);
  };

  // Dosyaları kontrol edip preview oluşturma
  const processFiles = (files: File[]) => {
    const maxFiles = 5;
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    // Geçerli dosyaları filtrele
    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name}: Sadece JPG, PNG ve WebP formatları destekleniyor`);
        return false;
      }
      if (file.size > maxSize) {
        alert(`${file.name}: Dosya boyutu 10MB'dan küçük olmalıdır`);
        return false;
      }
      return true;
    });

    // Maksimum dosya sayısı kontrolü
    if (uploadedImages.length + validFiles.length > maxFiles) {
      alert(`En fazla ${maxFiles} dosya yükleyebilirsiniz`);
      return;
    }

    // Preview URL’li nesne listesi oluştur
    const newImages: ImageFile[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));

    setUploadedImages(prev => {
      const updated = [...prev, ...newImages];

      // Form state’ine sadece File[] dizisini veriyoruz
      setValue(
        'reportMedias',
        updated.map(img => img.file),
        {
          shouldValidate: true,
          shouldDirty: true,
        }
      );

      return updated;
    });

    // Yükleme ilerlemesini simüle et
    simulateUpload();
  };

  // Yükleme çubuğunu simüle et
  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Bir resmi kaldır
  const removeImage = (index: number) => {
    setUploadedImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index].preview);
      setValue(
        'reportMedias',
        updated.map(img => img.file),
        {
          shouldValidate: true,
          shouldDirty: true,
        }
      );
      return updated;
    });
  };

  // Bayt cinsinden dosya boyutunu okunabilir string’e çevir
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Sürükle-bırak işlemi için
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  // İleri butonuna tıklandığında medyayı validasyon açısından tetikle, sonra onNext
  const handleNext = async () => {
    // “reportMedias” alanı isteğe bağlı, ama yine de trigger yapabiliriz
    const valid = await trigger('reportMedias');
    if (valid) {
      onNext();
    }
  };

  return (
    <VStack gap={8} w="100%" align="stretch">
      {/* 1) Başlık */}
      <Box textAlign="center" py={4}>
        <Icon as={Camera} w={12} h={12} color="blue.500" mb={4} />
        <Heading size="lg" color="gray.800" mb={2}>
          Adım 4: Fotoğraf & Medya
        </Heading>
        <Text color="gray.600" fontSize="md">
          Sorununuzu fotoğraflarla destekleyin (opsiyonel)
        </Text>
      </Box>

      {/* 2) Dosya Yükleme Alanı */}
      <FormControl isInvalid={!!errors.reportMedias}>
        <Text
          fontSize="md"
          fontWeight="semibold"
          color="gray.700"
          display="flex"
          alignItems="center"
          gap={2}
          mb={2}
        >
          <Icon as={ImageIcon} w={4} h={4} />
          Fotoğraflar (Opsiyonel)
        </Text>

        <Box
          border="2px dashed"
          borderColor="gray.300"
          borderRadius="lg"
          p={8}
          textAlign="center"
          bg="gray.50"
          cursor="pointer"
          transition="all 0.2s"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          _hover={{
            borderColor: 'blue.400',
            bg: 'blue.50',
          }}
        >
          <VStack gap={4}>
            <Icon as={Upload} w={12} h={12} color="gray.400" />
            <VStack gap={1}>
              <Text fontWeight="semibold" color="gray.700">
                Fotoğraf yüklemek için tıklayın veya sürükleyip bırakın
              </Text>
              <Text fontSize="sm" color="gray.500">
                JPG, PNG veya WebP formatında, en fazla 10MB
              </Text>
            </VStack>
            <Button
              colorScheme="blue"
              variant="outline"
              onClick={e => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <Icon as={Camera} mr={2} /> Dosya Seç
            </Button>
          </VStack>
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {/* Yükleme İlerleme Çubuğu */}
        {isUploading && (
          <Box mt={4}>
            <Text fontSize="sm" color="blue.600" mb={2}>
              Yükleniyor... {uploadProgress}%
            </Text>
            <Progress value={uploadProgress} colorScheme="blue" size="sm" />
          </Box>
        )}

        {errors.reportMedias && (
          <FormErrorMessage mt={2}>
            {typeof errors.reportMedias?.message === 'string'
              ? errors.reportMedias.message
              : ''}
          </FormErrorMessage>
        )}
      </FormControl>

      {/* 3) Yüklenen Resimler Gridi */}
      {uploadedImages.length > 0 && (
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <Text fontWeight="semibold" color="gray.700">
              Yüklenen Fotoğraflar ({uploadedImages.length}/5)
            </Text>
            <Badge colorScheme="blue" variant="subtle">
              Toplam:{' '}
              {formatFileSize(
                uploadedImages.reduce((total, img) => total + img.size, 0)
              )}
            </Badge>
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            {uploadedImages.map((image, index) => (
              <Box
                key={index}
                position="relative"
                borderRadius="lg"
                overflow="hidden"
                border="1px solid"
                borderColor="gray.200"
                bg="white"
                shadow="sm"
              >
                <Image
                  src={image.preview}
                  alt={`Yüklenen fotoğraf ${index + 1}`}
                  w="full"
                  h="200px"
                  objectFit="cover"
                />

                {/* Kaldır Butonu */}
                <Button
                  aria-label="Fotoğrafı kaldır"
                  size="sm"
                  colorScheme="red"
                  variant="solid"
                  position="absolute"
                  top={2}
                  right={2}
                  borderRadius="full"
                  onClick={() => removeImage(index)}
                >
                  <Icon as={X} />
                </Button>

                {/* Dosya Bilgisi */}
                <Box p={3} bg="white">
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.800"
                    truncate // isTruncated yerine v3 için truncate kullanıldı
                  >
                    {image.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {formatFileSize(image.size)}
                  </Text>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {/* 4) Dosya Kuralları Bilgilendirme */}
      <Alert status="info" borderRadius="lg">
        <AlertIcon />
        <VStack align="start" gap={1}>
          <Text fontSize="sm" fontWeight="medium">
            Dosya Yükleme Kuralları:
          </Text>
          <Text fontSize="sm">• En fazla 5 fotoğraf yükleyebilirsiniz</Text>
          <Text fontSize="sm">• Her dosya en fazla 10MB olabilir</Text>
          <Text fontSize="sm">• Desteklenen formatlar: JPG, PNG, WebP</Text>
        </VStack>
      </Alert>

      {/* 5) Yardımcı İpuçları */}
      <Box
        bg="green.50"
        p={4}
        borderRadius="lg"
        border="1px solid"
        borderColor="green.200"
      >
        <Text fontSize="sm" color="green.800" fontWeight="medium" mb={2}>
          📸 İpucu: Etkili fotoğraf çekimi
        </Text>
        <VStack align="start" gap={1}>
          <Text fontSize="sm" color="green.700">
            • Sorunu açıkça gösteren fotoğraflar çekin
          </Text>
          <Text fontSize="sm" color="green.700">
            • Farklı açılardan çekim yaparak detayları vurgulayın
          </Text>
          <Text fontSize="sm" color="green.700">
            • Fotoğraflar, sorununuzun ciddiyetini ekiplerimnize gösterir
          </Text>
          <Text fontSize="sm" color="green.700">
            • Bu adım opsiyoneldir; fotoğraf eklemeden de devam edebilirsiniz
          </Text>
        </VStack>
      </Box>

      {/* 6) Geri ve İleri Butonları */}
      <HStack justify="space-between" w="100%">
        <Button onClick={onBack} variant="outline">
          <Icon as={ChevronLeft} mr={2} /> Geri
        </Button>
        <Button colorScheme="brand" onClick={() => void handleNext()}>
          İleri <Icon as={ChevronRight} ml={2} />
        </Button>
      </HStack>
    </VStack>
  );
};
