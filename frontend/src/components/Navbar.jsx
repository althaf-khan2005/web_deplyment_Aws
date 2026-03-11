import './Navbar.css'

function Navbar({ activePage, setActivePage, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-content">
        <div className="logo">🎵 MyApp</div>
        <div className="nav-links">
          <button 
            className={activePage === 'home' ? 'active' : ''} 
            onClick={() => setActivePage('home')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.5 3.247a1 1 0 00-1 0L4 7.577V20h4.5v-6a1 1 0 011-1h5a1 1 0 011 1v6H20V7.577l-7.5-4.33z"/>
            </svg>
            Home
          </button>
          <button 
            className={activePage === 'search' ? 'active' : ''} 
            onClick={() => setActivePage('search')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 101.414-1.414l-4.344-4.344a9.157 9.157 0 002.077-5.816c0-5.14-4.226-9.28-9.407-9.28zm-7.407 9.279c0-4.006 3.302-7.28 7.407-7.28s7.407 3.274 7.407 7.28-3.302 7.279-7.407 7.279-7.407-3.273-7.407-7.28z"/>
            </svg>
            Search
          </button>
          <button 
            className={activePage === 'profile' ? 'active' : ''} 
            onClick={() => setActivePage('profile')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a5 5 0 100 10 5 5 0 000-10zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"/>
            </svg>
            Profile
          </button>
        </div>
        <div className="nav-links" style={{marginTop: 'auto', paddingTop: '20px'}}>
          <button onClick={onLogout} style={{color: '#b3b3b3'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m5 5H9"/>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
