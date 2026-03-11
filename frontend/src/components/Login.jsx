import { useState } from 'react'
import axios from 'axios'
import './Auth.css'

function Login({ setUser, setIsLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      })
      
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('email', res.data.email)
      setUser({ email: res.data.email })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="auth-card">
      <h2>Welcome Back</h2>
      <p className="subtitle">Login to your account</p>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <button type="submit" className="btn">Login</button>
      </form>
      
      <p className="switch-text">
        Don't have an account?{' '}
        <span onClick={() => setIsLogin(false)}>Register</span>
      </p>
    </div>
  )
}

export default Login
