// ============================================================
// STORAGE ADAPTER
// Same API in both modes:
//   local  -> browser localStorage (no login)
//   cloud  -> Supabase (email login, RLS-protected)
// ============================================================
import { IS_LOCAL_MODE } from './config'
import { supabase } from './supabase'
import { DEFAULT_SETTINGS } from './defaults'

const LS_SETTINGS = 'dd_settings'
const LS_ENTRIES = 'dd_entries'

// ---------- local implementation ----------
const local = {
  async getSettings() {
    const raw = localStorage.getItem(LS_SETTINGS)
    return raw ? JSON.parse(raw) : { ...DEFAULT_SETTINGS }
  },
  async saveSettings(settings) {
    localStorage.setItem(LS_SETTINGS, JSON.stringify(settings))
  },
  async getAllEntries() {
    const raw = localStorage.getItem(LS_ENTRIES)
    return raw ? JSON.parse(raw) : {}
  },
  async saveEntry(entry) {
    const all = await local.getAllEntries()
    all[entry.date] = entry
    localStorage.setItem(LS_ENTRIES, JSON.stringify(all))
  },
  async deleteEntry(date) {
    const all = await local.getAllEntries()
    delete all[date]
    localStorage.setItem(LS_ENTRIES, JSON.stringify(all))
  },
}

// ---------- supabase implementation ----------
const cloud = {
  async getSettings() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('settings')
      .select('data')
      .eq('user_id', user.id)
      .maybeSingle()
    return data?.data ?? { ...DEFAULT_SETTINGS }
  },
  async saveSettings(settings) {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase
      .from('settings')
      .upsert({ user_id: user.id, data: settings }, { onConflict: 'user_id' })
  },
  async getAllEntries() {
    const { data, error } = await supabase.from('entries').select('date, data')
    if (error) throw error
    const map = {}
    for (const row of data) map[row.date] = row.data
    return map
  },
  async saveEntry(entry) {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase
      .from('entries')
      .upsert(
        { user_id: user.id, date: entry.date, data: entry },
        { onConflict: 'user_id,date' }
      )
  },
  async deleteEntry(date) {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase
      .from('entries')
      .delete()
      .eq('user_id', user.id)
      .eq('date', date)
  },
}

// effective mode: also falls back to local if the client failed to init
const isLocal = IS_LOCAL_MODE || !supabase

export const storage = isLocal ? local : cloud

// ---------- auth (no-ops in local mode) ----------
export const auth = {
  isLocal,
  async getUser() {
    if (isLocal) return { email: 'local@device' }
    const { data } = await supabase.auth.getUser()
    return data.user
  },
  async signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  },
  async signUp(email, password) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  },
  async signOut() {
    if (!isLocal) await supabase.auth.signOut()
  },
  onAuthChange(cb) {
    if (isLocal) return () => {}
    const { data } = supabase.auth.onAuthStateChange((_e, session) => cb(session?.user ?? null))
    return () => data.subscription.unsubscribe()
  },
}
