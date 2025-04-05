// jest.config.ts (kök dizin)
import type { Config } from 'jest';

const config: Config = {
  projects: ['<rootDir>/apps/*', '<rootDir>/packages/*'],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: ['**/*.{ts,tsx}', '!**/node_modules/**', '!**/dist/**', '!**/*.d.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: './tsconfig.json',
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};

export default config;
