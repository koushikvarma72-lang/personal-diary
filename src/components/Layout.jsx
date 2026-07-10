import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, CalendarDays, BarChart3, Settings as Gear, LogOut, Moon, Sun } from 'lucide-react'
import { useApp } from '../App'
import { auth } from '../lib/storage'
import ThreeBackground from './ThreeBackground'
import { challengeDay, todayISO } from '../lib/stats'

const tabs = [
  { to: '/', label: 'Today', icon: BookOpen },
  { to: '/history', label: 'History', icon: CalendarDays },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Gear },
]

export default function Layout({ children }) {
  const { settings, saveSettings } = useApp()
  const dark = settings.theme === 'dark'
  const location = useLocation()
  const day = challengeDay(todayISO(), settings.challenge)

  const ticker = [
    'DAILY DISCIPLINE',
    day ? `DAY ${String(day).padStart(2, '0')} / ${settings.challenge.length}` : settings.challenge.name.toUpperCase(),
    'NO EXCUSES',
    'SHOW UP',
    `${settings.habits.length} COMMITMENTS`,
    'ONE DAY AT A TIME',
  ]

  return (
    <div className="noise min-h-screen pb-24 text-slate-900 dark:text-white sm:pb-0">
      <div className="bg-mesh" aria-hidden="true" />
      <ThreeBackground />

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
