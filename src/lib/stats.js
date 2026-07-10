// Analytics helpers — pure functions over the entries map.

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

// Heatmap: last `weeks` weeks as columns of 7 days.
export function heatmap(entries, items, weeks = 17) {
  const today = todayISO()
  const end = new Date(today + 'T00:00:00')
  // pad to end of week (Sat)
  const cols = []
  let cursor = addDays(today, -(weeks * 7 - 1) - end.getDay())
  for (let w = 0; w <= weeks; w++) {
    const col = []
    for (let d = 0; d < 7; d++) {
      if (cursor > today) { col.push(null) }
      else {
        const r = entryRate(entries[cursor], items)
        col.push({ date: cursor, rate: r })
      }
      cursor = addDays(cursor, 1)
    }
    cols.push(col)
  }
  return cols
}
