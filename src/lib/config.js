// ============================================================
// APP CONFIG
// ------------------------------------------------------------
// LOCAL MODE (default): leave SUPABASE_URL empty. All data is
// stored in your browser's localStorage. No login required.
//
// CLOUD MODE: paste your Supabase project URL + anon key below
// (Project Settings -> API in the Supabase dashboard), run the
// SQL in supabase/schema.sql once, then redeploy. The app will
// automatically switch to email login + cloud storage.
// ============================================================

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const IS_LOCAL_MODE = !SUPABASE_URL || !SUPABASE_ANON_KEY
