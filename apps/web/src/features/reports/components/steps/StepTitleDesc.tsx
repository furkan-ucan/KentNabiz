/**
 * Step 1: Title and Description Component
 * CreateReport formunun ilk adımı (başlık ve açıklama)
 */

import React from 'react';
import {
  VStack,
  Heading,
  Input,
  Textarea,
  Text,
  Box,
  Icon,
} from '@chakra-ui/react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/form-control';
import { useFormContext } from 'react-hook-form';
import { FileText, MessageSquare } from 'lucide-react';
import { CreateReportFormData } from '../../types/createReportForm.types';

export const StepTitleDesc: React.FC = () => {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext<CreateReportFormData>();

  // Karakter sayacı için
  const titleValue = watch('title') || '';
  const descriptionValue = watch('description') || '';

  return (
    <VStack gap={8} w="100%" align="stretch">
      {/* Adım Başlığı */}
      <Box textAlign="center" py={4}>
        <Icon as={FileText} w={12} h={12} color="blue.500" mb={4} />
        <Heading size="lg" color="gray.800" mb={2}>
          Sorunun Temel Bilgileri
        </Heading>
        <Text color="gray.600" fontSize="md">
          Yaşadığınız sorunu açık ve anlaşılır bir şekilde tanımlayın
        </Text>
      </Box>

      {/* Başlık Alanı */}
      <FormControl isInvalid={!!errors.title} isRequired>
        <FormLabel
          htmlFor="title"
          fontSize="md"
          fontWeight="semibold"
          color="gray.700"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Icon as={FileText} w={4} h={4} />
          Başlık
        </FormLabel>
        <Input
          id="title"
          type="text"
          placeholder="Örn: Mahalledeki kaldırım çatlağı"
          size="lg"
          {...register('title', {
            required: 'Başlık zorunludur',
            maxLength: {
              value: 100,
              message: 'En fazla 100 karakter girebilirsiniz',
            },
          })}
          _focus={{
            borderColor: 'blue.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
          }}
        />
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={1}
        >
          {errors.title ? (
            <FormErrorMessage>{errors.title.message}</FormErrorMessage>
          ) : (
            <Text fontSize="sm" color="gray.500">
              Sorunun kısa ve öz bir başlığını yazın
            </Text>
          )}
          <Text
            fontSize="sm"
            color={titleValue.length > 100 ? 'red.500' : 'gray.400'}
          >
            {titleValue.length}/100
          </Text>
        </Box>
      </FormControl>

      {/* Açıklama Alanı */}
      <FormControl isInvalid={!!errors.description} isRequired>
        <FormLabel
          htmlFor="description"
          fontSize="md"
          fontWeight="semibold"
          color="gray.700"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Icon as={MessageSquare} w={4} h={4} />
          Açıklama
        </FormLabel>
        <Textarea
          id="description"
          placeholder={`Sorunu detaylıca anlatın...\n\nÖrnek:\n- Sorun ne zaman başladı?\n- Hangi koşullarda ortaya çıkıyor?\n- Günlük yaşamınızı nasıl etkiliyor?\n- Daha önce bu konuda ne yapıldı?`}
          rows={8}
          size="lg"
          resize="vertical"
          {...register('description', {
            required: 'Açıklama zorunludur',
            maxLength: {
              value: 500,
              message: 'En fazla 500 karakter girebilirsiniz',
            },
          })}
          _focus={{
            borderColor: 'blue.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
          }}
        />
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={1}
        >
          {errors.description ? (
            <FormErrorMessage>{errors.description.message}</FormErrorMessage>
          ) : (
            <Text fontSize="sm" color="gray.500">
              Sorunu detaylıca açıklayarak çözüm sürecini hızlandırın
            </Text>
          )}
          <Text
            fontSize="sm"
            color={descriptionValue.length > 500 ? 'red.500' : 'gray.400'}
          >
            {descriptionValue.length}/500
          </Text>
        </Box>
      </FormControl>

      {/* İpucu Kutusu */}
      <Box
        bg="blue.50"
        p={4}
        borderRadius="lg"
        border="1px solid"
        borderColor="blue.200"
      >
        <Text fontSize="sm" color="blue.800" fontWeight="medium" mb={2}>
          💡 İpucu: Etkili rapor yazma
        </Text>
        <VStack align="start" gap={1}>
          <Text fontSize="sm" color="blue.700">
            • Sorunu net ve anlaşılır bir dille ifade edin
          </Text>
          <Text fontSize="sm" color="blue.700">
            • Mümkünse sorunun ne zaman başladığını belirtin
          </Text>
          <Text fontSize="sm" color="blue.700">
            • Sorunu deneyimlediğiniz sıklığı açıklayın
          </Text>
          <Text fontSize="sm" color="blue.700">
            • Size ve çevrenize olan etkisini anlatın
          </Text>
        </VStack>
      </Box>
    </VStack>
  );
};
