import React, { useState, useEffect } from 'react'
import {
  Layers, Search, ShieldCheck, Tag, User, Hash,
  AlertCircle, Loader2,
} from 'lucide-react'
import { apiGet } from './config'

export default function MetricStoreExplorer() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    apiGet('/api/metrics')
      .then(d => { setData(d); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  // API returns metrics/dimensions as objects (dicts), convert to arrays
  const metricsObj = data?.metrics || {}
  const metricsArr = Object.entries(metricsObj).map(([key, val]) => ({ key, ...val }))

  const dimsObj = data?.dimensions || {}
  const dimsArr = Object.entries(dimsObj).map(([key, val]) => ({ key, ...val }))

  const filtered = metricsArr.filter(m => {
    const q = search.toLowerCase()
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.key || '').toLowerCase().includes(q) ||
      (m.description || '').toLowerCase().includes(q)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        <span className="ml-3 text-sm text-slate-400">Loading metric store…</span>
      </div>
    )
  }

  if (error && metricsArr.length === 0) {
    return (
      <div className="flex items-center gap-3 glass rounded-xl p-6 border border-rose-500/20">
        <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-rose-300">Failed to load metric store</p>
          <p className="text-xs text-slate-400 mt-1">{error}</p>
          <p className="text-xs text-slate-500 mt-1">Make sure the backend is running on port 8000.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Governed Semantic Layer</h2>
          </div>
          <p className="text-sm text-slate-500 ml-11">
            {metricsArr.length} governed metrics · {dimsArr.length} dimensions · Zero SQL hallucination
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search metrics…"
            className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/50 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((metric, idx) => (
          <div key={idx} className="metric-card glass rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">{metric.name}</h3>
                <p className="text-xs font-mono text-blue-400 mt-0.5">{metric.key}</p>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <ShieldCheck className="w-3 h-3" />
                {metric.governance || 'Approved'}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">{metric.description}</p>

            {/* Formula */}
            <div className="rounded-lg bg-slate-950/60 border border-slate-800/40 p-3">
              <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold mb-1">Formula</p>
              <p className="text-[11px] font-mono text-violet-400 leading-relaxed break-all">
                {metric.formula || metric.sql_expression || '—'}
              </p>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              {metric.owner && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {metric.owner}
                </span>
              )}
              {metric.format && (
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {metric.format}
                </span>
              )}
            </div>

            {/* Allowed dimensions */}
            {metric.allowed_dimensions?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                <Tag className="w-3 h-3 text-slate-600 mt-0.5 flex-shrink-0" />
                {metric.allowed_dimensions.map((dim, di) => (
                  <span key={di} className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800/60 text-slate-400 border border-slate-700/40">
                    {dim}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-16">
          <Search className="w-8 h-8 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No metrics match your search.</p>
        </div>
      )}

      {/* Dimensions Section */}
      {dimsArr.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-slate-500" />
            <h3 className="text-base font-semibold text-slate-200">Available Dimensions</h3>
            <span className="text-xs text-slate-600 font-mono">({dimsArr.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {dimsArr.map((dim, idx) => (
              <div key={idx} className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-slate-200">{dim.name}</h4>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded">
                    {dim.column}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {/* API returns 'values', fallback to 'allowed_values' */}
                  {(dim.values || dim.allowed_values || []).map((val, vi) => (
                    <span key={vi} className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/15">
                      {val}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
