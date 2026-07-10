import { useEffect, useRef } from 'react'
import { motion, animate } from 'framer-motion'
import { useApp } from '../App'
import { todayISO, entryRate, perfectStreak, challengeDay } from '../lib/stats'
import EntryEditor from '../components/EntryEditor'
import { Flame, Target, CalendarDays } from 'lucide-react'

export function CountUp({ value, suffix = '', duration = 1 }) {
  const ref = useRef(null)
  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.round(v) + suffix
      },
    })
    return () => controls.stop()
  }, [value, suffix, duration])
  return <span ref={ref}>0{suffix}</span>
}

export default function Today() {
  const { settings, entries, getEntry } = useApp()
  const date = todayISO()
  const items = settings.habits
  const rate = entryRate(getEntry(date), items)
  const streak = perfectStreak(entries, items)
  const day = challengeDay(date, settings.challenge)
  const pct = day ? Math.round((day / settings.challenge.length) * 100) : 0

  return (
    <div className="space-y-5 lg:grid lg:grid-cols-3 lg:items-start lg:gap-6 lg:space-y-0">
      {/* right rail — stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:order-2 lg:col-span-1 lg:grid-cols-1 lg:gap-4">
        <Stat
          icon={<Flame size={18} className="text-orange-500" />}
          label="Perfect streak"
          value={<CountUp value={streak.current} suffix="d" />}
          sub={`best ${streak.best}d`}
        />
        <Stat
          icon={<Target size={18} className="text-lime-600 dark:text-acid" />}
          label="Today"
          value={rate === null ? '—' : <CountUp value={Math.round(rate * 100)} suffix="%" />}
          sub="completion"
        />
        <Stat
          icon={<CalendarDays size={18} className="text-blue-500" />}
          label={settings.challenge.name}
          value={day ? <CountUp value={day} /> : '—'}
          sub={day ? `of ${settings.challenge.length} — ${pct}% in` : 'not active'}
          progress={day ? pct : null}
        />
      </div>

      <div className="lg:order-1 lg:col-span-2">
        <EntryEditor date={date} />
      </div>
    </div>
  )
}

function Stat({ icon, label, value, sub, progress }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="glass flex flex-col items-center px-2 py-3 text-center sm:py-4 lg:items-start lg:px-5 lg:py-5 lg:text-left"
    >
      <div className="mb-1 flex items-center gap-2">
        {icon}
        <span className="tag hidden lg:inline">[ {label} ]</span>
      </div>
      <span className="font-display text-xl font-bold sm:text-2xl lg:text-4xl">{value}</span>
      <span className="tag mt-0.5 w-full truncate lg:hidden">{label}</span>
      <span className="tag mt-0.5 hidden lg:inline">{sub}</span>
      {progress !== null && progress !== undefined && (
        <div className="mt-3 hidden h-[3px] w-full overflow-hidden rounded bg-slate-100 dark:bg-white/5 lg:block">
          <motion.div
            className="h-full bg-lime-600 dark:bg-acid"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      )}
    </motion.div>
  )
}
