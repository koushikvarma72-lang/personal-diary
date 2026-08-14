import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../App'
import { formatDate } from '../lib/stats'
import { Search as SearchIcon, ArrowRight, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Search() {
  const { entries, searchEntries } = useApp()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const navigate = useNavigate()

  const handleSearch = (q) => {
    setQuery(q)
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    setResults(searchEntries(q))
  }

  const totalEntries = Object.keys(entries).length

  return (
    <div className="space-y-4">
      <div className="glass p-4 sm:p-6">
        <p className="tag mb-1">[ search diary ]</p>
        <h1 className="font-display mb-4 text-2xl font-bold uppercase tracking-tight sm:text-3xl">
          Find what matters
        </h1>

        <div className="relative">
          <SearchIcon
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search regrets, achievements, takes, or dates…"
            autoFocus
            className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-10 pr-4 text-sm focus:border-acid focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
          />
        </div>

        <p className="tag mt-3">
          {totalEntries} entries indexed · type at least 2 characters to search
        </p>
      </div>

      <AnimatePresence mode="wait">
        {query.trim().length >= 2 && results.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass flex flex-col items-center py-16 text-center"
          >
            <BookOpen size={40} className="mb-3 text-slate-300 dark:text-white/20" />
            <p className="font-display text-lg font-bold uppercase tracking-tight text-slate-400 dark:text-white/40">
              No matches
            </p>
            <p className="tag mt-1">Try a different search term</p>
          </motion.div>
        )}

        {results.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <p className="tag px-1">
              {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </p>
            {results.map(({ date, entry }, i) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass cursor-pointer p-4 transition hover:bg-white/90 sm:p-5 dark:hover:bg-card/60"
                onClick={() => navigate(`/history?date=${date}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs uppercase tracking-wider text-acid">
                      {formatDate(date)}
                    </p>
                    {entry.mood && (
                      <span className="ml-2 text-sm">{entry.mood}</span>
                    )}
                    {entry.regret && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-red-400">
                          regret:&nbsp;
                        </span>
                        {highlight(entry.regret, query)}
                      </p>
                    )}
                    {entry.achievement && (
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-lime-600 dark:text-acid">
                          achievement:&nbsp;
                        </span>
                        {highlight(entry.achievement, query)}
                      </p>
                    )}
                    {entry.take && (
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-blue-500">
                          take:&nbsp;
                        </span>
                        {highlight(entry.take, query)}
                      </p>
                    )}
                  </div>
                  <ArrowRight size={16} className="mt-1 shrink-0 text-slate-400" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function highlight(text, query) {
  if (!text || !query) return text
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="rounded bg-acid/30 px-0.5 text-inherit dark:bg-acid/40">{part}</mark>
      : part
  )
}
