import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'out', 'node_modules', '**/*.d.ts']),

  // Renderer (React) files
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettierConfig,
    ],
    plugins: {
      prettier,
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },

  // Main process and Preload files
  {
    files: ['electron/**/*.ts'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      prettierConfig,
    ],
    plugins: {
      prettier,
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.node, ...globals.electron },
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off', // Allow console in main process
      'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
    },
  },

  // Test files
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'src/test/**/*.ts'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      prettierConfig,
    ],
    plugins: {
      prettier,
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in tests
      'max-lines': 'off', // No line limit in tests
    },
  },

  // Exception for large handler/checker/store files
  {
    files: [
      'electron/main/ipc-handlers.ts',
      'electron/main/store/gamification/achievementChecker.ts',
      'electron/main/store.ts',
      'src/components/HistoryPanel.tsx'
    ],
    rules: {
      'max-lines': ['error', { max: 700, skipBlankLines: true, skipComments: true }],
    },
  },
])
