// ============================================================
// APP CONFIG
// ------------------------------------------------------------
// LOCAL MODE (default): leave the env vars unset. All data is
// stored in your browser's localStorage. No login required.
//
// CLOUD MODE: set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
// (Vercel -> Project -> Settings -> Environment Variables, or a
// local .env file), run supabase/schema.sql once, redeploy.
// ============================================================

// trim() + quote-stripping guards against copy-paste accidents
const clean = (v) => (v || '').trim().replace(/^["']|["']$/g, '')

export const SUPABASE_URL = clean(import.meta.env.VITE_SUPABASE_URL)
export const SUPABASE_ANON_KEY = clean(import.meta.env.VITE_SUPABASE_ANON_KEY)

const isValidUrl = (() => {
  try {
    return new URL(SUPABASE_URL).protocol.startsWith('http')
  } catch {
    return false
  }
})()

export const IS_LOCAL_MODE = !isValidUrl || !SUPABASE_ANON_KEY
