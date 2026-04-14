import { useState, useEffect } from 'react'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Overview from './pages/Overview'
import AirlinesPage from './pages/AirlinesPage'
import AirportsPage from './pages/AirportsPage'
import RoutesPage from './pages/RoutesPage'
import TimingPage from './pages/TimingPage'

export default function App() {
  const [data, setData] = useState(null)
  const [fetchError, setFetchError] = useState(null)
  const [page, setPage] = useState('overview')
  const [showTop, setShowTop] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('dark') === '1')

  // Apply dark mode class to html element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('dark', dark ? '1' : '0')
  }, [dark])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const url = import.meta.env.BASE_URL + 'data.json'
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} fetching ${url}`)
        return r.json()
      })
      .then(setData)
      .catch(err => setFetchError(err.message))
  }, [])

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  if (fetchError) {
    return (
      <div className="loading">
        <span style={{ color: '#dc2626', fontSize: 14, textAlign: 'center', maxWidth: 400 }}>
          ⚠️ Failed to load data: {fetchError}
        </span>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="loading">
        <div className="spinner"/>
        <span style={{ color: '#475569', fontSize: 13 }}>Loading flight data…</span>
      </div>
    )
  }

  return (
    <>
      <Nav active={page} onSelect={setPage} dark={dark} onToggleDark={() => setDark(d => !d)} />
      <div key={page} className="page-transition">
        {page === 'overview' && <Overview data={data}/>}
        {page === 'airlines' && <AirlinesPage data={data}/>}
        {page === 'airports' && <AirportsPage data={data}/>}
        {page === 'routes'   && <RoutesPage data={data}/>}
        {page === 'timing'   && <TimingPage data={data}/>}
      </div>

      <Footer />

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          position: 'fixed', bottom: 28, right: 28,
          width: 42, height: 42, borderRadius: '50%',
          background: 'var(--blue)', color: '#fff',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
          opacity: showTop ? 1 : 0,
          transform: showTop ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.2s, transform 0.2s',
          pointerEvents: showTop ? 'auto' : 'none',
          zIndex: 200,
        }}
        title="Back to top"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
      </button>
    </>
  )
}
