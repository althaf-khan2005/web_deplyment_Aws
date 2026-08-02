import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

/**
 * ServiceStatus - Shows a banner when the backend is down
 * 
 * Answers the user's questions:
 * (1) Is it down? → Polls /health every 10s
 * (2) What's the issue? → Shows which dependency failed (DB, server, etc.)
 * (4) How to display to users? → Shows a non-intrusive banner at the top
 * (5) When is it back? → Automatically detects recovery and shows "Back online!" message
 */
function ServiceStatus() {
  const [status, setStatus] = useState('checking') // 'healthy' | 'unhealthy' | 'unreachable' | 'checking'
  const [details, setDetails] = useState(null)
  const [wasDown, setWasDown] = useState(false)
  const [showRecovery, setShowRecovery] = useState(false)
  const intervalRef = useRef(null)

  const checkHealth = async () => {
    try {
      const res = await axios.get(`${API_URL}/health`, { timeout: 5000 })
      const newStatus = res.data.status

      // Detect recovery: was down, now healthy
      if ((status === 'unhealthy' || status === 'unreachable') && newStatus === 'healthy') {
        setShowRecovery(true)
        setTimeout(() => setShowRecovery(false), 5000) // Show "back online" for 5s
      }

      setStatus(newStatus)
      setDetails(res.data.checks)
    } catch (error) {
      // If we can't reach the backend at all
      if (status === 'healthy') {
        setWasDown(true)
      }
      setStatus('unreachable')
      setDetails({ error: 'Cannot reach server' })
    }
  }

  useEffect(() => {
    // Check immediately on mount
    checkHealth()

    // Poll every 10 seconds
    intervalRef.current = setInterval(checkHealth, 10000)

    return () => clearInterval(intervalRef.current)
  }, [status])

  // Don't show anything when healthy (unless just recovered)
  if (status === 'healthy' && !showRecovery) return null
  if (status === 'checking') return null

  return (
    <div style={styles.container} role="alert" aria-live="polite">
      {showRecovery && status === 'healthy' && (
        <div style={styles.recoveryBanner}>
          ✅ Services are back online!
        </div>
      )}

      {status === 'unreachable' && (
        <div style={styles.errorBanner}>
          <span style={styles.icon}>⚠️</span>
          <div>
            <strong>Service Unavailable</strong>
            <p style={styles.detail}>
              We're having trouble connecting to our servers. Your data is safe — we're working on it.
            </p>
          </div>
        </div>
      )}

      {status === 'unhealthy' && (
        <div style={styles.warningBanner}>
          <span style={styles.icon}>🔧</span>
          <div>
            <strong>Partial Outage</strong>
            <p style={styles.detail}>
              {details?.database?.status === 'unhealthy'
                ? 'Database is experiencing issues. Some features may be unavailable.'
                : 'Some services are degraded. We are investigating.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    fontSize: '14px',
  },
  warningBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    backgroundColor: '#fd7e14',
    color: 'white',
    fontSize: '14px',
  },
  recoveryBanner: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  icon: {
    fontSize: '20px',
  },
  detail: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    opacity: 0.9,
  },
}

export default ServiceStatus
