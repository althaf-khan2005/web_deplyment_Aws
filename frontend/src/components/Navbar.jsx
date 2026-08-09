import './Navbar.css'

function Navbar({ activePage, setActivePage, onLogout, email }) {
  return (
    <>
      {/* Top Header - Instagram style */}
      <header className="ig-top-header">
        <h1 className="ig-header-logo">MusicGram</h1>
        <div className="ig-header-actions">
          <button className="ig-header-btn" onClick={() => setActivePage('create')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </button>
          <button className="ig-header-btn" onClick={onLogout}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Bottom Navigation - Instagram style */}
      <nav className="ig-bottom-nav">
        <button className={activePage === 'home' ? 'active' : ''} onClick={() => setActivePage('home')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={activePage === 'home' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </button>
        <button className={activePage === 'search' ? 'active' : ''} onClick={() => setActivePage('search')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={activePage === 'search' ? '3' : '2'}>
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
        <button className={activePage === 'songs' ? 'active' : ''} onClick={() => setActivePage('songs')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={activePage === 'songs' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
        </button>
        <button className={activePage === 'messages' ? 'active' : ''} onClick={() => setActivePage('messages')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </button>
        <button className={activePage === 'profile' ? 'active' : ''} onClick={() => setActivePage('profile')}>
          <div className={`ig-nav-avatar ${activePage === 'profile' ? 'active-ring' : ''}`}>
            {email?.[0]?.toUpperCase()}
          </div>
        </button>
      </nav>
    </>
  )
}

export default Navbar
