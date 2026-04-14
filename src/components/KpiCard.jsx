import { useEffect, useState } from 'react'

function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = null
    const t = typeof target === 'number' ? target : 0
    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(ease * t * 10) / 10)
      if (p < 1) requestAnimationFrame(step)
      else setVal(t)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return val
}

export default function KpiCard({ label, value, unit, color, sub, icon, isDecimal }) {
  const isNum = typeof value === 'number'
  const animated = useCountUp(isNum ? value : 0)

  const display = isNum
    ? (isDecimal || String(value).includes('.'))
      ? animated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : Math.round(animated).toLocaleString()
    : value

  return (
    <div className="kpi-card" style={{ '--kpi-color': color }}>
      <style>{`.kpi-card::before { background: var(--kpi-color, #38bdf8); }`}</style>
      {icon && <div className="kpi-icon">{icon}</div>}
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color }}>
        {display}
        {unit && <span className="kpi-unit">{unit}</span>}
      </div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  )
}
