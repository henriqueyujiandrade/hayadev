import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import astro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y-x';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores([
    'dist/**',
    '.astro/**',
    'node_modules/**',
    'playwright-report/**',
    'test-results/**',
    '.vercel/**',
  ]),

  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-strict'],

  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      /* Unused arguments prefixed with _ are an intentional signal, not a slip. */
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'no-restricted-syntax': [
        'error',
        {
          /*
           * Internal URLs must come from the route helpers so a locale can
           * never be hard-coded into a link. External URLs are unaffected.
           */
          selector:
            'Literal[value=/^\\u002F(projetos|artigos|projects|articles|proyectos|articulos|sobre|about|lab)\\u002F/]',
          message:
            'Do not hard-code localized paths. Use localizedPath()/homePath() from @utils/routes.',
        },
      ],
    },
  },

  /* React islands. */
  {
    files: ['**/*.tsx'],
    plugins: { 'jsx-a11y-x': jsxA11y },
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },

  /* Node-side tooling. */
  {
    files: ['scripts/**/*.mjs', '*.config.{ts,js,mjs}', 'tests/**/*.ts'],
    languageOptions: { globals: globals.node },
    rules: { 'no-console': 'off' },
  },

  /* The route map is the one place localized paths are allowed to be literals. */
  {
    files: ['src/utils/routes.ts', 'tests/**/*.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
);
