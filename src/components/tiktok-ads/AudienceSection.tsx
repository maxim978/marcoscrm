'use client'

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import type { AudienceData } from '@/lib/tiktok-ads/types'

const PIE_COLORS = ['#3071D8', '#E0B533', '#10b981', '#f97316', '#8b5cf6']
const BAR_COLOR = '#3071D8'

interface AudienceSectionProps {
  audience: AudienceData
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">{children}</h4>
  )
}

function DonutChart({ data, title }: { data: { label: string; value: number; percentage: number }[]; title: string }) {
  return (
    <div className="bg-white rounded-xl ring-1 ring-slate-200 p-4">
      <SectionTitle>{title}</SectionTitle>
      <div className="flex items-center gap-4">
        <PieChart width={140} height={140}>
          <Pie
            data={data}
            innerRadius={44}
            outerRadius={62}
            dataKey="percentage"
            startAngle={90}
            endAngle={-270}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, _name, props: { payload?: { label: string } }) => [
              `${(value as number).toFixed(1)}%`,
              props.payload?.label ?? '',
            ]}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 11 }}
          />
        </PieChart>
        <div className="space-y-1.5 flex-1">
          {data.map((item, i) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
              />
              <span className="text-xs text-slate-600 flex-1">{item.label}</span>
              <span className="text-xs font-bold text-slate-700">{item.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AudienceSection({ audience }: AudienceSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Doelgroep analyse</h3>

      {/* Donut charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DonutChart data={audience.byAge} title="Leeftijdsgroepen" />
        <DonutChart data={audience.byGender} title="Geslacht" />
      </div>

      {/* Country bar */}
      <div className="bg-white rounded-xl ring-1 ring-slate-200 p-4">
        <SectionTitle>Landen</SectionTitle>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart
            data={audience.byCountry}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} width={80} />
            <Tooltip
              formatter={(value) => [`${(value as number).toFixed(1)}%`, 'Bereik']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 11 }}
            />
            <Bar dataKey="percentage" fill={BAR_COLOR} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Device bar */}
      <div className="bg-white rounded-xl ring-1 ring-slate-200 p-4">
        <SectionTitle>Apparaten</SectionTitle>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart
            data={audience.byDevice}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} width={80} />
            <Tooltip
              formatter={(value) => [`${(value as number).toFixed(1)}%`, 'Bereik']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 11 }}
            />
            <Bar dataKey="percentage" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Hour of day */}
      <div className="bg-white rounded-xl ring-1 ring-slate-200 p-4">
        <SectionTitle>Impressies per uur van de dag</SectionTitle>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={audience.byHour}
            margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 9, fill: '#94a3b8' }}
              tickFormatter={(v) => `${v}u`}
              interval={2}
            />
            <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
            <Tooltip
              formatter={(value) => [(value as number).toLocaleString('nl-NL'), 'Impressies']}
              labelFormatter={(label) => `${label}:00u`}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 11 }}
            />
            <Bar dataKey="impressions" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Day of week */}
      <div className="bg-white rounded-xl ring-1 ring-slate-200 p-4">
        <SectionTitle>Impressies per dag van de week</SectionTitle>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={audience.byDayOfWeek}
            margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
            <Tooltip
              formatter={(value) => [(value as number).toLocaleString('nl-NL'), 'Impressies']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 11 }}
            />
            <Bar dataKey="impressions" fill="#E0B533" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
