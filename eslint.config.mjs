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
      'mocks/**/*.har.zip'
    ]
  },

  {
    files: ['**/*.{js,mjs,cjs}'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      ...js.configs.recommended.rules
    }
  },



  {
    files: ['api-local/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-console': 'off'
    }
  },

  {
    files: ['web-local/assets/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        ...globals.browser,
        SITE_DATA: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      'no-empty': [
        'warn',
        {
          allowEmptyCatch: true
        }
      ]
    }
  },

  {
    files: ['web-local/harness.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node
      }
    }
  },

  {
    files: ['*.config.{js,mjs,cjs}', 'eslint.config.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    }
  },

  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.ts']
  })),

  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ]
    }
  },

  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,

      'playwright/no-focused-test': 'error',
      'playwright/no-skipped-test': 'warn',
      'playwright/prefer-web-first-assertions': 'error',

      /*
       * En este proyecto muchas assertions están dentro de Page Objects,
       * Component Objects y Flows. Por eso evitamos falsos positivos.
       */
      'playwright/expect-expect': 'off',

      /*
       * Regla puramente estética. La dejamos fuera para no bloquear.
       */
      'playwright/consistent-spacing-between-blocks': 'off'
    }
  }
];