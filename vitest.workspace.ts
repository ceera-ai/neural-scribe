import { defineWorkspace } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineWorkspace([
  // Renderer (React) tests
  {
    test: {
      include: ['src/**/*.test.{ts,tsx}'],
      name: 'renderer',
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      globals: true,
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.d.ts',
          '**/*.config.*',
          'out/**',
          'dist/**'
        ],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 75,
          statements: 80
        }
      }
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      }
    }
  },

  // Main process tests
  {
    test: {
      include: ['electron/main/**/*.test.ts'],
      name: 'main',
      environment: 'node',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html']
      }
    }
  },

  // Preload tests
  {
    test: {
      include: ['electron/preload/**/*.test.ts'],
      name: 'preload',
      environment: 'node'
    }
  }
])
