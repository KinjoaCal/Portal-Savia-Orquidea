import { createClient } from "@supabase/supabase-js"

let rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
// Clean URL: remove trailing /rest/v1 or trailing slashes if present by mistake
const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "")
const supabaseUrl = cleanUrl || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  if (typeof window !== "undefined") {
    console.warn("Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel.")
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

