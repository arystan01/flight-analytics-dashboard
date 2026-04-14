import { useState, useRef } from 'react'

// Equirectangular projection: viewBox 0 0 900 450
// Lat 25–49, Lon -124 to -67
const project = (lat, lon) => ({
  x: ((lon + 124) / 57) * 900,
  y: ((49 - lat) / 24) * 450,
})

const RAW = {
  ATL:[33.64,-84.43],LAX:[33.94,-118.41],ORD:[41.97,-87.91],DFW:[32.90,-97.04],
  DEN:[39.86,-104.67],JFK:[40.64,-73.78],SFO:[37.62,-122.38],SEA:[47.45,-122.31],
  LAS:[36.08,-115.15],MCO:[28.43,-81.31],MIA:[25.80,-80.29],PHX:[33.44,-112.01],
  EWR:[40.69,-74.17],MSP:[44.88,-93.22],BOS:[42.37,-71.01],DTW:[42.21,-83.35],
  CLT:[35.21,-80.94],LGA:[40.78,-73.87],PHL:[39.87,-75.24],IAH:[29.99,-95.34],
  SLC:[40.79,-111.98],PDX:[45.59,-122.60],TPA:[27.98,-82.53],MDW:[41.79,-87.75],
  BWI:[39.18,-76.67],IAD:[38.95,-77.46],DCA:[38.85,-77.04],MSY:[29.99,-90.26],
  STL:[38.75,-90.37],MEM:[35.04,-89.98],CVG:[39.05,-84.67],DAY:[39.90,-84.22],
  RDU:[35.88,-78.79],CLE:[41.41,-81.85],CMH:[39.99,-82.89],IND:[39.72,-86.29],
  MKE:[42.95,-87.90],OAK:[37.72,-122.22],SAN:[32.73,-117.19],SMF:[38.69,-121.59],
  HOU:[29.65,-95.28],AUS:[30.20,-97.67],SAT:[29.53,-98.47],ABQ:[35.04,-106.61],
  ELP:[31.81,-106.38],JAX:[30.49,-81.69],TLH:[30.40,-84.35],GNV:[29.69,-82.27],
}

const COORDS = {}
Object.entries(RAW).forEach(([code,[lat,lon]]) => { COORDS[code] = project(lat,lon) })

const CITY = {
  ATL:'Atlanta',LAX:'Los Angeles',ORD:"Chicago O'Hare",DFW:'Dallas–Fort Worth',
  DEN:'Denver',JFK:'New York JFK',SFO:'San Francisco',SEA:'Seattle',
  LAS:'Las Vegas',MCO:'Orlando',MIA:'Miami',PHX:'Phoenix',
  EWR:'Newark',MSP:'Minneapolis',BOS:'Boston',DTW:'Detroit',
  CLT:'Charlotte',LGA:'New York LGA',PHL:'Philadelphia',IAH:'Houston',
  SLC:'Salt Lake City',PDX:'Portland',TPA:'Tampa',MDW:'Chicago Midway',
  BWI:'Baltimore',IAD:'Washington Dulles',DCA:'Washington Reagan',
  MSY:'New Orleans',STL:'St. Louis',MEM:'Memphis',CVG:'Cincinnati',
  RDU:'Raleigh-Durham',CLE:'Cleveland',CMH:'Columbus',IND:'Indianapolis',
  OAK:'Oakland',SAN:'San Diego',HOU:'Houston Hobby',AUS:'Austin',
  SAT:'San Antonio',ABQ:'Albuquerque',JAX:'Jacksonville',
}

function otpColor(pct) {
  if (pct >= 82) return '#34d399'
  if (pct >= 72) return '#fbbf24'
  return '#f87171'
}

function RouteArc({ route }) {
  const from = COORDS[route.origin]
  const to = COORDS[route.dest]
  if (!from || !to) return null
  const cpx = (from.x + to.x) / 2
  const cpy = Math.min(from.y, to.y) - Math.abs(to.x - from.x) * 0.18 - 15
  const path = `M ${from.x} ${from.y} Q ${cpx} ${cpy} ${to.x} ${to.y}`
  const color = otpColor(route.on_time_pct)
  const w = Math.max(0.6, Math.log10(route.total / 100) * 0.7)
  return (
    <path d={path} stroke={color} strokeWidth={w}
      strokeOpacity={0.45} fill="none" filter="url(#arc-glow)" />
  )
}

function AirportDot({ airport, maxDep, onEnter, onLeave, svgRef }) {
  const pos = COORDS[airport.airport]
  if (!pos) return null
  const r = 3 + (airport.departures / maxDep) * 9
  const color = otpColor(airport.on_time_pct)
  const isTop = airport.departures > maxDep * 0.35

  return (
    <g transform={`translate(${pos.x},${pos.y})`}
      onMouseEnter={e => onEnter(airport, e)}
      onMouseLeave={onLeave}
      style={{ cursor: 'pointer' }}>
      {isTop && <circle r={r * 2.8} fill={color} opacity={0.06}>
        <animate attributeName="r" values={`${r*2.2};${r*3.5};${r*2.2}`} dur="3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.08;0.02;0.08" dur="3s" repeatCount="indefinite"/>
      </circle>}
      <circle r={r * 1.6} fill={color} opacity={0.18} />
      <circle r={r} fill={color} opacity={0.95} />
      {airport.departures > maxDep * 0.2 && (
        <text y={-r - 5} textAnchor="middle" fill="#94a3b8" fontSize="9"
          fontFamily="Space Mono, monospace" fontWeight="700">
          {airport.airport}
        </text>
      )}
    </g>
  )
}

export default function AirportMap({ origins, routes }) {
  const [hovered, setHovered] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const wrapRef = useRef(null)

  if (!origins || !routes) return null

  const maxDep = Math.max(...origins.map(a => a.departures))

  const handleEnter = (airport, e) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (rect) {
      setTooltipPos({ x: e.clientX - rect.left + 14, y: e.clientY - rect.top - 10 })
    }
    setHovered(airport)
  }

  return (
    <div ref={wrapRef} className="map-card" style={{ position: 'relative' }}>
      <div className="card-title">US Airport Network — January 2019</div>

      <svg viewBox="0 0 900 450" className="airport-map-svg">
        <defs>
          <filter id="arc-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="dot-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <pattern id="grid-dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.6" fill="#1e293b"/>
          </pattern>
          <radialGradient id="bg-glow" cx="70%" cy="40%">
            <stop offset="0%" stopColor="rgba(56,189,248,0.04)"/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
        </defs>

        {/* Background */}
        <rect width="900" height="450" fill="#020817"/>
        <rect width="900" height="450" fill="url(#grid-dots)"/>
        <rect width="900" height="450" fill="url(#bg-glow)"/>

        {/* Lat/lon grid lines */}
        {[30,35,40,45].map(lat => {
          const y = ((49-lat)/24)*450
          return <line key={lat} x1="0" y1={y} x2="900" y2={y}
            stroke="#1e293b" strokeWidth="1" strokeDasharray="4 8"/>
        })}
        {[-120,-110,-100,-90,-80,-70].map(lon => {
          const x = ((lon+124)/57)*900
          return <line key={lon} x1={x} y1="0" x2={x} y2="450"
            stroke="#1e293b" strokeWidth="1" strokeDasharray="4 8"/>
        })}

        {/* Route arcs */}
        {routes.slice(0, 20).map(r => <RouteArc key={r.route} route={r}/>)}

        {/* Airport dots */}
        {origins.map(a => (
          <AirportDot key={a.airport} airport={a} maxDep={maxDep}
            onEnter={handleEnter} onLeave={() => setHovered(null)} svgRef={wrapRef}/>
        ))}
      </svg>

      {/* Hover tooltip */}
      {hovered && (
        <div className="map-tooltip" style={{ left: tooltipPos.x, top: tooltipPos.y }}>
          <div className="map-tooltip-airport">{hovered.airport}</div>
          <div className="map-tooltip-city">{CITY[hovered.airport] || hovered.city}</div>
          <div className="map-tooltip-row">
            <span>Departures</span>
            <span className="map-tooltip-val" style={{color:'#38bdf8'}}>{hovered.departures.toLocaleString()}</span>
          </div>
          <div className="map-tooltip-row">
            <span>On-time</span>
            <span className="map-tooltip-val" style={{color: otpColor(hovered.on_time_pct)}}>{hovered.on_time_pct}%</span>
          </div>
          <div className="map-tooltip-row">
            <span>Dep delay</span>
            <span className="map-tooltip-val" style={{color:'#fbbf24'}}>{hovered.dep_delay_pct}%</span>
          </div>
          <div className="map-tooltip-row">
            <span>Cancelled</span>
            <span className="map-tooltip-val" style={{color:'#f87171'}}>{hovered.cancellation_pct}%</span>
          </div>
          <div className="map-tooltip-row">
            <span>Top route →</span>
            <span className="map-tooltip-val">{hovered.top_dest}</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="map-legend">
        <div className="map-legend-item">
          <div className="map-legend-dot" style={{background:'#34d399'}}/>
          <span>On-time ≥ 82%</span>
        </div>
        <div className="map-legend-item">
          <div className="map-legend-dot" style={{background:'#fbbf24'}}/>
          <span>On-time 72–81%</span>
        </div>
        <div className="map-legend-item">
          <div className="map-legend-dot" style={{background:'#f87171'}}/>
          <span>On-time &lt; 72%</span>
        </div>
        <div className="map-legend-item" style={{marginLeft:'auto', color:'#475569'}}>
          <span>Dot size = departure volume · Arc = top routes</span>
        </div>
      </div>
    </div>
  )
}
