import { useState, useRef, useEffect } from 'react'
import {
  ComposableMap, Geographies, Geography,
  Marker, useMapContext,
} from 'react-simple-maps'
import { cityPhotoUrl } from '../cityPhotos'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

const AP_COORDS = {
  ATL: [-84.43, 33.64], ORD: [-87.91, 41.97], DFW: [-97.04, 32.90],
  CLT: [-80.94, 35.21], DEN: [-104.67, 39.86], LAX: [-118.41, 33.94],
  MSP: [-93.22, 44.88], DTW: [-83.35, 42.21], DCA: [-77.04, 38.85],
  LGA: [-73.87, 40.78], SFO: [-122.38, 37.62], PHX: [-112.01, 33.44],
  IAH: [-95.34, 29.99], MCO: [-81.31, 28.43], BOS: [-71.00, 42.36],
  EWR: [-74.17, 40.69], PHL: [-75.24, 39.87], TPA: [-82.53, 27.98],
  MDW: [-87.75, 41.79], JFK: [-73.78, 40.64], MIA: [-80.29, 25.80],
  SEA: [-122.31, 47.45], SLC: [-111.98, 40.79], LAS: [-115.15, 36.08],
  STL: [-90.37, 38.75], BWI: [-76.67, 39.18], SAN: [-117.19, 32.73],
  HNL: [-157.92, 21.32], OGG: [-156.43, 20.90], FLL: [-80.15, 26.07],
}

function otpColor(pct) {
  if (pct >= 82) return '#16a34a'
  if (pct >= 72) return '#d97706'
  return '#dc2626'
}

// Curved arc — draws on load via stroke-dasharray animation
function FlightArc({ from, to, stroke, strokeWidth, strokeOpacity, animDelay, onClick, onMouseEnter, onMouseLeave }) {
  const { projection } = useMapContext()
  const p1 = projection(from)
  const p2 = projection(to)
  if (!p1 || !p2) return null

  const [x1, y1] = p1
  const [x2, y2] = p2
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.sqrt(dx * dx + dy * dy)
  const cpx = mx + dy * 0.15
  const cpy = my - dx * 0.15 - dist * 0.12

  return (
    <path
      d={`M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeOpacity={strokeOpacity}
      strokeLinecap="round"
      pathLength="1"
      strokeDasharray="1"
      strokeDashoffset="1"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        cursor: 'pointer',
        transition: 'stroke-width 0.15s, stroke-opacity 0.15s',
        animation: `drawArc 0.9s ease ${animDelay}s both`,
      }}
    />
  )
}

export default function RoutesPage({ data }) {
  const { top_routes, kpis, top_origins } = data
  const [sel, setSel] = useState(null)
  const [tooltip, setTooltip] = useState(null)
  const [hoveredRoute, setHoveredRoute] = useState(null)
  const [chipSearch, setChipSearch] = useState('')
  const chipRefs = useRef({})

  const routes = top_routes.slice(0, 20)

  // Primary lookup from top_origins
  const airportInfo = {}
  ;(top_origins || []).forEach(a => { airportInfo[a.airport] = a })

  // Fallback: build info from routes for airports not in top_origins (e.g. HNL, OGG)
  routes.forEach(r => {
    if (!airportInfo[r.origin]) {
      const originRoutes = routes.filter(x => x.origin === r.origin)
      const totalDeps = originRoutes.reduce((s, x) => s + x.total, 0)
      const wtdOtp = originRoutes.reduce((s, x) => s + x.on_time_pct * x.total, 0) / totalDeps
      airportInfo[r.origin] = {
        airport: r.origin,
        city: r.origin_city,
        departures: totalDeps,
        on_time_pct: Math.round(wtdOtp * 10) / 10,
        _fromRoutes: true,
      }
    }
    if (!airportInfo[r.dest]) {
      const destRoutes = routes.filter(x => x.dest === r.dest)
      const totalArr = destRoutes.reduce((s, x) => s + x.total, 0)
      const wtdOtp = destRoutes.reduce((s, x) => s + x.on_time_pct * x.total, 0) / totalArr
      airportInfo[r.dest] = {
        airport: r.dest,
        city: r.dest_city,
        departures: totalArr,
        on_time_pct: Math.round(wtdOtp * 10) / 10,
        _fromRoutes: true,
      }
    }
  })

  const apSet = new Set()
  routes.forEach(r => { apSet.add(r.origin); apSet.add(r.dest) })
  const airports = [...apSet].filter(code => AP_COORDS[code])

  // Volume-scaled arc width
  const maxFlights = Math.max(...routes.map(r => r.total))
  const minFlights = Math.min(...routes.map(r => r.total))
  function arcWidth(total) {
    const norm = maxFlights === minFlights ? 0.5 : (total - minFlights) / (maxFlights - minFlights)
    return 0.8 + norm * 2.7  // 0.8 – 3.5
  }

  // Traffic-scaled airport dot radius
  const maxDep = Math.max(...airports.map(code => airportInfo[code]?.departures || 0))
  function dotRadius(code) {
    const dep = airportInfo[code]?.departures || 0
    const norm = maxDep > 0 ? dep / maxDep : 0
    return 3 + norm * 5  // 3 – 8
  }

  function selectRoute(i) {
    setSel(sel?.type === 'route' && sel.idx === i ? null : { type: 'route', idx: i })
  }
  function selectAirport(code) {
    setSel(sel?.type === 'airport' && sel.code === code ? null : { type: 'airport', code })
  }

  const activeRouteIdx = sel?.type === 'route' ? sel.idx : null
  const activeAirport  = sel?.type === 'airport' ? sel.code : null

  function routeIsHighlighted(r, i) {
    if (activeRouteIdx !== null) return i === activeRouteIdx
    if (activeAirport)          return r.origin === activeAirport || r.dest === activeAirport
    return false
  }
  function routeOpacity(r, i) {
    if (!sel) return 0.55
    return routeIsHighlighted(r, i) ? 1 : 0.1
  }
  function apIsActive(code) {
    if (activeAirport) return code === activeAirport
    if (activeRouteIdx !== null) {
      const r = routes[activeRouteIdx]
      return r.origin === code || r.dest === code
    }
    return false
  }

  const selRoute   = activeRouteIdx !== null ? routes[activeRouteIdx] : null
  const selAirport = activeAirport ? airportInfo[activeAirport] : null
  const connectedRoutes = activeAirport
    ? routes.filter(r => r.origin === activeAirport || r.dest === activeAirport)
    : []

  // Scroll active chip into view when route selected via arc click
  useEffect(() => {
    if (activeRouteIdx !== null && chipRefs.current[activeRouteIdx]) {
      chipRefs.current[activeRouteIdx].scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [activeRouteIdx])

  // Chip search filter
  const searchQ = chipSearch.trim().toUpperCase()
  const filteredRoutes = searchQ
    ? routes.filter(r => r.origin.includes(searchQ) || r.dest.includes(searchQ))
    : routes

  // Reverse route lookup
  const reverseIdx = selRoute
    ? routes.findIndex(r => r.origin === selRoute.dest && r.dest === selRoute.origin)
    : -1

  // National avg delta
  const delta = selRoute
    ? (selRoute.on_time_pct - kpis.on_time_pct).toFixed(1)
    : null

  return (
    <div className="page">
      <div className="page-inner">

        <div className="page-hero">
          <div className="page-eyebrow">Route Analysis</div>
          <div className="page-title">{kpis.total_routes.toLocaleString()} Unique Routes</div>
          <div className="page-sub">
            Click a route arc or airport dot on the map to explore performance details.
            Arc thickness shows flight volume. Color shows on-time rate.
          </div>
        </div>

        <div className="routes-layout">
          <div>
            <div className="globe-card" style={{ background: '#dbeafe', padding: 0, overflow: 'hidden', position: 'relative' }}>
              {/* Hover tooltip */}
              {tooltip && (
                <div style={{
                  position: 'absolute',
                  left: tooltip.x + 12,
                  top: tooltip.y - 10,
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 12,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                  pointerEvents: 'none',
                  zIndex: 10,
                  whiteSpace: 'nowrap',
                }}>
                  <div style={{ fontFamily:'monospace', fontWeight:700, fontSize:14, color:'#0f172a' }}>
                    {tooltip.code}
                  </div>
                  <div style={{ color:'#475569', marginTop:2 }}>{tooltip.city}</div>
                  {tooltip.otp && (
                    <div style={{ marginTop:4, fontWeight:700, color: otpColor(tooltip.otp) }}>
                      {tooltip.otp}% on-time
                    </div>
                  )}
                </div>
              )}

              <ComposableMap
                projection="geoAlbersUsa"
                projectionConfig={{ scale: 1000 }}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              >
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map(geo => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#f0f7ff"
                        stroke="#bfdbfe"
                        strokeWidth={0.6}
                        style={{
                          default: { outline: 'none' },
                          hover:   { outline: 'none' },
                          pressed: { outline: 'none' },
                        }}
                      />
                    ))
                  }
                </Geographies>

                {/* Curved flight arcs — thickness proportional to volume */}
                {routes.map((r, i) => {
                  const o = AP_COORDS[r.origin]
                  const d = AP_COORDS[r.dest]
                  if (!o || !d) return null
                  const highlighted = routeIsHighlighted(r, i)
                  const hovered = hoveredRoute === i
                  const color = (highlighted || hovered) ? otpColor(r.on_time_pct) : '#60a5fa'
                  const base = arcWidth(r.total)
                  return (
                    <FlightArc
                      key={r.route}
                      from={o}
                      to={d}
                      stroke={color}
                      strokeWidth={highlighted ? base * 1.7 : hovered ? base * 1.3 : base}
                      strokeOpacity={hovered && !sel ? 0.9 : routeOpacity(r, i)}
                      animDelay={i * 0.04}
                      onClick={() => selectRoute(i)}
                      onMouseEnter={() => setHoveredRoute(i)}
                      onMouseLeave={() => setHoveredRoute(null)}
                    />
                  )
                })}

                {/* Airport dots — size proportional to traffic */}
                {airports.map(code => {
                  const coords = AP_COORDS[code]
                  const active = apIsActive(code)
                  const info = airportInfo[code]
                  const r = dotRadius(code)
                  return (
                    <Marker
                      key={code}
                      coordinates={coords}
                      onClick={() => selectAirport(code)}
                      onMouseEnter={e => {
                        const rect = e.currentTarget.closest('svg').getBoundingClientRect()
                        const parent = e.currentTarget.closest('.globe-card').getBoundingClientRect()
                        setTooltip({
                          x: rect.left - parent.left + e.clientX - rect.left,
                          y: rect.top  - parent.top  + e.clientY - rect.top,
                          code,
                          city: info?.city || '',
                          otp:  info?.on_time_pct || null,
                        })
                      }}
                      onMouseMove={e => {
                        const rect = e.currentTarget.closest('svg').getBoundingClientRect()
                        const parent = e.currentTarget.closest('.globe-card').getBoundingClientRect()
                        setTooltip(t => t ? {
                          ...t,
                          x: rect.left - parent.left + e.clientX - rect.left,
                          y: rect.top  - parent.top  + e.clientY - rect.top,
                        } : t)
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        r={active ? r + 2 : r}
                        fill={active ? '#2563eb' : '#ffffff'}
                        stroke={active ? '#1d4ed8' : '#60a5fa'}
                        strokeWidth={1.5}
                        style={{ transition: 'r 0.15s' }}
                      />
                      <text
                        y={active ? -(r + 5) : -(r + 3)}
                        textAnchor="middle"
                        fontSize={active ? 9 : 7}
                        fontWeight={active ? 700 : 500}
                        fill={active ? '#1d4ed8' : '#475569'}
                        fontFamily="monospace"
                        style={{ userSelect: 'none', pointerEvents: 'none' }}
                      >
                        {code}
                      </text>
                    </Marker>
                  )
                })}
              </ComposableMap>

              {/* Search + chips */}
              <div style={{ background: '#fff', padding: '12px 18px 14px', borderTop: '1px solid #e2e8f0' }}>
                <input
                  type="text"
                  placeholder="Filter by airport code (e.g. LAX, ORD)..."
                  value={chipSearch}
                  onChange={e => setChipSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                    outline: 'none',
                    background: '#f8fafc',
                    color: 'var(--text)',
                    boxSizing: 'border-box',
                    marginBottom: 10,
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <div className="route-chips" style={{ marginTop: 0 }}>
                  {filteredRoutes.map(r => {
                    const origIdx = routes.indexOf(r)
                    return (
                      <button
                        key={r.route}
                        ref={el => { chipRefs.current[origIdx] = el }}
                        className={`route-chip${activeRouteIdx === origIdx ? ' active' : ''}`}
                        onClick={() => selectRoute(origIdx)}
                      >
                        {r.origin} → {r.dest}
                      </button>
                    )
                  })}
                  {filteredRoutes.length === 0 && (
                    <div style={{ fontSize:12, color:'var(--text-3)', padding:'4px 0' }}>
                      No routes match "{chipSearch}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Detail panel */}
          <div className="route-panel">
            {/* Empty state */}
            {!sel && (
              <div className="route-panel-empty">
                <div className="route-panel-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                </div>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--text-2)', marginBottom:6 }}>
                  Select a route or airport
                </div>
                <div style={{ fontSize:12, color:'var(--text-3)', lineHeight:1.6 }}>
                  Click any flight arc, airport dot, or chip below to see details
                </div>
              </div>
            )}

            {/* Route detail */}
            {selRoute && (
              <>
                {/* Destination photo with rank badge */}
                <div style={{
                  height: 110,
                  borderRadius: 10,
                  backgroundImage: `linear-gradient(to bottom, rgba(10,20,40,0.1), rgba(10,20,40,0.6)), url(${cityPhotoUrl(selRoute.dest, 600)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  marginBottom: 18,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{ position:'absolute', bottom:10, left:12 }}>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, color:'#fff' }}>
                      {selRoute.dest}
                    </div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.75)' }}>{selRoute.dest_city}</div>
                  </div>
                  {/* Rank badge */}
                  <div style={{
                    position:'absolute', top:10, right:10,
                    background:'rgba(0,0,0,0.55)', borderRadius:6,
                    padding:'4px 9px', fontSize:10, fontWeight:700,
                    color:'rgba(255,255,255,0.92)', fontFamily:'var(--font-mono)',
                    backdropFilter:'blur(4px)',
                  }}>
                    #{activeRouteIdx + 1} busiest route
                  </div>
                </div>

                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase',
                  letterSpacing:'0.8px', color:'var(--text-3)', marginBottom:14 }}>
                  Route Details
                </div>

                <div className="route-od">
                  <div>
                    <div className="route-ap-code">{selRoute.origin}</div>
                    <div className="route-ap-city">{selRoute.origin_city}</div>
                  </div>
                  <div className="route-line">
                    <div className="route-dash"/>
                    <span className="route-plane" style={{ fontSize:18 }}>✈</span>
                    <div className="route-dash"/>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div className="route-ap-code">{selRoute.dest}</div>
                    <div className="route-ap-city" style={{ textAlign:'right' }}>{selRoute.dest_city}</div>
                  </div>
                </div>

                {/* Reverse route flip button */}
                {reverseIdx !== -1 && (
                  <button
                    onClick={() => selectRoute(reverseIdx)}
                    title={`Switch to ${selRoute.dest} → ${selRoute.origin}`}
                    style={{
                      display:'flex', alignItems:'center', gap:6,
                      marginTop:10, padding:'6px 12px',
                      border:'1px solid #bfdbfe', borderRadius:7,
                      background:'#eff6ff', color:'#1d4ed8',
                      fontSize:11, fontWeight:600, fontFamily:'var(--font-mono)',
                      cursor:'pointer', transition:'background 0.15s',
                    }}
                    onMouseOver={e => e.currentTarget.style.background='#dbeafe'}
                    onMouseOut={e => e.currentTarget.style.background='#eff6ff'}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
                    </svg>
                    Flip: {selRoute.dest} → {selRoute.origin}
                  </button>
                )}

                <div className="route-metrics-list" style={{ marginTop:18 }}>
                  <div className="route-metric-row">
                    <span className="route-metric-key">Distance</span>
                    <span className="route-metric-val">{Math.round(selRoute.avg_distance).toLocaleString()} mi</span>
                  </div>
                  <div className="route-metric-row">
                    <span className="route-metric-key">Flights in Jan</span>
                    <span className="route-metric-val">{selRoute.total.toLocaleString()}</span>
                  </div>
                  <div className="route-metric-row">
                    <span className="route-metric-key">On-time Rate</span>
                    <span className="route-metric-val" style={{ color: otpColor(selRoute.on_time_pct) }}>
                      {selRoute.on_time_pct}%
                    </span>
                  </div>
                  {/* National average comparison */}
                  <div className="route-metric-row">
                    <span className="route-metric-key">National Avg</span>
                    <span className="route-metric-val" style={{ color:'var(--text-2)' }}>
                      {kpis.on_time_pct}%
                      <span style={{
                        marginLeft:6,
                        color: Number(delta) >= 0 ? '#16a34a' : '#dc2626',
                        fontWeight:700,
                        fontSize:11,
                      }}>
                        ({Number(delta) >= 0 ? '+' : ''}{delta}%)
                      </span>
                    </span>
                  </div>
                  <div className="route-metric-row">
                    <span className="route-metric-key">Dep Delay Rate</span>
                    <span className="route-metric-val" style={{ color: selRoute.dep_delay_pct > 20 ? '#dc2626' : '#d97706' }}>
                      {selRoute.dep_delay_pct}%
                    </span>
                  </div>
                </div>

                {/* Performance bar with national avg marker */}
                <div style={{ marginTop:18 }}>
                  <div style={{ display:'flex', justifyContent:'space-between',
                    fontSize:11, color:'var(--text-3)', marginBottom:6 }}>
                    <span>On-time performance</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontWeight:700,
                      color: otpColor(selRoute.on_time_pct) }}>{selRoute.on_time_pct}%</span>
                  </div>
                  <div style={{ height:8, background:'#f1f5f9', borderRadius:4, overflow:'visible', position:'relative' }}>
                    <div style={{
                      width:`${selRoute.on_time_pct}%`, height:'100%',
                      background: otpColor(selRoute.on_time_pct), borderRadius:4,
                      transition:'width 0.4s ease',
                    }}/>
                    {/* National avg reference line */}
                    <div
                      title={`National avg: ${kpis.on_time_pct}%`}
                      style={{
                        position:'absolute', top:-4, bottom:-4,
                        left:`${kpis.on_time_pct}%`,
                        width:2, background:'#64748b', borderRadius:1,
                        transform:'translateX(-50%)',
                      }}
                    />
                  </div>
                  <div style={{ fontSize:10, color:'var(--text-3)', marginTop:5, textAlign:'right' }}>
                    Line = national avg ({kpis.on_time_pct}%)
                  </div>
                </div>

                <button onClick={() => setSel(null)} style={{
                  marginTop:18, width:'100%', padding:'9px 0',
                  border:'1px solid var(--border)', borderRadius:8,
                  background:'var(--bg)', color:'var(--text-2)',
                  fontSize:12, fontWeight:600, cursor:'pointer',
                }}>
                  Clear selection
                </button>
              </>
            )}

            {/* Airport detail */}
            {selAirport && (
              <>
                <div style={{
                  height: 110,
                  borderRadius: 10,
                  backgroundImage: `linear-gradient(to bottom, rgba(10,20,40,0.1), rgba(10,20,40,0.65)), url(${cityPhotoUrl(selAirport.airport, 600)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  marginBottom: 18,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{ position:'absolute', bottom:10, left:12 }}>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:26, fontWeight:700,
                      color:'#fff', textShadow:'0 2px 8px rgba(0,0,0,0.4)' }}>
                      {selAirport.airport}
                    </div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.75)' }}>{selAirport.city}</div>
                  </div>
                </div>
                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase',
                  letterSpacing:'0.8px', color:'var(--text-3)', marginBottom:14 }}>
                  Airport Details
                </div>

                <div style={{ marginBottom:16 }}>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:42, fontWeight:700,
                    color:'var(--text)', lineHeight:1 }}>
                    {selAirport.airport}
                  </div>
                  <div style={{ fontSize:13, color:'var(--text-2)', marginTop:4 }}>
                    {selAirport.city}
                  </div>
                </div>

                <div className="route-metrics-list">
                  <div className="route-metric-row">
                    <span className="route-metric-key">{selAirport._fromRoutes ? 'Flights (top routes)' : 'Departures'}</span>
                    <span className="route-metric-val">{selAirport.departures.toLocaleString()}</span>
                  </div>
                  <div className="route-metric-row">
                    <span className="route-metric-key">On-time Rate</span>
                    <span className="route-metric-val" style={{ color: otpColor(selAirport.on_time_pct) }}>
                      {selAirport.on_time_pct}%
                    </span>
                  </div>
                </div>

                {connectedRoutes.length > 0 && (
                  <div style={{ marginTop:18 }}>
                    <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)',
                      textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:10 }}>
                      Top Routes from/to {selAirport.airport}
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      {connectedRoutes.slice(0,6).map(r => (
                        <div key={r.route}
                          onClick={() => {
                            const idx = routes.indexOf(r)
                            if (idx !== -1) selectRoute(idx)
                          }}
                          style={{
                            display:'flex', justifyContent:'space-between', alignItems:'center',
                            padding:'8px 12px', background:'var(--bg)', borderRadius:8,
                            cursor:'pointer', fontSize:12, border:'1px solid var(--border)',
                          }}
                          onMouseOver={e => e.currentTarget.style.background='#dbeafe'}
                          onMouseOut={e => e.currentTarget.style.background='var(--bg)'}
                        >
                          <span style={{ fontFamily:'var(--font-mono)', fontWeight:700 }}>
                            {r.origin} → {r.dest}
                          </span>
                          <span style={{ fontFamily:'var(--font-mono)', fontWeight:700,
                            color: otpColor(r.on_time_pct) }}>
                            {r.on_time_pct}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={() => setSel(null)} style={{
                  marginTop:18, width:'100%', padding:'9px 0',
                  border:'1px solid var(--border)', borderRadius:8,
                  background:'var(--bg)', color:'var(--text-2)',
                  fontSize:12, fontWeight:600, cursor:'pointer',
                }}>
                  Clear selection
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
