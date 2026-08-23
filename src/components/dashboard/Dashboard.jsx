import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { endpoints } from '../../api/api'
import { useLayout } from '../layout/LayoutContext'
import { DashboardSkeleton } from '../common/Skeleton'
import './Dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
  const { insideLayout } = useLayout()
  const username = localStorage.getItem('tshare_username') || ''

  // History state
  const [historyItems, setHistoryItems] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    if (username) loadHistory()
  }, [username])

  const loadHistory = async () => {
    if (!username) return
    setHistoryLoading(true)
    try {
      const res = await fetch(endpoints.userHistory(username))
      if (res.ok) {
        const data = await res.json()
        setHistoryItems(data.history || data || [])
      }
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setHistoryLoading(false)
    }
  }

  // Show skeleton on initial load
  const showSkeleton = historyLoading && historyItems.length === 0

  // Compute summary statistics
  const stats = useMemo(() => {
    const shared = historyItems.filter(item => item.activity === 'shared')
    const received = historyItems.filter(item => item.activity === 'received')
    const textItems = historyItems.filter(item => item.type === 'text')
    const imageItems = historyItems.filter(item => item.type === 'image')
    const fileItems = historyItems.filter(item => item.type === 'pdf' || item.type === 'file')

    return {
      totalShared: shared.length,
      totalReceived: received.length,
      totalText: textItems.length,
      totalImages: imageItems.length,
      totalFiles: fileItems.length,
      totalItems: historyItems.length,
    }
  }, [historyItems])

  // Chart data - shared vs received by type
  const chartData = useMemo(() => {
    const types = ['text', 'image', 'pdf']
    return types.map(type => {
      const shared = historyItems.filter(item => item.type === type && item.activity === 'shared').length
      const received = historyItems.filter(item => item.type === type && item.activity === 'received').length
      return { type, shared, received }
    })
  }, [historyItems])

  // Activity over time (last 7 days)
  const activityData = useMemo(() => {
    const days = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const next = new Date(d)
      next.setDate(next.getDate() + 1)
      const dayItems = historyItems.filter(item => {
        const ts = new Date(item.timestamp)
        return ts >= d && ts < next
      })
      days.push({
        label: d.toLocaleDateString(undefined, { weekday: 'short' }),
        count: dayItems.length,
        shared: dayItems.filter(i => i.activity === 'shared').length,
        received: dayItems.filter(i => i.activity === 'received').length,
      })
    }
    return days
  }, [historyItems])

  const maxActivity = Math.max(...activityData.map(d => d.count), 1)

  const formatTime = (ts) => {
    const d = new Date(ts)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return d.toLocaleDateString()
  }

  const getTypeIcon = (type) => {
    if (type === 'text') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      )
    }
    if (type === 'image') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      )
    }
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    )
  }

  const getTypeLabel = (type) => {
    if (type === 'text') return 'Text'
    if (type === 'image') return 'Image'
    if (type === 'pdf') return 'File'
    return 'File'
  }

  const getTypeColor = (type) => {
    if (type === 'text') return 'var(--color-primary)'
    if (type === 'image') return 'var(--color-success)'
    return 'var(--theme-warning)'
  }

  const handleLogout = () => {
    localStorage.removeItem('tshare_username')
    navigate('/')
  }

  if (!username) {
    return (
      <div className="module-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <img src="/s2.svg" alt="TShare" width="48" height="48" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Share Anything. <span style={{ color: 'var(--theme-primary-light)' }}>In Seconds.</span>
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
            No sign-up. No accounts. Just a 4-character code. Share text, images, and files instantly.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px 20px', fontSize: '14px', justifyContent: 'center' }}
              onClick={() => navigate('/login')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 01 2 2v14a2 2 0 01-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Login
            </button>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', padding: '12px 20px', fontSize: '14px', justifyContent: 'center' }}
              onClick={() => navigate('/register')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" x2="19" y1="8" y2="14" />
                <line x1="22" x2="16" y1="11" y2="11" />
              </svg>
              Register
            </button>
            <button
              className="btn"
              style={{
                width: '100%',
                padding: '12px 20px',
                fontSize: '14px',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #d4af37 0%, #f59e0b 100%)',
                color: '#000',
                fontWeight: 'bold',
                border: 'none',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
              }}
              onClick={() => navigate('/premium/login')}
            >
              👑 Login to Premium Dashboard
            </button>
          </div>
          <div style={{ marginTop: '40px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/about" style={{ fontSize: '12px', color: 'var(--text-subtle)', textDecoration: 'none' }}>About</Link>
            <Link to="/contact" style={{ fontSize: '12px', color: 'var(--text-subtle)', textDecoration: 'none' }}>Contact</Link>
            <Link to="/privacy-policy" style={{ fontSize: '12px', color: 'var(--text-subtle)', textDecoration: 'none' }}>Privacy</Link>
            <Link to="/terms-of-service" style={{ fontSize: '12px', color: 'var(--text-subtle)', textDecoration: 'none' }}>Terms</Link>
            <Link to="/admin/panel" style={{ fontSize: '12px', color: 'var(--text-subtle)', textDecoration: 'none' }}>Admin</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={insideLayout ? '' : 'page'}>
      {!insideLayout && (
        <motion.nav
          className="nav"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="nav__inner">
            <button className="nav__back" onClick={() => navigate('/')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Home
            </button>
            <div className="nav__brand">
              <img src="/s2.svg" alt="TShare" width="20" height="20" />
              <span>Dashboard</span>
            </div>
            <div className="nav__user">
              <span className="nav__username">{username}</span>
              <button className="nav__logout" onClick={handleLogout} title="Logout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </motion.nav>
      )}

      <main className="dashboard dashboard--summary">
        <div className="dashboard__container dashboard__container--wide">
          {showSkeleton ? (
            <DashboardSkeleton />
          ) : (
            <div>
              {/* Vault Header */}
              <motion.div
                className="dashboard__vault-header"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="dashboard__vault-header-badge">
                  <span className="dashboard__vault-badge-dot" />
                  Dashboard
                </div>
                <h1 className="dashboard__vault-header-title">
                  Welcome back, <span className="dashboard__vault-gradient">{username}</span>
                </h1>
                <p className="dashboard__vault-header-subtitle">
                  Here's your sharing activity summary
                </p>
              </motion.div>

              {/* Premium Access Banner */}
              <motion.div
                style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(245, 158, 11, 0.04) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div>
                  <h3 style={{ margin: 0, color: '#f59e0b', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                    👑 Premium Code Ownership
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                    Access and manage your custom 4 & 6 digit premium codes instantly.
                  </p>
                </div>
                <button
                  className="btn"
                  onClick={() => navigate('/premium/login')}
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #f59e0b 100%)',
                    color: '#000',
                    fontWeight: '600',
                    border: 'none',
                    padding: '8px 16px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    borderRadius: '5px'
                  }}
                >
                  Go to Premium Panel
                </button>
              </motion.div>

              {/* Summary Cards */}
              <div className="dashboard__cards">
                <motion.div
                  className="dashboard__card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="dashboard__card-icon dashboard__card-icon--shared">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2L11 13" />
                      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                  </div>
                  <div className="dashboard__card-info">
                    <div className="dashboard__card-value">{stats.totalShared}</div>
                    <div className="dashboard__card-label">Total Shared</div>
                  </div>
                </motion.div>

                <motion.div
                  className="dashboard__card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  <div className="dashboard__card-icon dashboard__card-icon--received">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <path d="M7 10l5 5 5-5" />
                      <path d="M12 3v12" />
                    </svg>
                  </div>
                  <div className="dashboard__card-info">
                    <div className="dashboard__card-value">{stats.totalReceived}</div>
                    <div className="dashboard__card-label">Total Received</div>
                  </div>
                </motion.div>

                <motion.div
                  className="dashboard__card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className="dashboard__card-icon dashboard__card-icon--text">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                  </div>
                  <div className="dashboard__card-info">
                    <div className="dashboard__card-value">{stats.totalText}</div>
                    <div className="dashboard__card-label">Text Items</div>
                  </div>
                </motion.div>

                <motion.div
                  className="dashboard__card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                >
                  <div className="dashboard__card-icon dashboard__card-icon--image">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <div className="dashboard__card-info">
                    <div className="dashboard__card-value">{stats.totalImages}</div>
                    <div className="dashboard__card-label">Images</div>
                  </div>
                </motion.div>

                <motion.div
                  className="dashboard__card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <div className="dashboard__card-icon dashboard__card-icon--file">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="dashboard__card-info">
                    <div className="dashboard__card-value">{stats.totalFiles}</div>
                    <div className="dashboard__card-label">Files</div>
                  </div>
                </motion.div>
              </div>

              {/* Charts Section */}
              <div className="dashboard__charts">
                {/* Shared vs Received by Type */}
                <motion.div
                  className="dashboard__chart-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 }}
                >
                  <h3 className="dashboard__chart-title">Shared vs Received by Type</h3>
                  <div className="dashboard__bar-chart">
                    {chartData.map((item) => {
                      const maxVal = Math.max(item.shared, item.received, 1)
                      return (
                        <div key={item.type} className="dashboard__bar-group">
                          <div className="dashboard__bar-label">{getTypeLabel(item.type)}</div>
                          <div className="dashboard__bar-row">
                            <div className="dashboard__bar-track">
                              <motion.div
                                className="dashboard__bar dashboard__bar--shared"
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.shared / maxVal) * 100}%` }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                              />
                            </div>
                            <span className="dashboard__bar-value">{item.shared}</span>
                          </div>
                          <div className="dashboard__bar-row">
                            <div className="dashboard__bar-track">
                              <motion.div
                                className="dashboard__bar dashboard__bar--received"
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.received / maxVal) * 100}%` }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                              />
                            </div>
                            <span className="dashboard__bar-value">{item.received}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="dashboard__chart-legend">
                    <span className="dashboard__legend-item">
                      <span className="dashboard__legend-dot dashboard__legend-dot--shared" /> Shared
                    </span>
                    <span className="dashboard__legend-item">
                      <span className="dashboard__legend-dot dashboard__legend-dot--received" /> Received
                    </span>
                  </div>
                </motion.div>

                {/* Activity Over Time */}
                <motion.div
                  className="dashboard__chart-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <h3 className="dashboard__chart-title">Activity (Last 7 Days)</h3>
                  <div className="dashboard__line-chart">
                    {activityData.map((day, i) => (
                      <div key={i} className="dashboard__line-col">
                        <div className="dashboard__line-bars">
                          <motion.div
                            className="dashboard__line-bar dashboard__line-bar--shared"
                            initial={{ height: 0 }}
                            animate={{ height: `${(day.shared / maxActivity) * 100}%` }}
                            transition={{ duration: 0.5, delay: 0.4 + i * 0.05 }}
                            title={`${day.shared} shared`}
                          />
                          <motion.div
                            className="dashboard__line-bar dashboard__line-bar--received"
                            initial={{ height: 0 }}
                            animate={{ height: `${(day.received / maxActivity) * 100}%` }}
                            transition={{ duration: 0.5, delay: 0.45 + i * 0.05 }}
                            title={`${day.received} received`}
                          />
                        </div>
                        <div className="dashboard__line-label">{day.label}</div>
                        <div className="dashboard__line-count">{day.count}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* History Section */}
              <motion.div
                className="dashboard__history-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.45 }}
              >
                <div className="dashboard__history-header">
                  <div>
                    <h2 className="dashboard__history-title">History</h2>
                    <p className="dashboard__history-desc">Your shared and received content</p>
                  </div>
                  <span className="dashboard__history-count">{historyItems.length} items</span>
                </div>

                {historyLoading ? (
                  <div className="dashboard__history-loading">
                    <motion.span className="btn__spinner" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                      </svg>
                    </motion.span>
                    Loading history...
                  </div>
                ) : historyItems.length === 0 ? (
                  <div className="dashboard__history-empty">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <p>No history yet. Share or receive something to see it here.</p>
                  </div>
                ) : (
                  <div className="dashboard__history-list">
                    {historyItems.map((item, i) => (
                      <motion.div
                        key={i}
                        className="dashboard__history-item"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                      >
                        <div className="dashboard__history-item-icon" style={{ color: getTypeColor(item.type) }}>
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="dashboard__history-item-info">
                          <div className="dashboard__history-item-code">
                            <span className={`dashboard__history-activity dashboard__history-activity--${item.activity}`}>
                              {item.activity === 'shared' ? 'Shared' : 'Received'}
                            </span>
                            {' · '}Code: {item.code}
                          </div>
                          <div className="dashboard__history-item-preview">{item.title || 'No preview'}</div>
                        </div>
                        <div className="dashboard__history-item-time">{formatTime(item.timestamp)}</div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard