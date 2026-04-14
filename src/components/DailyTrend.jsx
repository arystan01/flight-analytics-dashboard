import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

function TT({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="tt">
      <div className="tt-label">Jan {label}</div>
      {payload.map((p, i) => (
        <div className="tt-row" key={i}>
          <span>{p.name}</span><span style={{ color: p.color }}>{p.value}%</span>
        </div>
      ))}
    </div>
  )
}

export default function DailyTrend({ data }) {
  if (!data) return null
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 6" stroke="#f1f5f9" vertical={false}/>
        <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false}/>
        <YAxis domain={[50, 100]} tickFormatter={v => `${v}%`} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={34}/>
        <Tooltip content={<TT/>} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}/>
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }}/>
        <Line type="monotone" dataKey="on_time_pct" name="On-time %" stroke="#16a34a" strokeWidth={2.5} dot={false}
          activeDot={{ r: 4, fill: '#16a34a', stroke: '#ffffff', strokeWidth: 2 }}/>
        <Line type="monotone" dataKey="dep_delay_pct" name="Dep delay %" stroke="#dc2626" strokeWidth={2} dot={false}
          activeDot={{ r: 4, fill: '#dc2626', stroke: '#ffffff', strokeWidth: 2 }}/>
      </LineChart>
    </ResponsiveContainer>
  )
}
