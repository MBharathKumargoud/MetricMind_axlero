import React, { useState, useRef } from 'react'
import {
  Send, RefreshCw, CheckCircle2, AlertTriangle, MessageSquare,
  ChevronDown, ChevronUp, Code2, X, Copy, Check, Sparkles, ArrowRight
} from 'lucide-react'
import { apiPost } from './config'
import DynamicCharts from './DynamicCharts'

const SUGGESTED_PROMPTS = [
  'Why did European margins drop last quarter?',
  'Break down revenue by product category',
  'Compare North America vs Europe',
  'What caused shipping costs to increase?',
  'Show customer churn by region',
]

// ─── Transparency Modal ───────────────────────────────────────────────────────
function TransparencyModal({ transparency, onClose }) {
  const [tab, setTab] = useState('sql')
  const [copied, setCopied] = useState(null)

  const sqlText = (transparency.compiled_sql || []).join('\n\n---\n\n')
  const semanticText = JSON.stringify(transparency.semantic_requests || [], null, 2)

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl glass rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-white">Governance Audit — Full Transparency</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {transparency.total_queries} governed {transparency.total_queries === 1 ? 'query' : 'queries'} ·{' '}
              {transparency.total_execution_time_ms?.toFixed(0) ?? '—'}ms total
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800/60 bg-slate-900/40">
          {[
            { key: 'sql', label: 'Compiled SQL' },
            { key: 'semantic', label: 'Semantic API Payload' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tab === key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[56vh] overflow-y-auto">
          <div className="relative group">
            <button
              onClick={() => handleCopy(tab === 'sql' ? sqlText : semanticText, tab)}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            >
              {copied === tab ? (
                <><Check className="w-3 h-3 text-emerald-400" /> Copied</>
              ) : (
                <><Copy className="w-3 h-3" /> Copy</>
              )}
            </button>
            <pre className="sql-block p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs leading-relaxed overflow-x-auto">
              <code className={tab === 'sql' ? 'text-blue-300' : 'text-purple-300'}>
                {tab === 'sql' ? sqlText : semanticText}
              </code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-900/60 border-t border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            All SQL compiled from <code className="text-slate-400">metrics.yaml</code> — no arbitrary SQL permitted
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Agent Activity Timeline ──────────────────────────────────────────────────
function AgentActivity({ steps }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="rounded-xl border border-violet-500/20 bg-violet-950/15 overflow-hidden">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-4 py-3 bg-violet-900/20 hover:bg-violet-900/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
          <span className="text-xs font-semibold text-violet-200 tracking-wide uppercase">Agent Activity</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-400/20 font-mono">
            {steps.length} steps
          </span>
        </div>
        {collapsed
          ? <ChevronDown className="w-4 h-4 text-violet-400" />
          : <ChevronUp className="w-4 h-4 text-violet-400" />
        }
      </button>

      {!collapsed && (
        <div className="px-4 py-3 space-y-2">
          {steps.map((s, i) => (
            <div key={i} className="step-item flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-sm text-slate-300">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Root Cause Card ──────────────────────────────────────────────────────────
function RootCauseCard({ rootCause }) {
  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-950/15 p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 flex-shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 block mb-1">Root Cause Identified</span>
          <h3 className="text-base font-bold text-white">{rootCause.title}</h3>
        </div>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mb-4">{rootCause.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">Primary Driver</span>
          <span className="text-sm text-amber-300 font-medium">{rootCause.primary_driver}</span>
        </div>
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">Quantified Impact</span>
          <span className="text-sm text-rose-300 font-medium">{rootCause.impact}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Finding Cards ────────────────────────────────────────────────────────────
function FindingCards({ findings }) {
  const STATUS_STYLES = {
    critical: 'border-rose-500/30 bg-rose-950/15',
    warning: 'border-amber-500/30 bg-amber-950/15',
    success: 'border-emerald-500/30 bg-emerald-950/15',
    info: 'border-blue-500/30 bg-blue-950/15',
  }
  const CHANGE_STYLES = {
    critical: 'bg-rose-500/20 text-rose-300',
    warning: 'bg-amber-500/20 text-amber-300',
    success: 'bg-emerald-500/20 text-emerald-300',
    info: 'bg-blue-500/20 text-blue-300',
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {findings.map((f, i) => (
        <div key={i} className={`metric-card rounded-xl border p-4 ${STATUS_STYLES[f.status] || STATUS_STYLES.info}`}>
          <span className="text-[11px] font-medium text-slate-400 block mb-2">{f.title}</span>
          <div className="text-xl font-bold text-white tracking-tight mb-1">{f.value}</div>
          {f.change && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CHANGE_STYLES[f.status] || CHANGE_STYLES.info}`}>
              {f.change}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Main ChatInterface ───────────────────────────────────────────────────────
export default function ChatInterface() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [showTransparency, setShowTransparency] = useState(false)
  const inputRef = useRef(null)

  const submitQuery = async (text) => {
    const q = (text || message).trim()
    if (!q) return

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const data = await apiPost('/api/chat', { message: q })
      setResult(data)
    } catch (err) {
      setError(err.message || 'Failed to connect to backend. Is the server running on port 8000?')
    } finally {
      setLoading(false)
    }
  }

  const handleSuggest = (prompt) => {
    setMessage(prompt)
    submitQuery(prompt)
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Input Card */}
      <div className="glass rounded-2xl p-6 border border-slate-700/50 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
            Agentic Semantic BI — Ask a business question
          </span>
        </div>

        <form
          onSubmit={e => { e.preventDefault(); submitQuery() }}
          className="flex gap-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="e.g. Why did European margins drop last quarter?"
            disabled={loading}
            className="flex-1 bg-slate-900/80 border border-slate-700/80 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-xl text-sm shadow-lg shadow-blue-600/30 transition-all"
          >
            {loading
              ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>Working…</span></>
              : <><Send className="w-4 h-4" /><span>Ask</span></>
            }
          </button>
        </form>

        {/* Suggested prompts */}
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSuggest(p)}
              disabled={loading}
              className="prompt-chip flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-900/70 text-slate-400 border border-slate-800 hover:border-blue-500/40 transition-all disabled:opacity-50"
            >
              <span>{p}</span>
              <ArrowRight className="w-3 h-3 opacity-50" />
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="glass rounded-2xl p-8 border border-slate-800 animate-fadeIn text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
            <span className="text-slate-300 font-medium">Orchestrating agentic analysis…</span>
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            {['Parsing intent', 'Mapping to semantic layer', 'Executing governed queries', 'Analyzing results'].map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-500 justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="glass rounded-2xl p-6 border border-rose-500/30 bg-rose-950/10 animate-fadeIn">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-rose-300 mb-1">Query Failed</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
              <button
                onClick={() => submitQuery()}
                className="mt-3 text-xs px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !result && (
        <div className="glass rounded-2xl p-12 border border-slate-800/60 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center mx-auto mb-5">
            <MessageSquare className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Ask MetricMind a Business Question</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Type a natural-language business question above, or click one of the suggested prompts.
            MetricMind will map it to governed metrics, execute deterministic SQL, and return executive insights.
          </p>
        </div>
      )}

      {/* Result Panel */}
      {result && !loading && (
        <div className="space-y-6 animate-slideUp">
          {/* Agent Activity */}
          {result.reasoning_steps?.length > 0 && (
            <AgentActivity steps={result.reasoning_steps} />
          )}

          {/* Executive Answer */}
          <div className="glass rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Executive Summary</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{result.answer}</p>
            </div>
            {/* Transparency Buttons */}
            {result.transparency && (
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowTransparency(true)}
                  className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 border border-blue-500/30 transition-all font-medium"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  View Compiled SQL
                </button>
                <button
                  onClick={() => setShowTransparency(true)}
                  className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all font-medium"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  View Semantic API
                </button>
              </div>
            )}
          </div>

          {/* Root Cause */}
          {result.root_cause && <RootCauseCard rootCause={result.root_cause} />}

          {/* Findings */}
          {result.findings?.length > 0 && <FindingCards findings={result.findings} />}

          {/* Charts */}
          {result.charts?.length > 0 && <DynamicCharts charts={result.charts} />}
        </div>
      )}

      {/* Transparency Modal */}
      {showTransparency && result?.transparency && (
        <TransparencyModal
          transparency={result.transparency}
          onClose={() => setShowTransparency(false)}
        />
      )}
    </div>
  )
}
