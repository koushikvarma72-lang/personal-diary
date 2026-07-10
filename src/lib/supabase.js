import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_LOCAL_MODE } from './config'

export const supabase = IS_LOCAL_MODE
  ? null
  : createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
