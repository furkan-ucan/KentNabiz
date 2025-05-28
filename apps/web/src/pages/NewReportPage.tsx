import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  Textarea,
  Field,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const NewReportPage: React.FC = () => {
  return (
    <Box p={6} maxW="2xl" mx="auto">
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading as="h1" size="xl" color="brand.500" mb={2}>
            Yeni Rapor Oluştur
          </Heading>
          <Text color="gray.600">
            Karşılaştığınız sorunu detaylı bir şekilde bildirin
          </Text>
        </Box>

        {/* Form */}
        <Box p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
          <VStack gap={6} align="stretch">
            <Field.Root>
              <Field.Label color="gray.700" fontWeight="medium">
                Rapor Başlığı *
              </Field.Label>
              <Input
                placeholder="Kısa ve açıklayıcı bir başlık girin"
                size="lg"
              />
            </Field.Root>

            <Field.Root>
              <Field.Label color="gray.700" fontWeight="medium">
                Kategori *
              </Field.Label>
              <Box
                as="select"
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="md"
                px={3}
                py={3}
                fontSize="md"
                _focus={{ borderColor: 'brand.500', outline: 'none' }}
              >
                <option value="">Kategori seçin</option>
                <option value="infrastructure">Altyapı</option>
                <option value="cleaning">Temizlik</option>
                <option value="lighting">Aydınlatma</option>
                <option value="transportation">Ulaşım</option>
                <option value="parks">Park ve Bahçe</option>
                <option value="other">Diğer</option>
              </Box>
            </Field.Root>

            <Field.Root>
              <Field.Label color="gray.700" fontWeight="medium">
                Konum *
              </Field.Label>
              <Input
                placeholder="Mahalle, sokak adı veya detaylı adres"
                size="lg"
              />
            </Field.Root>

            <Field.Root>
              <Field.Label color="gray.700" fontWeight="medium">
                Açıklama *
              </Field.Label>
              <Textarea
                placeholder="Sorunu detaylı bir şekilde açıklayın..."
                rows={6}
                resize="vertical"
              />
            </Field.Root>

            <Field.Root>
              <Field.Label color="gray.700" fontWeight="medium">
                Öncelik
              </Field.Label>
              <Box
                as="select"
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="md"
                px={3}
                py={3}
                fontSize="md"
                _focus={{ borderColor: 'brand.500', outline: 'none' }}
              >
                <option value="">Öncelik seviyesi seçin</option>
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
                <option value="urgent">Acil</option>
              </Box>
            </Field.Root>

            <Field.Root>
              <Field.Label color="gray.700" fontWeight="medium">
                Fotoğraf Ekle
              </Field.Label>
              <Box
                p={8}
                borderWidth="2px"
                borderStyle="dashed"
                borderColor="gray.300"
                borderRadius="lg"
                textAlign="center"
                bg="gray.50"
                _hover={{ bg: 'gray.100' }}
                cursor="pointer"
              >
                <Text color="gray.500" mb={2}>
                  Fotoğraf yüklemek için tıklayın veya sürükleyip bırakın
                </Text>
                <Text fontSize="sm" color="gray.400">
                  PNG, JPG, JPEG (Maks. 5MB)
                </Text>
              </Box>
            </Field.Root>

            {/* Contact Information */}
            <Box
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              bg="blue.50"
              borderColor="blue.200"
            >
              <Heading as="h3" size="sm" color="blue.800" mb={3}>
                İletişim Bilgileri
              </Heading>
              <VStack gap={4} align="stretch">
                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="medium">
                    Ad Soyad
                  </Field.Label>
                  <Input placeholder="Adınız ve soyadınız" bg="white" />
                </Field.Root>

                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="medium">
                    Telefon
                  </Field.Label>
                  <Input placeholder="0555 123 45 67" bg="white" />
                </Field.Root>

                <Field.Root>
                  <Field.Label color="gray.700" fontWeight="medium">
                    E-posta
                  </Field.Label>
                  <Input
                    type="email"
                    placeholder="ornek@email.com"
                    bg="white"
                  />
                </Field.Root>
              </VStack>
            </Box>

            {/* Action Buttons */}
            <HStack gap={4} justify="flex-end" pt={4}>
              <Button asChild variant="outline" size="lg">
                <RouterLink to="/reports">İptal</RouterLink>
              </Button>
              <Button colorPalette="brand" size="lg" minW="120px">
                Rapor Gönder
              </Button>
            </HStack>
          </VStack>
        </Box>

        {/* Help Text */}
        <Box
          p={4}
          borderWidth="1px"
          borderRadius="lg"
          bg="yellow.50"
          borderColor="yellow.200"
        >
          <Heading as="h3" size="sm" color="yellow.800" mb={2}>
            💡 İpuçları
          </Heading>
          <VStack align="start" gap={1} fontSize="sm" color="yellow.700">
            <Text>• Sorunu mümkün olduğunca detaylı açıklayın</Text>
            <Text>• Konum bilgisini doğru ve net belirtin</Text>
            <Text>
              • Fotoğraf eklemek sorununuzun daha hızlı çözülmesine yardımcı
              olur
            </Text>
            <Text>
              • Acil durumlar için öncelik seviyesini &quot;Acil&quot; olarak
              seçin
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default NewReportPage;
