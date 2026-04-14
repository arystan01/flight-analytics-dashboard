import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts'

function TT({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="tt">
      <div className="tt-label">{d.block}</div>
      <div className="tt-row"><span>Delay rate</span><span>{d.delay_pct}%</span></div>
      <div className="tt-row"><span>Flights</span><span>{d.total.toLocaleString()}</span></div>
    </div>
  )
}

export default function DelayByTimeBlock({ data }) {
  if (!data) return null
  const avg = data.reduce((s, d) => s + d.delay_pct, 0) / data.length
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="delayFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#f87171" stopOpacity={0.02}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 6" stroke="#f1f5f9" vertical={false}/>
        <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} interval={1}/>
        <YAxis tickFormatter={v => `${v}%`} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={34}/>
        <Tooltip content={<TT/>} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}/>
        <ReferenceLine y={avg} stroke="#cbd5e1" strokeDasharray="4 3"
          label={{ value: `avg ${avg.toFixed(1)}%`, fill: '#94a3b8', fontSize: 9, position: 'insideTopRight' }}/>
        <Area type="monotone" dataKey="delay_pct" stroke="#f87171" strokeWidth={2}
          fill="url(#delayFill)" dot={false}
          activeDot={{ r: 4, fill: '#f87171', stroke: '#020817', strokeWidth: 2 }}/>
      </AreaChart>
    </ResponsiveContainer>
  )
}
