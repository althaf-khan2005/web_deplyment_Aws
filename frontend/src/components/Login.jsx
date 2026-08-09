import { useState } from 'react'
import axios from 'axios'
import './Auth.css'

function Login({ setUser, setIsLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('email', res.data.email)
      setUser({ email: res.data.email })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ig-auth-page">
      <div className="ig-auth-container">
        {/* Phone mockup - left side (desktop only) */}
        <div className="ig-phone-mockup">
          <div className="ig-phone-frame">
            <div className="ig-phone-screen">
              <div className="ig-phone-content">
                <div className="ig-phone-header">🎵</div>
                <div className="ig-phone-post">
                  <div className="ig-phone-img"></div>
                  <div className="ig-phone-bar"></div>
                  <div className="ig-phone-bar short"></div>
                </div>
                <div className="ig-phone-post">
                  <div className="ig-phone-audio"></div>
                  <div className="ig-phone-bar"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="ig-auth-right">
          <div className="ig-auth-box">
            <h1 className="ig-auth-logo">MusicGram</h1>

            <form onSubmit={handleSubmit} className="ig-auth-form">
              <div className="ig-input-wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="ig-input"
                  aria-label="Email"
                />
              </div>

              <div className="ig-input-wrapper">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="ig-input"
                  aria-label="Password"
                />
              </div>

              {error && <div className="ig-error">{error}</div>}

              <button type="submit" className="ig-submit-btn" disabled={loading || !email || !password}>
                {loading ? <span className="ig-btn-spinner"></span> : 'Log In'}
              </button>
            </form>

            <div className="ig-divider">
              <div className="ig-divider-line"></div>
              <span>OR</span>
              <div className="ig-divider-line"></div>
            </div>

            <button className="ig-social-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Log in with GitHub
            </button>
          </div>

          <div className="ig-auth-switch">
            Don't have an account?{' '}
            <button onClick={() => setIsLogin(false)}>Sign up</button>
          </div>

          <div className="ig-get-app">
            <p>Get the app.</p>
            <div className="ig-app-badges">
              <div className="ig-badge">🎵 MusicGram Web</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
