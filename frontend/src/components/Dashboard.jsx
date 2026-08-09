import './Dashboard.css'
import Navbar from './Navbar'
import SystemHealth from './SystemHealth'
import InstaNotes from './InstaNotes'
import { useState, useEffect } from 'react'

function Dashboard({ email, onLogout }) {
  const [activePage, setActivePage] = useState('home')
  const [greeting, setGreeting] = useState('')
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')

    setTimeout(() => setAnimate(true), 100)
  }, [])

  useEffect(() => {
    setAnimate(false)
    setTimeout(() => setAnimate(true), 50)
  }, [activePage])

  return (
    <>
      <Navbar activePage={activePage} setActivePage={setActivePage} onLogout={onLogout} />
      <div className="dashboard">
        <div className={`dashboard-content-wrapper ${animate ? 'animate-in' : ''}`}>
          {activePage === 'home' && (
            <>
              <div className="welcome-section">
                <div className="welcome-text">
                  <span className="greeting-label">{greeting}</span>
                  <h1 className="welcome-title">Welcome back! 👋</h1>
                  <p className="welcome-email">{email}</p>
                </div>
                <div className="welcome-decoration">
                  <div className="deco-circle deco-1"></div>
                  <div className="deco-circle deco-2"></div>
                  <div className="deco-circle deco-3"></div>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card stat-card-1">
                  <div className="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">99.9%</span>
                    <span className="stat-label">Uptime</span>
                  </div>
                </div>
                <div className="stat-card stat-card-2">
                  <div className="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">45ms</span>
                    <span className="stat-label">Response</span>
                  </div>
                </div>
                <div className="stat-card stat-card-3">
                  <div className="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">Active</span>
                    <span className="stat-label">Security</span>
                  </div>
                </div>
                <div className="stat-card stat-card-4">
                  <div className="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">3</span>
                    <span className="stat-label">Services</span>
                  </div>
                </div>
              </div>

              <div className="quick-actions">
                <h3 className="section-title">Quick Actions</h3>
                <div className="actions-grid">
                  <button className="action-card" onClick={() => setActivePage('profile')}>
                    <div className="action-icon action-icon-purple">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <span>Profile Settings</span>
                  </button>
                  <button className="action-card" onClick={() => setActivePage('search')}>
                    <div className="action-icon action-icon-blue">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                    </div>
                    <span>Search</span>
                  </button>
                  <button className="action-card">
                    <div className="action-icon action-icon-green">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    </div>
                    <span>Deployments</span>
                  </button>
                  <button className="action-card">
                    <div className="action-icon action-icon-orange">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                      </svg>
                    </div>
                    <span>Analytics</span>
                  </button>
                </div>
              </div>

              <InstaNotes />

              <SystemHealth />
            </>
          )}

          {activePage === 'search' && (
            <div className="page-section">
              <div className="page-header">
                <h2>Search</h2>
                <p>Find anything across your workspace</p>
              </div>
              <div className="search-container">
                <div className="search-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input type="text" placeholder="Search deployments, settings, logs..." />
                </div>
                <div className="search-hints">
                  <span className="hint-tag">Deployments</span>
                  <span className="hint-tag">Logs</span>
                  <span className="hint-tag">Settings</span>
                  <span className="hint-tag">Users</span>
                </div>
              </div>
            </div>
          )}

          {activePage === 'profile' && (
            <div className="page-section">
              <div className="page-header">
                <h2>Profile</h2>
                <p>Manage your account settings</p>
              </div>
              <div className="profile-card">
                <div className="profile-avatar">
                  <span>{email[0].toUpperCase()}</span>
                </div>
                <div className="profile-info">
                  <h3>{email}</h3>
                  <span className="profile-badge">Pro Account</span>
                </div>
              </div>
              <div className="profile-details">
                <div className="detail-row">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Role</span>
                  <span className="detail-value">Administrator</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status</span>
                  <span className="detail-value status-active">● Active</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Dashboard
