import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

function TT({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="tt">
      <div className="tt-label">{label}</div>
      {payload.map((p, i) => (
        <div className="tt-row" key={i}>
          <span>{p.name}</span>
          <span style={{ color: p.color }}>
            {p.name === 'On-time %' ? `${p.value}%` : p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function WeeklyPattern({ data }) {
  if (!data) return null
  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 10, right: 40, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 6" stroke="#f1f5f9" vertical={false}/>
        <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false}/>
        <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false}
          tickFormatter={v => `${(v/1000).toFixed(0)}k`} width={36}/>
        <YAxis yAxisId="right" orientation="right" domain={[60, 100]}
          tickFormatter={v => `${v}%`} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={36}/>
        <Tooltip content={<TT/>} cursor={{ fill: 'rgba(37,99,235,0.04)' }}/>
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }}/>
        <Bar yAxisId="left" dataKey="total" name="Flights" fill="#dbeafe" radius={[4,4,0,0]} maxBarSize={42}/>
        <Line yAxisId="right" type="monotone" dataKey="on_time_pct" name="On-time %"
          stroke="#38bdf8" strokeWidth={2.5}
          dot={{ r: 4, fill: '#38bdf8', stroke: '#020817', strokeWidth: 2 }}/>
      </ComposedChart>
    </ResponsiveContainer>
  )
}
