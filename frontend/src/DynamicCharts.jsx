import React from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 shadow-xl shadow-black/40">
      <p className="text-xs font-medium text-slate-300 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="font-semibold text-slate-100">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
        </div>
      ))}
    </div>
  )
}

function KPIGrid({ data }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {data.map((item, idx) => {
        const statusColors = {
          success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          critical: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
          info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        }
        const color = statusColors[item.status] || statusColors.info
        const TrendIcon = item.change?.startsWith('-') ? TrendingDown : item.change?.startsWith('+') ? TrendingUp : Minus
        return (
          <div key={idx} className="metric-card glass rounded-xl p-4">
            <p className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">{item.label}</p>
            <p className="text-xl font-bold text-slate-100">{item.value}</p>
            {item.change && (
              <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-md text-[11px] font-medium border ${color}`}>
                <TrendIcon className="w-3 h-3" />
                {item.change}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ChartWrapper({ title, children }) {
  return (
    <div className="glass rounded-xl p-5">
      <h4 className="text-sm font-semibold text-slate-200 mb-4">{title}</h4>
      {children}
    </div>
  )
}

function renderAreaChart(chart) {
  const { data, config } = chart
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          {config.series.map((s, i) => (
            <linearGradient key={i} id={`gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey={config.xKey} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {config.series.map((s, i) => (
          <Area
            key={i}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#gradient-${s.key})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

function renderBarChart(chart) {
  const { data, config } = chart
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey={config.xKey} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {config.series.map((s, i) => (
          <Bar key={i} dataKey={s.key} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

function renderLineChart(chart) {
  const { data, config } = chart
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey={config.xKey} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {config.series.map((s, i) => (
          <Line key={i} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={{ r: 3, fill: s.color }} activeDot={{ r: 5 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

export default function DynamicCharts({ charts }) {
  if (!charts?.length) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {charts.map((chart, idx) => {
        if (chart.type === 'kpi') {
          return (
            <div key={idx} className="lg:col-span-2">
              <ChartWrapper title={chart.title}>
                <KPIGrid data={chart.data} />
              </ChartWrapper>
            </div>
          )
        }

        let content = null
        if (chart.type === 'area') content = renderAreaChart(chart)
        else if (chart.type === 'bar') content = renderBarChart(chart)
        else if (chart.type === 'line') content = renderLineChart(chart)
        else content = <p className="text-xs text-slate-500">Unsupported chart type: {chart.type}</p>

        return (
          <ChartWrapper key={idx} title={chart.title}>
            {content}
          </ChartWrapper>
        )
      })}
    </div>
  )
}
