function otpColor(pct) {
  if (pct >= 82) return '#34d399'
  if (pct >= 72) return '#fbbf24'
  return '#f87171'
}

function OtpBadge({ pct }) {
  const c = otpColor(pct)
  return (
    <span className="otp-badge"
      style={{ color: c, background: `${c}18`, border: `1px solid ${c}40` }}>
      {pct}%
    </span>
  )
}

export default function RouteCards({ routes }) {
  if (!routes) return null
  return (
    <div className="routes-grid">
      {routes.slice(0, 18).map(r => (
        <div className="route-card" key={r.route}>
          <div className="route-airports">
            <span className="route-code">{r.origin}</span>
            <div className="route-arrow">
              <span className="route-arrow-icon">✈</span>
            </div>
            <span className="route-code">{r.dest}</span>
          </div>
          <div className="route-cities">
            <span>{r.origin_city}</span>
            <span style={{textAlign:'right'}}>{r.dest_city}</span>
          </div>
          <div className="route-metrics">
            <div>
              <div className="route-metric-val" style={{ color: '#38bdf8' }}>
                {Math.round(r.avg_distance).toLocaleString()}
              </div>
              <div className="route-metric-lbl">Miles</div>
            </div>
            <div>
              <div className="route-metric-val" style={{ color: '#94a3b8' }}>
                {r.total.toLocaleString()}
              </div>
              <div className="route-metric-lbl">Flights</div>
            </div>
            <div>
              <OtpBadge pct={r.on_time_pct} />
              <div className="route-metric-lbl">On-time</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
