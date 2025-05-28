import React, { ElementType } from 'react';
import { Box, Text, Icon, BoxProps, HStack, VStack } from '@chakra-ui/react';

interface StatCardProps extends Omit<BoxProps, 'children'> {
  /** İstatistiğin etiketi (örn: "Toplam Raporların") */
  label: string;
  /** İstatistiğin sayısal veya metinsel değeri */
  value: string | number;
  /** Opsiyonel olarak gösterilecek ikon (react-icons veya Chakra UI ikonları) */
  icon?: ElementType;
  /** İkonu saran Box için ek stil prop'ları */
  iconContainerProps?: BoxProps;
  /** İstatistiğe ait opsiyonel açıklama veya karşılaştırma metni */
  helpText?: string;
  /** StatHelpText içinde gösterilecek trend oku */
  arrowType?: 'increase' | 'decrease';
  /** Kartın genel renk teması için Chakra UI colorPalette değeri */
  colorPalette?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  iconContainerProps,
  helpText,
  arrowType,
  colorPalette = 'gray',
  ...rest
}) => {
  // Trend oku karakterleri
  const arrowIcon = {
    increase: '↗',
    decrease: '↘',
  };

  return (
    <Box
      colorPalette={colorPalette}
      p={{ base: 4, md: 5 }}
      bg={{ base: 'white', _dark: 'gray.800' }}
      shadow="md"
      borderWidth="1px"
      borderColor={{ base: 'gray.200', _dark: 'gray.600' }}
      borderRadius="lg"
      transition="all 0.2s ease-in-out"
      _hover={{
        shadow: 'xl',
        transform: 'translateY(-4px)',
      }}
      role="group"
      {...rest}
    >
      <HStack justify="space-between" align="flex-start" gap={4}>
        {/* Metin Bölümü */}
        <VStack align="start" flex="1" minW="0" gap={1}>
          {/* StatLabel */}
          <Text
            fontSize="sm"
            fontWeight="medium"
            color={{ base: 'gray.500', _dark: 'gray.400' }}
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            w="full"
          >
            {label}
          </Text>

          {/* StatNumber */}
          <Text
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight="bold"
            color="colorPalette.fg"
            lineHeight="1.1"
          >
            {value}
          </Text>

          {/* StatHelpText */}
          {helpText && (
            <HStack gap={1}>
              {arrowType && (
                <Text
                  fontSize="sm"
                  color={
                    arrowType === 'increase'
                      ? { base: 'green.500', _dark: 'green.300' }
                      : { base: 'red.500', _dark: 'red.300' }
                  }
                  fontWeight="medium"
                  aria-hidden="true"
                >
                  {arrowIcon[arrowType]}
                </Text>
              )}
              <Text
                fontSize="xs"
                color={{ base: 'gray.500', _dark: 'gray.400' }}
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
              >
                {helpText}
              </Text>
            </HStack>
          )}
        </VStack>

        {/* İkon Bölümü */}
        {icon && (
          <HStack
            justify="center"
            align="center"
            w={{ base: 10, md: 12 }}
            h={{ base: 10, md: 12 }}
            borderRadius="lg"
            bg="colorPalette.subtle"
            flexShrink={0}
            transition="all 0.2s ease-in-out"
            _groupHover={{
              bg: 'colorPalette.emphasized',
            }}
            {...iconContainerProps}
          >
            <Icon
              as={icon}
              w={{ base: 5, md: 6 }}
              h={{ base: 5, md: 6 }}
              color="colorPalette.fg"
              aria-hidden="true"
            />
          </HStack>
        )}
      </HStack>
    </Box>
  );
};
