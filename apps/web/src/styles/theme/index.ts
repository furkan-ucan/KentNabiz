import { createSystem, defaultConfig } from '@chakra-ui/react';

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#E6FFFA' },
          100: { value: '#B2F5EA' },
          200: { value: '#81E6D9' },
          300: { value: '#4FD1C7' },
          400: { value: '#38B2AC' },
          500: { value: '#319795' }, // Ana marka rengi
          600: { value: '#2C7A7B' },
          700: { value: '#285E61' },
          800: { value: '#234E52' },
          900: { value: '#1D4044' },
          950: { value: '#0D1F22' },
        },
      },
      fonts: {
        heading: { value: '"Inter", sans-serif' },
        body: { value: '"Inter", sans-serif' },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: '{colors.brand.500}' },
          contrast: { value: '{colors.brand.100}' },
          fg: { value: '{colors.brand.700}' },
          muted: { value: '{colors.brand.100}' },
          subtle: { value: '{colors.brand.200}' },
          emphasized: { value: '{colors.brand.300}' },
          focusRing: { value: '{colors.brand.500}' },
        },
        status: {
          open: { value: '{colors.gray.500}' },
          inReview: { value: '{colors.yellow.500}' },
          inProgress: { value: '{colors.orange.500}' },
          done: { value: '{colors.green.500}' },
          rejected: { value: '{colors.red.500}' },
          cancelled: { value: '{colors.purple.500}' },
        },
      },
    },
  },
});
