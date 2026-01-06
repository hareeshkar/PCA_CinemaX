import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (typeof window !== 'undefined') {
    if (!key || key.includes('pca_cinemax')) {
      console.error("🚨 CLIENT ERROR: Supabase Key is invalid or contains project name prefix!")
    }
  }

  return createBrowserClient(url, key)
}