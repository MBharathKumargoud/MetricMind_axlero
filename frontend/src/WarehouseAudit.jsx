import React, { useState, useEffect } from 'react'
import {
  HardDrive, Database, Shield, Lock, FileCheck, Activity,
  ArrowRight, CheckCircle2, Loader2, AlertCircle,
  Server, Brain, Code2, BarChart3, Sparkles,
} from 'lucide-react'
import { apiGet } from './config'

const ARCHITECTURE_STEPS = [
  { icon: Sparkles, label: 'User Question', desc: 'Natural language business query', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { icon: Brain, label: 'Intent Parser', desc: 'Understand metrics & dimensions', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { icon: Shield, label: 'Semantic Mapper', desc: 'Map to governed metrics.yaml', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { icon: Code2, label: 'Governed Compiler', desc: 'Compile safe, verified SQL', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { icon: Database, label: 'SQLite Warehouse', desc: 'Execute against data lakehouse', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { icon: BarChart3, label: 'Result Analyzer', desc: 'Analyze patterns & anomalies', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  { icon: Sparkles, label: 'Executive Insight', desc: 'Generate narrative + charts', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
]

const GOVERNANCE_RULES = [
  { icon: Shield, text: 'All queries compiled from metrics.yaml definitions' },
  { icon: Lock, text: 'No arbitrary SQL generation permitted' },
  { icon: FileCheck, text: 'All metrics verified and approved' },
  { icon: Activity, text: 'Row limits enforced on all queries' },
  { icon: CheckCircle2, text: 'Full audit trail maintained' },
]

export default function WarehouseAudit() {
  const [audit, setAudit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    apiGet('/api/warehouse/audit')
      .then(d => { setAudit(d); setLoading(false) })
      .catch(err => {
        setError(err.message)
        setAudit({
          primary_table: 'fact_sales',
          total_records: 2016,
          governance_mode: 'SEMANTIC_ONLY',
          max_query_limit: 500,
        })
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        <span className="ml-3 text-sm text-slate-400">Loading audit data…</span>
      </div>
    )
  }

  const kpis = [
    { label: 'Primary Table', value: audit?.primary_table || 'fact_sales', icon: Database, color: 'text-blue-400' },
    { label: 'Total Records', value: `${(audit?.total_records || 0).toLocaleString()} Rows`, icon: Server, color: 'text-emerald-400' },
    { label: 'Governance Mode', value: audit?.governance_mode || 'SEMANTIC_ONLY', icon: Shield, color: 'text-violet-400' },
    { label: 'Max Query Limit', value: `${audit?.max_query_limit || 500} Rows`, icon: Lock, color: 'text-amber-400' },
  ]

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <HardDrive className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-100">Data Lakehouse Audit</h2>
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
          </div>
          <p className="text-sm text-slate-500">Governed data warehouse status and architecture overview</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon
          return (
            <div key={idx} className="metric-card glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-4 h-4 ${kpi.color}`} />
                <span className="text-[11px] text-slate-500 uppercase tracking-wide">{kpi.label}</span>
              </div>
              <p className="text-lg font-bold text-slate-100 font-mono">{kpi.value}</p>
            </div>
          )
        })}
      </div>

      {/* Architecture Diagram */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-base font-semibold text-slate-200 mb-6">Agentic Pipeline Architecture</h3>
        <div className="flex flex-col lg:flex-row items-stretch gap-2">
          {ARCHITECTURE_STEPS.map((step, idx) => {
            const Icon = step.icon
            return (
              <React.Fragment key={idx}>
                <div className={`flex-1 ${step.bg} ${step.border} border rounded-xl p-4 flex flex-col items-center text-center gap-2 step-item`}>
                  <div className={`w-10 h-10 rounded-full ${step.bg} ${step.border} border flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${step.color}`} />
                  </div>
                  <h4 className={`text-xs font-semibold ${step.color}`}>{step.label}</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
                {idx < ARCHITECTURE_STEPS.length - 1 && (
                  <div className="flex items-center justify-center lg:py-0 py-1">
                    <ArrowRight className="w-4 h-4 text-slate-600 rotate-90 lg:rotate-0" />
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Governance Rules */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-base font-semibold text-slate-200 mb-4">Governance Rules</h3>
        <div className="space-y-3">
          {GOVERNANCE_RULES.map((rule, idx) => {
            const Icon = rule.icon
            return (
              <div key={idx} className="flex items-center gap-3 step-item">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-sm text-slate-300">{rule.text}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Error notice if API failed */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-slate-500 glass rounded-lg px-4 py-3">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Showing cached audit data — backend unavailable</span>
        </div>
      )}
    </div>
  )
}
