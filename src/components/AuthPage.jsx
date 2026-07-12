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
        setInfo('Account created! Now sign in with the same email & password.')
        setMode('signin')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="dark flex min-h-screen items-center justify-center p-4 font-body">
      <div className="bg-mesh" aria-hidden="true" />
      <ThreeBackground />
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-card/90 p-8 shadow-2xl backdrop-blur-2xl"
      >
        <p className="tag mb-2">[ welcome ]</p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-white">
          Daily<span className="text-acid">*</span>Discipline
        </h1>
        <p className="mb-6 mt-2 text-sm text-white/50">
          Your diary, digitized. {mode === 'signin' ? 'Sign in' : 'Create an account'} to
          continue.
        </p>
        <label className="tag mb-1.5 block">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-white placeholder:text-white/25 focus:border-acid/60"
          placeholder="you@example.com"
        />
        <label className="tag mb-1.5 block">Password</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-white placeholder:text-white/25 focus:border-acid/60"
          placeholder="min. 6 characters"
        />
        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
        {info && <p className="mb-3 text-sm text-acid">{info}</p>}
        <button
          disabled={busy}
          className="w-full rounded-lg bg-acid py-3 font-display font-bold uppercase tracking-wide text-base text-card transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
        >
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setError('')
            setInfo('')
          }}
          className="mt-5 w-full text-center font-mono text-xs uppercase tracking-widest text-white/60 underline decoration-acid/50 underline-offset-4 transition hover:text-acid"
        >
          {mode === 'signin'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  )
}
