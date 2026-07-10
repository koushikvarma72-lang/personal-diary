import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_LOCAL_MODE } from './config'

// Never let a bad config crash the whole app — fall back to local mode.
let client = null
if (!IS_LOCAL_MODE) {
  try {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  } catch (e) {
    console.error('[daily-discipline] Supabase init failed, using local mode:', e)
  }
}

export const supabase = client
