import './Dashboard.css'
import Navbar from './Navbar'
import { useState } from 'react'

function Dashboard({ email, onLogout }) {
  const [activePage, setActivePage] = useState('home')

  return (
    <>
      <Navbar activePage={activePage} setActivePage={setActivePage} onLogout={onLogout} />
      <div className="dashboard">
        <div className="dashboard-card">
          {activePage === 'home' && (
            <>
              <div className="welcome-header">
                <h1>Welcome to Your Dashboard! 🎉</h1>
                <p className="user-email">{email}</p>
              </div>
              
              <div className="dashboard-content">
                <p>You have successfully logged in to your account.</p>
                <p>This is your personal space where you can manage everything.</p>
                <p>Explore the navigation menu to access different features.</p>
                <p>Stay connected and enjoy your experience!</p>
              </div>
            </>
          )}

          {activePage === 'search' && (
            <div className="page-content">
              <h2>🔍 Search</h2>
              <p>Search functionality coming soon...</p>
              <p>You'll be able to search through all your content here.</p>
            </div>
          )}

          {activePage === 'profile' && (
            <div className="page-content">
              <h2>👤 Profile</h2>
              <p>Email: {email}</p>
              <p>Manage your account settings and preferences here.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Dashboard
