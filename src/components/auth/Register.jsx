import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { endpoints } from '../../api/api'
import './Login.css'

const Register = () => {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch(endpoints.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      localStorage.setItem('tshare_username', username.trim())
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="login-header">
          <div className="login-badge">
            <span className="login-badge-dot" />
            Account
          </div>
          <h1 className="login-title">
            Create <span className="login-gradient">Account</span>
          </h1>
          <p className="login-subtitle">Choose a username to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label className="login-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError('') }}
              placeholder="Choose a username"
              autoFocus
              required
              className="login-input"
            />
          </div>

          {error && (
            <motion.div
              className="login-error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="btn btn-primary login-submit"
            style={{ opacity: (loading || !username.trim()) ? 0.7 : 1 }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="login-link">Login</Link>
          </p>
          <Link to="/" className="login-back">Back to Home</Link>
        </div>
      </motion.div>
    </div>
  )
}

export default Register