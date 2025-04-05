// packages/shared/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  displayName: 'shared',
  preset: 'ts-jest', // ESM preset'i kaldırıldı
  testEnvironment: 'node',
  rootDir: './',
  moduleDirectories: ['node_modules', '<rootDir>'],
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: false, // ESM kullanımı kapatıldı
        tsconfig: './tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    // ESM için uzantı eşlemeleri kaldırıldı
  },
};

export default config;
