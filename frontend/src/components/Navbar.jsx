import './Navbar.css'

function Navbar({ activePage, setActivePage, onLogout, email }) {
  return (
    <nav className="navbar">
      <div className="nav-content">
        <div className="nav-brand">
          <div className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
          <span className="brand-name">MusicGram</span>
        </div>

        <div className="nav-menu">
          <button
            className={`nav-item ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => setActivePage('home')}
          >
            <span className="nav-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill={activePage === 'home' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </span>
            <span className="nav-label">Home</span>
            {activePage === 'home' && <span className="active-indicator"></span>}
          </button>

          <button
            className={`nav-item ${activePage === 'create' ? 'active' : ''}`}
            onClick={() => setActivePage('create')}
          >
            <span className="nav-icon create-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </span>
            <span className="nav-label">Create</span>
            {activePage === 'create' && <span className="active-indicator"></span>}
          </button>

          <button
            className={`nav-item ${activePage === 'profile' ? 'active' : ''}`}
            onClick={() => setActivePage('profile')}
          >
            <span className="nav-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill={activePage === 'profile' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </span>
            <span className="nav-label">Profile</span>
            {activePage === 'profile' && <span className="active-indicator"></span>}
          </button>
        </div>

        <div className="nav-footer">
          <div className="nav-divider"></div>
          <button className="nav-item logout-item" onClick={onLogout}>
            <span className="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
