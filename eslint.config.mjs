// eslint.config.mjs
import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import playwright from 'eslint-plugin-playwright';

export default defineConfig([
  {
    ignores: [
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'blob-report/**',
      'coverage/**',
      'dist/**',
      'mocks/**/*.har',
      'mocks/**/*.har.zip',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['web-local/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        ...globals.browser,
        SITE_DATA: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  {
    files: ['tests/**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
    },
  },

  {
    files: ['tests/**/*.ts'],
    extends: [playwright.configs['flat/recommended']],
    rules: {
      'playwright/no-focused-test': 'error',
      'playwright/no-skipped-test': 'warn',
      'playwright/expect-expect': 'warn',
    },
  },
]);
