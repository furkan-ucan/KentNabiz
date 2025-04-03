// packages/test-lib/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  displayName: 'test-lib',
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  rootDir: './',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: './tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // Shared ve UI modüllerini doğru şekilde çözümle
    '@kentnabiz/shared': '<rootDir>/../shared/dist/index.js',
    '@kentnabiz/ui': '<rootDir>/../ui/dist/index.js',
  },
};

export default config;
