import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../App'
import { todayISO, entryRate, addDays, formatDate } from '../lib/stats'
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

  // entries from the same month/day in past years
  const onThisDay = useMemo(() => {
    if (!date) return []
    const md = date.slice(5) // MM-DD
    return Object.entries(entries)
      .filter(([d]) => d.slice(5) === md && d !== date)
      .map(([d, entry]) => ({ date: d, entry }))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [entries, date])

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
      {onThisDay.length > 0 && (
        <div className="glass p-4 sm:p-5">
          <p className="tag mb-3">[ on this day — past years ]</p>
          <div className="space-y-2">
            {onThisDay.map(({ date: d, entry }) => {
              const r = entryRate(entry, settings.habits)
              const snippet = (entry.take || entry.achievement || entry.regret || '').trim()
              const y = Number(d.slice(0, 4)) - Number(date.slice(0, 4))
              return (
                <button
                  key={d}
                  onClick={() => goTo(d)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200/70 bg-white/60 px-3 py-2 text-left transition hover:border-slate-400 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-xs uppercase tracking-wider text-lime-600 dark:text-acid">
                      {formatDate(d)} — {y === 1 ? '1 year ago' : `${y} years ago`}
                    </span>
                    {snippet && (
                      <span className="mt-0.5 block truncate text-sm text-slate-600 dark:text-slate-300">
                        {snippet}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-lg">{entry.mood ?? ''}</span>
                  <span className="tag shrink-0">
                    {r === null ? '—' : `${Math.round(r * 100)}%`}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
