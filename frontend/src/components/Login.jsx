import { useState } from 'react'
import axios from 'axios'
import './Auth.css'

function Login({ setUser, setIsLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email,
        password
      })
      
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('email', res.data.email)
      setUser({ email: res.data.email })
    } catch (err) {
      if (!err.response) {
        setError('Unable to reach server. Please check your connection or try again later.')
      } else if (err.response.status === 503) {
        setError('Service is temporarily unavailable. Please try again in a moment.')
      } else {
        setError(err.response?.data?.message || 'Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-branding">
            <div className="brand-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 className="brand-title">MyApp</h1>
            <p className="brand-subtitle">Your all-in-one deployment platform</p>
            <div className="brand-features">
              <div className="feature-item">
                <span className="feature-icon">🚀</span>
                <span>Fast Deployments</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>Secure & Reliable</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span>Real-time Monitoring</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Welcome Back</h2>
              <p className="subtitle">Sign in to continue to your dashboard</p>
            </div>
            
            <form onSubmit={handleSubmit} className="auth-form">
              <div className={`material-input ${emailFocused || email ? 'focused' : ''}`}>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  aria-label="Email address"
                />
                <label htmlFor="email">Email address</label>
                <div className="input-line"></div>
                <span className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
              </div>
              
              <div className={`material-input ${passwordFocused || password ? 'focused' : ''}`}>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  aria-label="Password"
                />
                <label htmlFor="password">Password</label>
                <div className="input-line"></div>
                <span className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </span>
              </div>
              
              {error && (
                <div className="error-message" role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}
              
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? (
                  <span className="btn-loader"></span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </button>
            </form>
            
            <div className="auth-footer">
              <p className="switch-text">
                Don't have an account?{' '}
                <button type="button" onClick={() => setIsLogin(false)} className="switch-btn">
                  Create Account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
