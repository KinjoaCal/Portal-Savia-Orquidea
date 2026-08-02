import { createClient } from "@supabase/supabase-js"

let rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
// Clean URL: remove trailing /rest/v1 or trailing slashes if present by mistake
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "")
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== "undefined") {
    console.warn("Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY.")
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
