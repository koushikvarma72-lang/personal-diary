import { motion } from 'framer-motion'
import { useApp } from '../App'
import {
  habitStats,
  habitStreak,
  perfectStreak,
  trend,
  heatmap,
} from '../lib/stats'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts'
import { Flame, Trophy } from 'lucide-react'
import { CountUp } from './Today'

export default function Analytics() {
  const { settings, entries } = useApp()
  const items = settings.habits
  const stats = habitStats(entries, items)
  const perfect = perfectStreak(entries, items)
  const trendData = trend(entries, items, 30)
  const heat = heatmap(entries, items, 16)
  const isDark = settings.theme === 'dark'
  const lineColor = isDark ? '#e3b02b' : '#1a5d2a'
  const axisColor = isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8'

  const barData = items.map((it) => ({
    name: it.label.length > 14 ? it.label.slice(0, 13) + '…' : it.label,
    rate: Math.round(stats[it.id].rate * 100),
  }))

  const heatColor = (cell) => {
    if (!cell || cell.rate === null) return 'bg-slate-200 dark:bg-white/5'
    if (cell.rate >= 0.99) return 'bg-lime-600 dark:bg-acid'
    if (cell.rate >= 0.7) return 'bg-lime-500/70 dark:bg-acid/60'
    if (cell.rate >= 0.4) return 'bg-yellow-400 dark:bg-yellow-400/70'
    if (cell.rate > 0) return 'bg-orange-400 dark:bg-orange-400/70'
    return 'bg-red-400 dark:bg-red-500/60'
  }

  const tooltipStyle = {
    background: isDark ? '#0b1957' : '#fff',
    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
    borderRadius: 8,
    fontFamily: '"Space Mono", monospace',
    fontSize: 12,
    color: isDark ? '#fff' : '#0f172a',
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <p className="tag mb-1">[ analytics ]</p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          The numbers don't lie
        </h1>
      </div>

      {/* streak cards */}
      <div className="grid grid-cols-2 gap-3 lg:col-span-2 lg:gap-4">
        <Card hover>
          <Flame className="text-orange-500" />
          <p className="font-display mt-2 text-3xl font-bold sm:text-4xl">
            <CountUp value={perfect.current} /> <span className="text-base text-slate-400 dark:text-white/30">days</span>
          </p>
          <p className="tag mt-1">current perfect streak</p>
        </Card>
        <Card hover>
          <Trophy className="text-amber-500" />
          <p className="font-display mt-2 text-3xl font-bold sm:text-4xl">
            <CountUp value={perfect.best} /> <span className="text-base text-slate-400 dark:text-white/30">days</span>
          </p>
          <p className="tag mt-1">best perfect streak</p>
        </Card>
      </div>

      {/* heatmap */}
      <Card title="consistency heatmap" className="lg:col-span-2">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {heat.map((col, i) => (
            <div key={i} className="flex flex-col gap-1">
              {col.map((cell, j) => (
                <motion.div
                  key={j}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.015 }}
                  title={cell ? `${cell.date}` : ''}
                  className={`h-3.5 w-3.5 rounded-sm ${cell ? heatColor(cell) : 'opacity-0'}`}
                />
              ))}
            </div>
          ))}
        </div>
        <p className="tag mt-3">last ~4 months · green = all done · yellow = partial · red = missed</p>
      </Card>

      {/* daily trend */}
      <Card title="daily completion % — last 30 days">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={isDark ? 0.08 : 0.3} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: axisColor }} interval={4} stroke="transparent" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: axisColor }} width={30} stroke="transparent" />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke={lineColor}
              strokeWidth={2}
              dot={{ r: 2, fill: lineColor }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* per-habit success */}
      <Card title="success rate per habit — all time">
        <ResponsiveContainer width="100%" height={items.length * 34 + 30}>
          <BarChart data={barData} layout="vertical" margin={{ left: 8 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: axisColor }} stroke="transparent" />
            <YAxis
              type="category"
              dataKey="name"
              width={typeof window !== 'undefined' && window.innerWidth < 640 ? 92 : 120}
              tick={{ fontSize: 10, fill: axisColor }}
              stroke="transparent"
            />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
            <Bar dataKey="rate" fill={lineColor} radius={[0, 6, 6, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* per-habit streak table */}
      <Card title="habit streaks" className="lg:col-span-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="text-left font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-white/40">
                <th className="py-2">Habit</th>
                <th className="py-2 text-right">Done</th>
                <th className="py-2 text-right">Missed</th>
                <th className="py-2 text-right">Current</th>
                <th className="py-2 text-right">Best</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const s = habitStreak(entries, it.id)
                return (
                  <tr
                    key={it.id}
                    className="border-t border-slate-100 transition-colors hover:bg-slate-50/60 dark:border-white/5 dark:text-white/80 dark:hover:bg-white/[0.03]"
                  >
                    <td className="font-display py-2 font-medium">{it.label}</td>
                    <td className="py-2 text-right font-mono text-lime-600 dark:text-acid">
                      {stats[it.id].done}
                    </td>
                    <td className="py-2 text-right font-mono text-red-500">
                      {stats[it.id].missed}
                    </td>
                    <td className="py-2 text-right font-mono">{s.current}d</td>
                    <td className="py-2 text-right font-mono font-bold">{s.best}d</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function Card({ title, children, className = '', hover = false }) {
  const Comp = hover ? motion.div : 'div'
  const props = hover ? { whileHover: { y: -3 } } : {}
  return (
    <Comp {...props} className={`glass p-4 sm:p-5 ${className}`}>
      {title && <p className="tag mb-3">[ {title} ]</p>}
      {children}
    </Comp>
  )
}
