const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const globals = require('globals');
const playwright = require('eslint-plugin-playwright');

const tsRecommended = tseslint.configs.recommended.map((config) => ({
  ...config,
  files: ['**/*.ts'],
}));

module.exports = [
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

  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },

  {
    files: ['eslint.config.cjs', '*.config.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
  },

  {
    files: ['web-local/**/*.js'],
    ignores: ['web-local/harness.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        SITE_DATA: 'readonly',
      },
    },
    
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-empty': [
        'warn',
        {
          allowEmptyCatch: true,
        },
      ],
    },
  },

  {
    files: ['web-local/harness.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-redeclare': 'off',
    },
  },

  ...tsRecommended,

  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  {
    files: ['tests/**/*.ts'],
    plugins: {
      playwright,
    },
    rules: {
      ...playwright.configs['flat/recommended'].rules,

      'playwright/no-focused-test': 'error',
      'playwright/no-skipped-test': 'warn',
      'playwright/prefer-web-first-assertions': 'error',

      /*
       * En este proyecto muchas assertions viven dentro de Page Objects,
       * Component Objects y Flows.
       */
      'playwright/expect-expect': 'off',

      /*
       * Regla estética. No bloquea la práctica.
       */
      'playwright/consistent-spacing-between-blocks': 'off',
    },
  },
];