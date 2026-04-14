function otpColor(pct) {
  if (pct >= 82) return '#34d399'
  if (pct >= 72) return '#fbbf24'
  return '#f87171'
}

function RankList({ items, valueKey, label, formatVal }) {
  const max = Math.max(...items.map(a => a[valueKey]))
  return (
    <div className="ranking-list">
      {items.slice(0, 15).map((a, i) => {
        const pct = a[valueKey] / max * 100
        const otp = a.on_time_pct
        return (
          <div className="ranking-item" key={a.airport}>
            <span className="ranking-num">{i + 1}</span>
            <span className="ranking-code">{a.airport}</span>
            <div className="ranking-info">
              <div className="ranking-city">{a.city || a.airport}</div>
              <div className="ranking-detail">{formatVal(a)} {label}</div>
            </div>
            <div className="ranking-bar-wrap">
              <div className="ranking-bar">
                <div className="ranking-bar-fill"
                  style={{ width: `${pct}%`, background: otpColor(otp) }} />
              </div>
              <div className="ranking-pct" style={{ color: otpColor(otp) }}>
                {otp}%
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function AirportRankings({ origins, dests }) {
  if (!origins || !dests) return null
  return (
    <div className="grid-2">
      <div className="card">
        <div className="card-title">Top Departure Airports</div>
        <RankList
          items={origins}
          valueKey="departures"
          label="departures"
          formatVal={a => a.departures.toLocaleString()}
        />
      </div>
      <div className="card">
        <div className="card-title">Top Arrival Airports</div>
        <RankList
          items={dests}
          valueKey="arrivals"
          label="arrivals"
          formatVal={a => a.arrivals.toLocaleString()}
        />
      </div>
    </div>
  )
}
