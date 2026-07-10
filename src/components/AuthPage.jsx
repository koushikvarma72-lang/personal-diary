import { useState } from 'react'
import { auth } from '../lib/storage'
import ThreeBackground from './ThreeBackground'

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    try {
      if (mode === 'signin') {
        await auth.signIn(email, password)
        onLogin(await auth.getUser())
      } else {
        await auth.signUp(email, password)
        setInfo('Account created. Check your email to confirm, then sign in.')
        setMode('signin')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="bg-mesh" aria-hidden="true" />
      <ThreeBackground />
      <form
        onSubmit={submit}
        className="paper w-full max-w-sm rounded-xl border-2 border-ink/20 p-8 shadow-xl"
      >
        <h1 className="font-hand text-4xl font-bold text-ink">Daily Discipline</h1>
        <p className="mb-6 mt-1 text-sm text-slate-500">
          Your diary, digitized. Sign {mode === 'signin' ? 'in' : 'up'} to continue.
        </p>
        <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
        />
        <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
        />
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        {info && <p className="mb-3 text-sm text-green-700">{info}</p>}
        <button
          disabled={busy}
          className="w-full rounded-lg bg-ink py-2.5 font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
        >
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="mt-4 w-full text-center text-sm text-ink underline"
        >
          {mode === 'signin'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  )
}
