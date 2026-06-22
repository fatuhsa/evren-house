import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        // Vite 8 (rolldown) requires manualChunks as a function
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase'))    return 'vendor-supabase'
            if (id.includes('html5-qrcode') || id.includes('/qrcode/')) return 'vendor-qr'
            if (id.includes('date-fns'))     return 'vendor-date'
            if (id.includes('lucide-react')) return 'vendor-icons'
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/react-router')
            ) return 'vendor-react'
          }
        },
      },
    },
  },
})
