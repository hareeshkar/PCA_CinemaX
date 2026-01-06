import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // DEBUG LOGGING
  if (!url || !key) {
    console.error("❌ SUPABASE ERROR: Missing Environment Variables")
    console.log("URL exists:", !!url)
    console.log("Key exists:", !!key)
  }

  if (key && !key.startsWith('sb_')) {
    console.error("❌ SUPABASE ERROR: Invalid Key Format. Key should start with 'sb_'. Current prefix:", key.substring(0, 15))
  }

  return createServerClient(url!, key!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch (error) {
          // This happens when called from Server Components, it's safe to ignore
        }
      },
    },
  })
}