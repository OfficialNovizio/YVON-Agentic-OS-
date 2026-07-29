import { createClient } from '@supabase/supabase-js'

// Safe fallbacks prevent crash at module init time when env vars are not yet set.
// Actual auth calls will fail gracefully if real values are not provided.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
