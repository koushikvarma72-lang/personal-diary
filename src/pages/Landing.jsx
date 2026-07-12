import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  AnimatePresence,
  animate,
} from 'framer-motion'
import { ArrowRight, ArrowDown } from 'lucide-react'
import ThreeBackground from '../components/ThreeBackground'

/* ============ PRELOADER — Oryzo-style 000% counter ============ */
function Preloader({ onDone }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const controls = animate(0, 100, {
      duration: 1.6,
      ease: 'easeInOut',
      onUpdate: (v) => setN(Math.round(v)),
      onComplete: () => setTimeout(onDone, 250),
    })
    return () => controls.stop()
  }, [onDone])
  return (
    <motion.div
      exit={{ y: '-100%' }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-base"
    >
      <p className="font-display text-xl font-bold uppercase tracking-tight text-white">
        Daily<span className="text-acid">*</span>Discipline
      </p>
      <p className="mt-2 font-mono text-5xl font-bold text-acid">
        {String(n).padStart(3, '0')}%
      </p>
    </motion.div>
  )
}

/* ============ MARQUEE STRIP ============ */
function Marquee({ items, className = '' }) {
  return (
    <div className={`marquee border-white/10 py-3 ${className}`}>
      <div className="marquee-track">
        {[0, 1].map((n) => (
          <span key={n} className="flex shrink-0 items-center">
            {items.map((t, i) => (
              <span
                key={i}
                className="mx-8 flex items-center gap-8 font-mono text-xs uppercase tracking-[0.3em] text-white/50"
              >
                {t} <span className="text-acid">✦</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ============ MOUSE-TILT DIARY CARD ============ */
function TiltCard() {
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 150, damping: 20 })
  const sry = useSpring(ry, { stiffness: 150, damping: 20 })

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 18)
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 18)
  }
  const reset = () => {
    rx.set(0)
    ry.set(0)
  }

  const habits = [
    { n: '01', label: 'No Sugar', v: '✓' },
    { n: '02', label: 'Train My Body', v: '✓' },
    { n: '03', label: 'Train Communication', v: '✗' },
    { n: '04', label: 'Study 30 Minutes', v: '✓' },
    { n: '05', label: 'Drink 3 Lit Water', v: '✓' },
  ]

  return (
    <div style={{ perspective: 1200 }} onMouseMove={onMove} onMouseLeave={reset}>
      <motion.div
        style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d' }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-card/90 p-6 text-left shadow-2xl backdrop-blur-2xl"
      >
        <div className="mb-3 flex items-baseline justify-between" style={{ transform: 'translateZ(30px)' }}>
          <p className="font-display text-3xl font-bold uppercase">
            Day <span className="text-acid">19</span>
            <span className="text-base text-white/30">/30</span>
          </p>
          <p className="font-mono text-sm text-white/40">04/05</p>
        </div>
        <div className="mb-4 h-[3px] w-full rounded bg-white/5">
          <motion.div
            className="h-full rounded bg-acid"
            initial={{ width: 0 }}
            whileInView={{ width: '80%' }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.3 }}
          />
        </div>
        <div style={{ transform: 'translateZ(20px)' }}>
          {habits.map((h, i) => (
            <motion.div
              key={h.n}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center justify-between border-b border-white/5 py-2.5 last:border-0"
            >
              <span className="flex items-center gap-3">
                <span className="tag">{h.n}</span>
                <span
                  className={`font-display font-medium uppercase tracking-wide ${
                    h.v === '✓'
                      ? 'text-white/30 line-through decoration-acid/60'
                      : 'text-white/85'
                  }`}
                >
                  {h.label}
                </span>
              </span>
              <span
                className={`rounded-full border px-3 py-1 font-mono text-sm ${
                  h.v === '✓' ? 'border-acid/60 text-acid' : 'border-red-500/60 text-red-400'
                }`}
              >
                [ {h.v} ]
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

/* ============ SCROLL-REVEAL BIG STATEMENT ============ */
function Statement({ children }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'start 0.35'] })
  const words = children.split(' ')
  return (
    <p ref={ref} className="font-display max-w-4xl text-3xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  )
}
function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.15, 1])
  return (
    <motion.span style={{ opacity }} className="mr-[0.3em] inline-block">
      {children}
    </motion.span>
  )
}

/* ============ LANDING ============ */
export default function Landing() {
  const [loading, setLoading] = useState(true)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.9])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120])

  const testimonials = [
    { q: '"My streak is longer than my attention span. Unprecedented."', who: 'Koushik V.', role: 'Founder & only investor' },
    { q: '"I checked NO SUGAR for 12 days straight. My dentist wept."', who: 'Priya K.', role: 'Reformed dessert enthusiast' },
    { q: '"The ✗ button hurts more than my alarm clock. 10/10."', who: 'Jamie R.', role: 'Professional procrastinator' },
    { q: '"Finally, an app that judges me silently, in monospace."', who: 'Edan K.', role: 'Terminal romantic' },
    { q: '"My dog is now trained. The app takes full credit."', who: 'Gol D.', role: 'Dog parent, day 30' },
  ]

  return (
    <div className="dark noise min-h-screen overflow-x-clip font-body text-white">
      <div className="bg-mesh" aria-hidden="true" />
      <ThreeBackground />

      <AnimatePresence>{loading && <Preloader onDone={() => setLoading(false)} />}</AnimatePresence>

      {/* nav */}
      <header className="fixed left-0 right-0 top-0 z-30 border-b border-white/10 bg-base/50 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <p className="font-display text-lg font-bold uppercase tracking-tight">
            Daily<span className="text-acid">*</span>Discipline
          </p>
          <div className="flex items-center gap-4">
            <span className="tag hidden sm:inline">[ issue no. 001 ]</span>
            <Link
              to="/auth"
              className="rounded-full bg-acid px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-card transition hover:brightness-110 active:scale-95"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* ============ HERO — pinned, scales away on scroll ============ */}
      <section ref={heroRef} className="relative h-[160vh]">
        <motion.div
          style={{ scale: heroScale, opacity: heroOpacity, y: heroY }}
          className="sticky top-0 flex h-screen flex-col items-center justify-center px-4 text-center"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: loading ? 0 : 1 }}
            transition={{ delay: 0.3 }}
            className="tag mb-5"
          >
            [ the world's most unnecessarily disciplined diary ]
          </motion.p>
          <h1 className="font-display text-[13vw] font-bold uppercase leading-[0.9] tracking-tight sm:text-8xl lg:text-9xl">
            {['Show', 'up.'].map((w, wi) => (
              <span key={wi} className="mr-[0.25em] inline-block overflow-hidden align-bottom">
                <motion.span
                  initial={{ y: '110%' }}
                  animate={{ y: loading ? '110%' : 0 }}
                  transition={{ duration: 0.8, delay: 0.4 + wi * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block"
                >
                  {w}
                </motion.span>
              </span>
            ))}
            <br />
            <span className="inline-block overflow-hidden align-bottom">
              <motion.span
                initial={{ y: '110%' }}
                animate={{ y: loading ? '110%' : 0 }}
                transition={{ duration: 0.8, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block text-acid"
              >
                Every day.
              </motion.span>
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: loading ? 0 : 1, y: loading ? 16 : 0 }}
            transition={{ delay: 0.9 }}
            className="mt-6 max-w-xl text-base text-white/60 sm:text-lg"
          >
            Your handwritten habit diary, rebuilt for the internet. Checks, streaks,
            regrets, achievements — synced everywhere, judging you gently.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: loading ? 0 : 1, y: loading ? 16 : 0 }}
            transition={{ delay: 1.05 }}
            className="mt-8 flex items-center gap-4"
          >
            <Link
              to="/auth"
              className="flex items-center gap-2 rounded-full bg-acid px-8 py-3.5 font-display font-bold uppercase tracking-wide text-card transition hover:brightness-110 active:scale-95"
            >
              Start free <ArrowRight size={18} />
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: loading ? 0 : 1 }}
            transition={{ delay: 1.4 }}
            className="absolute bottom-8 flex flex-col items-center gap-2"
          >
            <span className="tag">scroll to continue</span>
            <motion.span animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <ArrowDown size={16} className="text-acid" />
            </motion.span>
          </motion.div>
        </motion.div>
      </section>

      <Marquee items={['Daily Discipline', 'No excuses', 'One day at a time', '30-day challenge', 'Show up']} />

      {/* ============ STATEMENT — words light up as you scroll ============ */}
      <section className="mx-auto max-w-6xl px-4 py-28 sm:px-6 sm:py-40">
        <p className="tag mb-6">[ manifesto ]</p>
        <Statement>
          This isn't just a to-do list. It's a mirror. Every checkbox you tick is a
          promise kept to yourself — and every ✗ is written down where you can't
          pretend it didn't happen.
        </Statement>
      </section>

      {/* ============ PRODUCT — tilt card ============ */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="tag mb-3">[ the entry — powered by you* ]</p>
          <h2 className="font-display text-4xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
            Tap. Cycle.
            <br />
            <span className="text-acid">Regret nothing.</span>
          </h2>
          <p className="mt-5 max-w-md text-white/60">
            Numbered habits with tap-to-cycle [ ✓ ] / [ ✗ ] checks, a live completion
            bar, and space for your regret, achievement and take of the day. Exactly
            like your paper diary — minus the pen running out.
          </p>
          <p className="tag mt-6">* no AI was harmed. or used. you do the work.</p>
        </div>
        <TiltCard />
      </section>

      {/* ============ ABSURD STATS — Oryzo-style ============ */}
      <section className="border-y border-white/10 bg-card/40 py-20 backdrop-blur-xl">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 text-center sm:grid-cols-3 sm:px-6">
          {[
            { big: '37.9%', small: 'more disciplined*', note: '*vs. your last new year resolution' },
            { big: '0 W', small: 'power draw of a kept promise', note: 'say "please" as much as you want' },
            { big: '24/7', small: 'uptime. no updates required', note: 'legacy support since your first diary' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
            >
              <p className="font-display text-5xl font-bold text-acid sm:text-6xl">{s.big}</p>
              <p className="font-display mt-2 text-lg font-bold uppercase tracking-wide">{s.small}</p>
              <p className="tag mt-1">{s.note}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ TESTIMONIALS — draggable row ============ */}
      <section className="overflow-hidden py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="tag mb-2">[ rating & reviews — 4.9/5 ]</p>
          <h2 className="font-display mb-8 text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            People pretend to love it
          </h2>
        </div>
        <motion.div
          drag="x"
          dragConstraints={{ left: -900, right: 0 }}
          className="flex cursor-grab gap-4 px-4 active:cursor-grabbing sm:px-6"
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="w-[300px] shrink-0 rounded-2xl border border-white/10 bg-card/80 p-6 backdrop-blur-xl"
            >
              <p className="font-mono text-xs text-acid">[ 5/5 ]</p>
              <p className="font-display mt-3 text-lg font-medium leading-snug">{t.q}</p>
              <p className="tag mt-5">{t.who}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">{t.role}</p>
            </motion.div>
          ))}
        </motion.div>
        <p className="tag mt-6 px-4 sm:px-6">← drag to read more lies</p>
      </section>

      {/* ============ SPEC TABLE ============ */}
      <section className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <p className="tag mb-2">[ technical specifications ]</p>
        <h2 className="font-display mb-6 text-3xl font-bold uppercase tracking-tight">
          Daily*Discipline — v1.0
        </h2>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-card/70 backdrop-blur-xl">
          {[
            ['Habits', 'Unlimited. Your shame is the only limit.'],
            ['Checks', '[ ✓ ] and [ ✗ ]. Both count. One hurts.'],
            ['Streaks', 'Tracked per habit. Also perfect days.'],
            ['Sync', 'Cloud. Laptop, phone, desktop app.'],
            ['Privacy', 'Row-level security. Your diary, your eyes.'],
            ['Pairing', 'Not required.'],
            ['Updates', 'When you show up. Daily, ideally.'],
          ].map(([k, v], i) => (
            <div
              key={k}
              className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:gap-6 ${
                i !== 0 ? 'border-t border-white/5' : ''
              }`}
            >
              <span className="w-28 shrink-0 font-mono text-xs uppercase tracking-widest text-acid">{k}</span>
              <span className="text-sm text-white/70">{v}</span>
            </div>
          ))}
        </div>
      </section>

      <Marquee items={['Start today', 'Day 01 / 30', 'Your future self is watching', 'Start today']} />

      {/* ============ FINAL CTA ============ */}
      <section className="flex flex-col items-center px-4 py-28 text-center sm:py-36">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display max-w-3xl text-4xl font-bold uppercase leading-tight tracking-tight sm:text-6xl"
        >
          We caught your attention with a <span className="text-acid">diary</span>.
          Imagine what you'll do with 30 days.
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
        >
          <Link
            to="/auth"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-acid px-10 py-4 font-display text-lg font-bold uppercase tracking-wide text-card transition hover:brightness-110 active:scale-95"
          >
            Create your diary <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center">
        <p className="tag">daily*discipline — built with stubbornness, not AI slop</p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/20">
          all testimonials are satirical. the discipline is real.
        </p>
      </footer>
    </div>
  )
}
