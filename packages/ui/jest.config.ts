// packages/ui/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  displayName: 'ui',
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testEnvironment: 'jsdom', // UI için jsdom kullanıyoruz
  rootDir: './',
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: './tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // CSS ve diğer asset'ler için mock tanımlamaları
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'], // Eğer test kurulum dosyanız varsa
};

export default config;
