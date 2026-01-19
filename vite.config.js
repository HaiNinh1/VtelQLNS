import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/VtelQLNS/',
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('https://54.206.62.10/api')
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
})
