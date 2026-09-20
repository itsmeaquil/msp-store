import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/msp-store/',
  server: {
    host: '0.0.0.0',
    port: 8080,
  },
  // Disable rolldown's dep scanner which fails with '#' in ancestor path.
  // Instead we explicitly list all deps so rolldown never needs to scan.
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react-router-dom',
      'lucide-react',
      'firebase/app',
      'firebase/firestore',
      'firebase/auth',
      'firebase/storage',
    ],
  },
})
