// eslint.config.js

const js = require('@eslint/js');
const parser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const globals = require('globals');

// Define the configuration array
const config = [
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/*.d.ts',
      '**/*.js.map',
      'jest.config.ts',
      'eslint.config.js',
      'commitlint.config.cjs',
      'packages/ui/dist/**',
    ],
  },
  // Base Recommended JS Rules (applies broadly first)
  js.configs.recommended,

  // --- Base TypeScript Configuration (ONLY FOR .ts/.tsx) ---
  {
    files: ['**/*.ts', '**/*.tsx'], // IMPORTANT: Target ONLY TS/TSX files here
    languageOptions: {
      parser: parser,
      parserOptions: {
        projectService: true,
        allowDefaultProject: true,
        tsconfigRootDir: process.cwd(),
        ecmaVersion: 'latest',
        sourceType: 'module', // TS source uses ES Modules
        ecmaFeatures: { jsx: true },
      },
      globals: {
        // Node/Jest globals for backend TS files
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs['recommended-type-checked'].rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-var-requires': 'warn',
    },
  },

  // --- Override for packages/ui (React/Browser Env for TS/TSX) ---
  {
    files: ['packages/ui/**/*.{ts,tsx}'], // Target only UI TS/TSX
    languageOptions: {
      parserOptions: {
        /* inherits base TS parser options */
      },
      globals: {
        // Add Browser globals
        ...globals.browser,
        React: 'readonly',
        JSX: 'readonly',
      },
    },
    plugins: {
      // Ensure React plugins are active
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@typescript-eslint': tsPlugin, // Keep TS plugin
    },
    rules: {
      // Base TS rules apply from above, add React rules
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // Override any conflicting base TS rules if needed
    },
    settings: { react: { version: 'detect' } },
  },

  // --- Override for apps/web (React/Browser Env for TS/TSX) ---
  {
    files: ['apps/web/**/*.{ts,tsx}'], // Target only web app TS/TSX
    languageOptions: {
      parser: parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        // No project service or type checking for web app
      },
      globals: {
        // Add Browser globals
        ...globals.browser,
        React: 'readonly',
        JSX: 'readonly',
      },
    },
    plugins: {
      // Ensure React plugins are active
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@typescript-eslint': tsPlugin, // Keep TS plugin
    },
    rules: {
      // Use only basic TS rules without type checking
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-var-requires': 'error',
      // React rules
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // Explicitly disable all type-checked rules
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
    settings: { react: { version: 'detect' } },
  },

  // --- Override for .js files (Treat as ESM in Node) ---
  {
    files: ['**/*.js'], // Target only .js files
    languageOptions: {
      ecmaVersion: 'latest', // Assume modern JS syntax
      sourceType: 'module', // Treat JS files as ES Modules
      globals: {
        // Define Node ESM environment globals
        ...globals.node, // Includes 'process', 'console', etc.
        // No '__dirname', 'require', 'module', 'exports' in standard ESM
      },
    },
    rules: {
      // Use standard JS rules, disable any TS rules that might leak
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      // Ensure standard JS 'no-unused-vars' applies
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  // --- Override for .cjs files (Treat as CommonJS in Node) ---
  {
    files: ['**/*.cjs'], // Target only .cjs files (like commitlint.config.cjs)
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs', // Treat CJS files as CommonJS
      globals: {
        // Define Node CJS environment globals
        ...globals.node,
        __dirname: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  // --- Optional: Override for Test files ---
  {
    files: ['**/*.spec.ts', '**/*.test.ts', '**/*.test.tsx'],
    languageOptions: {
      globals: { ...globals.jest },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-floating-promises': 'off', // Often okay in tests
      '@typescript-eslint/unbound-method': 'off', // Jest expect methods cause this issue
    },
  },
  {
    // E2E test files have different requirements
    files: ['**/*.e2e-spec.ts', '**/test/**/*.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },
];

module.exports = config;
