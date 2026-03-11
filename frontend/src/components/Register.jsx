import { useState } from 'react'
import axios from 'axios'
import './Auth.css'

function Register({ setUser, setIsLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        email,
        password
      })
      
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('email', res.data.email)
      setUser({ email: res.data.email })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="auth-card">
      <h2>Create Account</h2>
      <p className="subtitle">Sign up to get started</p>
      
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
            placeholder="Create a password"
            required
          />
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <button type="submit" className="btn">Register</button>
      </form>
      
      <p className="switch-text">
        Already have an account?{' '}
        <span onClick={() => setIsLogin(true)}>Login</span>
      </p>
    </div>
  )
}

export default Register
