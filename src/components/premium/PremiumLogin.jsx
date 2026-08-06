import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { endpoints } from '../../api/api'
import './BuyPremium.css'

const PremiumLogin = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isFocused, setIsFocused] = useState({ username: false, password: false })

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('tshare_premium_token')
    if (token) {
      navigate('/premium/dashboard')
    }
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(endpoints.premiumLogin, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          password
        })
      })

      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('tshare_premium_token', data.token)
        localStorage.setItem('tshare_premium_username', data.user.username)
        navigate('/premium/dashboard')
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      console.error(err)
      setError('Network error, please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="premium-login-wrapper">
      {/* Animated background orbs */}
      <div className="premium-login-bg">
        <div className="premium-login-orb premium-login-orb--1"></div>
        <div className="premium-login-orb premium-login-orb--2"></div>
        <div className="premium-login-orb premium-login-orb--3"></div>
      </div>

      <motion.div 
        className="premium-login-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo/Icon Section */}
        <div className="premium-login-header">
          <motion.div 
            className="premium-login-icon"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </motion.div>
          <motion.h1 
            className="premium-login-title"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Premium Login
          </motion.h1>
          <motion.p 
            className="premium-login-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            Access your premium dashboard
          </motion.p>
        </div>

        {/* Login Form */}
        <motion.form 
          onSubmit={handleLogin} 
          className="premium-login-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <AnimatePresence>
            {error && (
              <motion.div 
                className="premium-login-alert premium-login-alert--error"
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="premium-login-field">
            <label className="premium-login-label" htmlFor="username">
              Username
            </label>
            <div className={`premium-login-input-wrapper ${isFocused.username ? 'premium-login-input-wrapper--focused' : ''}`}>
              <div className="premium-login-input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                className="premium-login-input"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError('')
                }}
                onFocus={() => setIsFocused({ ...isFocused, username: true })}
                onBlur={() => setIsFocused({ ...isFocused, username: false })}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="premium-login-field">
            <label className="premium-login-label" htmlFor="password">
              Password
            </label>
            <div className={`premium-login-input-wrapper ${isFocused.password ? 'premium-login-input-wrapper--focused' : ''}`}>
              <div className="premium-login-input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="premium-login-input"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                onFocus={() => setIsFocused({ ...isFocused, password: true })}
                onBlur={() => setIsFocused({ ...isFocused, password: false })}
                autoComplete="current-password"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            className="premium-login-button"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="premium-login-button-content">
                <span className="premium-login-spinner"></span>
                Authenticating...
              </span>
            ) : (
              <span className="premium-login-button-content">
                Sign In
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </span>
            )}
          </motion.button>

          <div className="premium-login-footer">
            <p>
              Don't have a premium code?{' '}
              <Link to="/buy" className="premium-login-link">
                Purchase one now
              </Link>
            </p>
          </div>
        </motion.form>

        {/* Decorative Elements */}
        <div className="premium-login-decoration">
          <div className="premium-login-shimmer"></div>
        </div>
      </motion.div>

      {/* Bottom branding */}
      <motion.div 
        className="premium-login-branding"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <p>Premium Member Access</p>
      </motion.div>
    </div>
  )
}

export default PremiumLogin