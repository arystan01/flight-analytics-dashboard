import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'

function TT({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="tt">
      <div className="tt-label">{d.label}</div>
      <div className="tt-row"><span>On-time</span><span>{d.on_time_pct}%</span></div>
      <div className="tt-row"><span>Flights</span><span>{d.total.toLocaleString()}</span></div>
    </div>
  )
}

export default function DistanceVsOnTime({ data }) {
  if (!data) return null
  const avg = data.reduce((s, d) => s + d.on_time_pct, 0) / data.length
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 6" stroke="#0f172a" vertical={false}/>
        <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 9 }} axisLine={{ stroke: '#1e293b' }} tickLine={false}/>
        <YAxis domain={[60, 100]} tickFormatter={v => `${v}%`} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} width={34}/>
        <Tooltip content={<TT/>} cursor={{ fill: 'rgba(56,189,248,0.04)' }}/>
        <ReferenceLine y={avg} stroke="#334155" strokeDasharray="4 3"
          label={{ value: `avg ${avg.toFixed(1)}%`, fill: '#475569', fontSize: 9, position: 'insideTopRight' }}/>
        <Bar dataKey="on_time_pct" fill="#38bdf8" fillOpacity={0.75} radius={[4,4,0,0]} maxBarSize={70}/>
      </BarChart>
    </ResponsiveContainer>
  )
}
