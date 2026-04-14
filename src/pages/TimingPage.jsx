import DelayByTimeBlock from '../components/DelayByTimeBlock'
import WeeklyPattern from '../components/WeeklyPattern'
import DailyTrend from '../components/DailyTrend'
import { runwayPhotoUrl } from '../cityPhotos'

function otpColor(pct) {
  if (pct >= 78) return '#16a34a'
  if (pct >= 74) return '#d97706'
  return '#dc2626'
}

export default function TimingPage({ data }) {
  const { by_time_block, by_day_of_week, by_day_of_month, by_distance_bucket } = data
  const bestHour  = by_time_block.reduce((b, t) => t.delay_pct < b.delay_pct ? t : b)
  const worstHour = by_time_block.reduce((w, b) => b.delay_pct > w.delay_pct ? b : w)
  const bestDay   = by_day_of_week.reduce((b, d) => d.on_time_pct > b.on_time_pct ? d : b)
  const worstDay  = by_day_of_week.reduce((w, d) => d.on_time_pct < w.on_time_pct ? d : w)

  const TIPS = [
    {
      bar: '#16a34a', label: 'Best Time to Fly',
      heading: `Depart at ${bestHour.label}`,
      body: `Early morning departures had the lowest delay rate at just ${bestHour.delay_pct}%. Book the first flight of the day — aircraft are freshest and delays haven't cascaded yet.`,
    },
    {
      bar: '#dc2626', label: 'Time to Avoid',
      heading: `Avoid ${worstHour.label} departures`,
      body: `Evening departures peak at ${worstHour.delay_pct}% delay rate. Day-long delays compound — aircraft are late, gates are busy, and crews approach hour limits.`,
    },
    {
      bar: '#2563eb', label: 'Best Day',
      heading: `Fly on ${bestDay.day}`,
      body: `${bestDay.day} had the highest on-time rate of ${bestDay.on_time_pct}%. Mid-week travel typically experiences less congestion and fewer delays.`,
    },
    {
      bar: '#d97706', label: 'Busiest Day',
      heading: `Careful on ${worstDay.day}`,
      body: `${worstDay.day} had the lowest on-time rate at ${worstDay.on_time_pct}%. Weekend travel surges create bottlenecks across the national airspace system.`,
    },
  ]

  return (
    <div className="page">
      <div className="page-inner">

        {/* Photo hero */}
        <div style={{
          height: 200,
          borderRadius: 16,
          backgroundImage: `linear-gradient(to right, rgba(10,20,40,0.88) 0%, rgba(10,20,40,0.50) 60%, rgba(10,20,40,0.15) 100%), url(${runwayPhotoUrl()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 70%',
          display: 'flex',
          alignItems: 'center',
          padding: '0 44px',
          marginBottom: 32,
          overflow: 'hidden',
          borderRadius: 16,
        }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase',
              letterSpacing:'1px', color:'rgba(255,255,255,0.6)', marginBottom:8 }}>
              Time Intelligence · January 2019
            </div>
            <div style={{ fontFamily:'var(--font-head)', fontSize:36, fontWeight:700,
              color:'#fff', lineHeight:1.1, marginBottom:10 }}>
              When to Fly
            </div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', maxWidth:440, lineHeight:1.6 }}>
              Departure hour and day of week have a dramatic impact on whether your flight
              leaves on time — or sits on the tarmac for hours.
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="time-tips">
          {TIPS.map((tip, i) => (
            <div className="time-tip" key={i}>
              <div className="time-tip-bar" style={{ background: tip.bar }}/>
              <div style={{ paddingLeft: 8 }}>
                <div className="time-tip-label" style={{ color: tip.bar }}>{tip.label}</div>
                <div className="time-tip-heading">{tip.heading}</div>
                <div className="time-tip-body">{tip.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Delay curve */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Delays triple from 6am to 7pm — book the first flight of the day</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12, marginTop: -4 }}>
            Departure delay rate by hour · {worstHour.delay_pct}% peak at {worstHour.label} vs {bestHour.delay_pct}% at {bestHour.label}
          </div>
          <DelayByTimeBlock data={by_time_block}/>
        </div>

        <div className="grid-2" style={{ marginBottom: 16 }}>
          <div className="card">
            <div className="card-title">Saturday is the most reliable day; Thursday the worst</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12, marginTop: -4 }}>
              Flight volume &amp; on-time % by day of week
            </div>
            <WeeklyPattern data={by_day_of_week}/>
          </div>

          {/* Calendar heatmap */}
          <div className="card">
            <div className="card-title">Jan 7–11 worst week — storms hit the Northeast corridor</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8, marginTop: -4 }}>
              Daily on-time % heatmap · January 2019
            </div>
            <div className="cal-grid" style={{ marginTop: 8 }}>
              {['M','T','W','T','F','S','S'].map((d, i) => (
                <div key={i} className="cal-header">{d}</div>
              ))}
              {/* Jan 2019 starts Tuesday (offset 1) */}
              <div/>
              {by_day_of_month.map(d => {
                const otp = d.on_time_pct
                const [bg, color] = otp >= 82
                  ? ['#dcfce7','#16a34a']
                  : otp >= 72
                  ? ['#fef3c7','#d97706']
                  : ['#fee2e2','#dc2626']
                return (
                  <div key={d.day} className="cal-cell"
                    style={{ background: bg }}
                    title={`Jan ${d.day}: ${d.on_time_pct}% on-time`}>
                    <div className="cal-day">{d.day}</div>
                    <div className="cal-val" style={{ color }}>{d.on_time_pct}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ display:'flex', gap:14, marginTop:12, justifyContent:'center' }}>
              {[['#16a34a','≥ 82%'],['#d97706','72–81%'],['#dc2626','< 72%']].map(([c,l]) => (
                <div key={l} style={{ display:'flex', alignItems:'center', gap:5,
                  fontSize:10, color:'var(--text-3)' }}>
                  <div style={{ width:10, height:10, borderRadius:2, background:c+'55',
                    border:`1px solid ${c}` }}/>
                  {l}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Mid-month recovery after a rough start — daily Jan 2019</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12, marginTop: -4 }}>
            On-time % and departure delay % · all 31 days of January
          </div>
          <DailyTrend data={by_day_of_month}/>
        </div>

        {/* Distance bucket chart */}
        <div className="section-hd">
          <div className="section-title">Flight distance barely affects on-time rate</div>
          <div className="section-sub">On-time % and flight volume by distance bucket — short-haul slightly outperforms long-haul</div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(by_distance_bucket || []).map((bucket, i) => {
              const maxTotal = Math.max(...by_distance_bucket.map(b => b.total))
              const color = otpColor(bucket.on_time_pct)
              return (
                <div key={bucket.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'baseline', marginBottom: 6, fontSize: 12 }}>
                    <span style={{ color: 'var(--text-2)', fontWeight: 600, minWidth: 120 }}>
                      {bucket.label}
                    </span>
                    <div style={{ display: 'flex', gap: 20 }}>
                      <span style={{ color: 'var(--text-3)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                        {bucket.total.toLocaleString()} flights
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700,
                        color, minWidth: 46, textAlign: 'right' }}>
                        {bucket.on_time_pct}%
                      </span>
                    </div>
                  </div>
                  {/* Volume bar (grey) with OTP overlay (colored) */}
                  <div style={{ height: 20, background: 'var(--bg)', borderRadius: 5,
                    overflow: 'hidden', position: 'relative' }}>
                    {/* Volume */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      width: `${(bucket.total / maxTotal) * 100}%`,
                      background: '#e2e8f0', borderRadius: 5,
                    }}/>
                    {/* OTP fill inside volume bar */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      width: `${(bucket.on_time_pct / 100) * (bucket.total / maxTotal) * 100}%`,
                      background: color, borderRadius: 5, opacity: 0.85,
                    }}/>
                    {/* OTP label inside bar */}
                    <div style={{
                      position: 'absolute', right: 8, top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700,
                      color: 'var(--text-3)',
                    }}>
                      {bucket.on_time_pct}% on-time
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 18, fontSize: 11, color: 'var(--text-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 16, height: 8, background: '#e2e8f0', borderRadius: 2 }}/>
              Total flights (bar width)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 16, height: 8, background: '#16a34a', borderRadius: 2, opacity: 0.85 }}/>
              On-time portion (color fill)
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
