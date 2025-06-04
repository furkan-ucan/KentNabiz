/**
 * Step 3: Location Selection Component
 * Üçüncü adım: CreateReport formunun konum seçme bölümü
 */

import React, { useState } from 'react';
import {
  VStack,
  Heading,
  Text,
  Box,
  Icon,
  Input,
  Button,
  HStack,
  Badge,
} from '@chakra-ui/react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/form-control';
import { Alert, AlertIcon } from '@chakra-ui/alert';
import { useFormContext } from 'react-hook-form';
import { MapPin, Navigation, Search } from 'lucide-react';
import { CreateReportFormData } from '../../types/createReportForm.types';

export const StepLocation: React.FC<{
  onNext: () => void;
  onBack: () => void;
}> = ({ onNext, onBack }) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useFormContext<CreateReportFormData>();

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const currentLocation = watch('location');
  const currentAddress = watch('address') || '';

  // Örnek adres önerileri (gerçek coğrafi kodlama API’si ile değiştirilecek)
  const mockSuggestions = [
    'Atatürk Mahallesi, Cumhuriyet Caddesi No:123, Kadıköy/İstanbul',
    'Atatürk Mahallesi, Bağdat Caddesi No:456, Kadıköy/İstanbul',
    'Atatürk Mahallesi, Fenerbahçe Cd. No:789, Kadıköy/İstanbul',
  ];

  // Geçerli konumu tarayıcıdan al
  const getCurrentLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Tarayıcınız konum servisini desteklemiyor');
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      position => {
        void (async () => {
          const { latitude, longitude } = position.coords;

          try {
            // Koordinat bilgisini form state’e ata
            setValue(
              'location',
              {
                lat: latitude,
                lng: longitude,
              },
              {
                shouldValidate: true,
                shouldDirty: true,
              }
            );

            // Örneğin burada gerçek bir “reverse geocoding” API çağrısı yapılabilir
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockAddress = `Enlem: ${latitude.toFixed(
              6
            )}, Boylam: ${longitude.toFixed(6)} civarı`;
            setValue('address', mockAddress, {
              shouldValidate: true,
              shouldDirty: true,
            });
          } catch {
            setLocationError('Adres bilgisi alınırken hata oluştu');
          } finally {
            setIsLocating(false);
          }
        })();
      },
      positionError => {
        let errorMessage = 'Konum alınırken hata oluştu';
        switch (positionError.code) {
          case positionError.PERMISSION_DENIED:
            errorMessage =
              'Konum erişimi reddedildi. Lütfen tarayıcı ayarlarınızı kontrol edin.';
            break;
          case positionError.POSITION_UNAVAILABLE:
            errorMessage = 'Konum bilgisi mevcut değil';
            break;
          case positionError.TIMEOUT:
            errorMessage = 'Konum alma işlemi zaman aşımına uğradı';
            break;
        }
        setLocationError(errorMessage);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Adres input’u yazıldığında öneri listesi için mock filtresi
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue('address', value, { shouldDirty: true }); // Adres yazarken de formu kirli hale getir
    if (value.length > 2) {
      setAddressSuggestions(
        mockSuggestions.filter(addr =>
          addr.toLowerCase().includes(value.toLowerCase())
        )
      );
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Kullanıcı öneri listesinden bir adres seçtiğinde
  const selectAddress = (address: string) => {
    setValue('address', address, {
      shouldValidate: true,
      shouldDirty: true,
    });

    // Örnek geocoding (rastgele konum ataması)
    setValue(
      'location',
      {
        lat: 40.9769 + (Math.random() - 0.5) * 0.01,
        lng: 29.1244 + (Math.random() - 0.5) * 0.01,
      },
      {
        shouldValidate: true,
        shouldDirty: true,
      }
    );

    setShowSuggestions(false);
  };

  // “İleri” butonuna tıklanınca önce validasyonu tetikle
  const handleNext = async () => {
    const valid = await trigger(['location', 'address']);
    if (valid) {
      onNext();
    }
  };

  return (
    <VStack gap={8} w="100%" align="stretch">
      {/* 1) Adım Başlığı */}
      <Box textAlign="center" py={4}>
        <Icon as={MapPin} w={12} h={12} color="blue.500" mb={4} />
        <Heading size="lg" color="gray.800" mb={2}>
          Adım 3: Konum Bilgileri
        </Heading>
        <Text color="gray.600" fontSize="md">
          Sorunun bulunduğu konumu belirtin
        </Text>
      </Box>

      {/* 2) Mevcut Konumu Kullan Butonu */}
      <Box>
        <Button
          onClick={getCurrentLocation}
          loading={isLocating}
          loadingText="Konum alınıyor..."
          colorScheme="green"
          size="lg"
          w="full"
          variant="outline"
          _hover={{
            bg: 'green.50',
            borderColor: 'green.300',
          }}
        >
          <Icon as={Navigation} mr={2} />
          Mevcut Konumumu Kullan
        </Button>
        {locationError && (
          <Alert status="error" mt={4}>
            <AlertIcon />
            <Text fontSize="sm">{locationError}</Text>
          </Alert>
        )}
      </Box>

      {/* 3) Adres Input + Öneri Listesi */}
      <FormControl isInvalid={!!errors.address} isRequired>
        <FormLabel
          fontSize="md"
          fontWeight="semibold"
          color="gray.700"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Icon as={Search} w={4} h={4} />
          Adres
        </FormLabel>
        <Box position="relative">
          <Input
            {...register('address', {
              required: 'Adres zorunludur',
            })}
            placeholder="Örn: Atatürk Mah. Cumhuriyet Cad. No:123, Kadıköy/İstanbul"
            size="lg"
            onChange={handleAddressChange}
            onBlur={() => setShowSuggestions(false)} // Odak dışı kalınca önerileri gizle
            onFocus={e => {
              // Odaklanınca ve input doluysa önerileri göster
              if (e.target.value.length > 2) {
                setShowSuggestions(true);
              }
            }}
            _focus={{
              borderColor: 'blue.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
            }}
          />

          {/* Öneri Listesi */}
          {showSuggestions && addressSuggestions.length > 0 && (
            <Box
              position="absolute"
              top="100%"
              left={0}
              right={0}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              shadow="lg"
              zIndex={10}
              maxH="200px"
              overflowY="auto"
              mt={1} // Input ile arasında küçük bir boşluk
            >
              {addressSuggestions.map((suggestion, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  size="sm"
                  w="full"
                  justifyContent="flex-start"
                  p={3}
                  borderRadius={0}
                  fontWeight="normal"
                  onClick={() => selectAddress(suggestion)}
                  _hover={{ bg: 'gray.50' }}
                  // Öneriye tıklandığında input'tan blur olmasını engellemek için
                  onMouseDown={e => e.preventDefault()}
                >
                  <Icon as={MapPin} w={4} h={4} mr={2} color="gray.400" />
                  <Text
                    fontSize="sm"
                    textAlign="left"
                    whiteSpace="normal"
                    wordBreak="break-word"
                  >
                    {suggestion}
                  </Text>
                </Button>
              ))}
            </Box>
          )}
        </Box>
        {errors.address ? (
          <FormErrorMessage>{errors.address.message}</FormErrorMessage>
        ) : (
          <Text fontSize="sm" color="gray.500" mt={1}>
            Adres yazarak öneri listesinden seçebilir veya mevcut konumunuzu
            kullanabilirsiniz
          </Text>
        )}
      </FormControl>

      {/* 4) Seçilen Konumun Özet Bilgisi */}
      {currentLocation &&
        currentAddress &&
        !errors.address &&
        !errors.location && (
          <Box
            bg="green.50"
            p={4}
            borderRadius="lg"
            border="1px solid"
            borderColor="green.200"
          >
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={2} flex={1}>
                <HStack>
                  <Icon as={MapPin} color="green.600" />
                  <Text fontSize="sm" fontWeight="medium" color="green.800">
                    Seçilen Konum
                  </Text>
                </HStack>
                <Text fontSize="sm" color="green.700">
                  {currentAddress}
                </Text>
                {currentLocation.lat && currentLocation.lng && (
                  <HStack gap={4}>
                    <Badge colorScheme="green" variant="subtle">
                      Enlem: {currentLocation.lat.toFixed(6)}
                    </Badge>
                    <Badge colorScheme="green" variant="subtle">
                      Boylam: {currentLocation.lng.toFixed(6)}
                    </Badge>
                  </HStack>
                )}
              </VStack>
            </HStack>
          </Box>
        )}

      {/* 5) Yardımcı İpuçları */}
      <Box
        bg="blue.50"
        p={4}
        borderRadius="lg"
        border="1px solid"
        borderColor="blue.200"
      >
        <Text fontSize="sm" color="blue.800" fontWeight="medium" mb={2}>
          💡 İpucu: Konum belirtme
        </Text>
        <VStack align="start" gap={1}>
          <Text fontSize="sm" color="blue.700">
            • Mevcut konumunuzu kullanarak hızlıca konum belirleyebilirsiniz.
          </Text>
          <Text fontSize="sm" color="blue.700">
            • Adres yazarak daha spesifik konum girebilirsiniz.
          </Text>
          <Text fontSize="sm" color="blue.700">
            • Doğru konum bilgisi ekiplerin hızlı müdahale etmesini sağlar.
          </Text>
        </VStack>
      </Box>

      {/* 6) Geri ve İleri Butonları */}
      <HStack justify="space-between" w="100%" mt={4}>
        <Button onClick={onBack} variant="outline" size="lg">
          ← Geri
        </Button>
        <Button colorScheme="brand" onClick={() => void handleNext()} size="lg">
          İleri →
        </Button>
      </HStack>
    </VStack>
  );
};
