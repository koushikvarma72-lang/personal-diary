import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { storage, auth } from './lib/storage'
import { EMPTY_ENTRY } from './lib/defaults'
import { todayISO, isEntryIncomplete } from './lib/stats'
import Layout from './components/Layout'
import AuthPage from './components/AuthPage'
import Landing from './pages/Landing'
import Today from './pages/Today'
import History from './pages/History'
import Analytics from './pages/Analytics'
import WeeklyReview from './pages/WeeklyReview'
import Search from './pages/Search'
import Settings from './pages/Settings'
import Toast from './components/Toast'

const NAG_KEY = 'dd_nag_dismiss'
let toastSeq = 0

const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

const ToastCtx = createContext(null)
export const useToast = () => useContext(ToastCtx)

export default function App() {
  const [user, setUser] = useState(null)
  const [booted, setBooted] = useState(false)
  const [settings, setSettings] = useState(null)
  const [entries, setEntries] = useState({})
  const entriesRef = useRef({})
  const [toasts, setToasts] = useState([])
  const [saving, setSaving] = useState({})
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(NAG_KEY) === todayISO())
  const [loadError, setLoadError] = useState(null)
  const [loadAttempt, setLoadAttempt] = useState(0)

  // auth bootstrap
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
    setLoadError(null)
    Promise.all([storage.getSettings(), storage.getAllEntries()])
      .then(([s, e]) => {
        setSettings(s)
        setEntries(e)
      })
      .catch((e) => {
        console.error('[daily-discipline] data bootstrap failed:', e)
        setLoadError(
          'Could not load your diary from storage. Check your connection and try again.'
        )
      })
  }, [user, loadAttempt])

  // dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings?.theme === 'dark')
  }, [settings?.theme])

  // keep the optimistic-copy ref in sync with the entries state
  useEffect(() => {
    entriesRef.current = entries
  }, [entries])

  // today's entry status
  const today = useMemo(() => todayISO(), [])
  const todayIncomplete = useMemo(
    () => !dismissed && isEntryIncomplete(entries[today]),
    [entries, today, dismissed]
  )

  // browser notification permission + notification
  // If today's entry isn't done, remind at the chosen reminder time (or
  // immediately if it's already past), then keep re-reminding while the app
  // stays open (hourly) and whenever the tab regains focus, until the entry
  // is complete or the banner is dismissed.
  useEffect(() => {
    if (!settings?.notifications || !todayIncomplete) return
    if (typeof Notification === 'undefined') return

    const REMINDER_INTERVAL_MS = 60 * 60 * 1000 // 1 hour
    const FOCUS_COOLDOWN_MS = 5 * 60 * 1000 // don't re-nag more often than every 5 min
    const [h, m] = (settings.reminderTime || '20:00').split(':').map(Number)
    const at = new Date()
    at.setHours(h, m, 0, 0)
    const delay = Math.max(0, at - new Date())

    let lastSent = 0
    let interval = null
    let timer = null

    const send = (minGapMs = 0) => {
      if (Notification.permission !== 'granted') return
      const now = Date.now()
      if (now - lastSent < minGapMs) return
      lastSent = now
      new Notification('Daily*Discipline', {
        body: '✍️ You haven\'t logged today yet. Head to Today to check in.',
        icon: '/favicon.ico',
      })
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') send(FOCUS_COOLDOWN_MS)
    }

    const armLoop = () => {
      interval = setInterval(() => send(), REMINDER_INTERVAL_MS)
      document.addEventListener('visibilitychange', onVisibility)
    }

    if (Notification.permission === 'granted') {
      if (delay === 0) {
        send()
        armLoop()
      } else {
        timer = setTimeout(() => {
          send()
          armLoop()
        }, delay)
      }
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then((perm) => {
        if (perm !== 'granted') return
        if (delay === 0) {
          send()
          armLoop()
        } else {
          timer = setTimeout(() => {
            send()
            armLoop()
          }, delay)
        }
      })
    }

    return () => {
      if (interval) clearInterval(interval)
      if (timer) clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [settings?.notifications, settings?.reminderTime, todayIncomplete])

  // dismiss the reminder banner for the day
  const dismissToday = useCallback(() => {
    setDismissed(true)
    localStorage.setItem(NAG_KEY, today)
  }, [today])

  // toast
  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = `${Date.now().toString(36)}-${++toastSeq}`
    setToasts((prev) => [...prev, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const getEntry = useCallback(
    (date) => entries[date] ?? EMPTY_ENTRY(date),
    [entries]
  )

  const updateEntry = useCallback((date, patch) => {
    const prev = entriesRef.current[date] ?? EMPTY_ENTRY(date)
    const next = { ...prev, ...patch, date }
    // keep the optimistic copy in the ref too, so rapid successive saves
    // don't clobber each other before React re-renders
    entriesRef.current = { ...entriesRef.current, [date]: next }
    setSaving((prev) => ({ ...prev, [date]: 'saving' }))
    setEntries((prev) => ({ ...prev, [date]: next }))
    storage
      .saveEntry(next)
      .then(() => {
        setSaving((s) => ({ ...s, [date]: 'saved' }))
        setTimeout(() => setSaving((s) => ({ ...s, [date]: undefined })), 2000)
      })
      .catch((e) => {
        console.error('[daily-discipline] save failed:', e)
        setSaving((s) => ({ ...s, [date]: 'error' }))
      })
  }, [])

  const deleteEntry = useCallback((date) => {
    // clear any in-flight save indicator for this date
    setSaving((prev) => {
      const { [date]: _, ...rest } = prev
      return rest
    })
    const { [date]: _, ...rest } = entriesRef.current
    entriesRef.current = rest
    setEntries(rest)
    storage.deleteEntry(date)
  }, [])

  const searchEntries = useCallback((query) => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return Object.entries(entries)
      .filter(([_, entry]) => {
        return (
          (entry.regret && entry.regret.toLowerCase().includes(q)) ||
          (entry.achievement && entry.achievement.toLowerCase().includes(q)) ||
          (entry.take && entry.take.toLowerCase().includes(q)) ||
          entry.date.includes(q)
        )
      })
      .map(([date, entry]) => ({ date, entry }))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [entries])

  const saveSettings = useCallback((next) => {
    setSettings(next)
    storage.saveSettings(next)
  }, [])

  // restore a full backup (settings + all entries), replacing current data
  const restoreData = useCallback(
    async (data) => {
      if (!data || typeof data !== 'object') throw new Error('Invalid backup file')
      const nextSettings =
        data.settings && typeof data.settings === 'object' ? data.settings : settings
      const nextEntries =
        data.entries && typeof data.entries === 'object' ? data.entries : {}
      setSettings(nextSettings)
      setEntries(nextEntries)
      entriesRef.current = nextEntries
      await Promise.all([
        storage.saveSettings(nextSettings),
        storage.replaceAllEntries(nextEntries),
      ])
    },
    [settings]
  )

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
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-4 text-center text-ink dark:text-blue-200">
        {loadError ? (
          <>
            <p>{loadError}</p>
            <button
              onClick={() => setLoadAttempt((n) => n + 1)}
              className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800 dark:bg-acid dark:text-card dark:hover:brightness-110"
            >
              Retry
            </button>
          </>
        ) : (
          <p>Loading your diary…</p>
        )}
      </div>
    )

  return (
    <AppCtx.Provider
      value={{ user, settings, saveSettings, restoreData, entries, getEntry, updateEntry, deleteEntry, searchEntries, saving, todayIncomplete, dismissToday }}
    >
      <ToastCtx.Provider value={{ addToast, removeToast }}>
        <Layout>
          <Routes>
            <Route path="/" element={<Today />} />
            <Route path="/history" element={<History />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/weekly" element={<WeeklyReview />} />
            <Route path="/search" element={<Search />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/auth" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
        <Toast toasts={toasts} onDismiss={removeToast} />
      </ToastCtx.Provider>
    </AppCtx.Provider>
  )
}
