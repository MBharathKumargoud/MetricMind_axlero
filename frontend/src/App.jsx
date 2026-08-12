import React, { useState, useEffect } from 'react'
import Header from './Header'
import ChatInterface from './ChatInterface'
import MetricStoreExplorer from './MetricStoreExplorer'
import WarehouseAudit from './WarehouseAudit'
import { apiGet } from './config'
import { AlertTriangle, RefreshCw } from 'lucide-react'

// ── Error Boundary: catches crashes in any child tab ──────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('[MetricMind] Render error:', error, info)
  }
  reset() {
    this.setState({ hasError: false, error: null })
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="glass rounded-2xl border border-rose-500/30 bg-rose-950/10 p-8 mt-6 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-rose-300 mb-1">Component Error</h3>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
          </div>
          <button
            onClick={() => this.reset()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('chat')
  const [health, setHealth] = useState(null)

  useEffect(() => {
    apiGet('/api/health')
      .then(data => setHealth(data))
      .catch(() => setHealth({ status: 'offline', database: 'disconnected', metrics_count: 0 }))
  }, [])

  return (
    <div className="min-h-screen bg-[#060910] text-slate-200 flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} health={health} />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
        <ErrorBoundary key={activeTab}>
          {activeTab === 'chat' && <ChatInterface />}
          {activeTab === 'metrics' && <MetricStoreExplorer />}
          {activeTab === 'audit' && <WarehouseAudit />}
        </ErrorBoundary>
      </main>
      <footer className="border-t border-slate-800/60 py-4 px-6 text-center text-xs text-slate-500">
        <span>MetricMind v1.0 — Agentic Semantic BI Engine</span>
        <span className="mx-3 text-slate-700">•</span>
        <span className="text-slate-600 font-mono">Governed Semantic Layer</span>
        <span className="mx-3 text-slate-700">•</span>
        <span className="text-slate-600 font-mono">Zero SQL Hallucination</span>
      </footer>
    </div>
  )
}
