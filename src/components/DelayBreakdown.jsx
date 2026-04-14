import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const SLICES = [
  { key: 'on_time',          label: 'On-time',            color: '#34d399' },
  { key: 'dep_delayed_only', label: 'Dep delayed only',   color: '#fbbf24' },
  { key: 'arr_delayed_only', label: 'Arr delayed only',   color: '#fb923c' },
  { key: 'both_delayed',     label: 'Both delayed',       color: '#f87171' },
  { key: 'cancelled',        label: 'Cancelled',          color: '#a78bfa' },
  { key: 'diverted',         label: 'Diverted',           color: '#38bdf8' },
]

function TT({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value, payload: p } = payload[0]
  return (
    <div className="tt">
      <div className="tt-label">{name}</div>
      <div className="tt-row"><span>Flights</span><span>{value.toLocaleString()}</span></div>
      <div className="tt-row"><span>Share</span><span>{((value / p.total) * 100).toFixed(1)}%</span></div>
    </div>
  )
}

export default function DelayBreakdown({ data }) {
  if (!data) return null
  const total = Object.values(data).reduce((s, v) => s + v, 0)
  const chartData = SLICES.map(s => ({ name: s.label, value: data[s.key] || 0, total, color: s.color }))

  return (
    <div className="donut-wrap">
      <ResponsiveContainer width={260} height={260}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%"
            innerRadius={72} outerRadius={112}
            dataKey="value" stroke="none" paddingAngle={2}>
            {chartData.map((e, i) => <Cell key={i} fill={e.color} fillOpacity={0.9}/>)}
          </Pie>
          <Tooltip content={<TT/>}/>
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-legend">
        {SLICES.map(s => (
          <div className="donut-legend-item" key={s.key}>
            <div className="donut-legend-left">
              <div className="donut-dot" style={{ background: s.color }}/>
              <span>{s.label}</span>
            </div>
            <span className="donut-val">{((data[s.key] || 0) / total * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
