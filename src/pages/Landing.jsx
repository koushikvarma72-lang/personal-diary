import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Flame, BarChart3, CloudUpload, ArrowRight } from 'lucide-react'
import ThreeBackground from '../components/ThreeBackground'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

const demoHabits = [
  { n: '01', label: 'No Sugar', v: '✓' },
  { n: '02', label: 'Train My Body', v: '✓' },
  { n: '03', label: 'Study 30 Minutes', v: '✗' },
  { n: '04', label: 'Drink 3 Lit Water', v: '✓' },
]

export default function Landing() {
  return (
    <div className="dark noise min-h-screen font-body text-white">
      <div className="bg-mesh" aria-hidden="true" />
      <ThreeBackground />

      {/* nav */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-base/60 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <h1 className="font-display text-lg font-bold uppercase tracking-tight sm:text-xl">
            Daily<span className="text-acid">*</span>Discipline
          </h1>
          <Link
            to="/auth"
            className="rounded-full bg-acid px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-card transition hover:brightness-110 active:scale-95"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-16 pt-16 text-center sm:pt-24">
        <motion.p {...fadeUp(0)} className="tag mb-4">
          [ your paper diary — digitized ]
        </motion.p>
        <motion.h2
          {...fadeUp(0.1)}
          className="font-display max-w-3xl text-4xl font-bold uppercase leading-[1.05] tracking-tight sm:text-6xl"
        >
          Build discipline
          <br />
          <span className="text-acid">one day</span> at a time
        </motion.h2>
        <motion.p {...fadeUp(0.2)} className="mt-5 max-w-xl text-base text-white/60 sm:text-lg">
          Track daily habits with satisfying ✓/✗ checks, write your regret, achievement
          and take of the day, and watch your streaks grow — synced across every device.
        </motion.p>
        <motion.div {...fadeUp(0.3)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/auth"
            className="flex items-center gap-2 rounded-full bg-acid px-8 py-3.5 font-display font-bold uppercase tracking-wide text-card transition hover:brightness-110 active:scale-95"
          >
            Start free <ArrowRight size={18} />
          </Link>
          <span className="tag">no ads · no tracking · your data stays yours</span>
        </motion.div>

        {/* mini app preview */}
        <motion.div
          {...fadeUp(0.45)}
          className="mt-14 w-full max-w-md rounded-2xl border border-white/10 bg-card/80 p-6 text-left shadow-2xl backdrop-blur-2xl"
        >
          <div className="mb-3 flex items-baseline justify-between">
            <p className="font-display text-2xl font-bold uppercase">
              Day <span className="text-acid">19</span>
              <span className="text-sm text-white/30">/30</span>
            </p>
            <p className="font-mono text-sm text-white/40">03/04</p>
          </div>
          <div className="mb-4 h-[3px] w-full rounded bg-white/5">
            <motion.div
              className="h-full rounded bg-acid"
              initial={{ width: 0 }}
              whileInView={{ width: '75%' }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.6 }}
            />
          </div>
          {demoHabits.map((h, i) => (
            <motion.div
              key={h.n}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 + i * 0.12 }}
              className="flex items-center justify-between border-b border-white/5 py-2.5 last:border-0"
            >
              <span className="flex items-center gap-3">
                <span className="tag">{h.n}</span>
                <span
                  className={`font-display font-medium uppercase tracking-wide ${
                    h.v === '✓' ? 'text-white/30 line-through decoration-acid/60' : 'text-white/85'
                  }`}
                >
                  {h.label}
                </span>
              </span>
              <span
                className={`rounded-full border px-3 py-1 font-mono text-sm ${
                  h.v === '✓'
                    ? 'border-acid/60 text-acid'
                    : 'border-red-500/60 text-red-400'
                }`}
              >
                [ {h.v} ]
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* features */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <motion.p {...fadeUp(0)} className="tag mb-6 text-center">
          [ everything your paper diary did — and more ]
        </motion.p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: <CheckCircle2 className="text-acid" />,
              title: 'Daily checks',
              body: 'Habits and tasks with tap-to-cycle ✓/✗, plus regret, achievement and take of the day.',
            },
            {
              icon: <Flame className="text-orange-400" />,
              title: 'Streaks',
              body: 'Perfect-day streaks and per-habit streaks keep the chain alive and you honest.',
            },
            {
              icon: <BarChart3 className="text-blue-400" />,
              title: 'Analytics',
              body: 'Heatmaps, trends and success rates show exactly where you win and where you slip.',
            },
            {
              icon: <CloudUpload className="text-pink-400" />,
              title: 'Sync everywhere',
              body: 'Private account with cloud sync — same diary on your laptop, phone and desktop app.',
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp(i * 0.1)}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-white/10 bg-card/70 p-5 backdrop-blur-xl"
            >
              {f.icon}
              <h3 className="font-display mt-3 text-lg font-bold uppercase tracking-wide">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/55">{f.body}</p>
            </motion.div>
          ))}
        </div>

        {/* bottom CTA */}
        <motion.div {...fadeUp(0.2)} className="mt-16 text-center">
          <h3 className="font-display text-2xl font-bold uppercase tracking-tight sm:text-4xl">
            Your future self is <span className="text-acid">watching</span>.
          </h3>
          <Link
            to="/auth"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-acid px-8 py-3.5 font-display font-bold uppercase tracking-wide text-card transition hover:brightness-110 active:scale-95"
          >
            Create your diary <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-white/10 py-6 text-center">
        <p className="tag">daily*discipline — show up. every day.</p>
      </footer>
    </div>
  )
}
