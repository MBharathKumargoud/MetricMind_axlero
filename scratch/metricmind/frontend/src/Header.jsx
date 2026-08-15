import React from 'react'
import { BrainCircuit, BarChart3, Layers, Terminal, Shield } from 'lucide-react'

export default function Header({ activeTab, setActiveTab, health }) {
  const tabs = [
    { id: 'chat', label: 'Executive BI Agent', icon: BarChart3 },
    { id: 'metrics', label: 'Metric Store', icon: Layers },
    { id: 'audit', label: 'Warehouse Audit', icon: Terminal },
  ]

  const isHealthy = health?.status === 'healthy' || health?.status === 'ok'
  const metricsCount = health?.metrics_count ?? 0

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#060910]" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold">
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  MetricMind
                </span>
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-slate-500 leading-none tracking-wide uppercase">
                  Agentic Semantic BI Engine
                </p>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Shield className="w-2.5 h-2.5" />
                  Governed
                </span>
              </div>
            </div>
          </div>

          {/* Center: Tab Navigation */}
          <nav className="flex items-center gap-1 bg-slate-900/60 rounded-xl p-1 border border-slate-800/50">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  activeTab === id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </nav>

          {/* Right: Health Status */}
          <div className="flex items-center gap-3 shrink-0">
            {metricsCount > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {metricsCount} metrics
              </span>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/40 border border-slate-800/50">
              <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-rose-400 shadow-sm shadow-rose-400/50'}`}>
                {isHealthy && (
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
                )}
              </div>
              <span className={`text-[11px] font-medium ${isHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
                {health ? (isHealthy ? 'Connected' : 'Offline') : 'Checking…'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
