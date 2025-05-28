import React, { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Heading,
  Grid,
  Card,
} from '@chakra-ui/react';
import { FiBarChart, FiClock, FiCheckCircle, FiX } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { StatCard } from '@/components/ui/StatCard';

export const ChakraV3Demo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleLoadingTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Box p={8} maxW="1200px" mx="auto">
      <VStack gap={8} align="stretch">
        <Box textAlign="center">
          <Heading size="2xl" mb={4}>
            🎉 Chakra UI v3 Demo
          </Heading>
          <Text fontSize="lg" color="gray.600">
            KentNabız projesi artık Chakra UI v3 kullanıyor!
          </Text>
        </Box>

        {/* ColorPalette Özelliği */}
        <Card.Root p={6}>
          <Card.Header>
            <Heading size="lg">🎨 ColorPalette Özelliği</Heading>
            <Text color="gray.600">
              v3&apos;ün yeni colorPalette özelliği ile renk paletlerini kolayca
              değiştirebilirsiniz
            </Text>
          </Card.Header>
          <Card.Body>
            <Grid
              templateColumns="repeat(auto-fit, minmax(250px, 1fr))"
              gap={4}
            >
              <StatCard
                label="Toplam Rapor"
                value="1,234"
                icon={FiBarChart}
                helpText="+12% bu ay"
                arrowType="increase"
                colorPalette="blue"
              />
              <StatCard
                label="Bekleyen"
                value="56"
                icon={FiClock}
                helpText="-5% bu ay"
                arrowType="decrease"
                colorPalette="orange"
              />
              <StatCard
                label="Tamamlanan"
                value="890"
                icon={FiCheckCircle}
                helpText="+8% bu ay"
                arrowType="increase"
                colorPalette="green"
              />
              <StatCard
                label="İptal Edilen"
                value="23"
                icon={FiX}
                helpText="+2% bu ay"
                arrowType="increase"
                colorPalette="red"
              />
            </Grid>
          </Card.Body>
        </Card.Root>

        {/* Yeni Button Snippet */}
        <Card.Root p={6}>
          <Card.Header>
            <Heading size="lg">🔘 Yeni Button Snippet</Heading>
            <Text color="gray.600">
              Loading state&apos;li gelişmiş button bileşeni
            </Text>
          </Card.Header>
          <Card.Body>
            <HStack gap={4} wrap="wrap">
              <Button
                colorPalette="blue"
                onClick={handleLoadingTest}
                loading={loading}
                loadingText="Yükleniyor..."
              >
                Loading Test
              </Button>
              <Button colorPalette="green" variant="solid">
                Solid Green
              </Button>
              <Button colorPalette="red" variant="outline">
                Outline Red
              </Button>
              <Button colorPalette="purple" variant="ghost">
                Ghost Purple
              </Button>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* Yeni Checkbox Snippet */}
        <Card.Root p={6}>
          <Card.Header>
            <Heading size="lg">☑️ Yeni Checkbox Snippet</Heading>
            <Text color="gray.600">Composable checkbox bileşeni</Text>
          </Card.Header>
          <Card.Body>
            <VStack align="start" gap={3}>
              <Checkbox
                checked={checked}
                onCheckedChange={e => setChecked(!!e.checked)}
                colorPalette="blue"
              >
                Ana checkbox
              </Checkbox>
              <Checkbox colorPalette="green" defaultChecked>
                Varsayılan seçili
              </Checkbox>
              <Checkbox colorPalette="red" disabled>
                Devre dışı
              </Checkbox>
              <Checkbox colorPalette="purple">Belirsiz durum</Checkbox>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Semantic Tokens */}
        <Card.Root p={6}>
          <Card.Header>
            <Heading size="lg">🎯 Semantic Tokens</Heading>
            <Text color="gray.600">Özel tema tokenlarımız</Text>
          </Card.Header>
          <Card.Body>
            <Grid
              templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
              gap={4}
            >
              <Box colorPalette="brand">
                <Box
                  bg="colorPalette.solid"
                  color="colorPalette.contrast"
                  p={4}
                  borderRadius="md"
                >
                  <Text fontWeight="bold">Brand Solid</Text>
                  <Text fontSize="sm">colorPalette.solid</Text>
                </Box>
              </Box>
              <Box colorPalette="brand">
                <Box
                  bg="colorPalette.subtle"
                  color="colorPalette.fg"
                  p={4}
                  borderRadius="md"
                >
                  <Text fontWeight="bold">Brand Subtle</Text>
                  <Text fontSize="sm">colorPalette.subtle</Text>
                </Box>
              </Box>
              <Box colorPalette="brand">
                <Box
                  bg="colorPalette.emphasized"
                  color="colorPalette.fg"
                  p={4}
                  borderRadius="md"
                >
                  <Text fontWeight="bold">Brand Emphasized</Text>
                  <Text fontSize="sm">colorPalette.emphasized</Text>
                </Box>
              </Box>
            </Grid>
          </Card.Body>
        </Card.Root>

        {/* v3 Avantajları */}
        <Card.Root p={6}>
          <Card.Header>
            <Heading size="lg">🚀 v3 Avantajları</Heading>
          </Card.Header>
          <Card.Body>
            <Grid
              templateColumns="repeat(auto-fit, minmax(300px, 1fr))"
              gap={6}
            >
              <VStack align="start" gap={3}>
                <Text fontWeight="bold" color="green.600">
                  ✅ Daha Az Dependency
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Sadece 2 paket: @chakra-ui/react + @emotion/react
                </Text>
              </VStack>
              <VStack align="start" gap={3}>
                <Text fontWeight="bold" color="green.600">
                  ✅ Snippet Sistemi
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Hazır bileşenler CLI ile kolayca eklenebilir
                </Text>
              </VStack>
              <VStack align="start" gap={3}>
                <Text fontWeight="bold" color="green.600">
                  ✅ ColorPalette
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Dinamik renk paletleri ile tutarlı tasarım
                </Text>
              </VStack>
              <VStack align="start" gap={3}>
                <Text fontWeight="bold" color="green.600">
                  ✅ Composable API
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Daha esnek ve özelleştirilebilir bileşenler
                </Text>
              </VStack>
              <VStack align="start" gap={3}>
                <Text fontWeight="bold" color="green.600">
                  ✅ Better Performance
                </Text>
                <Text fontSize="sm" color="gray.600">
                  %50 daha küçük bundle size
                </Text>
              </VStack>
              <VStack align="start" gap={3}>
                <Text fontWeight="bold" color="green.600">
                  ✅ Modern Theming
                </Text>
                <Text fontSize="sm" color="gray.600">
                  createSystem ile gelişmiş tema sistemi
                </Text>
              </VStack>
            </Grid>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
};
