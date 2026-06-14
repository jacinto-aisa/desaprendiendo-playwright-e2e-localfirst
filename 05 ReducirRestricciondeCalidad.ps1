# Lo que ha pasado es que npm run quality está revisando tres mundos distintos como si todos fueran iguales:
#
# tests/**/*.ts              → código de pruebas Playwright
# api-local/**/*.ts          → TypeScript de API
# web-local/assets/**/*.js   → JavaScript heredado / web estática
#
# Y además lo está haciendo con:
#
# eslint . --max-warnings=0
#
# Eso significa:
#
# 1 warning = fallo de CI
# 1 error   = fallo de CI
#
# Para una primera iteración con alumnos, yo lo calibraría así:
#
# Tests Playwright  → estricto
# Config / API TS   → razonablemente estricto
# web-local JS      → modo legado, no bloquear al principio
# HTML / CSS        → validar, pero ajustar poco a poco
#
# ESLint desde v9 usa por defecto el formato eslint.config.js/mjs, y el plugin de Playwright recomienda reglas específicas para tests; además Playwright recomienda usar “web-first assertions” porque esperan automáticamente a que se cumpla la condición.
#
# 1. Sustituye tu eslint.config.mjs
# 
# En C:\LabGuiado07, reemplaza el contenido de eslint.config.mjs por este:

@'
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
    files: ['api-local/**/*.ts', 'tests/**/*.ts', 'playwright.config.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'off',

      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
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
'@ | Set-Content -Encoding UTF8 eslint.config.mjs