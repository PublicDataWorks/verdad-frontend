import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import istanbul from 'vite-plugin-istanbul'

export default defineConfig(({ command, mode }) => ({
  base: '',
  plugins: [
    react(),
    tsconfigPaths(),
    istanbul({
      cypress: true,
      requireEnv: false
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/vitest-setup.ts'],
    coverage: {
      provider: 'istanbul',
      reportsDirectory: 'vitest-coverage'
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
}))
