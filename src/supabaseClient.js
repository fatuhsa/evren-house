import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''

let supabaseInstance
try {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Konfigurasi URL atau Kunci Anon Supabase kosong.')
  }
  // Basic validation for URL to avoid client library throwing inside createClient
  if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    throw new Error('Format URL Supabase tidak valid (harus dimulai dengan http:// atau https://).')
  }
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
} catch (err) {
  console.error('Gagal menginisialisasi client Supabase:', err.message)
  
  // Proxy fallback: instead of throwing immediately on import, throw a descriptive
  // message only when the application attempts to use client methods.
  supabaseInstance = new Proxy({}, {
    get(target, prop) {
      if (prop === 'channel') {
        return () => ({
          on: () => ({
            subscribe: () => ({})
          })
        })
      }
      if (prop === 'removeChannel') {
        return () => {}
      }
      return () => {
        throw new Error('Koneksi database tidak tersedia. Harap periksa apakah file .env telah dibuat dan diisi dengan benar.')
      }
    }
  })
}

export const supabase = supabaseInstance
