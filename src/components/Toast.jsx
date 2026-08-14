import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
}

const colors = {
  success: 'border-lime-500 bg-lime-500/10 text-lime-600 dark:border-acid dark:bg-acid/10 dark:text-acid',
  error: 'border-red-500 bg-red-500/10 text-red-500',
  info: 'border-blue-500 bg-blue-500/10 text-blue-500',
}

export default function Toast({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2 sm:bottom-6 sm:right-6 sm:left-auto sm:translate-x-0">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = icons[t.type] || icons.info
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-xl ${colors[t.type] || colors.info}`}
            >
              <Icon size={16} />
              <span className="font-mono text-xs uppercase tracking-wider">{t.message}</span>
              <button
                onClick={() => onDismiss(t.id)}
                className="ml-1 rounded p-0.5 opacity-60 transition hover:opacity-100"
              >
                <X size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
