import './Navbar.css'

function Navbar({ activePage, setActivePage, onLogout, email }) {
  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="ig-sidebar">
        <div className="ig-sidebar-content">
          <div className="ig-logo" onClick={() => setActivePage('home')}>
            <span className="ig-logo-text">MusicGram</span>
          </div>

          <div className="ig-nav-items">
            <button className={`ig-nav-btn ${activePage === 'home' ? 'active' : ''}`} onClick={() => setActivePage('home')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill={activePage === 'home' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>Home</span>
            </button>

            <button className={`ig-nav-btn ${activePage === 'search' ? 'active' : ''}`} onClick={() => setActivePage('search')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={activePage === 'search' ? '3' : '2'}>
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span>Explore</span>
            </button>

            <button className={`ig-nav-btn ${activePage === 'create' ? 'active' : ''}`} onClick={() => setActivePage('create')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              <span>Create</span>
            </button>

            <button className={`ig-nav-btn ${activePage === 'profile' ? 'active' : ''}`} onClick={() => setActivePage('profile')}>
              <div className={`ig-nav-avatar ${activePage === 'profile' ? 'active-avatar' : ''}`}>
                {email?.[0]?.toUpperCase() || 'U'}
              </div>
              <span>Profile</span>
            </button>
          </div>

          <div className="ig-nav-footer">
            <button className="ig-nav-btn" onClick={onLogout}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="3" x2="21" y2="3"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="21" x2="21" y2="21"/>
              </svg>
              <span>More</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="ig-bottombar">
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
        <button className={activePage === 'create' ? 'active' : ''} onClick={() => setActivePage('create')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        </button>
        <button className={activePage === 'profile' ? 'active' : ''} onClick={() => setActivePage('profile')}>
          <div className={`ig-bottom-avatar ${activePage === 'profile' ? 'active-avatar' : ''}`}>
            {email?.[0]?.toUpperCase() || 'U'}
          </div>
        </button>
      </nav>
    </>
  )
}

export default Navbar
