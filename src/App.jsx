import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { storage, auth } from './lib/storage'
import { EMPTY_ENTRY } from './lib/defaults'
import Layout from './components/Layout'
import AuthPage from './components/AuthPage'
import Landing from './pages/Landing'
import Today from './pages/Today'
import History from './pages/History'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

export default function App() {
  const [user, setUser] = useState(null)
  const [booted, setBooted] = useState(false)
  const [settings, setSettings] = useState(null)
  const [entries, setEntries] = useState({})

  // auth bootstrap — never leave the screen blank, even on failure
  useEffect(() => {
    auth
      .getUser()
      .then((u) => setUser(u))
      .catch((e) => console.error('[daily-discipline] auth bootstrap failed:', e))
      .finally(() => setBooted(true))
    return auth.onAuthChange(setUser)
  }, [])

  // data bootstrap once logged in
  useEffect(() => {
    if (!user) return
    Promise.all([storage.getSettings(), storage.getAllEntries()])
      .then(([s, e]) => {
        setSettings(s)
        setEntries(e)
      })
      .catch((e) => {
        console.error('[daily-discipline] data bootstrap failed:', e)
        setSettings((s) => s) // keep whatever we have; UI shows loading state
      })
  }, [user])

  // dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings?.theme === 'dark')
  }, [settings?.theme])

  const getEntry = useCallback(
    (date) => entries[date] ?? EMPTY_ENTRY(date),
    [entries]
  )

  const updateEntry = useCallback((date, patch) => {
    setEntries((prev) => {
      const next = { ...(prev[date] ?? EMPTY_ENTRY(date)), ...patch, date }
      storage.saveEntry(next)
      return { ...prev, [date]: next }
    })
  }, [])

  const saveSettings = useCallback((next) => {
    setSettings(next)
    storage.saveSettings(next)
  }, [])

  if (!booted) return null

  // logged out: landing page at /, sign-in at /auth
  if (!user)
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage onLogin={setUser} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )

  if (!settings)
    return (
      <div className="flex h-screen items-center justify-center text-ink dark:text-blue-200">
        Loading your diary…
      </div>
    )

  return (
    <AppCtx.Provider
      value={{ user, settings, saveSettings, entries, getEntry, updateEntry }}
    >
      <Layout>
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/history" element={<History />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          {/* logged-in users skip landing/auth and land in the app */}
          <Route path="/auth" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </AppCtx.Provider>
  )
}
