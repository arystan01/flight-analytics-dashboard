import { useState, useEffect, useRef } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { heroPhotoUrl } from '../cityPhotos'

// ── Animated counter hook ──────────────────────────────────────────────────
function useCountUp(target, duration = 1400, decimals = 0) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    let startTs = null
    const step = (ts) => {
      if (!startTs) startTs = ts
      const progress = Math.min((ts - startTs) / duration, 1)
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(parseFloat((eased * target).toFixed(decimals)))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        setValue(target)
      }
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration, decimals])

  return value
}

// Renders an animated number with optional suffix
function CountUp({ target, decimals = 0, suffix = '', toLocale = false }) {
  const val = useCountUp(target, 1400, decimals)
  const display = toLocale
    ? Math.round(val).toLocaleString()
    : decimals > 0 ? val.toFixed(decimals) : Math.round(val)
  return <>{display}{suffix}</>
}

// ── Donut tooltip ──────────────────────────────────────────────────────────
const SLICES = [
  { key: 'on_time',          label: 'On-time',        color: '#16a34a' },
  { key: 'dep_delayed_only', label: 'Dep delay only', color: '#d97706' },
  { key: 'arr_delayed_only', label: 'Arr delay only', color: '#f97316' },
  { key: 'both_delayed',     label: 'Both delayed',   color: '#dc2626' },
  { key: 'cancelled',        label: 'Cancelled',      color: '#7c3aed' },
  { key: 'diverted',         label: 'Diverted',       color: '#0891b2' },
]

// Disruption breakdown (excludes on-time)
const DISRUPTIONS = [
  { key: 'both_delayed',     label: 'Dep + Arr delayed', color: '#dc2626' },
  { key: 'arr_delayed_only', label: 'Arrival delayed only', color: '#f97316' },
  { key: 'dep_delayed_only', label: 'Departure delayed only', color: '#d97706' },
  { key: 'cancelled',        label: 'Cancelled', color: '#7c3aed' },
  { key: 'diverted',         label: 'Diverted', color: '#0891b2' },
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

// ── Animated disruption bar ────────────────────────────────────────────────
function DisruptionBar({ label, count, pct, color, delay, maxCount }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth((count / maxCount) * 100), delay)
    return () => clearTimeout(t)
  }, [count, maxCount, delay])

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 5, fontSize: 12, color: 'var(--text-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }}/>
          <span>{label}</span>
        </div>
        <div style={{ display: 'flex', gap: 14, fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{count.toLocaleString()} flights</span>
          <span style={{ fontWeight: 700, color, minWidth: 38, textAlign: 'right' }}>{pct}%</span>
        </div>
      </div>
      <div style={{ height: 7, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', background: color, borderRadius: 4,
          width: `${width}%`,
          transition: 'width 0.9s cubic-bezier(0.22,1,0.36,1)',
        }}/>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function Overview({ data }) {
  const { kpis, by_carrier, by_time_block, top_origins, delay_cascade } = data

  const bestAirline = by_carrier.reduce((b, c) => c.on_time_pct > b.on_time_pct ? c : b)
  const worstHour   = by_time_block.reduce((w, b) => b.delay_pct > w.delay_pct ? b : w)
  const bestHour    = by_time_block.reduce((b, t) => t.delay_pct < b.delay_pct ? t : b)
  const topHub      = top_origins[0]

  const total     = Object.values(delay_cascade).reduce((s, v) => s + v, 0)
  const chartData = SLICES.map(s => ({ name: s.label, value: delay_cascade[s.key] || 0, total, color: s.color }))

  // Disruption stats (not on time)
  const disrupted     = total - (delay_cascade.on_time || 0)
  const disruptedPct  = ((disrupted / total) * 100).toFixed(1)
  const maxDisruption = Math.max(...DISRUPTIONS.map(d => delay_cascade[d.key] || 0))

  return (
    <div className="page">
      <div className="page-inner">

        {/* Hero */}
        <div className="ov-hero" style={{
          backgroundImage: `linear-gradient(135deg, rgba(37,99,235,0.90) 0%, rgba(29,78,216,0.85) 100%), url(${heroPhotoUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
        }}>
          <div className="ov-hero-inner">
            <div>
              <div className="ov-hero-tag">US Domestic Aviation · January 2019</div>
              <div className="ov-hero-title">
                Flight Analytics<br/>Dashboard
              </div>
              <div className="ov-hero-sub">
                A comprehensive analysis of {kpis.total_flights.toLocaleString()} domestic flights
                across {kpis.total_airports} airports, {kpis.total_routes.toLocaleString()} routes,
                and {kpis.total_carriers} airlines — revealing patterns in delays, cancellations, and punctuality.
              </div>
              <div className="ov-hero-stats">
                <div>
                  <span className="ov-stat-val">
                    <CountUp target={kpis.total_flights} toLocale />
                  </span>
                  <div className="ov-stat-lbl">Total Flights</div>
                </div>
                <div>
                  <span className="ov-stat-val">
                    <CountUp target={kpis.on_time_pct} decimals={1} suffix="%" />
                  </span>
                  <div className="ov-stat-lbl">On-time Rate</div>
                </div>
                <div>
                  <span className="ov-stat-val">
                    <CountUp target={kpis.dep_delay_pct} decimals={1} suffix="%" />
                  </span>
                  <div className="ov-stat-lbl">Delay Rate</div>
                </div>
                <div>
                  <span className="ov-stat-val">
                    <CountUp target={kpis.cancellation_pct} decimals={1} suffix="%" />
                  </span>
                  <div className="ov-stat-lbl">Cancelled</div>
                </div>
              </div>
            </div>

            <svg width="180" height="180" viewBox="0 0 180 180" fill="none"
              style={{ opacity: 0.85, flexShrink: 0 }}>
              <circle cx="90" cy="90" r="80" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="5 4"/>
              <circle cx="90" cy="90" r="55" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 5"/>
              <path d="M 42 90 L 142 86 L 142 94 L 42 90 Z" fill="rgba(255,255,255,0.65)"/>
              <path d="M 85 90 L 62 63 L 72 90 Z" fill="rgba(255,255,255,0.45)"/>
              <path d="M 85 90 L 62 117 L 72 90 Z" fill="rgba(255,255,255,0.45)"/>
              <path d="M 55 90 L 44 78 L 52 90 Z" fill="rgba(255,255,255,0.35)"/>
              <path d="M 55 90 L 44 102 L 52 90 Z" fill="rgba(255,255,255,0.35)"/>
              <circle cx="90" cy="20" r="4" fill="rgba(255,255,255,0.5)"/>
              <circle cx="160" cy="90" r="4" fill="rgba(255,255,255,0.5)"/>
              <circle cx="90" cy="160" r="4" fill="rgba(255,255,255,0.5)"/>
              <circle cx="20" cy="90" r="4" fill="rgba(255,255,255,0.5)"/>
            </svg>
          </div>
        </div>

        {/* Insight cards */}
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon-box" style={{ background:'#dcfce7', color:'#16a34a' }}>{kpis.on_time_pct}%</div>
            <div className="insight-headline">
              3 in 4 flights landed <span style={{ color:'#16a34a' }}>on time</span>
            </div>
            <div className="insight-body">
              With a <strong>{kpis.on_time_pct}% on-time arrival rate</strong>, the majority of US domestic travel
              in January 2019 ran on schedule — despite winter weather conditions.
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon-box" style={{ background:'#fef3c7', color:'#d97706' }}>{kpis.dep_delay_pct}%</div>
            <div className="insight-headline">
              Fly early, avoid <span style={{ color:'#d97706' }}>{worstHour.label}</span> delays
            </div>
            <div className="insight-body">
              Departures at <strong>{worstHour.label}</strong> had a <strong>{worstHour.delay_pct}% delay rate</strong> —
              nearly 4× higher than early morning flights at {bestHour.label} ({bestHour.delay_pct}% delayed).
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon-box" style={{ background:'#dbeafe', color:'#2563eb' }}>#1</div>
            <div className="insight-headline">
              <span style={{ color:'#2563eb' }}>{bestAirline.name}</span> led all airlines
            </div>
            <div className="insight-body">
              <strong>{bestAirline.name} ({bestAirline.carrier})</strong> achieved the highest on-time rate
              of <strong>{bestAirline.on_time_pct}%</strong> across its {bestAirline.total.toLocaleString()} January flights.
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon-box" style={{ background:'#ede9fe', color:'#7c3aed' }}>HUB</div>
            <div className="insight-headline">
              <span style={{ color:'#7c3aed' }}>{topHub.airport}</span> was the nation's busiest hub
            </div>
            <div className="insight-body">
              <strong>{topHub.city}</strong> processed <strong>{topHub.departures.toLocaleString()} departures</strong> in
              January — more than any other airport in the US domestic network.
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon-box" style={{ background:'#cffafe', color:'#0891b2' }}>5K+</div>
            <div className="insight-headline">
              <span style={{ color:'#0891b2' }}>{kpis.total_routes.toLocaleString()}</span> unique routes flown
            </div>
            <div className="insight-body">
              January 2019 saw <strong>{kpis.total_routes.toLocaleString()} city-pair combinations</strong> with an
              average route distance of <strong>{Math.round(kpis.avg_distance_miles).toLocaleString()} miles</strong>.
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon-box" style={{ background:'#fee2e2', color:'#dc2626' }}>{kpis.cancellation_pct}%</div>
            <div className="insight-headline">
              <span style={{ color:'#dc2626' }}>{kpis.cancellation_pct}%</span> of flights cancelled
            </div>
            <div className="insight-body">
              Winter conditions contributed to <strong>{Math.round(kpis.total_flights * kpis.cancellation_pct / 100).toLocaleString()} cancellations</strong> across
              the month — most concentrated in the Northeast corridor.
            </div>
          </div>
        </div>

        {/* Donut */}
        <div>
          <div className="section-hd">
            <div className="section-title">What Happened to Every Flight?</div>
            <div className="section-sub">All {kpis.total_flights.toLocaleString()} flights · January 2019</div>
          </div>
          <div className="card">
            <div className="donut-wrap">
              <div style={{ position:'relative', width:280, height:280, flexShrink:0 }}>
                <ResponsiveContainer width={280} height={280}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%"
                      innerRadius={72} outerRadius={120}
                      dataKey="value" stroke="none" paddingAngle={2}>
                      {chartData.map((e, i) => <Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip content={<TT/>}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{
                  position:'absolute', top:'50%', left:'50%',
                  transform:'translate(-50%,-50%)',
                  textAlign:'center', pointerEvents:'none',
                }}>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:26, fontWeight:700,
                    color:'#16a34a', lineHeight:1 }}>{kpis.on_time_pct}%</div>
                  <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase',
                    letterSpacing:'0.5px', color:'var(--text-3)', marginTop:4 }}>on-time</div>
                </div>
              </div>
              <div className="donut-legend">
                {SLICES.map(s => (
                  <div className="donut-row" key={s.key}>
                    <div className="donut-left">
                      <div className="donut-dot" style={{ background: s.color }}/>
                      <span>{s.label}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:100, height:5, background:'#f1f5f9', borderRadius:3, overflow:'hidden' }}>
                        <div style={{
                          width:`${(delay_cascade[s.key]||0)/total*100}%`,
                          height:'100%', background:s.color, borderRadius:3
                        }}/>
                      </div>
                      <span className="donut-pct">
                        {((delay_cascade[s.key]||0)/total*100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Delay cascade breakdown */}
        <div>
          <div className="section-hd">
            <div className="section-title">What Disrupted {disruptedPct}% of Flights?</div>
            <div className="section-sub">
              {disrupted.toLocaleString()} flights were delayed, cancelled, or diverted
            </div>
          </div>
          <div className="card" style={{ padding: '28px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px 48px' }}>

              {/* Left: animated bars */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.7px', color: 'var(--text-3)', marginBottom: 18 }}>
                  Breakdown of disrupted flights
                </div>
                {DISRUPTIONS.map((d, i) => {
                  const count = delay_cascade[d.key] || 0
                  const pct = ((count / disrupted) * 100).toFixed(1)
                  return (
                    <DisruptionBar
                      key={d.key}
                      label={d.label}
                      count={count}
                      pct={pct}
                      color={d.color}
                      maxCount={maxDisruption}
                      delay={120 + i * 100}
                    />
                  )
                })}
              </div>

              {/* Right: summary cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.7px', color: 'var(--text-3)', marginBottom: 6 }}>
                  Key takeaways
                </div>

                {/* Biggest culprit */}
                <div style={{
                  background: '#fff5f5', border: '1px solid #fecaca',
                  borderRadius: 10, padding: '14px 16px',
                }}>
                  <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                    Biggest culprit
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700,
                    color: '#dc2626', lineHeight: 1 }}>
                    {((delay_cascade.both_delayed / disrupted) * 100).toFixed(0)}%
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>
                    of disrupted flights had <strong>both</strong> a departure and arrival delay —
                    the ripple effect of late pushback.
                  </div>
                </div>

                {/* Cancellation insight */}
                <div style={{
                  background: '#faf5ff', border: '1px solid #e9d5ff',
                  borderRadius: 10, padding: '14px 16px',
                }}>
                  <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                    Cancellations
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700,
                    color: '#7c3aed', lineHeight: 1 }}>
                    {delay_cascade.cancelled.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>
                    flights never departed —{' '}
                    <strong>{((delay_cascade.cancelled / total) * 100).toFixed(2)}%</strong> of all
                    January traffic grounded.
                  </div>
                </div>

                {/* Silver lining */}
                <div style={{
                  background: '#f0fdf4', border: '1px solid #bbf7d0',
                  borderRadius: 10, padding: '14px 16px',
                }}>
                  <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                    Silver lining
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700,
                    color: '#16a34a', lineHeight: 1 }}>
                    {((delay_cascade.arr_delayed_only / disrupted) * 100).toFixed(0)}%
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>
                    of disrupted flights departed late but <strong>made up time in air</strong> — arriving with only an
                    arrival delay.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About this data */}
        <div>
          <div className="section-hd">
            <div className="section-title">About This Dataset</div>
            <div className="section-sub">Source, scope, and methodology</div>
          </div>
          <div className="card" style={{ padding: '28px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px 32px' }}>
              {[
                {
                  color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe',
                  label: 'Source',
                  value: 'BTS On-Time Performance',
                  detail: 'Bureau of Transportation Statistics, US DOT. Publicly available at transtats.bts.gov',
                },
                {
                  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',
                  label: 'Date Range',
                  value: 'January 2019',
                  detail: '583,985 flight records · 31 days · All scheduled US domestic passenger service',
                },
                {
                  color: '#d97706', bg: '#fffbeb', border: '#fde68a',
                  label: 'On-time Definition',
                  value: 'Arrived ≤ 15 min late',
                  detail: 'Industry-standard FAA/BTS definition. 75.62% of flights met this threshold in January.',
                },
                {
                  color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff',
                  label: 'Coverage',
                  value: '346 airports · 17 airlines',
                  detail: 'All certificated US air carriers. Includes mainline and regional operators.',
                },
                {
                  color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc',
                  label: 'Raw Dataset',
                  value: '73 MB CSV · 73 columns',
                  detail: 'Jan_2019_ontime.csv → preprocessed with Python/pandas → 17 KB JSON for the browser.',
                },
                {
                  color: '#dc2626', bg: '#fff5f5', border: '#fecaca',
                  label: 'Limitations',
                  value: 'Single month · domestic only',
                  detail: 'January is historically the worst month for delays. Results may not generalize to other seasons.',
                },
              ].map(item => (
                <div key={item.label} style={{
                  background: item.bg, border: `1px solid ${item.border}`,
                  borderRadius: 10, padding: '14px 16px',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.7px', color: item.color, marginBottom: 6 }}>
                    {item.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                    color: 'var(--text)', marginBottom: 5 }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.6 }}>
                    {item.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
