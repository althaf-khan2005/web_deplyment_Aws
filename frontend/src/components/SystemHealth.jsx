import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

/**
 * SystemHealth - Dashboard widget showing real-time service status
 * Shows: Backend status, Database status, response times, uptime
 */
function SystemHealth() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState(null)
  const [history, setHistory] = useState([]) // last 10 checks

  const checkHealth = async () => {
    try {
      const res = await axios.get(`${API_URL}/health`, { timeout: 5000 })
      const data = {
        ...res.data,
        reachable: true,
      }
      setHealth(data)
      setHistory(prev => [...prev.slice(-9), { time: new Date(), status: data.status }])
    } catch (error) {
      const data = {
        status: 'unreachable',
        reachable: false,
        checks: { server: { status: 'unreachable' }, database: { status: 'unknown' } },
      }
      setHealth(data)
      setHistory(prev => [...prev.slice(-9), { time: new Date(), status: 'unreachable' }])
    }
    setLastChecked(new Date())
    setLoading(false)
  }

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 15000) // Poll every 15s
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return '#1db954'
      case 'unhealthy': return '#fd7e14'
      case 'unreachable': return '#dc3545'
      default: return '#6c757d'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return '🟢'
      case 'unhealthy': return '🟠'
      case 'unreachable': return '🔴'
      default: return '⚪'
    }
  }

  // Convert raw technical errors to user-friendly messages
  const getFriendlyError = (rawError) => {
    if (!rawError) return 'Unknown error'
    if (rawError.includes("Can't reach database server")) return 'Database server is unreachable'
    if (rawError.includes('Connection refused')) return 'Database connection refused'
    if (rawError.includes('timeout') || rawError.includes('Timeout')) return 'Database connection timed out'
    if (rawError.includes('authentication') || rawError.includes('password')) return 'Database authentication failed'
    if (rawError.includes('ENOTFOUND')) return 'Database host not found'
    if (rawError.includes('ECONNRESET')) return 'Database connection was reset'
    // Fallback: show first 60 characters max
    return rawError.split('\n')[0].substring(0, 60)
  }

  const formatUptime = (seconds) => {
    if (!seconds) return 'N/A'
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`
    if (mins > 0) return `${mins}m ${secs}s`
    return `${secs}s`
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>📊 System Status</h3>
        <p style={styles.loading}>Checking services...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>📊 System Status</h3>
        <button onClick={checkHealth} style={styles.refreshBtn} title="Refresh">
          🔄
        </button>
      </div>

      {/* Overall Status */}
      <div style={{
        ...styles.overallStatus,
        borderColor: getStatusColor(health?.status),
      }}>
        <span style={{ fontSize: '24px' }}>{getStatusIcon(health?.status)}</span>
        <div>
          <p style={{ ...styles.statusText, color: getStatusColor(health?.status) }}>
            {health?.status === 'healthy' ? 'All Systems Operational' :
             health?.status === 'unhealthy' ? 'Partial Outage' :
             'Service Unreachable'}
          </p>
          <p style={styles.timestamp}>
            Last checked: {lastChecked?.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Individual Services */}
      <div style={styles.servicesGrid}>
        {/* Backend Server */}
        <div style={styles.serviceCard}>
          <div style={styles.serviceHeader}>
            <span>{getStatusIcon(health?.reachable ? 'healthy' : 'unreachable')}</span>
            <span style={styles.serviceName}>Backend Server</span>
          </div>
          <div style={styles.serviceDetails}>
            <p>Status: <strong>{health?.reachable ? 'Online' : 'Offline'}</strong></p>
            {health?.checks?.server?.uptime && (
              <p>Uptime: {formatUptime(health.checks.server.uptime)}</p>
            )}
          </div>
        </div>

        {/* Database */}
        <div style={styles.serviceCard}>
          <div style={styles.serviceHeader}>
            <span>{getStatusIcon(health?.checks?.database?.status)}</span>
            <span style={styles.serviceName}>Database (PostgreSQL)</span>
          </div>
          <div style={styles.serviceDetails}>
            <p>Status: <strong>{health?.checks?.database?.status || 'Unknown'}</strong></p>
            {health?.checks?.database?.responseTime != null && (
              <p>Response: {health.checks.database.responseTime}ms</p>
            )}
            {health?.checks?.database?.error && (
              <p style={styles.errorText}>❌ {getFriendlyError(health.checks.database.error)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Check History (mini timeline) */}
      {history.length > 1 && (
        <div style={styles.historySection}>
          <p style={styles.historyTitle}>Recent checks:</p>
          <div style={styles.historyDots}>
            {history.map((check, i) => (
              <div
                key={i}
                style={{
                  ...styles.dot,
                  backgroundColor: getStatusColor(check.status),
                }}
                title={`${check.status} at ${check.time.toLocaleTimeString()}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Trace Viewer Link */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          🔭 <a href={`${API_URL}/health/traces`} target="_blank" rel="noopener noreferrer" style={styles.link}>
            Open Trace Viewer
          </a> for detailed request logs &amp; errors
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '24px',
    marginTop: '30px',
    maxWidth: '700px',
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'left',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    color: '#fff',
    fontSize: '20px',
    margin: 0,
  },
  refreshBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  loading: {
    color: '#aaa',
    fontSize: '14px',
  },
  overallStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid',
    background: 'rgba(0,0,0,0.2)',
    marginBottom: '20px',
  },
  statusText: {
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
  },
  timestamp: {
    color: '#888',
    fontSize: '12px',
    margin: '4px 0 0 0',
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '20px',
  },
  serviceCard: {
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '8px',
    padding: '16px',
  },
  serviceHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
  },
  serviceName: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
  },
  serviceDetails: {
    color: '#ccc',
    fontSize: '12px',
    lineHeight: '1.6',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: '11px',
    marginTop: '4px',
  },
  historySection: {
    marginBottom: '16px',
  },
  historyTitle: {
    color: '#888',
    fontSize: '12px',
    marginBottom: '8px',
  },
  historyDots: {
    display: 'flex',
    gap: '4px',
  },
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  footer: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    paddingTop: '12px',
  },
  footerText: {
    color: '#888',
    fontSize: '12px',
    margin: 0,
  },
  link: {
    color: '#1db954',
    textDecoration: 'none',
  },
}

export default SystemHealth
