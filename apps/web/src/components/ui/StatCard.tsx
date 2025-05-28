import React from 'react';
import { Box, Text, Flex } from '@chakra-ui/react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  helpText?: string;
  arrowType?: 'increase' | 'decrease';
  colorPalette?: string; // v3'ün colorPalette özelliği
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  helpText,
  arrowType,
  colorPalette = 'gray',
}) => {
  return (
    <Box
      colorPalette={colorPalette}
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="lg"
      bg="white"
      borderColor="gray.200"
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
          <Text fontSize="2xl" fontWeight="bold" color="colorPalette.fg">
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
            bg="colorPalette.subtle"
            fontSize="2xl"
          >
            {icon}
          </Flex>
        )}
      </Flex>
    </Box>
  );
};
