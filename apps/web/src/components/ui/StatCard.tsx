import React from 'react';
import { Box, Text, Flex } from '@chakra-ui/react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode; // Emoji veya React element
  helpText?: string;
  arrowType?: 'increase' | 'decrease';
  colorScheme?: string; // Örn: "green", "red", "blue" vb. Chakra tema renkleri
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  helpText,
  arrowType,
  colorScheme = 'gray', // Varsayılan renk
}) => {
  const cardBg = 'white';
  const borderColor = 'gray.200';
  const textColor = `${colorScheme}.700`;
  const iconBg = `${colorScheme}.100`;

  return (
    <Box
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="lg"
      bg={cardBg}
      borderColor={borderColor}
      _hover={{
        shadow: 'lg',
        transform: 'translateY(-2px)',
        transitionDuration: '0.2s',
      }}
    >
      <Flex justifyContent="space-between" alignItems="center">
        <Box>
          <Text fontWeight="medium" color="gray.500" fontSize="sm">
            {label}
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color={textColor}>
            {value}
          </Text>
          {helpText && (
            <Text fontSize="sm" color="gray.500" mt={1}>
              {arrowType === 'increase' && '↗️ '}
              {arrowType === 'decrease' && '↘️ '}
              {helpText}
            </Text>
          )}
        </Box>
        {icon && (
          <Flex
            alignItems="center"
            justifyContent="center"
            w={12}
            h={12}
            borderRadius="full"
            bg={iconBg}
            fontSize="2xl"
          >
            {icon}
          </Flex>
        )}
      </Flex>
    </Box>
  );
};
