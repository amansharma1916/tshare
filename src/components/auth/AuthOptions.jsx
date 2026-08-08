import React from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import './AuthOptions.css'

const AuthOptions = () => {
  const navigate = useNavigate()

  return (
    <div className="auth-options-page">
      <div className="auth-options__orb auth-options__orb--1" />
      <div className="auth-options__orb auth-options__orb--2" />
      <div className="auth-options__orb auth-options__orb--3" />

      <motion.div
        className="auth-options__card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="auth-options__header">
          <div className="auth-options__badge">
            <span className="auth-options__badge-dot" />
            Account
          </div>
          <h1 className="auth-options__title">
            Choose your <span className="auth-options__gradient">access</span>
          </h1>
          <p className="auth-options__subtitle">
            Sign in, create an account, or unlock premium features
          </p>
        </div>

        <div className="auth-options__grid">
          <motion.div
            className="auth-options__option auth-options__option--login"
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className="auth-options__option-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </div>
            <h2 className="auth-options__option-title">Sign In</h2>
            <p className="auth-options__option-desc">
              Already have an account? Enter your username to access your dashboard and history.
            </p>
            <button
              className="auth-options__btn auth-options__btn--primary"
              onClick={() => navigate('/login')}
            >
              Sign In
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </motion.div>

          <motion.div
            className="auth-options__option auth-options__option--register"
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className="auth-options__option-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" x2="19" y1="8" y2="14" />
                <line x1="22" x2="16" y1="11" y2="11" />
              </svg>
            </div>
            <h2 className="auth-options__option-title">Create Account</h2>
            <p className="auth-options__option-desc">
              New here? Pick a username and start sharing instantly — no password needed.
            </p>
            <button
              className="auth-options__btn auth-options__btn--ghost"
              onClick={() => navigate('/register')}
            >
              Create Account
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </motion.div>

          <motion.div
            className="auth-options__option auth-options__option--premium"
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className="auth-options__option-icon auth-options__option-icon--gold">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <h2 className="auth-options__option-title auth-options__option-title--gold">
              Premium Access
            </h2>
            <p className="auth-options__option-desc">
              Already own a premium code? Manage codes, set passwords, and unlock advanced features.
            </p>
            <button
              className="auth-options__btn auth-options__btn--gold"
              onClick={() => navigate('/premium/login')}
            >
              Premium Login
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </motion.div>
        </div>

        <div className="auth-options__footer">
          <Link to="/" className="auth-options__back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default AuthOptions
