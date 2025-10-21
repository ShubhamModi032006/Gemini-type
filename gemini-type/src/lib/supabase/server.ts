// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CookieOptions } from '@supabase/ssr'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Wrap in a try...catch block
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // This error can be ignored if you're calling this from a
            // Server Component. Cookies can only be set in Server Actions
            // or Route Handlers. Middleware will handle the refresh.
          }
        },
        remove(name: string, options: CookieOptions) {
          // Wrap in a try...catch block
          try {
            cookieStore.delete({ name, ...options })
          } catch (error) {
            // This error can be ignored if you're calling this from a
            // Server Component. Cookies can only be set in Server Actions
            // or Route Handlers. Middleware will handle the refresh.
          }
        },
      },
    }
  )
}