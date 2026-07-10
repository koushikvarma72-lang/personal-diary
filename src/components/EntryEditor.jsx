import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../App'
import { challengeDay, formatDate } from '../lib/stats'

// One diary entry — Oryzo-style dark card with technical labels
// and springy check interactions.
export default function EntryEditor({ date }) {
  const { settings, getEntry, updateEntry } = useApp()
  const entry = getEntry(date)
  const habits = settings.habits.filter((h) => h.type === 'habit')
  const tasks = settings.habits.filter((h) => h.type === 'task')
  const day = challengeDay(date, settings.challenge)
  const all = [...habits, ...tasks]
  const done = all.filter((it) => entry.checks?.[it.id] === true).length

  const cycle = (id) => {
    // unmarked -> ✓ -> ✗ -> unmarked
    const cur = entry.checks?.[id]
    const next = cur === undefined || cur === null ? true : cur === true ? false : null
    updateEntry(date, { checks: { ...entry.checks, [id]: next } })
  }

  const Check = ({ id }) => {
    const v = entry.checks?.[id]
    return (
      <motion.button
        onClick={() => cycle(id)}
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.06 }}
        className={`shrink-0 rounded-full border px-4 py-2 font-mono text-sm transition-colors ${
          v === true
            ? 'border-lime-600 bg-lime-600/10 text-lime-600 dark:border-acid dark:bg-acid/10 dark:text-acid'
            : v === false
              ? 'border-red-500 bg-red-500/10 text-red-500'
              : 'border-slate-300 text-slate-400 hover:border-slate-500 dark:border-white/15 dark:text-white/30 dark:hover:border-white/40'
        }`}
        title="Tap to cycle: blank → ✓ → ✗"
      >
        <span className="flex w-10 justify-center">
          [&nbsp;
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={String(v)}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              {v === true ? '✓' : v === false ? '✗' : ' '}
            </motion.span>
          </AnimatePresence>
          &nbsp;]
        </span>
      </motion.button>
    )
  }

  const Row = ({ item, index }) => {
    const v = entry.checks?.[item.id]
    return (
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.045, duration: 0.35, ease: 'easeOut' }}
        className="group flex items-center justify-between gap-3 border-b border-slate-100 py-3 transition-colors last:border-0 hover:bg-slate-50/60 dark:border-white/5 dark:hover:bg-white/[0.03]"
      >
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <span className="tag w-6 shrink-0">{String(index + 1).padStart(2, '0')}</span>
          <span
            className={`font-display min-w-0 break-words text-base font-medium uppercase tracking-wide transition-all sm:text-lg ${
              v === true
                ? 'text-slate-400 line-through decoration-lime-600/60 dark:text-white/30 dark:decoration-acid/60'
                : v === false
                  ? 'text-red-500/80'
                  : 'text-slate-800 dark:text-white/85'
            }`}
          >
            {item.label}
          </span>
        </div>
        <Check id={item.id} />
      </motion.div>
    )
  }

  const Section = ({ label, value, field, placeholder }) => (
    <div className="mt-5">
      <p className="tag-acid mb-1">[ {label} ]</p>
      <textarea
        rows={2}
        defaultValue={value}
        key={date + field}
        onBlur={(e) => updateEntry(date, { [field]: e.target.value })}
        placeholder={placeholder}
        className="font-hand w-full resize-none text-2xl leading-9 text-slate-800 placeholder:text-slate-300 dark:text-slate-100 dark:placeholder:text-white/20"
      />
    </div>
  )

  return (
    <div className="paper overflow-hidden">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 p-5 dark:border-white/10 sm:p-6">
        <div>
          <p className="tag mb-1">[ entry — {formatDate(date)} ]</p>
          {day ? (
            <p className="font-display text-4xl font-bold uppercase leading-none tracking-tight sm:text-5xl">
              Day&nbsp;
              <span className="text-lime-600 dark:text-acid">
                {String(day).padStart(2, '0')}
              </span>
              <span className="text-xl text-slate-400 dark:text-white/30 sm:text-2xl">
                /{settings.challenge.length}
              </span>
            </p>
          ) : (
            <p className="font-display text-3xl font-bold uppercase tracking-tight">
              Free day
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="tag mb-1">completed</p>
          <p className="font-mono text-2xl font-bold">
            <span className={done === all.length && all.length > 0 ? 'text-lime-600 dark:text-acid' : ''}>
              {String(done).padStart(2, '0')}
            </span>
            <span className="text-slate-400 dark:text-white/30">/{String(all.length).padStart(2, '0')}</span>
          </p>
        </div>
      </div>

      {/* progress hairline */}
      <div className="h-[3px] w-full bg-slate-100 dark:bg-white/5">
        <motion.div
          className="h-full bg-lime-600 dark:bg-acid"
          animate={{ width: all.length ? `${(done / all.length) * 100}%` : '0%' }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>

      <div className="p-5 sm:p-6">
        <p className="tag mb-2">[ habits — {String(habits.length).padStart(2, '0')} ]</p>
        {habits.map((h, i) => (
          <Row key={h.id} item={h} index={i} />
        ))}

        {tasks.length > 0 && (
          <>
            <div className="arrow-divider">tasks — {String(tasks.length).padStart(2, '0')}</div>
            {tasks.map((t, i) => (
              <Row key={t.id} item={t} index={habits.length + i} />
            ))}
          </>
        )}

        <div className="arrow-divider">reflection</div>
        <Section
          label="Regret of the day"
          value={entry.regret}
          field="regret"
          placeholder="What could you have done better?"
        />
        <Section
          label="Achievement of the day"
          value={entry.achievement}
          field="achievement"
          placeholder="What did you win today?"
        />
        <Section
          label="Take of the day"
          value={entry.take}
          field="take"
          placeholder='"One lesson today taught you…"'
        />
      </div>
    </div>
  )
}
