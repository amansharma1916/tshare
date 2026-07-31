import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { endpoints, baseUrl } from '../../api/api'
import io from 'socket.io-client'
import './Dashboard.css'

const SEGMENT_COUNT = 4

const Dashboard = () => {
  const navigate = useNavigate()
  const username = localStorage.getItem('tshare_username') || ''

  // Share state
  const [text, setText] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [socket, setSocket] = useState(null)
  const textareaRef = useRef(null)

  // Receive state
  const [segments, setSegments] = useState(Array(SEGMENT_COUNT).fill(''))
  const [activeSegment, setActiveSegment] = useState(0)
  const segmentRefs = useRef([])
  const [receivedData, setReceivedData] = useState('')
  const [imageData, setImageData] = useState(null)
  const [imageCode, setImageCode] = useState('')
  const [pdfData, setPdfData] = useState(null)
  const [pdfCode, setPdfCode] = useState('')
  const [receiveLoading, setReceiveLoading] = useState(false)
  const [receiveError, setReceiveError] = useState('')
  const [receiveSuccess, setReceiveSuccess] = useState('')
  const [receiveContentType, setReceiveContentType] = useState('text')
  const [showReceivedContent, setShowReceivedContent] = useState(false)
  const [receiveCopied, setReceiveCopied] = useState(false)

  // History state
  const [historyItems, setHistoryItems] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('history')

  useEffect(() => {
    const newSocket = io(baseUrl)
    setSocket(newSocket)
    return () => {
      if (newSocket) newSocket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (username) loadHistory()
  }, [username])

  useEffect(() => {
    segmentRefs.current[0]?.focus()
  }, [])

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

  // Share handlers
  const saveTextDb = () => {
    if (!text.trim()) {
      textareaRef.current?.focus()
      return
    }
    setLoading(true)
    setShowCode(false)

    fetch(endpoints.save, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, username }),
    })
      .then(res => res.json())
      .then(data => {
        const newCode = String(data.id)
        setCode(newCode)
        setText('')
        setShowCode(true)
        if (socket) {
          socket.emit('text-update', { textId: data.id, text })
        }
        // Refresh history
        loadHistory()
      })
      .catch(error => console.error('Error:', error))
      .finally(() => setLoading(false))
  }

  const copyCode = () => {
    if (!code) return
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy: ', err))
  }

  // Receive handlers
  const getCode = () => segments.join('')

  const handleSegmentChange = useCallback((index, value) => {
    const digit = value.replace(/\D/g, '')
    if (!digit) return
    const newSegments = [...segments]
    newSegments[index] = digit.slice(-1)
    setSegments(newSegments)
    setReceiveError('')
    setReceiveSuccess('')
    setShowReceivedContent(false)
    if (index < SEGMENT_COUNT - 1) {
      setActiveSegment(index + 1)
      segmentRefs.current[index + 1]?.focus()
    }
  }, [segments])

  const handleSegmentKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newSegments = [...segments]
      if (segments[index]) {
        newSegments[index] = ''
        setSegments(newSegments)
      } else if (index > 0) {
        newSegments[index - 1] = ''
        setSegments(newSegments)
        setActiveSegment(index - 1)
        segmentRefs.current[index - 1]?.focus()
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      setActiveSegment(index - 1)
      segmentRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < SEGMENT_COUNT - 1) {
      e.preventDefault()
      setActiveSegment(index + 1)
      segmentRefs.current[index + 1]?.focus()
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      handleReceive()
    }
  }, [segments])

  const handlePaste = useCallback((e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, SEGMENT_COUNT)
    if (!pasted) return
    const newSegments = [...segments]
    for (let i = 0; i < pasted.length; i++) {
      newSegments[i] = pasted[i]
    }
    setSegments(newSegments)
    setReceiveError('')
    const nextIndex = Math.min(pasted.length, SEGMENT_COUNT - 1)
    setActiveSegment(nextIndex)
    segmentRefs.current[nextIndex]?.focus()
  }, [segments])

  const clearSegments = () => {
    setSegments(Array(SEGMENT_COUNT).fill(''))
    setActiveSegment(0)
    segmentRefs.current[0]?.focus()
    setReceivedData('')
    setImageData(null)
    setPdfData(null)
    setReceiveError('')
    setReceiveSuccess('')
    setShowReceivedContent(false)
  }

  const handleReceive = () => {
    const code = getCode()
    if (code.length !== SEGMENT_COUNT) {
      setReceiveError('Please enter all 4 digits')
      return
    }
    if (receiveContentType === 'text') receiveData(code)
    else if (receiveContentType === 'image') receiveImage(code)
    else if (receiveContentType === 'pdf') receivePdf(code)
  }

  const receiveData = (code) => {
    setReceiveLoading(true)
    setReceiveError('')
    setReceiveSuccess('')
    setShowReceivedContent(false)
    setImageData(null)
    setPdfData(null)

    fetch(endpoints.get(code) + (username ? '?username=' + encodeURIComponent(username) : ''))
      .then(res => {
        if (!res.ok) throw new Error('Invalid code or content not found')
        return res.json()
      })
      .then(data => {
        if (data && data.text) {
          const unescapedText = data.text
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\\\/g, '\\')
          setReceivedData(unescapedText)
          setReceiveSuccess('Text received successfully')
          setShowReceivedContent(true)
          // Refresh history
          loadHistory()
        } else {
          setReceiveError('No data found for this code')
        }
      })
      .catch(error => {
        setReceiveError(error.message || 'Failed to retrieve data')
      })
      .finally(() => setReceiveLoading(false))
  }

  const receiveImage = (code) => {
    setReceiveLoading(true)
    setReceiveError('')
    setReceiveSuccess('')
    setShowReceivedContent(false)
    setReceivedData('')
    setPdfData(null)

    fetch(endpoints.getImage(code) + (username ? '?username=' + encodeURIComponent(username) : ''))
      .then(res => {
        if (!res.ok) throw new Error('Invalid code or image not found')
        return res.json()
      })
      .then(data => {
        if (data?.image?.url) {
          setImageData(data.image)
          setImageCode(code)
          setReceiveSuccess('Image received')
          setShowReceivedContent(true)
          // Refresh history
          loadHistory()
        } else {
          setReceiveError('No image found for this code')
        }
      })
      .catch(error => {
        setReceiveError(error.message || 'Failed to retrieve image')
      })
      .finally(() => setReceiveLoading(false))
  }

  const receivePdf = (code) => {
    setReceiveLoading(true)
    setReceiveError('')
    setReceiveSuccess('')
    setShowReceivedContent(false)
    setReceivedData('')
    setImageData(null)

    fetch(endpoints.getPdf(code) + (username ? '?username=' + encodeURIComponent(username) : ''))
      .then(res => {
        if (!res.ok) throw new Error('Invalid code or PDF not found')
        return res.json()
      })
      .then(data => {
        if (data?.pdf?.url) {
          setPdfData(data.pdf)
          setPdfCode(code)
          setReceiveSuccess('PDF received')
          setShowReceivedContent(true)
          // Refresh history
          loadHistory()
        } else {
          setReceiveError('No PDF found for this code')
        }
      })
      .catch(error => {
        setReceiveError(error.message || 'Failed to retrieve PDF')
      })
      .finally(() => setReceiveLoading(false))
  }

  const copyReceivedText = () => {
    if (!receivedData) return
    navigator.clipboard.writeText(receivedData)
      .then(() => {
        setReceiveCopied(true)
        setTimeout(() => setReceiveCopied(false), 2000)
      })
      .catch(err => console.error('Error copying:', err))
  }

  const downloadImage = () => {
    if (!imageCode) return
    window.location.href = endpoints.downloadImage(imageCode)
  }

  const downloadPdf = () => {
    if (!pdfCode) return
    window.location.href = endpoints.downloadPdf(pdfCode)
  }

  const handleLogout = () => {
    localStorage.removeItem('tshare_username')
    navigate('/')
  }

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

  if (!username) {
    return (
      <div className="page">
        <div className="dashboard">
          <div className="dashboard__empty">
            <div className="dashboard__empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2 className="dashboard__empty-title">Not logged in</h2>
            <p className="dashboard__empty-desc">Login or create an account to access your dashboard.</p>
            <Link to="/login" className="btn btn--primary">Go to Login</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
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

      <main className="dashboard">
        <div className="dashboard__container">
          {/* Tab Switcher */}
          <motion.div
            className="dashboard__tabs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <button
              className={`dashboard__tab ${activeTab === 'share' ? 'dashboard__tab--active' : ''}`}
              onClick={() => setActiveTab('share')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              Share
            </button>
            <button
              className={`dashboard__tab ${activeTab === 'receive' ? 'dashboard__tab--active' : ''}`}
              onClick={() => setActiveTab('receive')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <path d="M7 10l5 5 5-5" />
                <path d="M12 3v12" />
              </svg>
              Receive
            </button>
            <button
              className={`dashboard__tab ${activeTab === 'history' ? 'dashboard__tab--active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              History
            </button>
          </motion.div>

          {/* Share Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'share' && (
              <motion.div
                key="share"
                className="dashboard__section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="dashboard__section-header">
                  <h2 className="dashboard__section-title">Share Text</h2>
                  <p className="dashboard__section-desc">Paste or type text to share instantly.</p>
                </div>

                <AnimatePresence mode="wait">
                  {showCode && code ? (
                    <motion.div
                      key="code"
                      className="code-reveal"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="code-reveal__badge">Code Generated</div>
                      <button className="code-reveal__value" onClick={copyCode} title="Click to copy">
                        <span className="code-reveal__digits">
                          {code.split('').map((digit, i) => (
                            <motion.span
                              key={i}
                              className="code-reveal__digit"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                            >
                              {digit}
                            </motion.span>
                          ))}
                        </span>
                        <span className="code-reveal__copy-icon">
                          {copied ? (
                            <motion.svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <polyline points="20 6 9 17 4 12" />
                            </motion.svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                            </svg>
                          )}
                        </span>
                      </button>
                      <p className="code-reveal__hint">Share this code with the recipient</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="input"
                      className="dashboard__editor"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <textarea
                        ref={textareaRef}
                        className="dashboard__textarea"
                        placeholder="Paste your text here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={6}
                      />
                      <div className="dashboard__editor-actions">
                        <button
                          className="btn btn--primary"
                          onClick={saveTextDb}
                          disabled={loading || !text.trim()}
                        >
                          {loading ? (
                            <span className="btn__loading">
                              <motion.span className="btn__spinner" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                                </svg>
                              </motion.span>
                              Sharing...
                            </span>
                          ) : (
                            <>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 2L11 13" />
                                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                              </svg>
                              Share Text
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="dashboard__quick-links">
                  <span className="dashboard__quick-label">Share other types</span>
                  <div className="dashboard__quick-list">
                    <button className="dashboard__quick-btn" onClick={() => navigate('/share-image?from=/dashboard')}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      Image
                    </button>
                    <button className="dashboard__quick-btn" onClick={() => navigate('/share-pdf?from=/dashboard')}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      PDF
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Receive Tab */}
            {activeTab === 'receive' && (
              <motion.div
                key="receive"
                className="dashboard__section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="dashboard__section-header">
                  <h2 className="dashboard__section-title">Receive Content</h2>
                  <p className="dashboard__section-desc">Enter the 4-digit code shared with you.</p>
                </div>

                <div className="dashboard__receive-tabs">
                  {[
                    { id: 'text', label: 'Text', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
                    { id: 'image', label: 'Image', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
                    { id: 'pdf', label: 'PDF', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      className={`dashboard__receive-tab ${receiveContentType === tab.id ? 'dashboard__receive-tab--active' : ''}`}
                      onClick={() => {
                        setReceiveContentType(tab.id)
                        setReceiveError('')
                        setReceiveSuccess('')
                        setShowReceivedContent(false)
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={tab.icon} />
                      </svg>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="dashboard__receive-input">
                  <div className="segmented-input" onPaste={handlePaste}>
                    {segments.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { segmentRefs.current[i] = el }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleSegmentChange(i, e.target.value)}
                        onKeyDown={(e) => handleSegmentKeyDown(i, e)}
                        onFocus={() => setActiveSegment(i)}
                        className={`segment-input ${digit ? 'segment-input--filled' : ''} ${activeSegment === i ? 'segment-input--active' : ''}`}
                        aria-label={`Digit ${i + 1} of 4`}
                        autoComplete="off"
                      />
                    ))}
                  </div>

                  <div className="dashboard__receive-actions">
                    <button className="dashboard__clear-btn" onClick={clearSegments} type="button">Clear</button>
                    <button
                      className="btn btn--primary dashboard__receive-go"
                      onClick={handleReceive}
                      disabled={receiveLoading || getCode().length !== SEGMENT_COUNT}
                    >
                      {receiveLoading ? (
                        <span className="btn__loading">
                          <motion.span className="btn__spinner" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <path d="M21 12a9 9 0 11-6.219-8.56" />
                            </svg>
                          </motion.span>
                          Receiving...
                        </span>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <path d="M7 10l5 5 5-5" />
                            <path d="M12 3v12" />
                          </svg>
                          Receive
                        </>
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {receiveError && (
                      <motion.div
                        className="dashboard__status dashboard__status--error"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="15" y1="9" x2="9" y2="15" />
                          <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        {receiveError}
                      </motion.div>
                    )}
                    {receiveSuccess && !receiveError && (
                      <motion.div
                        className="dashboard__status dashboard__status--success"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {receiveSuccess}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence mode="wait">
                  {showReceivedContent && (
                    <motion.div
                      key={`content-${receiveContentType}`}
                      className="dashboard__received-content"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      {receiveContentType === 'text' && receivedData && (
                        <div className="dashboard__received-text">
                          <pre className="dashboard__received-pre">{receivedData}</pre>
                          <button className="btn btn--secondary" onClick={copyReceivedText}>
                            {receiveCopied ? (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Copied
                              </>
                            ) : (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                </svg>
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                      )}
                      {receiveContentType === 'image' && imageData && (
                        <div className="dashboard__received-media">
                          <div className="dashboard__received-img-wrapper">
                            <img src={imageData.url} alt={imageData.originalName || 'Shared image'} />
                          </div>
                          <div className="dashboard__file-meta">
                            <span>{imageData.originalName || 'Shared image'}</span>
                          </div>
                          <button className="btn btn--secondary" onClick={downloadImage}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download
                          </button>
                        </div>
                      )}
                      {receiveContentType === 'pdf' && pdfData && (
                        <div className="dashboard__received-media">
                          <div className="dashboard__received-pdf-wrapper">
                            <iframe src={endpoints.previewPdf(pdfCode)} title="Shared PDF" />
                          </div>
                          <div className="dashboard__file-meta">
                            <span>{pdfData.originalName || 'Shared PDF'}</span>
                          </div>
                          <button className="btn btn--secondary" onClick={downloadPdf}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download PDF
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <motion.div
                key="history"
                className="dashboard__section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="dashboard__section-header">
                  <h2 className="dashboard__section-title">History</h2>
                  <p className="dashboard__section-desc">Your shared and received content history.</p>
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
                  <p className="dashboard__history-empty">No history yet. Share or receive something to see it here.</p>
                ) : (
                  <div className="dashboard__history-list">
                    {historyItems.map((item, i) => (
                      <div key={i} className="dashboard__history-item">
                        <div className="dashboard__history-item-icon">{getTypeIcon(item.type)}</div>
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
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

export default Dashboard