import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../App'
import { todayISO, addDays, formatDate, entryRate, habitStats, isPerfectDay } from '../lib/stats'
import { ArrowUp, ArrowDown, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react'

export default function WeeklyReview() {
  const { settings, entries } = useApp()
  const today = todayISO()

  const weeks = useMemo(() => {
    const out = []
    for (let w = 0; w < 4; w++) {
      const end = addDays(today, -(w * 7))
      const start = addDays(today, -(w * 7 + 6))
      const days = []
      let cursor = start
      let perfectCount = 0
      let totalRate = 0
      let dayCount = 0
      for (let d = 0; d < 7; d++) {
        const entry = entries[cursor]
        days.push({ date: cursor, entry })
        const rate = entryRate(entry, settings.habits)
        if (rate !== null) {
          totalRate += rate
          dayCount++
          if (isPerfectDay(entry, settings.habits)) perfectCount++
        }
        cursor = addDays(cursor, 1)
      }
      const avgRate = dayCount > 0 ? totalRate / dayCount : 0
      // find best and worst day
      const rated = days
        .map((d, i) => ({ ...d, rate: entryRate(d.entry, settings.habits), index: i }))
        .filter((d) => d.rate !== null)
      const best = rated.length > 0 ? rated.reduce((a, b) => (a.rate > b.rate ? a : b)) : null
      const worst = rated.length > 0 ? rated.reduce((a, b) => (a.rate < b.rate ? a : b)) : null

      // week label
      const weekLabels = ['This week', 'Last week', '2 weeks ago', '3 weeks ago']
      out.push({
        label: weekLabels[w] || `${w} weeks ago`,
        start,
        end,
        days,
        avgRate,
        perfectCount,
        best,
        worst,
        totalDays: dayCount,
      })
    }
    return out
  }, [entries, settings.habits])

  const latestWeek = weeks[0]
  const prevWeek = weeks[1]
  const trend = prevWeek?.avgRate
    ? ((latestWeek.avgRate - prevWeek.avgRate) / prevWeek.avgRate) * 100
    : 0

  return (
    <div className="space-y-4">
      <div className="lg:col-span-2">
        <p className="tag mb-1">[ weekly review ]</p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          How you lived this week
        </h1>
      </div>

      {/* Trend card */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Card hover>
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-lime-600 dark:text-acid" />
            <p className="tag">weekly average</p>
          </div>
          <p className="font-display mt-2 text-3xl font-bold sm:text-4xl">
            {Math.round(latestWeek.avgRate * 100)}%
          </p>
          <p className="tag mt-1">
            {trend > 0 ? (
              <span className="text-lime-600 dark:text-acid">↑ {Math.abs(trend).toFixed(1)}% vs last week</span>
            ) : trend < 0 ? (
              <span className="text-red-500">↓ {Math.abs(trend).toFixed(1)}% vs last week</span>
            ) : (
              <span className="text-slate-400">— no change</span>
            )}
          </p>
        </Card>

        <Card hover>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            <p className="tag">perfect days</p>
          </div>
          <p className="font-display mt-2 text-3xl font-bold sm:text-4xl">
            {latestWeek.perfectCount}
            <span className="text-base text-slate-400 dark:text-white/30">/7</span>
          </p>
          <p className="tag mt-1">days with 100% completion</p>
        </Card>

        <Card hover>
          <div className="flex items-center gap-2">
            <ArrowUp size={18} className="text-green-500" />
            <p className="tag">best day</p>
          </div>
          {latestWeek.best ? (
            <>
              <p className="font-display mt-2 text-3xl font-bold sm:text-4xl">
                {Math.round(latestWeek.best.rate * 100)}%
              </p>
              <p className="tag mt-1">{formatDate(latestWeek.best.date)}</p>
            </>
          ) : (
            <p className="font-display mt-2 text-base text-slate-400">—</p>
          )}
        </Card>

        <Card hover>
          <div className="flex items-center gap-2">
            <ArrowDown size={18} className="text-red-500" />
            <p className="tag">worst day</p>
          </div>
          {latestWeek.worst ? (
            <>
              <p className="font-display mt-2 text-3xl font-bold sm:text-4xl">
                {Math.round(latestWeek.worst.rate * 100)}%
              </p>
              <p className="tag mt-1">{formatDate(latestWeek.worst.date)}</p>
            </>
          ) : (
            <p className="font-display mt-2 text-base text-slate-400">—</p>
          )}
        </Card>
      </div>

      {/* Week-by-week breakdown */}
      <Card title="week by week">
        <div className="space-y-6">
          {weeks.map((week, wi) => (
            <motion.div
              key={week.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: wi * 0.1 }}
            >
              <div className="mb-2 flex items-baseline justify-between">
                <p className="font-display text-lg font-bold uppercase">{week.label}</p>
                <span className="tag">
                  {week.start} — {week.end}
                </span>
              </div>

              {/* Mini bar chart */}
              <div className="flex items-end gap-1.5" style={{ height: 60 }}>
                {week.days.map((d) => {
                  const rate = entryRate(d.entry, settings.habits)
                  const h = rate !== null ? Math.max(rate * 60, 4) : 4
                  return (
                    <div
                      key={d.date}
                      title={`${d.date}: ${rate !== null ? Math.round(rate * 100) + '%' : 'no data'}`}
                      className="group relative flex-1"
                    >
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${h}px` }}
                        transition={{ delay: wi * 0.1 + 0.3 }}
                        className={`w-full rounded-t ${
                          rate === null
                            ? 'bg-slate-200 dark:bg-white/5'
                            : rate >= 0.99
                              ? 'bg-lime-600 dark:bg-acid'
                              : rate >= 0.7
                                ? 'bg-lime-500/70 dark:bg-acid/60'
                                : rate >= 0.4
                                  ? 'bg-yellow-400 dark:bg-yellow-400/70'
                                  : 'bg-red-400 dark:bg-red-500/60'
                        }`}
                      />
                    </div>
                  )
                })}
              </div>

              <div className="mt-1 flex justify-between px-0.5">
                <span className="font-mono text-[8px] uppercase tracking-wider text-slate-400 dark:text-white/30">
                  Mon
                </span>
                <span className="font-mono text-[8px] uppercase tracking-wider text-slate-400 dark:text-white/30">
                  Sun
                </span>
              </div>

              {/* Worst/best insight */}
              <div className="mt-2 flex gap-4 text-xs text-slate-500 dark:text-slate-400">
                {week.best && (
                  <span className="flex items-center gap-1">
                    <ArrowUp size={12} className="text-green-500" />
                    Best: {formatDate(week.best.date)} ({Math.round(week.best.rate * 100)}%)
                  </span>
                )}
                {week.worst && week.worst.date !== week.best?.date && (
                  <span className="flex items-center gap-1">
                    <ArrowDown size={12} className="text-red-500" />
                    Worst: {formatDate(week.worst.date)} ({Math.round(week.worst.rate * 100)}%)
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Insights */}
      <Card title="insights">
        {latestWeek.perfectCount === 7 ? (
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-amber-500" />
            <p className="text-sm dark:text-slate-200">
              <b>Perfect week!</b> You checked every box every day. This is elite.
            </p>
          </div>
        ) : latestWeek.avgRate >= 0.85 ? (
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-lime-600 dark:text-acid" />
            <p className="text-sm dark:text-slate-200">
              <b>Strong week.</b> You're showing up consistently. {latestWeek.perfectCount}/7 perfect days.
            </p>
          </div>
        ) : latestWeek.avgRate >= 0.6 ? (
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-yellow-500" />
            <p className="text-sm dark:text-slate-200">
              <b>Solid effort.</b> Room to grow — identify the habits you skipped most and focus there.
            </p>
          </div>
        ) : latestWeek.totalDays > 0 ? (
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-500" />
            <p className="text-sm dark:text-slate-200">
              <b>Tough week.</b> You showed up on {latestWeek.totalDays}/7 days. Tomorrow is a fresh start.
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-400 dark:text-white/30">
            No data for this week. Start journaling to see your weekly review.
          </p>
        )}
        {latestWeek.avgRate < prevWeek?.avgRate && (
          <p className="tag mt-2">↓ {Math.abs(trend).toFixed(1)}% from last week. What changed?</p>
        )}
        {latestWeek.avgRate > prevWeek?.avgRate && prevWeek?.avgRate > 0 && (
          <p className="tag mt-2 text-lime-600 dark:text-acid">↑ {trend.toFixed(1)}% from last week. Keep it up!</p>
        )}
      </Card>
    </div>
  )
}

function Card({ title, children, hover = false, className = '' }) {
  const Comp = hover ? motion.div : 'div'
  const props = hover ? { whileHover: { y: -3 } } : {}
  return (
    <Comp {...props} className={`glass p-4 sm:p-5 ${className}`}>
      {title && <p className="tag mb-3">[ {title} ]</p>}
      {children}
    </Comp>
  )
}
