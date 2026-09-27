//import { defineConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  // Dev server only (`npm run dev`): not used by `vite build` or Vitest (mode 'test').
  // Takes effect only for relative requests, i.e. when VITE_BITACORA_BASE_URL is empty.
  ...(command === 'serve' && mode !== 'test' && {
    server: {
      proxy: {
        '/api/v1/auth': { target: 'http://localhost:3000', changeOrigin: true },
        '/api/v1/user': { target: 'http://localhost:3000', changeOrigin: true },
      },
    },
  }),
}))
