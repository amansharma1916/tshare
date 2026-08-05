import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { endpoints } from '../../api/api'
import './BuyPremium.css'

const PremiumLogin = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
        // Store JWT token instead of username/password
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
    <div className="premium-container">
      <motion.div 
        className="premium-card bg-glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="premium-header">
          <div className="premium-icon-glow">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="premium-badge-icon">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h1>Premium Login</h1>
          <p>Sign in with your premium account credentials to manage your purchased codes.</p>
        </div>

        <form onSubmit={handleLogin} className="premium-form">
          {error && (
            <div className="alert alert-danger">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="section-label">Username</label>
            <input
              type="text"
              placeholder="Username"
              className="custom-amount-input"
              style={{ paddingLeft: '14px' }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="section-label">Password</label>
            <input
              type="password"
              placeholder="Password"
              className="custom-amount-input"
              style={{ paddingLeft: '14px' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-pay-now"
            disabled={loading}
            style={{ marginTop: '10px' }}
          >
            {loading ? (
              <div className="spinner-wrapper">
                <div className="spinner"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              <span>Login</span>
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Need a code? </span>
            <Link to="/buy" style={{ fontSize: '13px', color: 'var(--theme-primary-light)', fontWeight: 600, textDecoration: 'none' }}>
              Buy a Code
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default PremiumLogin
