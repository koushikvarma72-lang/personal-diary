import { useState } from 'react'
import { useApp } from '../App'
import { auth } from '../lib/storage'
import { Trash2, Plus, ArrowUp, ArrowDown } from 'lucide-react'

export default function Settings() {
  const { settings, saveSettings, user } = useApp()
  const [newLabel, setNewLabel] = useState('')
  const [newType, setNewType] = useState('habit')
  // local buffer so you can clear/type freely (e.g. 7, 21, 100)
  const [lenInput, setLenInput] = useState(String(settings.challenge.length))

  const setHabits = (habits) => saveSettings({ ...settings, habits })

  const add = () => {
    const label = newLabel.trim()
    if (!label) return
    const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36)
    setHabits([...settings.habits, { id, label, type: newType }])
    setNewLabel('')
  }

  const remove = (id) => {
    if (confirm('Remove this item? Past records stay saved.'))
      setHabits(settings.habits.filter((h) => h.id !== id))
  }

  const move = (i, dir) => {
    const arr = [...settings.habits]
    const j = i + dir
    if (j < 0 || j >= arr.length) return
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    setHabits(arr)
  }

  const setChallenge = (patch) =>
    saveSettings({ ...settings, challenge: { ...settings.challenge, ...patch } })

  return (
    <div className="space-y-4">
      <Card title="Habits & tasks">
        {settings.habits.map((h, i) => (
          <div
            key={h.id}
            className="flex items-center gap-2 border-t border-slate-100 py-2 first:border-0 dark:border-gray-800"
          >
            <span className="flex-1 text-sm dark:text-slate-200">{h.label}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-gray-800 dark:text-slate-400">
              {h.type}
            </span>
            <button onClick={() => move(i, -1)} className="btn-icon"><ArrowUp size={15} /></button>
            <button onClick={() => move(i, 1)} className="btn-icon"><ArrowDown size={15} /></button>
            <button onClick={() => remove(h.id)} className="btn-icon text-red-500"><Trash2 size={15} /></button>
          </div>
        ))}
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="New habit or task…"
            className="w-full flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <div className="flex gap-2">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-2 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:flex-none"
            >
              <option value="habit">Habit</option>
              <option value="task">Task</option>
            </select>
            <button
              onClick={add}
              className="flex shrink-0 items-center justify-center gap-1 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800 dark:bg-acid dark:text-card dark:hover:brightness-110"
            >
              <Plus size={15} /> Add
            </button>
          </div>
        </div>
      </Card>

      <Card title="Challenge">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm dark:text-slate-200">
            Name
            <input
              value={settings.challenge.name}
              onChange={(e) => setChallenge({ name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </label>
          <label className="text-sm dark:text-slate-200">
            Length (days)
            <input
              type="number"
              min={1}
              max={3650}
              value={lenInput}
              onChange={(e) => {
                setLenInput(e.target.value)
                const n = parseInt(e.target.value, 10)
                if (n >= 1) setChallenge({ length: n })
              }}
              onBlur={() => {
                const n = parseInt(lenInput, 10)
                if (!(n >= 1)) setLenInput(String(settings.challenge.length))
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </label>
          <label className="text-sm dark:text-slate-200">
            Start date
            <input
              type="date"
              value={settings.challenge.startDate}
              onChange={(e) => setChallenge({ startDate: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </label>
        </div>
      </Card>

      <Card title="Account">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {auth.isLocal ? (
            <>
              Running in <b>local mode</b> — data is stored in this browser only.
              Connect Supabase (see README) to sync across devices with login.
            </>
          ) : (
            <>Signed in as <b>{user?.email}</b></>
          )}
        </p>
      </Card>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div className="glass p-4">
      <h2 className="mb-3 font-semibold text-slate-700 dark:text-slate-200">{title}</h2>
      {children}
    </div>
  )
}
