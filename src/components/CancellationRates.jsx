import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function color(pct) {
  if (pct >= 5) return '#f87171'
  if (pct >= 2.5) return '#fbbf24'
  return '#64748b'
}

function TT({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="tt">
      <div className="tt-label">{d.name || d.carrier}</div>
      <div className="tt-row"><span>Cancellation rate</span><span>{d.cancellation_pct}%</span></div>
    </div>
  )
}

export default function CancellationRates({ data }) {
  if (!data) return null
  const sorted = [...data].sort((a, b) => b.cancellation_pct - a.cancellation_pct)
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 52, left: 8, bottom: 4 }}>
        <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fill: '#475569', fontSize: 10 }}
          axisLine={{ stroke: '#1e293b' }} tickLine={false}/>
        <YAxis dataKey="carrier" type="category" width={28}
          tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false}/>
        <Tooltip content={<TT/>} cursor={{ fill: 'rgba(56,189,248,0.04)' }}/>
        <Bar dataKey="cancellation_pct" radius={[0,4,4,0]} maxBarSize={14}>
          {sorted.map((e, i) => <Cell key={i} fill={color(e.cancellation_pct)} fillOpacity={0.85}/>)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
