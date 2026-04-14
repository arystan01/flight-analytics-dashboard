import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, LabelList } from 'recharts'

function color(pct) {
  if (pct >= 82) return '#16a34a'
  if (pct >= 72) return '#d97706'
  return '#dc2626'
}

function TT({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="tt">
      <div className="tt-label">{d.name || d.carrier}</div>
      <div className="tt-row"><span>On-time</span><span>{d.on_time_pct}%</span></div>
      <div className="tt-row"><span>Dep delay rate</span><span>{d.dep_delay_pct}%</span></div>
      <div className="tt-row"><span>Cancelled</span><span>{d.cancellation_pct}%</span></div>
      <div className="tt-row"><span>Flights</span><span>{d.total.toLocaleString()}</span></div>
    </div>
  )
}

function EndLabel(props) {
  const { x, y, width, value } = props
  return (
    <text x={x + width + 6} y={y + 9} fill={color(value)}
      fontSize={10} fontFamily="monospace" fontWeight={700}>
      {value}%
    </text>
  )
}

export default function CarrierPerformance({ data }) {
  if (!data) return null
  const sorted = [...data].sort((a, b) => b.on_time_pct - a.on_time_pct)
  const avg = sorted.reduce((s, d) => s + d.on_time_pct, 0) / sorted.length
  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 72, left: 8, bottom: 4 }}>
        <XAxis type="number" domain={[55, 100]} tickFormatter={v => `${v}%`}
          tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
        <YAxis dataKey="carrier" type="category" width={28}
          tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Space Mono' }}
          axisLine={false} tickLine={false} />
        <Tooltip content={<TT />} cursor={{ fill: 'rgba(37,99,235,0.04)' }} />
        <ReferenceLine x={avg} stroke="#cbd5e1" strokeDasharray="4 3"
          label={{ value: `avg ${avg.toFixed(1)}%`, fill: '#94a3b8', fontSize: 9, position: 'insideTopRight' }} />
        <Bar dataKey="on_time_pct" radius={[0, 4, 4, 0]} maxBarSize={16}>
          {sorted.map((e, i) => <Cell key={i} fill={color(e.on_time_pct)} fillOpacity={0.85} />)}
          <LabelList content={<EndLabel />} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
