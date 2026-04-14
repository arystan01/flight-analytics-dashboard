import { cityPhotoUrl } from '../cityPhotos'

function otpColor(pct) {
  if (pct >= 82) return '#16a34a'
  if (pct >= 72) return '#d97706'
  return '#dc2626'
}

function otpBg(pct) {
  if (pct >= 82) return '#dcfce7'
  if (pct >= 72) return '#fef3c7'
  return '#fee2e2'
}

function AirportCard({ airport, rank }) {
  const color = otpColor(airport.on_time_pct)
  const photo = cityPhotoUrl(airport.airport, 600)
  return (
    <div className="airport-card" style={{
      backgroundImage: `linear-gradient(to bottom, rgba(10,20,40,0.25) 0%, rgba(10,20,40,0.78) 100%), url(${photo})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      border: 'none',
    }}>
      {/* Rank badge */}
      <div style={{
        position:'absolute', top:12, right:12,
        fontFamily:'var(--font-mono)', fontSize:10,
        color:'rgba(255,255,255,0.6)', fontWeight:700,
      }}>#{rank}</div>

      {/* Airport code + city */}
      <div>
        <div style={{
          fontFamily:'var(--font-mono)', fontSize:38, fontWeight:700,
          color:'#ffffff', lineHeight:1, textShadow:'0 2px 8px rgba(0,0,0,0.4)',
        }}>{airport.airport}</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.75)', marginTop:3 }}>
          {airport.city}
        </div>
      </div>

      {/* Stats */}
      <div className="airport-bottom">
        <div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, color:'#fff' }}>
            {airport.departures.toLocaleString()}
          </div>
          <div style={{ fontSize:9, fontWeight:600, textTransform:'uppercase',
            letterSpacing:'0.4px', color:'rgba(255,255,255,0.55)', marginTop:2 }}>
            departures
          </div>
        </div>
        <div style={{
          fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700,
          padding:'3px 9px', borderRadius:5,
          color: '#fff',
          background: color + 'cc',
          border: `1px solid ${color}`,
        }}>
          {airport.on_time_pct}%
        </div>
      </div>
    </div>
  )
}

export default function AirportsPage({ data }) {
  const { top_origins, top_dests, kpis } = data
  const top10 = top_origins.slice(0, 10)
  const rest = top_origins.slice(10)

  return (
    <div className="page">
      <div className="page-inner">

        <div className="page-hero">
          <div className="page-eyebrow">Airport Intelligence</div>
          <div className="page-title">{kpis.total_airports} Airports in the Network</div>
          <div className="page-sub">
            From major international hubs to regional airports — explore which cities dominated
            US air travel and how each hub performed on punctuality in January 2019.
          </div>
        </div>

        {/* Top 10 hub cards */}
        <div className="section-hd">
          <div className="section-title">Top 10 Departure Hubs</div>
          <div className="section-sub">Color bar = on-time performance</div>
        </div>
        <div className="airports-grid">
          {top10.map((a, i) => <AirportCard key={a.airport} airport={a} rank={i+1}/>)}
        </div>

        {/* Full departure + arrival tables */}
        <div className="grid-2" style={{ marginTop: 28 }}>
          {/* Departures table */}
          <div>
            <div className="section-hd">
              <div className="section-title">Airports #11–20 by Departures</div>
            </div>
            <div className="apt-table">
              <div className="apt-row apt-header">
                <span>#</span><span>Code</span><span>City</span>
                <span>Departures</span><span>On-time</span>
              </div>
              {rest.map((a, i) => (
                <div className="apt-row" key={a.airport}>
                  <span style={{ color:'var(--text-3)', fontFamily:'var(--font-mono)', fontSize:11 }}>{i+11}</span>
                  <span style={{
                    fontFamily:'var(--font-mono)', fontWeight:700, fontSize:11,
                    background:'#dbeafe', color:'#1d4ed8',
                    padding:'2px 7px', borderRadius:5,
                  }}>{a.airport}</span>
                  <span style={{ color:'var(--text-2)' }}>{a.city}</span>
                  <span style={{ fontFamily:'var(--font-mono)' }}>{a.departures.toLocaleString()}</span>
                  <span style={{
                    fontFamily:'var(--font-mono)', fontWeight:700, fontSize:11,
                    color: otpColor(a.on_time_pct),
                    background: otpBg(a.on_time_pct),
                    padding:'2px 7px', borderRadius:5,
                  }}>
                    {a.on_time_pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top arrival airports */}
          <div>
            <div className="section-hd">
              <div className="section-title">Top 10 Arrival Airports</div>
            </div>
            <div className="apt-table">
              <div className="apt-row apt-header">
                <span>#</span><span>Code</span><span>City</span>
                <span>Arrivals</span><span>On-time</span>
              </div>
              {top_dests.slice(0, 10).map((a, i) => (
                <div className="apt-row" key={a.airport}>
                  <span style={{ color:'var(--text-3)', fontFamily:'var(--font-mono)', fontSize:11 }}>{i+1}</span>
                  <span style={{
                    fontFamily:'var(--font-mono)', fontWeight:700, fontSize:11,
                    background:'#dbeafe', color:'#1d4ed8',
                    padding:'2px 7px', borderRadius:5,
                  }}>{a.airport}</span>
                  <span style={{ color:'var(--text-2)' }}>{a.city}</span>
                  <span style={{ fontFamily:'var(--font-mono)' }}>{a.arrivals.toLocaleString()}</span>
                  <span style={{
                    fontFamily:'var(--font-mono)', fontWeight:700, fontSize:11,
                    color: otpColor(a.on_time_pct),
                    background: otpBg(a.on_time_pct),
                    padding:'2px 7px', borderRadius:5,
                  }}>
                    {a.on_time_pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
