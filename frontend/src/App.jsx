import { useState, useEffect } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [isLogin, setIsLogin] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const email = localStorage.getItem('email')
    if (token && email) {
      setUser({ email })
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    setUser(null)
  }

  if (user) {
    return <Dashboard email={user.email} onLogout={handleLogout} />
  }

  return (
    <div className="container">
      {isLogin ? (
        <Login setUser={setUser} setIsLogin={setIsLogin} />
      ) : (
        <Register setUser={setUser} setIsLogin={setIsLogin} />
      )}
    </div>
  )
}

export default App
