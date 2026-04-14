import { useState } from 'react'
import CarrierPerformance from '../components/CarrierPerformance'
import { runwayPhotoUrl } from '../cityPhotos'

// Two-source fallback: pics.avs.io (broader coverage) → Google CDN → gradient
const logoSources = code => [
  `https://pics.avs.io/150/60/${code}@2x.png`,
  `https://www.gstatic.com/flights/airline_logos/70px/${code}.png`,
]

const GRAD = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#3b82f6,#06b6d4)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#ec4899,#a855f7)',
  'linear-gradient(135deg,#14b8a6,#6366f1)',
]

function otpColor(pct) {
  if (pct >= 82) return '#16a34a'
  if (pct >= 72) return '#d97706'
  return '#dc2626'
}

function AirlineLogo({ carrier, idx }) {
  const [srcIdx, setSrcIdx] = useState(0)
  const sources = logoSources(carrier)

  if (srcIdx >= sources.length) {
    return (
      <div className="airline-logo-fallback" style={{ background: GRAD[idx % GRAD.length] }}>
        {carrier}
      </div>
    )
  }
  return (
    <div className="airline-logo-wrap">
      <img
        src={sources[srcIdx]}
        alt={carrier}
        onError={() => setSrcIdx(i => i + 1)}
      />
    </div>
  )
}

const SORTS = [
  { key: 'on_time_pct',      label: 'On-time %',   dir: -1 },
  { key: 'total',            label: 'Flights',      dir: -1 },
  { key: 'cancellation_pct', label: 'Cancellation', dir: -1 },
]

export default function AirlinesPage({ data }) {
  const [sortKey, setSortKey] = useState('on_time_pct')
  const sorted = [...data.by_carrier].sort((a, b) => {
    const s = SORTS.find(s => s.key === sortKey)
    return (b[sortKey] - a[sortKey]) * (s?.dir ?? -1)
  })
  const best = [...data.by_carrier].sort((a, b) => b.on_time_pct - a.on_time_pct)[0]
  const worst = [...data.by_carrier].sort((a, b) => a.on_time_pct - b.on_time_pct)[0]

  return (
    <div className="page">
      <div className="page-inner">

        {/* Photo hero strip */}
        <div style={{
          height: 200,
          borderRadius: 16,
          backgroundImage: `linear-gradient(to right, rgba(10,20,40,0.82) 0%, rgba(10,20,40,0.45) 60%, rgba(10,20,40,0.2) 100%), url(${runwayPhotoUrl()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 60%',
          display: 'flex',
          alignItems: 'center',
          padding: '0 44px',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase',
              letterSpacing:'1px', color:'rgba(255,255,255,0.6)', marginBottom:8 }}>
              Carrier Performance · January 2019
            </div>
            <div style={{ fontFamily:'var(--font-head)', fontSize:36, fontWeight:700,
              color:'#fff', lineHeight:1.1, marginBottom:10 }}>
              {sorted.length} Airlines Analyzed
            </div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', maxWidth:460, lineHeight:1.6 }}>
              From major network carriers to regional operators — on-time departures,
              arrivals, and cancellations across 583,985 domestic flights.
            </div>
          </div>
        </div>

        {/* Best & Worst highlight */}
        <div className="grid-2" style={{ marginBottom: 28 }}>
          {/* Best */}
          <div className="card" style={{ borderTop: `3px solid #16a34a` }}>
            <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px',
              color:'#16a34a', background:'#dcfce7', display:'inline-block',
              padding:'2px 10px', borderRadius:20, marginBottom:14 }}>
              Best Performer
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
              <AirlineLogo carrier={best.carrier} idx={0}/>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:'var(--text)' }}>{best.name}</div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-3)', marginTop:2 }}>
                  {best.carrier} · {best.total.toLocaleString()} flights
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:32 }}>
              <div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:34, fontWeight:700, color:'#16a34a', lineHeight:1 }}>
                  {best.on_time_pct}%
                </div>
                <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', color:'var(--text-3)', marginTop:5 }}>
                  On-time Rate
                </div>
              </div>
              <div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:34, fontWeight:700, color:'#dc2626', lineHeight:1 }}>
                  {best.cancellation_pct}%
                </div>
                <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', color:'var(--text-3)', marginTop:5 }}>
                  Cancelled
                </div>
              </div>
            </div>
          </div>

          {/* Worst */}
          <div className="card" style={{ borderTop: `3px solid #dc2626` }}>
            <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px',
              color:'#dc2626', background:'#fee2e2', display:'inline-block',
              padding:'2px 10px', borderRadius:20, marginBottom:14 }}>
              Needs Improvement
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
              <AirlineLogo carrier={worst.carrier} idx={3}/>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:'var(--text)' }}>{worst.name}</div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-3)', marginTop:2 }}>
                  {worst.carrier} · {worst.total.toLocaleString()} flights
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:32 }}>
              <div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:34, fontWeight:700, color:'#dc2626', lineHeight:1 }}>
                  {worst.on_time_pct}%
                </div>
                <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', color:'var(--text-3)', marginTop:5 }}>
                  On-time Rate
                </div>
              </div>
              <div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:34, fontWeight:700, color:'#d97706', lineHeight:1 }}>
                  {worst.cancellation_pct}%
                </div>
                <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', color:'var(--text-3)', marginTop:5 }}>
                  Cancelled
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ranked bar chart */}
        <div className="section-hd">
          <div className="section-title">
            {best.name} leads; {worst.name} trails by {(best.on_time_pct - worst.on_time_pct).toFixed(1)} points
          </div>
          <div className="section-sub">All 17 carriers ranked · Dashed line = national average</div>
        </div>
        <div className="card" style={{ marginBottom: 28 }}>
          <CarrierPerformance data={sorted}/>
        </div>

        {/* Cancellation chart */}
        <div className="section-hd">
          <div className="section-title">Regional carriers ground the most flights</div>
          <div className="section-sub">Cancellation rate by airline · national avg {data.kpis.cancellation_pct}%</div>
        </div>
        <div className="card" style={{ marginBottom: 28, padding: '24px 28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...data.by_carrier]
              .sort((a, b) => b.cancellation_pct - a.cancellation_pct)
              .map((airline, i) => {
                const isAboveAvg = airline.cancellation_pct > data.kpis.cancellation_pct
                const barColor = airline.cancellation_pct >= 5 ? '#dc2626'
                  : airline.cancellation_pct >= 3 ? '#d97706' : '#16a34a'
                const maxPct = 8
                return (
                  <div key={airline.carrier}>
                    <div style={{ display: 'flex', justifyContent: 'space-between',
                      alignItems: 'baseline', marginBottom: 4, fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11,
                          color: 'var(--text-3)', width: 24, flexShrink: 0 }}>
                          #{i + 1}
                        </span>
                        <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{airline.name}</span>
                        {isAboveAvg && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626',
                            background: '#fee2e2', padding: '1px 6px', borderRadius: 4 }}>
                            above avg
                          </span>
                        )}
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700,
                        color: barColor, minWidth: 40, textAlign: 'right' }}>
                        {airline.cancellation_pct}%
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg)', borderRadius: 3,
                      overflow: 'visible', position: 'relative' }}>
                      <div style={{
                        height: '100%', borderRadius: 3,
                        width: `${(airline.cancellation_pct / maxPct) * 100}%`,
                        background: barColor,
                        transition: 'width 0.4s ease',
                      }}/>
                      {/* Avg line */}
                      <div style={{
                        position: 'absolute', top: -2, bottom: -2,
                        left: `${(data.kpis.cancellation_pct / maxPct) * 100}%`,
                        width: 1.5, background: '#94a3b8', borderRadius: 1,
                      }}/>
                    </div>
                  </div>
                )
              })}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: 11, color: 'var(--text-3)' }}>
            {[['#dc2626','≥ 5% — high'], ['#d97706','3–5% — moderate'], ['#16a34a','< 3% — low']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: c }}/>
                {l}
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto' }}>
              <div style={{ width: 10, height: 2, background: '#94a3b8' }}/>
              national avg
            </div>
          </div>
        </div>

        {/* All airlines grid */}
        <div className="section-hd">
          <div className="section-title">All Airlines</div>
          <div style={{ display:'flex', gap:6 }}>
            {SORTS.map(s => (
              <button key={s.key} onClick={() => setSortKey(s.key)} style={{
                padding:'5px 12px', borderRadius:7, fontSize:11, fontWeight:600,
                cursor:'pointer', border:'1px solid',
                background: sortKey === s.key ? 'var(--blue)' : 'var(--surface)',
                color:      sortKey === s.key ? '#fff' : 'var(--text-2)',
                borderColor:sortKey === s.key ? 'var(--blue)' : 'var(--border)',
                transition:'all 0.15s',
              }}>{s.label}</button>
            ))}
          </div>
        </div>
        <div className="airlines-grid">
          {sorted.map((airline, i) => {
            const color = otpColor(airline.on_time_pct)
            return (
              <div className="airline-card" key={airline.carrier}
                style={{ borderTop: `3px solid ${color}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <AirlineLogo carrier={airline.carrier} idx={i}/>
                  <div>
                    <div className="airline-name">{airline.name}</div>
                    <div className="airline-code">#{i+1} · {airline.carrier}</div>
                  </div>
                </div>

                <div>
                  <div className="airline-otp" style={{ color }}>{airline.on_time_pct}%</div>
                  <div style={{ fontSize:10, color:'var(--text-3)', marginTop:2 }}>On-time rate</div>
                </div>

                <div className="airline-bar">
                  <div className="airline-bar-fill"
                    style={{ width:`${airline.on_time_pct}%`, background:color }}/>
                </div>

                <div className="airline-meta">
                  <div>
                    <div className="airline-meta-val">{airline.total.toLocaleString()}</div>
                    <div>flights</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div className="airline-meta-val" style={{ color:'#dc2626' }}>
                      {airline.cancellation_pct}%
                    </div>
                    <div>cancelled</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
