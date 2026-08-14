// Analytics helpers — pure functions over the entries map.
import { MOODS } from './defaults'

const MOOD_SCORE = Object.fromEntries(MOODS.map((m) => [m.emoji, m.score]))

export const toISO = (d) => {
  const dt = d instanceof Date ? d : new Date(d)
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const todayISO = () => toISO(new Date())

export const addDays = (iso, n) => {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return toISO(d)
}

export const formatDate = (iso) => {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// Day number within the challenge (1-based), or null if outside.
export function challengeDay(dateISO, challenge) {
  if (!challenge?.startDate) return null
  const start = new Date(challenge.startDate + 'T00:00:00')
  const d = new Date(dateISO + 'T00:00:00')
  const diff = Math.round((d - start) / 86400000) + 1
  if (diff < 1 || diff > challenge.length) return null
  return diff
}

// Completion rate (0..1) for one entry across the given items.
export function entryRate(entry, items) {
  if (!entry || items.length === 0) return null
  let done = 0
  let marked = 0
  for (const it of items) {
    const v = entry.checks?.[it.id]
    if (v === true) { done++; marked++ }
    else if (v === false) marked++
  }
  if (marked === 0) return null
  return done / items.length
}

// Per-habit totals: { done, missed, rate }
export function habitStats(entries, items) {
  const out = {}
  for (const it of items) out[it.id] = { done: 0, missed: 0, rate: 0 }
  for (const entry of Object.values(entries)) {
    for (const it of items) {
      const v = entry.checks?.[it.id]
      if (v === true) out[it.id].done++
      else if (v === false) out[it.id].missed++
    }
  }
  for (const it of items) {
    const s = out[it.id]
    const total = s.done + s.missed
    s.rate = total ? s.done / total : 0
  }
  return out
}

// Current + best streak for a single habit id.
export function habitStreak(entries, habitId) {
  // current: walk back from today (allow today unmarked)
  let current = 0
  let cursor = todayISO()
  if (entries[cursor]?.checks?.[habitId] !== true) cursor = addDays(cursor, -1)
  while (entries[cursor]?.checks?.[habitId] === true) {
    current++
    cursor = addDays(cursor, -1)
  }
  // best: scan all dates
  const dates = Object.keys(entries).sort()
  let best = 0
  let run = 0
  let prev = null
  for (const d of dates) {
    if (entries[d]?.checks?.[habitId] === true) {
      run = prev && addDays(prev, 1) === d ? run + 1 : 1
      prev = d
      best = Math.max(best, run)
    } else {
      run = 0
      prev = null
    }
  }
  return { current, best }
}

// "Perfect day" = every item checked true.
export function isPerfectDay(entry, items) {
  return items.length > 0 && items.every((it) => entry?.checks?.[it.id] === true)
}

export function perfectStreak(entries, items) {
  let current = 0
  let cursor = todayISO()
  if (!isPerfectDay(entries[cursor], items)) cursor = addDays(cursor, -1)
  while (isPerfectDay(entries[cursor], items)) {
    current++
    cursor = addDays(cursor, -1)
  }
  const dates = Object.keys(entries).sort()
  let best = 0
  let run = 0
  let prev = null
  for (const d of dates) {
    if (isPerfectDay(entries[d], items)) {
      run = prev && addDays(prev, 1) === d ? run + 1 : 1
      prev = d
      best = Math.max(best, run)
    } else {
      run = 0
      prev = null
    }
  }
  return { current, best }
}
// Check whether an entry is "not done" — no habits marked AND no content written.
export function isEntryIncomplete(entry) {
  if (!entry) return true
  // only count real marks (✓/✗); cycling a check back to blank doesn't count
  const hasChecks = Object.values(entry.checks ?? {}).some((v) => v === true || v === false)
  const hasText = (entry.regret ?? '').trim() || (entry.achievement ?? '').trim() || (entry.take ?? '').trim()
  const hasMood = entry.mood != null
  return !hasChecks && !hasText && !hasMood
}

// Trend data for last n days: [{date, label, rate}]
export function trend(entries, items, n = 30) {
  const out = []
  let cursor = addDays(todayISO(), -(n - 1))
  for (let i = 0; i < n; i++) {
    const e = entries[cursor]
    const r = entryRate(e, items)
    out.push({
      date: cursor,
      label: cursor.slice(8) + '/' + cursor.slice(5, 7),
      rate: r === null ? null : Math.round(r * 100),
    })
    cursor = addDays(cursor, 1)
  }
  return out
}

// Heatmap: last `weeks` weeks as columns of 7 days (Sun–Sat), the final
// column being the current week with future days left empty.
export function heatmap(entries, items, weeks = 17) {
  const today = todayISO()
  const end = new Date(today + 'T00:00:00')
  // start on the Sunday `weeks - 1` weeks back so the last column is this week
  const start = addDays(today, -(weeks - 1) * 7 - end.getDay())
  const cols = []
  for (let w = 0; w < weeks; w++) {
    const col = []
    for (let d = 0; d < 7; d++) {
      const date = addDays(start, w * 7 + d)
      col.push(date > today ? null : { date, rate: entryRate(entries[date], items) })
    }
    cols.push(col)
  }
  return cols
}

// Mood ↔ habit correlation: average mood score (1–5) on days each habit was
// done vs missed. Only entries with a mood are counted; habits with too few
// samples report null averages.
export function moodCorrelations(entries, items) {
  const acc = {}
  for (const it of items) {
    acc[it.id] = { id: it.id, label: it.label, doneCount: 0, doneSum: 0, missedCount: 0, missedSum: 0 }
  }
  for (const entry of Object.values(entries)) {
    const score = MOOD_SCORE[entry.mood]
    if (score == null) continue
    for (const it of items) {
      const v = entry.checks?.[it.id]
      if (v === true) {
        acc[it.id].doneCount++
        acc[it.id].doneSum += score
      } else if (v === false) {
        acc[it.id].missedCount++
        acc[it.id].missedSum += score
      }
    }
  }
  return Object.values(acc).map((r) => ({
    ...r,
    doneAvg: r.doneCount ? r.doneSum / r.doneCount : null,
    missedAvg: r.missedCount ? r.missedSum / r.missedCount : null,
    diff:
      r.doneCount && r.missedCount ? r.doneSum / r.doneCount - r.missedSum / r.missedCount : null,
  }))
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Year in Pixels: 12 month rows of days, each { date, entry } or { date, entry: null }.
export function yearPixels(year, entries) {
  const months = []
  for (let m = 0; m < 12; m++) {
    const daysInMonth = new Date(year, m + 1, 0).getDate()
    const days = []
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({ date, entry: entries[date] ?? null })
    }
    months.push({ label: MONTHS[m], days })
  }
  return months
}

