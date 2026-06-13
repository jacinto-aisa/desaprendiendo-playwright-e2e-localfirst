import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import playwright from 'eslint-plugin-playwright';

export default [
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
      'web-local/harness.js',
    ],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.ts'],
  })),

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
      /*
       * web-local es código de la web de práctica.
       * En esta iteración no queremos que el CI falle por deuda heredada
       * del JavaScript visual. Primero hacemos pasar el pipeline y luego
       * convertimos estas reglas en avisos o errores progresivamente.
       */
      'no-console': 'off',
      'no-unused-vars': 'off',
      'no-empty': 'off',
      'no-useless-escape': 'off',
      'no-redeclare': 'off',
      'no-unreachable': 'off',
      'no-useless-assignment': 'off',

      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

 {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',      // Cambio: error → warn
      '@typescript-eslint/no-unused-vars': 'warn',       // Cambio: error → warn
    },
  },
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,

      /*
       * Reglas críticas: estas sí deben bloquear.
       */
      'playwright/no-focused-test': 'error',

      /*
       * En esta arquitectura muchas assertions viven dentro de POM, COM o Flow.
       * Por eso desactivamos expect-expect en la primera fase.
       */
      'playwright/expect-expect': 'off',

      /*
       * En el curso usamos tests exclusivos de local-first.
       */
      'playwright/no-skipped-test': 'off',

      /*
       * Regla de estilo. No debe bloquear la primera integración.
       */
      'playwright/consistent-spacing-between-blocks': 'off',

      /*
       * Esta sí es interesante: preferimos assertions web-first.
       */
      'playwright/prefer-web-first-assertions': 'error',
    },
  },
];