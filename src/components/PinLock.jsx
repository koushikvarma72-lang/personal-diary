import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { hashPin, getPinHash } from '../lib/pin'

export default function PinLock({ onUnlock }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    const ok = (await hashPin(pin)) === getPinHash()
    setBusy(false)
    if (ok) {
      onUnlock()
    } else {
      setError(true)
      setPin('')
    }
  }

  return (
    <div className="dark noise flex min-h-screen flex-col items-center justify-center p-4 font-body">
      <div className="bg-mesh" aria-hidden="true" />
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={submit}
        className="w-full max-w-xs rounded-2xl border border-white/10 bg-card/90 p-8 text-center shadow-2xl backdrop-blur-2xl"
      >
        <Lock size={28} className="mx-auto mb-4 text-acid" />
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-white">
          Locked
        </h1>
        <p className="mb-6 mt-1 text-sm text-white/50">Enter your PIN to open your diary.</p>
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          autoFocus
          maxLength={6}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ''))
            setError(false)
          }}
          className={`w-full rounded-lg border bg-white/5 px-3 py-3 text-center font-mono text-xl tracking-[0.5em] text-white placeholder:text-white/25 focus:border-acid/60 ${
            error ? 'border-red-500' : 'border-white/15'
          }`}
          placeholder="••••"
        />
        {error && <p className="mt-2 text-sm text-red-400">Wrong PIN — try again</p>}
        <button
          disabled={busy || pin.length < 4}
          className="mt-5 w-full rounded-lg bg-acid py-3 font-display font-bold uppercase tracking-wide text-base text-card transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
        >
          {busy ? '…' : 'Unlock'}
        </button>
      </motion.form>
    </div>
  )
}
