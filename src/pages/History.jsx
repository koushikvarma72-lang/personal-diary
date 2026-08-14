import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../App'
import { todayISO, entryRate, addDays } from '../lib/stats'
import { useSearchParams } from 'react-router-dom'
import EntryEditor from '../components/EntryEditor'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function History() {
  const { settings, entries } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlDate = searchParams.get('date')
  const [date, setDate] = useState(urlDate || todayISO())
  const today = todayISO()

  // keep the editor in sync when the URL's ?date= changes
  // (browser back/forward, links from Search, etc.)
  useEffect(() => {
    if (urlDate) setDate(urlDate)
  }, [urlDate])

  const goTo = (d) => {
    setDate(d)
    setSearchParams(d !== today ? { date: d } : {}, { replace: true })
  }

  const color = (d) => {
    const r = entryRate(entries[d], settings.habits)
    if (r === null) return 'bg-slate-200 dark:bg-white/5'
    if (r >= 0.99) return 'bg-lime-600 dark:bg-acid'
    if (r >= 0.7) return 'bg-lime-500/70 dark:bg-acid/60'
    if (r >= 0.4) return 'bg-yellow-400 dark:bg-yellow-400/70'
    return 'bg-red-400 dark:bg-red-500/60'
  }

  // simple month strip: last 28 days
  const days = []
  for (let i = 27; i >= 0; i--) days.push(addDays(today, -i))

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-[360px,1fr] lg:items-start lg:gap-6 lg:space-y-0">
      <div className="glass p-4 lg:sticky lg:top-32">
        <p className="tag mb-3">[ time machine — last 28 days ]</p>
        <div className="mb-3 flex items-center justify-between">
          <button onClick={() => goTo(addDays(date, -1))} className="btn-icon">
            <ChevronLeft size={18} />
          </button>
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => e.target.value && goTo(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-sm dark:border-white/15 dark:bg-white/5 dark:text-white"
          />
          <button
            onClick={() => goTo(addDays(date, 1))}
            disabled={date >= today}
            className="btn-icon disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1.5 sm:[grid-template-columns:repeat(14,minmax(0,1fr))] lg:[grid-template-columns:repeat(7,minmax(0,1fr))]">
          {days.map((d, i) => (
            <motion.button
              key={d}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.012 }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => goTo(d)}
              title={d}
              className={`aspect-square rounded ${color(d)} ${
                d === date ? 'ring-2 ring-slate-900 dark:ring-acid' : ''
              }`}
            />
          ))}
        </div>
        <p className="tag mt-3 text-center">tap a square to open that day</p>
      </div>
      <EntryEditor date={date} />
    </div>
  )
}
