import { Component } from 'react'

// Last line of defense: if anything inside the app throws, show a small
// recoverable screen instead of unmounting the entire app to a blank page.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[daily-discipline] app crashed:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center text-ink dark:text-blue-200">
          <p className="font-display text-xl font-bold uppercase tracking-tight">
            Something went wrong
          </p>
          <p className="tag max-w-sm">{String(this.state.error?.message || this.state.error)}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800 dark:bg-acid dark:text-card dark:hover:brightness-110"
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
