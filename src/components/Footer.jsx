export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--surface)',
      marginTop: 64,
      padding: '32px 0',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 32,
          marginBottom: 28,
        }}>
          {/* Brand */}
          <div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700,
              color: 'var(--text)', marginBottom: 6 }}>
              FlightAnalytics
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.7 }}>
              US domestic aviation performance analysis covering
              583,985 flights across 346 airports in January 2019.
            </div>
          </div>

          {/* Data source */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.7px', color: 'var(--text-3)', marginBottom: 10 }}>
              Data Source
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.7 }}>
              Bureau of Transportation Statistics (BTS)<br/>
              On-Time Performance dataset, January 2019<br/>
              <span style={{ color: 'var(--text-3)' }}>Form 41, Schedule T-100</span>
            </div>
          </div>

          {/* Methodology */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.7px', color: 'var(--text-3)', marginBottom: 10 }}>
              Methodology
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.7 }}>
              On-time = arrived within 15 min of schedule<br/>
              Scope: US domestic flights only<br/>
              <span style={{ color: 'var(--text-3)' }}>Single-month snapshot (Jan 2019)</span>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 18,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
            Final project · Data Analytics course · Dataset: Jan_2019_ontime.csv (583,985 rows, 73 MB)
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              ['583,985', 'flights'],
              ['346', 'airports'],
              ['5,535', 'routes'],
              ['17', 'airlines'],
            ].map(([val, lbl]) => (
              <div key={lbl} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                  color: 'var(--blue)' }}>{val}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
