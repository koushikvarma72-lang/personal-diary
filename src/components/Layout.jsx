import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, CalendarDays, BarChart3, Settings as Gear, LogOut, Moon, Sun, Search, TrendingUp, Keyboard, Bell, X, ExternalLink } from 'lucide-react'
import { useApp } from '../App'
import { auth } from '../lib/storage'
import ThreeBackground from './ThreeBackground'
import { challengeDay, todayISO } from '../lib/stats'

const tabs = [
  { to: '/', label: 'Today', icon: BookOpen },
  { to: '/history', label: 'History', icon: CalendarDays },
  { to: '/weekly', label: 'Weekly', icon: TrendingUp },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/settings', label: 'Settings', icon: Gear },
]

export default function Layout({ children }) {
  const { settings, saveSettings, todayIncomplete, dismissToday } = useApp()
  const dark = settings.theme === 'dark'
  const location = useLocation()
  const day = challengeDay(todayISO(), settings.challenge)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const navigate = useNavigate()
  const gPressedAt = useRef(0)

  // Global keyboard shortcuts (see the "?" dialog) — ignored while typing.
  useEffect(() => {
    const CHORD_TIMEOUT = 1500
    const chordTargets = {
      h: '/history',
      a: '/analytics',
      w: '/weekly',
      s: '/search',
      ',': '/settings',
    }
    const onKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target
      const typing =
        t &&
        (t.tagName === 'INPUT' ||
          t.tagName === 'TEXTAREA' ||
          t.tagName === 'SELECT' ||
          t.isContentEditable)
      if (typing) return
      const key = e.key.toLowerCase()
      if (key === 'g' && !e.repeat) {
        gPressedAt.current = Date.now()
        return
      }
      if (key === '?' && !e.repeat) {
        setShowShortcuts((s) => !s)
        gPressedAt.current = 0
        return
      }
      if (key === 'escape') {
        setShowShortcuts(false)
        gPressedAt.current = 0
        return
      }
      if (key === 'n' && !e.repeat) {
        navigate('/')
        gPressedAt.current = 0
        return
      }
      const dest = chordTargets[key]
      if (dest && gPressedAt.current && Date.now() - gPressedAt.current < CHORD_TIMEOUT) {
        gPressedAt.current = 0
        navigate(dest)
        return
      }
      gPressedAt.current = 0
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate])

  const ticker = [
    'DAILY DISCIPLINE',
    day ? `DAY ${String(day).padStart(2, '0')} / ${settings.challenge.length}` : settings.challenge.name.toUpperCase(),
    'NO EXCUSES',
    'SHOW UP',
    `${settings.habits.length} COMMITMENTS`,
    'ONE DAY AT A TIME',
  ]

  const shortcuts = [
    { key: 'G + H', action: 'Go to History' },
    { key: 'G + A', action: 'Go to Analytics' },
    { key: 'G + W', action: 'Go to Weekly Review' },
    { key: 'G + S', action: 'Go to Search' },
    { key: 'G + ,', action: 'Go to Settings' },
    { key: '?', action: 'Toggle this menu' },
    { key: 'N', action: 'Go to Today' },
    { key: 'Escape', action: 'Close modals / menus' },
  ]

  return (
    <div className="noise min-h-screen pb-24 text-slate-900 dark:text-white sm:pb-0">
      <div className="bg-mesh" aria-hidden="true" />
      <ThreeBackground />

      {/* Keyboard shortcuts dialog */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-md p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="tag">[ keyboard shortcuts ]</p>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="btn-icon"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2">
                {shortcuts.map((s) => (
                  <div
                    key={s.key}
                    className="flex items-center justify-between border-b border-slate-100 py-2 dark:border-white/5"
                  >
                    <span className="text-sm dark:text-slate-200">{s.action}</span>
                    <kbd className="rounded-md border border-slate-200 bg-white/80 px-2 py-0.5 font-mono text-xs dark:border-white/10 dark:bg-white/5 dark:text-white">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
              <p className="tag mt-4">These shortcuts work when not typing in an input</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/60 backdrop-blur-2xl dark:border-white/10 dark:bg-base/60"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3">
          <div className="flex items-baseline gap-3">
            <h1 className="font-display text-lg font-bold uppercase tracking-tight sm:text-xl">
              Daily<span className="text-lime-600 dark:text-acid">*</span>Discipline
            </h1>
            <span className="tag hidden md:inline">[ personal os v1.0 ]</span>
          </div>
          <div className="flex items-center gap-1">
            <nav className="hidden sm:flex sm:gap-1">
              {tabs.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `relative rounded-full px-4 py-2 font-mono text-xs uppercase tracking-widest transition ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-acid dark:text-base'
                        : 'text-slate-500 hover:text-slate-900 dark:text-white/50 dark:hover:text-white'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
            <button
              title="Keyboard shortcuts"
              onClick={() => setShowShortcuts(true)}
              className="btn-icon hidden sm:flex"
            >
              <Keyboard size={16} />
            </button>
            <button
              title="Toggle dark mode"
              onClick={() => saveSettings({ ...settings, theme: dark ? 'light' : 'dark' })}
              className="btn-icon"
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            {!auth.isLocal && (
              <button
                title="Sign out"
                onClick={() => auth.signOut().then(() => location.reload())}
                className="btn-icon"
              >
                <LogOut size={17} />
              </button>
            )}
          </div>
        </div>

        {/* ticker strip */}
        <div className="marquee bg-white/40 py-1.5 dark:bg-white/[0.02]">
          <div className="marquee-track">
            {[0, 1].map((n) => (
              <span key={n} className="flex shrink-0 items-center">
                {ticker.map((t, i) => (
                  <span key={i} className="mx-6 flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500 dark:text-white/40">
                    {t} <span className="text-lime-600 dark:text-acid">✦</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Reminder banner — today's entry not done */}
      <AnimatePresence>
        {todayIncomplete && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 pt-3 sm:px-6 sm:pt-4">
              <div className="flex flex-1 items-center gap-3 rounded-xl border border-orange-300/50 bg-gradient-to-r from-orange-500/5 via-yellow-500/10 to-orange-500/5 px-4 py-3 backdrop-blur-xl dark:border-orange-400/20 dark:from-orange-400/5 dark:via-yellow-400/10 dark:to-orange-400/5">
                <Bell size={18} className="shrink-0 text-orange-500" />
                <p className="flex-1 text-sm text-slate-700 dark:text-orange-200/90">
                  <span className="font-medium">Today's entry isn't done yet.</span>{' '}
                  <Link
                    to="/"
                    className="inline-flex items-center gap-1 font-medium text-orange-600 underline decoration-orange-400/40 underline-offset-2 transition hover:decoration-orange-400 dark:text-orange-400 dark:decoration-orange-400/30 dark:hover:decoration-orange-300"
                  >
                    Go to Today <ExternalLink size={13} />
                  </Link>
                </p>
                <button
                  onClick={dismissToday}
                  className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-600 dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white"
                  title="Dismiss for today"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8"
      >
        {children}
      </motion.main>

      {/* mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 flex justify-around border-t border-slate-200/60 bg-white/80 py-2 backdrop-blur-2xl dark:border-white/10 dark:bg-base/80 sm:hidden"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${
                isActive
                  ? 'text-slate-900 dark:text-acid'
                  : 'text-slate-400 dark:text-white/40'
              }`
            }
          >
            <Icon size={19} /> {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
